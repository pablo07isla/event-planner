// Re-procesa con IA los eventos cuyo catering_intelligence está vacío ({} o null).
// Uso (desde event-planner/):
//   node scripts/backfill-catering.mjs            -> procesa los pendientes
//   node scripts/backfill-catering.mjs --dry-run  -> solo lista los pendientes
import { readFileSync } from "node:fs";

const ENV_FILE = process.env.ENV_FILE || ".env.local";
const DELAY_MS = 1500;
const isDryRun = process.argv.includes("--dry-run");

const env = Object.fromEntries(
  readFileSync(ENV_FILE, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const SUPABASE_URL = env.REACT_APP_SUPABASE_URL;
const ANON_KEY = env.REACT_APP_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !ANON_KEY) {
  console.error(`Faltan REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY en ${ENV_FILE}`);
  process.exit(1);
}

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPendingEvents() {
  const url =
    `${SUPABASE_URL}/rest/v1/events` +
    "?select=id,companyName,title,peopleCount,eventDescription,catering_intelligence" +
    "&or=(catering_intelligence.is.null,catering_intelligence.eq.%7B%7D)" +
    "&eventDescription=not.is.null";
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Error leyendo eventos: ${res.status} ${await res.text()}`);
  const events = await res.json();
  return events.filter((e) => e.eventDescription && e.eventDescription.trim());
}

async function analyzeEvent(eventId) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/catering-intelligence`, {
    method: "POST",
    headers,
    body: JSON.stringify({ eventId }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return body.data;
}

const events = await fetchPendingEvents();
console.log(`Eventos pendientes de análisis: ${events.length} (proyecto ${SUPABASE_URL})`);

if (isDryRun) {
  events.forEach((e) => console.log(` - ${e.id}  ${e.companyName || e.title} (${e.peopleCount} pax)`));
  process.exit(0);
}

let okCount = 0;
const failures = [];
for (const [i, event] of events.entries()) {
  const label = `[${i + 1}/${events.length}] ${event.companyName || event.title}`;
  try {
    const data = await analyzeEvent(event.id);
    const itemCount = Object.values(data?.mealGroups || {}).flat().length;
    console.log(`OK   ${label} -> ${itemCount} ítems`);
    okCount++;
  } catch (err) {
    console.log(`FAIL ${label} -> ${err.message.split("\n")[0]}`);
    failures.push({ id: event.id, error: err.message });
    // Créditos agotados: no tiene sentido seguir
    if (/402|prepayment credits/i.test(err.message)) {
      console.error("Créditos de Gemini agotados. Deteniendo.");
      break;
    }
  }
  await sleep(DELAY_MS);
}

console.log(`\nTerminado: ${okCount} OK, ${failures.length} fallidos.`);
if (failures.length) failures.forEach((f) => console.log(` - ${f.id}: ${f.error.split("\n")[0]}`));
