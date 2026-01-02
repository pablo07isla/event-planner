import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_ID");
const FRONTEND_URL =
  Deno.env.get("FRONTEND_URL") || "https://event-planner-taupe.vercel.app";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Encontrar eventos que terminaron hace exactamente 3 días (o entre 3 y 4 días)
    // y que no se les haya enviado la encuesta.
    // Usamos un intervalo para ser robustos ante retrasos en el cron.
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    const { data: events, error: fetchError } = await supabase
      .from("events")
      .select("id, contactName, contactPhone, companyName")
      .is("survey_sent_at", null)
      .not("contactPhone", "is", null)
      .lt("end", threeDaysAgo.toISOString())
      .gt("end", fourDaysAgo.toISOString());

    if (fetchError) throw fetchError;

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: "No events found to notify" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const results = [];

    for (const event of events) {
      const surveyLink = `${FRONTEND_URL}/feedback/${event.id}`;
      const messageText = `Hola ${
        event.contactName || "cliente"
      },\n\nGracias por confiar en nosotros para tu evento con *${
        event.companyName
      }*. 🌟\n\nNos encantaría saber cómo fue tu experiencia. ¿Podrías regalarnos 1 minuto para completar esta breve encuesta?\n\n👉 ${surveyLink}\n\n¡Gracias!`;

      // Enviar WhatsApp
      const body = {
        messaging_product: "whatsapp",
        to: event.contactPhone.replace(/\D/g, ""), // Limpiar caracteres no numéricos
        type: "text",
        text: { body: messageText },
      };

      const sendResponse = await fetch(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const sendData = await sendResponse.json();

      if (sendResponse.ok) {
        // Actualizar el evento
        await supabase
          .from("events")
          .update({ survey_sent_at: new Date().toISOString() })
          .eq("id", event.id);

        results.push({ id: event.id, success: true });
      } else {
        results.push({ id: event.id, success: false, error: sendData });
      }
    }

    return new Response(JSON.stringify({ processed: events.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error en send-survey-notifications:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
