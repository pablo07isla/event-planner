import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

const env = await load({ envPath: "./supabase/.env.local" });
const GEMINI_API_KEY = env["GEMINI_API_KEY"] || Deno.env.get("GEMINI_API_KEY");

if (!GEMINI_API_KEY) {
  console.error("No API key found in ./supabase/.env.local");
  Deno.exit(1);
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const req = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ role: "user", parts: [{ text: "Hello" }] }],
    generationConfig: { responseMimeType: "application/json" },
  }),
});

console.log("Status:", req.status, req.statusText);
const body = await req.json();
console.log("Body:", JSON.stringify(body, null, 2));
