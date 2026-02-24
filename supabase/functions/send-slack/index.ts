import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { totalPax, eventsAnalyzed, warnings, mealGroups, date, channel } =
      await req.json();

    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");

    if (!slackWebhookUrl) {
      throw new Error(
        "SLACK_WEBHOOK_URL no está configurada en las variables de entorno",
      );
    }

    // Build the Slack message using Block Kit
    const blocks: any[] = [];

    if (date) {
      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `🗓️ *${date}*`,
          },
        ],
      });
    }

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📊 *Totales*\n👥 Personas: ${totalPax} pax\n📅 Eventos: ${eventsAnalyzed}`,
      },
    });

    if (warnings && warnings.length > 0) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `*⚠️ Alertas (${warnings.length}):*\n` +
            warnings.map((w: string) => `• ${w}`).join("\n"),
        },
      });
    }

    if (mealGroups && Object.keys(mealGroups).length > 0) {
      blocks.push({ type: "divider" });

      Object.entries(mealGroups).forEach(([type, items]: [string, any]) => {
        let typeEmoji = "🍽️";
        if (type === "ALMUERZO") typeEmoji = "🍽️";
        else if (type === "REFRIGERIO") typeEmoji = "🥪";
        else if (type === "DESAYUNO") typeEmoji = "☕";
        else if (type === "MENU INFANTIL") typeEmoji = "👶";
        else if (type === "VEGETARIANO") typeEmoji = "🥗";
        else if (type === "OTRO") typeEmoji = "📦";

        let sectionText = `*${typeEmoji} ${type}*\n`;
        items.forEach((item: any) => {
          sectionText += `• *${item.quantity}* x ${item.category}\n`;
        });

        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: sectionText,
          },
        });
      });
    }

    const slackPayload = {
      channel: channel || "#eventos-los-arrayanes",
      blocks: blocks,
    };

    const response = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slack API error: ${response.status} ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
