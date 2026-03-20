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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const payload = await req.json();
    console.log("Payload received:", payload);

    // Support both direct calls (frontend) and webhooks (database)
    // Direct call payload: { eventId: "..." }
    // Webhook payload: { record: { ... } }
    let eventId;
    let eventDescription;
    let peopleCount = 0;

    if (payload.eventId) {
      // Direct call - fetch event data first
      eventId = payload.eventId;
      const { data: eventData, error: eventError } = await supabaseClient
        .from("events")
        .select("eventDescription, peopleCount")
        .eq("id", eventId)
        .single();

      if (eventError || !eventData) {
        throw new Error(`Event not found: ${eventError?.message}`);
      }
      eventDescription = eventData.eventDescription;
      peopleCount = eventData.peopleCount || 0;
    } else if (payload.record) {
      // Webhook call — guard against infinite loop
      // The function updates catering_intelligence on this same table,
      // which fires the webhook again. Only re-process if the fields
      // that actually feed the AI prompt have changed.
      if (payload.old_record) {
        const descChanged = payload.record.eventDescription !== payload.old_record.eventDescription;
        const countChanged = payload.record.peopleCount !== payload.old_record.peopleCount;
        if (!descChanged && !countChanged) {
          return new Response(
            JSON.stringify({ message: "No relevant changes, skipping to avoid loop" }),
            { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
          );
        }
      }
      eventId = payload.record.id;
      eventDescription = payload.record.eventDescription;
      peopleCount = payload.record.peopleCount || 0;
    } else if (payload.testDescription) {
      // Test call - direct text analysis
      eventId = "test-execution";
      eventDescription = payload.testDescription;
      peopleCount = payload.testPeopleCount || 0;
    } else {
      throw new Error(
        "Invalid payload: missing eventId, record, or testDescription",
      );
    }

    if (!eventDescription) {
      return new Response(
        JSON.stringify({ message: "No description to analyze", result: [] }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
      );
    }

    // 1. Call Gemini API
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("Missing GEMINI_API_KEY secret");
    }

    const prompt = `
You are a Catering Normalizer AI. Your job is to convert free-text catering descriptions into standard categories and extract quantities.

NÚMERO DE PERSONAS DEL EVENTO: ${peopleCount}

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

### REFRIGERIO AM (snacks de la mañana):
- Dedo de Queso
- Empanadas (cada refrigerio de empanada = 2 empanadas, así que multiplica la cantidad por 2)
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

### REFRIGERIO PM (snacks de la tarde):
- Dedo de Queso
- Empanadas (cada refrigerio de empanada = 2 empanadas, así que multiplica la cantidad por 2)
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
- Huevos Rancheros
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
    "REFRIGERIO AM": [],
    "REFRIGERIO PM": [],
    "DESAYUNO": [],
    "MENU INFANTIL": [],
    "VEGETARIANO": [],
    "OTRO": []
  }
}

RULES:
1. Group items by mealType: ALMUERZO, REFRIGERIO AM, REFRIGERIO PM, DESAYUNO, MENU INFANTIL, VEGETARIANO, OTRO.
2. Extract the quantity from the text (default to 1 if not specified).
3. CRITICAL — "POR PERSONA" RULE: When text says "X por persona", "X x persona", "X pp", or similar per-person expressions, multiply X by the NÚMERO DE PERSONAS DEL EVENTO (${peopleCount}). Example: "Cervezas 2 x persona" with 150 personas = quantity 300.
4. Use "notes" for any special instructions (e.g., "sin cebolla", "con ensalada").
5. REFRIGERIO AM vs PM: If the description specifies "Refrigerio AM" or "refrigerio am", place items in "REFRIGERIO AM". If it specifies "Refrigerio PM" or "refrigerio pm", place items in "REFRIGERIO PM". If no AM/PM is specified, default to "REFRIGERIO AM".
6. EMPANADAS RULE: Each "refrigerio de empanada" includes 2 empanadas per person. So if 150 refrigerios de empanada are ordered, the quantity of empanadas is 300 (150 × 2).
7. If no food is detected, return: {"mealGroups": {}}
    `;

    // Try primary model, fallback to secondary on 503/429 errors
    const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
    let geminiData;

    for (const model of models) {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      if (geminiResponse.ok) {
        geminiData = await geminiResponse.json();
        console.log(`Success with model: ${model}`);
        break;
      }

      const errorText = await geminiResponse.text();
      console.warn(`Model ${model} failed (${geminiResponse.status}): ${errorText}`);

      // Only retry on 503 (unavailable) or 429 (rate limit)
      if (geminiResponse.status !== 503 && geminiResponse.status !== 429) {
        throw new Error(`Gemini API Error: ${geminiResponse.status} - ${errorText}`);
      }

      // If last model also failed, throw
      if (model === models[models.length - 1]) {
        throw new Error(`All Gemini models unavailable. Last error: ${geminiResponse.status} - ${errorText}`);
      }
    }
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
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
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
      },
    );
  }
});
