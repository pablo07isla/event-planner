import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload = await req.json();
    console.log("Payload received:", payload);

    // Support both direct calls (frontend) and webhooks (database)
    // Direct call payload: { eventId: "..." }
    // Webhook payload: { record: { ... } }
    let eventId;
    let eventDescription;

    if (payload.eventId) {
      // Direct call - fetch event data first
      eventId = payload.eventId;
      const { data: eventData, error: eventError } = await supabaseClient
        .from("events")
        .select("eventDescription")
        .eq("id", eventId)
        .single();

      if (eventError || !eventData) {
        throw new Error(`Event not found: ${eventError?.message}`);
      }
      eventDescription = eventData.eventDescription;
    } else if (payload.record) {
      // Webhook call
      eventId = payload.record.id;
      eventDescription = payload.record.eventDescription;
    } else if (payload.testDescription) {
      // Test call - direct text analysis
      eventId = "test-execution";
      eventDescription = payload.testDescription;
    } else {
      throw new Error(
        "Invalid payload: missing eventId, record, or testDescription"
      );
    }

    if (!eventDescription) {
      return new Response(
        JSON.stringify({ message: "No description to analyze", result: [] }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 1. Call Gemini API
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY secret");
    }

    const prompt = `
You are a Catering Normalizer AI. Your job is to convert free-text catering descriptions into standard categories and extract quantities.

STANDARD CATEGORIES (use EXACTLY these names, grouped by meal type):

### ALMUERZOS:
- Asado 2 Carnes (e.g., "A*2 carnes", "asado dos carnes", "asado X 2 carnes")
- Asado 3 Carnes (e.g., "A*3 carnes", "asado tres carnes")
- Pernil Asado
- Pernil Guisado
- Chuleta Cerdo
- Chuleta Pollo
- Filete Champiñones
- Tilapia Frita
- Tilapia Sudada (e.g., "tilapia en sancocho")

### MENU INFANTIL:
- Nuggets
- Hamburguesa

### VEGETARIANO:
- Vegetariano (opción vegetariana)

### REFRIGERIO (snacks AM/PM):
- Dedo de Queso
- Empanadas
- Aborrajado
- Papa Rellena
- Salchipapa
- Tostadas con carne
- Salpicon de frutas
- Vaso de Helado
- Café
- Café con Leche
- Chocolate
- Gaseosa

### DESAYUNO:
- Huevos Pericos
- Huevos Revueltos
- Huevos Cacerola
- Calentado
- Café
- Café con Leche
- Chocolate

### OTRO (items not matching above):
- List each unrecognized item INDIVIDUALLY using its original name as the category
- Examples: "Cerveza", "Agua", "Arroz con Pollo", etc.

---
EVENT DESCRIPTION TO ANALYZE:
"${eventDescription}"

---
OUTPUT FORMAT (JSON object, no markdown):
{
  "mealGroups": {
    "ALMUERZO": [
      {
        "category": "Asado 2 Carnes",
        "originalText": "A*2 CARNES",
        "quantity": 50,
        "notes": "con ensalada"
      }
    ],
    "REFRIGERIO": [],
    "DESAYUNO": [],
    "MENU INFANTIL": [],
    "VEGETARIANO": [],
    "OTRO": []
  }
}

RULES:
1. Group items by mealType: ALMUERZO, REFRIGERIO, DESAYUNO, MENU INFANTIL, VEGETARIANO, OTRO.
2. Extract the quantity from the text (default to 1 if not specified).
3. Use "notes" for any special instructions (e.g., "sin cebolla", "con ensalada").
4. If no food is detected, return: {"mealGroups": {}}
    `;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(
        `Gemini API Error: ${geminiResponse.status} - ${errorText}`
      );
    }

    const geminiData = await geminiResponse.json();
    let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Cleanup markdown if Gemini adds it despite instruction
    rawText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let cateringResult = { items: [], validation: {} };
    try {
      cateringResult = JSON.parse(rawText);
      // Ensure structure is valid
      if (!cateringResult.items) cateringResult.items = [];
      if (!cateringResult.validation) cateringResult.validation = {};
    } catch (e) {
      console.error("Failed to parse JSON from AI:", rawText);
      throw new Error("AI returned invalid JSON format");
    }

    // 2. Update Supabase
    const { error: updateError } = await supabaseClient
      .from("events")
      .update({ catering_intelligence: cateringResult })
      .eq("id", eventId);

    if (updateError) {
      throw new Error(`Failed to update event: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Analysis complete",
        data: cateringResult,
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Function error:", error);
    // Return 200 even on error to see the message easily in client
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error),
        stack: error.stack,
        debug: {
          hasGeminiKey: !!Deno.env.get("GEMINI_API_KEY"),
          hasServiceKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
          hasUrl: !!Deno.env.get("SUPABASE_URL"),
        },
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
