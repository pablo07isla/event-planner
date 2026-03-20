import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_CHANNEL = Deno.env.get("SLACK_CHANNEL_ID") || "C0AML8MREF3";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Manejo de subida de archivos PDF (Multipart Form-Data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const channel = (formData.get("channel") as string) || DEFAULT_CHANNEL;

      if (!file) {
        throw new Error("No se proporcionó ningún archivo");
      }

      const slackBotToken = Deno.env.get("SLACK_BOT_TOKEN");
      if (!slackBotToken) {
        throw new Error(
          "SLACK_BOT_TOKEN no está configurada en las variables de entorno",
        );
      }

      // Paso 1: Obtener URL de carga externa
      const getUploadUrlRes = await fetch(
        "https://slack.com/api/files.getUploadURLExternal",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${slackBotToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            filename: file.name,
            length: file.size.toString(),
          }),
        },
      );

      const getUploadUrlData = await getUploadUrlRes.json();

      if (!getUploadUrlData.ok) {
        throw new Error(
          `Error getting upload URL from Slack: ${getUploadUrlData.error}`,
        );
      }

      const { upload_url, file_id } = getUploadUrlData;

      // Paso 2: Subir el archivo a la URL obtenida
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadRes = await fetch(upload_url, {
        method: "POST",
        body: uploadFormData, // fetch con FormData detecta límites y headers multipart
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(
          `Error uploading file to Slack URL: ${uploadRes.status} ${errorText}`,
        );
      }

      // Utilidad: Buscar el ID del canal si nos envían un nombre con #
      let targetChannelId = channel;
      if (channel.startsWith("#")) {
        const channelName = channel.substring(1);
        const convRes = await fetch(
          "https://slack.com/api/conversations.list?exclude_archived=true&types=public_channel,private_channel",
          {
            headers: { Authorization: `Bearer ${slackBotToken}` },
          },
        );
        const convData = await convRes.json();
        if (convData.ok && convData.channels) {
          const foundChannel = convData.channels.find(
            (c: any) => c.name === channelName,
          );
          if (foundChannel) {
            targetChannelId = foundChannel.id;
          } else {
            // If channel not found by name, proceed with original string, Slack will handle if it's an ID or invalid.
          }
        } else {
          throw new Error(
            `Error resolviendo el canal. Verifica que el bot tenga el scope channels:read y sea miembro del canal. Error Slack: ${convData.error}`,
          );
        }
      }

      // Paso 3: Completar carga y compartir
      const completeRes = await fetch(
        "https://slack.com/api/files.completeUploadExternal",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${slackBotToken}`,
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify({
            files: [{ id: file_id, title: file.name }],
            channel_id: targetChannelId,
            initial_comment: "Aquí está el reporte de eventos generado.",
          }),
        },
      );

      const completeData = await completeRes.json();

      if (!completeData.ok) {
        throw new Error(
          `Error completing upload to Slack: ${completeData.error}`,
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2. Manejo de texto y resúmenes de IA (JSON Block Kit)
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
      channel: channel || DEFAULT_CHANNEL,
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
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
