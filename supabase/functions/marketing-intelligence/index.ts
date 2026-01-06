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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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
          deposit, pendingAmount, event_category, event_type, lead_source, 
          satisfaction_score, companyGroupId, catering_intelligence
        `
        )
        .gte("start", period_start)
        .lte("end", period_end);

      if (eventsError) throw eventsError;

      // Fetch Company Details for Industry/Account Type context
      const companyIds = [
        ...new Set(
          events
            .map((e) => e.companyGroupId)
            .filter((id) => id && id !== "undefined")
        ),
      ];

      let companies = [];
      if (companyIds.length > 0) {
        const { data: companiesData } = await supabaseClient
          .from("CompanyGroups")
          .select("id, account_type, industry, company_size")
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
          pax: e.peopleCount,
          revenue: (e.deposit || 0) + (e.pendingAmount || 0),
          industry: company?.industry || "N/A",
          account_type: company?.account_type || "N/A",
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

### 2. 🏢 Segmentación por Industria (priority: 2)
- **Visualizaciones**:
  - Gráfico de barras horizontales: Top 5 industrias por ingreso
  - Tabla: Industria | Ingresos | # Eventos | Ticket Promedio | Satisfacción
- **Insights**:
  - Industrias con mayor valor económico agregado
  - Industrias con mejor rendimiento por evento
  - Relación entre industria, volumen de asistentes y satisfacción
  - Oportunidades de crecimiento alineadas con el modelo recreacional

  Nota: La industria debe interpretarse como segmento de cliente, no exclusivamente como B2B tradicional.

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

### Tablas
- **Máximo 10 filas** (mostrar Top 5-10, no todo)
- Headers en **negrita**
- Incluir totales/promedios cuando sea relevante
- Ordenar por la métrica más importante

### Lenguaje
- **Todo en español profesional**
- Usar **emojis estratégicamente** (uno por sección, en el título)
- **Sin jerga técnica innecesaria**
- **Números formateados**: $788,935 (no 788935), 78.3% (no 0.783)

### Manejo de Datos Faltantes
- Si un campo tiene >20% de "Unknown": **incluir alerta en dataQuality**
- Si faltan datos para una visualización: **omitir la visualización, no inventar datos**
- En insights: usar "Información insuficiente para [análisis específico]"

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
- Asegúrate de que todas las métricas sean números o strings formateados según se pide.
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
        }),
      });

      const geminiData = await response.json();
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
              0
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

## Rol      
Eres el Director de Marketing (CMO).

## Contexto Empresarial (Marco Estratégico)
La empresa es **Los Arrayanes Parque Acuático**, un complejo recreacional del sector
turismo y entretenimiento ubicado en Pance (Cali, Colombia).

Su modelo de negocio combina:
- Parque acuático y recreación familiar
- Eventos sociales (familiares, celebraciones, integración)
- Eventos corporativos de tipo experiencial (outdoor, integración, bienestar)
- Servicios de catering como componente clave del ingreso

Características relevantes para marketing:
- Público mixto B2C (familias, grupos sociales) y B2B (empresas)
- Alto impacto del **volumen de asistentes (pax)** en ingresos
- Decisiones de compra influenciadas por experiencia, logística y precio
- Canales visuales y experienciales más efectivos que comunicación corporativa tradicional
- No compite como un venue corporativo urbano clásico

Este contexto debe usarse para:
- Definir audiencias, campañas y canales
- Priorizar presupuesto y mensajes
- Diseñar estrategias de adquisición y retención coherentes con el negocio

No debe utilizarse para contradecir los datos del Reporte JSON del Analista.

## Dependencia del Reporte del Analista
Tu única fuente de verdad es el **Reporte JSON generado por el Analista de Datos**.
No debes asumir información adicional ni contradecir métricas existentes.

## Reglas de Alineación
- KPIs → prioridades y presupuesto
- Insights → campañas, audiencias y mensajes
- Recomendaciones → iniciativas estratégicas
- Alertas y dataQuality → riesgos del plan
- Si no hay datos suficientes, refleja la limitación en la sección de riesgos

## Objetivo
Crear un **Plan Estratégico de Marketing** basado exclusivamente
en el **Reporte JSON del Analista de Datos**.

## Formato de Salida
Debes generar un objeto JSON con la siguiente estructura:

{
  "vision": {
    "title": "Visión Estratégica",
    "description": "Interpretación de alto nivel de la oportunidad."
  },
  "campaigns": [
    {
      "title": "Nombre de Campaña",
      "objective": "Objetivo SMART",
      "audience": "Target específico",
      "channel": "Canal principal",
      "hook": "Mensaje clave",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "retentionStrategy": {
    "title": "Fidelización",
    "actions": ["Acción 1", "Acción 2"],
    "expectedUplift": "Ej: +15% LTV"
  },
  "budgetAllocation": [
    {
      "category": "Canal/Acción",
      "percentage": 40,
      "amountSuggestion": "Estimado",
      "justification": "Por qué invertir aquí"
    }
  ],
  "risks": ["Riesgo 1", "Riesgo 2"]
}

## Reglas
- **Genera ÚNICAMENTE el objeto JSON**.
- No incluyas markdown (\`\`\`json).
- Todo en **ESPAÑOL**.
- Sé creativo pero básate en los datos del input.
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
        }),
      });

      const geminiData = await response.json();
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
