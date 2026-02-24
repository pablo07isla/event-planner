const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables
const envConfig = dotenv.parse(fs.readFileSync("./supabase/.env"));
const GEMINI_API_KEY =
  envConfig["GEMINI_API_KEY"] || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("No API key found in ./supabase/.env");
  process.exit(1);
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function test() {
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
}

test();
