import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_ID");
// Recibientes separados por coma, ej: "573188400638,573001234567"
const RECIPIENTS = Deno.env.get("WHATSAPP_RECIPIENTS")?.split(",") || [
  "573188400638",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      throw new Error(
        "WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_ID no configurado"
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let mediaId = null;
    let payload = null;

    // 1. Manejar ARCHIVO (PDF)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) throw new Error("No se encontró el archivo PDF");

      // Subir a Meta Media API
      const metaFormData = new FormData();
      metaFormData.append("file", file);
      metaFormData.append("type", "application/pdf");
      metaFormData.append("messaging_product", "whatsapp");

      const uploadResponse = await fetch(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/media`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          },
          body: metaFormData,
        }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok)
        throw new Error(`Error subiendo a Meta: ${JSON.stringify(uploadData)}`);

      mediaId = uploadData.id;
    }
    // 2. Manejar JSON (Análisis AI)
    else if (contentType.includes("application/json")) {
      payload = await req.json();
    }

    // 3. Enviar a todos los destinatarios
    const results = [];
    for (const to of RECIPIENTS) {
      const body: any = {
        messaging_product: "whatsapp",
        to: to.trim(),
      };

      if (mediaId) {
        body.type = "document";
        body.document = {
          id: mediaId,
          filename: "reporte_eventos.pdf",
        };
      } else if (payload) {
        // Formatear el mensaje similar a n8n pero aquí mismo
        const messageText = formatAnalysisMessage(payload);
        body.type = "text";
        body.text = { body: messageText };
      }

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
      results.push({ to, success: sendResponse.ok, data: sendData });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error en send-whatsapp:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function formatAnalysisMessage(data: any) {
  const lines = [];
  lines.push(`*🍽️ RESUMEN DE CATERING - ${data.date || "Sin fecha"}*`);
  lines.push("");
  lines.push(`📊 *Totales*`);
  lines.push(`👥 Personas: *${data.totalPax}* pax`);
  lines.push(`📅 Eventos: *${data.eventsAnalyzed}*`);
  lines.push("");

  if (data.warnings && data.warnings.length > 0) {
    lines.push(`⚠️ *ALERTAS*`);
    data.warnings.forEach((w: string) => lines.push(`• ${w}`));
    lines.push("");
  }

  if (data.mealGroups && Object.keys(data.mealGroups).length > 0) {
    const emojis: Record<string, string> = {
      ALMUERZO: "🍽️",
      REFRIGERIO: "🥪",
      DESAYUNO: "☕",
      "MENU INFANTIL": "👶",
      VEGETARIANO: "🥗",
      OTRO: "📦",
    };

    Object.entries(data.mealGroups).forEach(([type, items]: [string, any]) => {
      const emoji = emojis[type] || "🔹";
      lines.push(`${emoji} *${type}*`);
      items.forEach((item: any) => {
        lines.push(
          `  • *${item.quantity}* x ${item.category}${
            item.notes ? ` (_${item.notes}_)` : ""
          }`
        );
      });
      lines.push("");
    });
  }

  lines.push(`✅ *Resumen:* Procesado correctamente.`);
  return lines.join("\n");
}
