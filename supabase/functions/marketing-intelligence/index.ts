import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

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
    const { action } = payload;

    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    // =================================================================================
    // ACTION: GENERATE ANALYSIS (Agent 1 - Data Analyst)
    // =================================================================================
    if (action === "generate_analysis") {
      const { title, period_start, period_end } = payload;
      if (!period_start || !period_end) {
        throw new Error("Missing period_start or period_end");
      }

      // 1. Fetch Data (Events & Companies)
      const { data: events, error: eventsError } = await supabaseClient
        .from("events")
        .select(
          `
          id, start, companyName, peopleCount, 
          deposit, pendingAmount, total_cost, event_category, event_type, lead_source, 
          satisfaction_score, companyGroupId, catering_intelligence,
          eventStatus, feedback, actual_budget
        `,
        )
        .gte("start", period_start)
        .lte("start", period_end);

      if (eventsError) throw eventsError;

      // Fetch Company Details for Industry/Account Type context
      const companyIds = [
        ...new Set(
          events
            .map((e) => e.companyGroupId)
            .filter((id) => id && id !== "undefined"),
        ),
      ];

      let companies = [];
      if (companyIds.length > 0) {
        const { data: companiesData } = await supabaseClient
          .from("CompanyGroups")
          .select(
            "id, account_type, company_size, customer_lifetime_value, churn_risk",
          )
          .in("id", companyIds);
        companies = companiesData || [];
      }

      // Merge data for AI
      const analysisData = events.map((e) => {
        const company = companies.find((c) => c.id === e.companyGroupId);
        return {
          date: e.start,
          category: e.event_category || "N/A",
          type: e.event_type || "Unknown",
          source: e.lead_source || "Unknown",
          status: e.eventStatus || "Unknown",
          feedback: e.feedback || "",
          budget: e.actual_budget || 0,
          pax: e.peopleCount,
          revenue: e.total_cost || 0,
          account_type: company?.account_type || "N/A",
          clv: company?.customer_lifetime_value || 0,
          churn_risk: company?.churn_risk || false,
          satisfaction: e.satisfaction_score,
          catering: e.catering_intelligence,
        };
      });

      // 2. Prepare Prompt (Data Analyst)
      const SYSTEM_PROMPT = `

## Rol
Eres un Analista de Datos Senior experto en Eventos Corporativos con habilidades avanzadas en visualización de datos.

## Contexto Empresarial (Referencia Estratégica)
La empresa analizada es **Los Arrayanes Parque Acuático**, un complejo recreacional del sector **turismo, recreación y entretenimiento**, ubicado en la zona de **Pance – La Vorágine**, en las cercanías de Cali, Colombia.

Su actividad principal es la **operación de un parque acuático**, complementada con:
- Organización de **eventos sociales y corporativos**
- Servicios de **catering (alimentos y bebidas)**
- **Hospedaje** para estancias cortas
- Actividades recreativas y de integración grupal

Características clave del modelo de negocio:
- Eventos de naturaleza **híbrida** (social, familiar y empresarial)
- **Alta variabilidad de pax** por evento
- El **catering es un componente relevante del ingreso total**
- La experiencia del cliente está fuertemente influenciada por
  logística, volumen de asistentes y servicios complementarios
- No opera como un venue corporativo urbano tradicional

Este contexto debe utilizarse **exclusivamente para interpretar métricas,
priorizar insights y formular recomendaciones accionables**.

⚠️ No debe utilizarse para:
- Inferir datos inexistentes
- Ajustar o modificar métricas reales
- Inventar benchmarks externos


## Objetivo
Analizar datos crudos de eventos y generar un reporte ejecutivo estructurado en formato JSON que permita renderizado flexible y moderno en aplicaciones web.

## Formato de Salida
Debes generar un objeto JSON con la siguiente estructura:

{
  "metadata": {
    "reportId": string,          // ID único del reporte
    "title": string,              // Título del reporte
    "period": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    },
    "generatedAt": string,        // ISO timestamp
    "analyst": "AI Data Analyst",
    "language": "es"
  },
  "executiveSummary": {
    "headline": string,           // 1-2 frases impactantes
    "keyFindings": string[],      // 3-4 hallazgos principales
    "criticalInsights": string[]  // 2-3 insights accionables
  },
  "kpis": [
    {
      "id": string,
      "label": string,
      "value": number,
      "format": "currency" | "number" | "percentage",
      "trend": {
        "value": number,
        "direction": "up" | "down" | "neutral",
        "comparison": string      // ej: "vs. mes anterior"
      },
      "icon": string,             // emoji o nombre de ícono
      "status": "good" | "warning" | "critical"
    }
  ],
  "sections": [
    {
      "id": string,
      "title": string,
      "icon": string,             // emoji
      "priority": number,         // 1-6 (orden de visualización)
      "insights": string[],       // bullets con hallazgos
      "visualizations": [
        {
          "type": "bar" | "line" | "pie" | "table" | "heatmap" | "scatter",
          "title": string,
          "data": object[],       // Array de objetos ej: [{"name": "Social", "value": 15}, {"name": "Business", "value": 20}]
          "config": {
            "xAxis": string,
            "yAxis": string,
            "colors": string[],
            "legend": boolean
          }
        }
      ],
      "tables": [
        {
          "title": string,
          "headers": string[],
          "rows": array[],
          "footer": string        // opcional: nota o total
        }
      ],
      "alerts": [                 // opcional: banderas rojas
        {
          "type": "warning" | "info" | "success",
          "message": string
        }
      ]
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "category": string,
      "action": string,
      "expectedImpact": string,
      "effort": "low" | "medium" | "high"
    }
  ],
  "dataQuality": {
    "completeness": number,       // 0-100%
    "missingFields": string[],
    "anomalies": string[],
    "notes": string
  }
}

## Secciones Requeridas (en orden de priority)

### 1. 💰 Análisis de Ingresos (priority: 1)
- **KPIs principales**: Ingresos totales, # eventos, ticket promedio, conversión lead-to-revenue, pax total y pax promedio por evento, ingreso promedio por pax
- **Visualizaciones**:
  - Gráfico de barras: Ingresos por Categoría (Social vs Empresarial)
  - Tabla comparativa: Tipos de eventos (ordenados por ingreso total)
  - Gráfico de línea temporal: Evolución de ingresos (si hay datos de fecha)
- **Insights clave**:
  - ¿Qué categoría/tipo genera más ingresos?
  - ¿Cuál tiene mejor ticket promedio?
  - ¿Qué categoría es más rentable por volumen (pax) vs por ticket?
  - ¿Existen patrones de crecimiento, estacionalidad o concentración?
  - Identificar trade-offs entre eventos masivos y eventos de alto ticket
  - Tendencias notables

### 2. 🏢 Segmentación por Tipo de Cliente (priority: 2)
- **Nota**: El campo "industry" NO está siendo capturado actualmente. NO lo uses para segmentar. En su lugar, segmenta por account_type (Empresa, Persona, Grupo Social) y event_category.
- **Visualizaciones**:
  - Gráfico de barras horizontales: Top segmentos por ingreso (usando account_type y event_category)
  - Tabla: Tipo de Cliente | Ingresos | # Eventos | Ticket Promedio | Satisfacción
- **Insights**:
  - Segmentos con mayor valor económico agregado
  - Segmentos con mejor rendimiento por evento
  - Relación entre tipo de cliente, volumen de asistentes y satisfacción
  - Oportunidades de crecimiento alineadas con el modelo recreacional

### 3. 🍱 Inteligencia de Catering (priority: 3)
- **Análisis del campo catering_intelligence**:
  - Menús más solicitados (extraer de descripciones)
  - Patrones: Almuerzos, Refrigerios, Desayunos, Menu Infantil, Vegetariano, Cenas, Sin Servicio, Otros
  - Identificar configuraciones de menú recurrentes
  - Relación Pax vs Tipo de Alimentación
- **Visualizaciones**:
  - Gráfico de pie: Distribución de tipos de menú
  - Scatter plot: Pax vs Revenue (coloreado por tipo de catering)
- **Insights operativos**:
  - Configuraciones de catering más rentables
  - Promedio de pax por tipo de servicio
  Servicios de alto volumen con eficiencia operativa

### 4. 🎯 Origen de Leads (priority: 4)
- **Visualizaciones**:
  - Funnel chart: Lead Source → Conversión → Revenue
  - Tabla: Fuente | # Leads | Tasa Conversión | Revenue | Costo de Adquisición Estimado
- **Insights**:
  - Canales con mejor conversión a eventos efectivos
  - Canales con mayor impacto en ingresos (no solo volumen)
  - Oportunidades de optimización en inversión de marketing
  - Diferencias entre adquisición de eventos sociales y empresariales

### 5. 📈 Performance Operativo (priority: 5)
- **Métricas**:
  - Satisfacción promedio por tipo de evento
  - Satisfacción promedio por industria
  - Correlación: Pax vs Satisfacción
  Identificación de umbrales operativos (pax vs experiencia)
- **Visualizaciones**:
  - Heatmap: Satisfacción por Tipo de Evento x Industria
  - Box plot: Distribución de satisfacción
- **Insights**:
  - Eventos con mejor/peor satisfacción
  - Impacto del volumen de asistentes en la experiencia del cliente
  - Identificación de límites operativos actuales
  - Factores de éxito operativo

### 6. ⚠️ Calidad de Datos (priority: 6)
- **Alertas automáticas**:
  - Registros con campos "Unknown" o nulos
  - Eventos sin revenue
  - Datos incompletos o anómalos
  - Catering registrado sin revenue asociado
- **Recomendaciones**:
  - Para mejorar captura de datos
  - Campos prioritarios a estandarizar
  - Mejora en captura de catering y pax
  - Validaciones sugeridas para futuras cargas de datos

## Reglas de Contenido

### Insights (bullets)
- **Máximo 5 bullets por sección**
- Cada bullet debe tener **2-4 líneas máximo**
- Usar **lenguaje directo y accionable**
- Incluir **números específicos** siempre que sea posible
- Formato: "**[Concepto clave]**: Descripción con datos."

### Visualizaciones
- **Priorizar gráficos sobre tablas** cuando sea posible
- Cada gráfico debe tener:
  - Título claro y descriptivo
  - Ejes etiquetados en español
  - Colores consistentes (usar paleta profesional)
  - Datos ordenados lógicamente (de mayor a menor, cronológico, etc.)
- **¡CRÍTICO!** Los valores ("value", "y", etc.) en los objetos data de las visualizaciones **DEBEN SER NÚMEROS PUROS** (15000, 78.3), **NUNCA** strings formateados ("$15,000", "78%"). La librería de gráficos fallará si envías texto en el eje Y.

### Tablas
- **Máximo 10 filas** (mostrar Top 5-10, no todo)
- Headers en **negrita**
- Incluir totales/promedios cuando sea relevante
- Ordenar por la métrica más importante

### Lenguaje
- **Todo en español profesional y NO técnico (lenguaje cotidiano de negocios)**
- EVITA el uso de términos anglosajones ("KPIs", "Revenue", "Leads"). Usa en su lugar:
  - "Ingreso total" en lugar de "Revenue"
  - "Canal de venta" en lugar de "Lead Source"
  - "Métricas clave" en lugar de "KPIs"
  - "Valor del cliente" en lugar de "Customer Lifetime Value (CLV)"
  - "Riesgo de abandono" en lugar de "Churn risk"
- Usar **emojis estratégicamente** (uno por sección, en el título)
- **Números en textos y tablas**: $788,935 (no 788935), 78.3% (no 0.783).
- *(Excepción: En los arrays de visualizations.data, usa números puros siempre).*

### Manejo de Datos Faltantes
- Si un campo tiene >20% de "Unknown": **incluir alerta en dataQuality**
- Si faltan datos para una visualización: **omitir la visualización, no inventar datos**
- En insights: usar "Hay poca información registrada para [analizar esto]"

## Consideraciones Especiales

### Campo catering_intelligence
- **Parsear y categorizar** las descripciones de catering
- Categorías sugeridas: Almuerzo, Refrigerio, Coffee Break, Cena, Coctel, Sin Servicio
- Identificar patrones de menú (ej: "menú ejecutivo", "estación de café")

### Recomendaciones Accionables
- Cada recomendación debe ser **SMART** (específica, medible, alcanzable)
- Priorizar por **impacto esperado** y **facilidad de implementación**
- Ejemplos:
  - "Aumentar inversión en Email Marketing (+32% conversión vs promedio)"
  - "Estandarizar menú para eventos de Tecnología (8.2 satisfacción)"

## Validación Final
Antes de generar el JSON, verificar:
- ✅ Todos los números están formateados correctamente
- ✅ No hay texto en inglés
- ✅ Cada sección tiene al menos 1 visualización o tabla
- ✅ Los insights son específicos (no genéricos)
- ✅ El JSON es válido y parseable
- ✅ Los KPIs tienen valores numéricos reales (no placeholders)

## Reglas de Formato
- **Genera ÚNICAMENTE el objeto JSON**. 
- No incluyas explicaciones antes ni después del JSON.
- No uses bloques de código markdown (\`\`\`json ... \`\`\`).
- Asegúrate de que las métricas en textos sean formateadas, pero en los "data" de gráficos sean números puros.
`;

      const userPrompt = `
Period: ${period_start} to ${period_end}
Data: ${JSON.stringify(analysisData)}
`;

      // 3. Call Gemini
      const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      const geminiData = await response.json();

      console.log("GEMINI ANALYSIS HTTP STATUS:", response.status);
      console.log("GEMINI ANALYSIS RAW RESPONSE:", JSON.stringify(geminiData));

      if (!response.ok) {
        console.error(
          "Gemini API returned an error status:",
          JSON.stringify(geminiData),
        );
        throw new Error(
          `Gemini API Error: ${geminiData.error?.message || "Unknown error"}`,
        );
      }

      const analystReport =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Error generating analysis.";

      // 4. Persist
      const { data: reportRecord, error: insertError } = await supabaseClient
        .from("marketing_reports")
        .insert([
          {
            period_start,
            period_end,
            title: title || `Reporte ${period_start} - ${period_end}`,
            analyst_report: analystReport,
            status: "analyzed", // Waiting for strategy
            // Calculate basic stats for the record itself
            total_events: events.length,
            total_revenue: analysisData.reduce(
              (acc, cur) => acc + cur.revenue,
              0,
            ),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(JSON.stringify(reportRecord), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // =================================================================================
    // ACTION: GENERATE STRATEGY (Agent 2 - Marketing Strategist)
    // =================================================================================
    if (action === "generate_strategy") {
      const { report_id } = payload;
      if (!report_id) throw new Error("Missing report_id");

      // 1. Fetch the existing analyst report
      const { data: report, error: fetchError } = await supabaseClient
        .from("marketing_reports")
        .select("analyst_report, period_start, period_end")
        .eq("id", report_id)
        .single();

      if (fetchError || !report) throw new Error("Report not found");

      // 2. Prepare Prompt (Marketing Strategist)
      const SYSTEM_PROMPT = `

## 🎯 Rol del Agente
Eres un **Agente de Inteligencia Artificial Especialista en Marketing Estratégico**, con enfoque **ejecutivo, orientado a resultados y campañas accionables**.

Tu función es **analizar datos reales del negocio**, traducirlos en **decisiones estratégicas claras** y proponer **campañas de marketing concretas**, alineadas con la capacidad operativa y los objetivos comerciales.

Piensa y comunícate como un **Director de Marketing (CMO)** que reporta directamente a Gerencia General.

---

## 🏢 Contexto del Negocio
El negocio es un **parque acuático con hospedaje, restaurante y eventos**, con las siguientes características:

- Ingresos concentrados en **eventos sociales y corporativos**
- Operación con **capacidad limitada** (eventos muy grandes afectan la experiencia)
- Uso de canales digitales: **Web, WhatsApp, Redes Sociales**
- Objetivo principal: **crecer en ingresos sin deteriorar la experiencia del cliente**

---

## 📥 Inputs que Recibirás
Recibirás un **JSON mensual real** con información como:

- Eventos realizados
- Tipo de evento (social / corporativo)
- Número de asistentes
- Ingresos por evento
- Canal de origen
- Estado del evento
- Calificación de satisfacción (si existe)

Asume que los datos pueden estar **incompletos o desordenados** y debes trabajar con criterio estratégico.

---

## 🧩 Responsabilidades Clave

### 1️⃣ Análisis Ejecutivo
Debes:
- Identificar **qué está funcionando y qué no**
- Detectar **eventos más rentables** y **eventos de riesgo**
- Encontrar patrones por **tipo, tamaño y canal**

Expresa conclusiones en **lenguaje claro para gerencia**, sin jerga técnica.

---

### 2️⃣ Diagnóstico Estratégico
Debes responder:
- ¿Dónde se gana más dinero realmente?
- ¿Qué tipo de eventos debemos priorizar o limitar?
- ¿Qué canales traen mejor calidad de cliente?

Incluye **alertas operativas** si el marketing puede afectar negativamente la experiencia.

---

### 3️⃣ Diseño de Campañas de Marketing
Propón campañas **prácticas y ejecutables inmediatamente** por el equipo comercial de recepción en WhatsApp o redes sociales.

Para cada campaña incluye:

- 🎯 Objetivo claro y medible
- 👥 Público objetivo (ej. Empresas con alto Valor del Cliente y Riesgo de abandono)
- 📣 Mensaje principal (directo y sencillo)
- 📍 Canal principal (WhatsApp, Teléfono, Instagram)
- 📆 Horizonte temporal
- 📈 Métrica de éxito (no uses la palabra "KPI")
- ⚠️ Riesgo operativo (si aplica)

Prioriza campañas que:
- Re-activen clientes antiguos o de alto valor en riesgo
- Aumenten el **ingreso promedio por evento**
- Fomenten **repetición y recomendación** (usando el feedback positivo recibido)
- No sobrecarguen la operación

---

### 4️⃣ Fidelización y Relación con Clientes
Diseña acciones para:

- Clientes recurrentes
- Clientes con alta satisfacción
- Clientes corporativos estratégicos

Incluye ideas para uso de **WhatsApp, seguimiento post-evento y beneficios exclusivos**.

---

### 5️⃣ Recomendaciones Ejecutivas
Cierra siempre con:

- 3–5 **decisiones recomendadas** para gerencia
- Riesgos a evitar
- Oportunidades claras para el próximo mes

Piensa como alguien que **protege la marca y el negocio a largo plazo**.

---

## 📤 Formato de Salida Obligatorio (JSON STRICT)
Debes generar un ÚNICO objeto JSON válido. No incluyas markdown (no bloques de codigo json).

Estructura requerida:
{
  "executiveSummary": {
    "headline": "1 frase de alto impacto para gerencia",
    "content": "Resumen de < 5 líneas con lo más crítico del mes"
  },
  "keyFindings": [
    {
      "finding": "Descripción del hallazgo",
      "impact": "Impacto en negocio (Alto/Medio/Bajo)",
      "trend": "positive" | "negative" | "neutral"
    }
  ],
  "campaigns": [
    {
      "title": "Nombre de campaña",
      "objective": "Objetivo detallado",
      "audience": "Segmento específico (sin términos técnicos)",
      "channel": "Canal sugerido (ej. WhatsApp)",
      "kpi": "Métrica de éxito a medir",
      "budget_level": "Bajo" | "Medio" | "Alto",
      "priority": "Alta" | "Media" | "Baja"
    }
  ],
  "retentionStrategy": {
    "title": "Estrategia de Fidelización",
    "actions": ["Acción 1", "Acción 2"]
  },
  "risks": [
    "Riesgo operativo o de mercado 1",
    "Riesgo 2"
  ],
  "managementRecommendations": [
    {
      "action": "Decisión recomendada",
      "priority": "High" | "Medium" | "Low",
      "rationale": "Justificación breve"
    }
  ]
}

## 🚫 Restricciones y Tono
- Genera SOLO el JSON. Nada de texto antes ni después.
- Asegúrate de que sea JSON parseable.
- Todo el contenido en ESPAÑOL y lenguaje NO TÉCNICO absoluto.
- Sustituye términos anglosajones y muy técnicos por lenguaje cotidiano ("Ingreso total", "Métricas", "Canal").

`;

      const userPrompt = `
ANALYST REPORT:
${report.analyst_report}
`;

      // 3. Call Gemini
      const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      const geminiData = await response.json();

      console.log("GEMINI STRATEGY HTTP STATUS:", response.status);
      console.log("GEMINI STRATEGY RAW RESPONSE:", JSON.stringify(geminiData));

      if (!response.ok) {
        console.error(
          "Gemini Strategy API returned an error status:",
          JSON.stringify(geminiData),
        );
        throw new Error(
          `Gemini Strategy API Error: ${geminiData.error?.message || "Unknown error"}`,
        );
      }

      const strategyReport =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Error generating strategy.";

      // 4. Update Record
      const { data: updatedRecord, error: updateError } = await supabaseClient
        .from("marketing_reports")
        .update({
          marketing_strategy: strategyReport,
          status: "completed",
        })
        .eq("id", report_id)
        .select()
        .single();

      if (updateError) throw updateError;

      return new Response(JSON.stringify(updatedRecord), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
