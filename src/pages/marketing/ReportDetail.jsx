import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  ArrowLeft,
  Rocket,
  FileText,
  Loader2,
  Calendar,
  Target,
  DollarSign,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { AppSidebar } from "../../components/sidebar/app-sidebar";
import { SiteHeader } from "../../components/sidebar/site-header";
import { SidebarInset } from "../../components/ui/sidebar";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

const VisualRenderer = ({ viz }) => {
  if (!viz || !viz.type) return null;

  const { type, title, data, config } = viz;
  const colors = config?.colors || [
    "#4f46e5",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  // Helper to normalize data for Recharts
  let chartData = [];
  if (Array.isArray(data)) {
    chartData = data;
  } else if (typeof data === "object" && data !== null) {
    const keys = Object.keys(data);

    // Check for "Parallel Arrays" pattern (e.g. { labels: [], values: [] })
    const arrayValues = keys.filter((k) => Array.isArray(data[k]));

    if (arrayValues.length >= 2) {
      // Assume the first array is the axis (labels) and the second is values
      // Or prefer "labels", "categories", "x" as axis
      const axisKey =
        keys.find((k) =>
          ["labels", "categories", "x", "axis"].includes(k.toLowerCase())
        ) || arrayValues[0];
      const valueKey =
        keys.find((k) => k !== axisKey && Array.isArray(data[k])) ||
        arrayValues[1];

      if (data[axisKey] && data[valueKey]) {
        chartData = data[axisKey].map((label, i) => ({
          [config?.xAxis || "name"]: label,
          [config?.yAxis || "value"]: data[valueKey][i] || 0,
        }));
      } else {
        // Fallback to simple key-value if parallel array detection fails
        chartData = Object.entries(data).map(([key, value]) => ({
          [config?.xAxis || "name"]: key,
          [config?.yAxis || "value"]: value,
        }));
      }
    } else {
      // Standard Key-Value (e.g. { "Social": 10, "Corporate": 20 })
      chartData = Object.entries(data).map(([key, value]) => ({
        [config?.xAxis || "name"]: key,
        [config?.yAxis || "value"]: value,
      }));
    }
  }

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey={config?.xAxis || "name"}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
            />
            {config?.legend !== false && (
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: 20, fontSize: "11px" }}
              />
            )}
            <Bar
              dataKey={config?.yAxis || "value"}
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
              barSize={40}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey={config?.xAxis || "name"}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
            />
            {config?.legend !== false && (
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: 20, fontSize: "11px" }}
              />
            )}
            <Line
              type="monotone"
              dataKey={config?.yAxis || "value"}
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ r: 4, fill: colors[0], strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={config?.yAxis || "value"}
              nameKey={config?.xAxis || "name"}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
            />
            {config?.legend !== false && (
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: 20, fontSize: "11px" }}
              />
            )}
          </PieChart>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Bot className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-xs uppercase tracking-widest leading-loose">
              {type} chart not supported
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      <h5 className="text-sm font-semibold text-slate-700">{title}</h5>
      <div className="h-[300px] w-full bg-white rounded-lg border border-slate-100 p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("marketing_reports")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setReport(data);
    } catch (err) {
      console.error("Error fetching report:", err);
      toast.error("No se pudo cargar el reporte");
      navigate("/reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReport();
  }, [id]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleGenerateStrategy = async () => {
    setGeneratingStrategy(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "marketing-intelligence",
        {
          body: {
            action: "generate_strategy",
            report_id: id,
          },
        }
      );

      if (error) throw error;

      toast.success("¡Estrategia Generada con Éxito!");
      setReport(data); // Update local state with new strategy
    } catch (err) {
      console.error("Error generating strategy:", err);
      toast.error("Error al generar la estrategia: " + err.message);
    } finally {
      setGeneratingStrategy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-gray-100 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <AppSidebar
        variant="inset"
        collapsible="offcanvas"
        currentUserData={user}
        onAddEvent={() => {}}
        onLogout={handleLogout}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          <div className="flex-1 min-h-0 min-w-0 overflow-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col gap-4">
                <Button
                  variant="ghost"
                  className="w-fit pl-0 hover:bg-transparent"
                  onClick={() => navigate("/reports")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Reportes
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                      {report.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500 mt-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {(() => {
                          const formatDate = (dateString) => {
                            if (!dateString) return "";
                            const date = new Date(dateString);
                            const userTimezoneOffset =
                              date.getTimezoneOffset() * 60000;
                            return format(
                              new Date(date.getTime() + userTimezoneOffset),
                              "d MMM yyyy",
                              { locale: es }
                            );
                          };
                          return `${formatDate(
                            report.period_start
                          )} - ${formatDate(report.period_end)}`;
                        })()}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <Badge variant="outline" className="text-sm">
                        {report.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  {/* Action buttons could go here */}
                </div>
              </div>

              {/* Content */}
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="analysis">
                    <FileText className="mr-2 h-4 w-4" />
                    Análisis de Datos
                  </TabsTrigger>
                  <TabsTrigger value="strategy">
                    <Rocket className="mr-2 h-4 w-4" />
                    Plan Estratégico
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="analysis" className="mt-6">
                  {(() => {
                    let data = null;
                    try {
                      data = JSON.parse(report.analyst_report);
                    } catch (e) {
                      data = null;
                    }

                    if (!data) {
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle>Analista de Datos (IA)</CardTitle>
                            <CardDescription>
                              Informe basado en datos crudos de eventos y
                              empresas.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-slate max-w-none dark:prose-invert markdown-content">
                              <ReactMarkdown>
                                {report.analyst_report}
                              </ReactMarkdown>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    // Render Structured JSON Dashboard
                    return (
                      <div className="space-y-6">
                        {/* Executive Summary */}
                        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                          <CardHeader>
                            <CardTitle className="text-indigo-900 flex items-center gap-2">
                              <Bot className="h-5 w-5" />
                              Resumen Ejecutivo
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-xl font-medium text-slate-800 leading-relaxed">
                              {data.executiveSummary?.headline}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500">
                                  Hallazgos Clave
                                </h4>
                                <ul className="space-y-1">
                                  {data.executiveSummary?.keyFindings?.map(
                                    (f, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-slate-700"
                                      >
                                        <span className="text-indigo-500 mt-1">
                                          •
                                        </span>
                                        {f}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500">
                                  Insights Críticos
                                </h4>
                                <ul className="space-y-1">
                                  {data.executiveSummary?.criticalInsights?.map(
                                    (f, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-slate-700"
                                      >
                                        <span className="text-emerald-500 mt-1">
                                          ✓
                                        </span>
                                        {f}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {data.kpis?.map((kpi, i) => (
                            <Card key={i} className="overflow-hidden">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500">
                                      {kpi.label}
                                    </p>
                                    <h3 className="text-2xl font-bold tracking-tight">
                                      {kpi.format === "currency"
                                        ? `$${kpi.value.toLocaleString()}`
                                        : kpi.value.toLocaleString()}
                                      {kpi.format === "percentage" && "%"}
                                    </h3>
                                  </div>
                                  <div
                                    className={`p-2 rounded-lg ${
                                      kpi.status === "good"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : kpi.status === "warning"
                                        ? "bg-amber-50 text-amber-600"
                                        : "bg-rose-50 text-rose-600"
                                    }`}
                                  >
                                    <span className="text-xl">
                                      {kpi.icon || "📈"}
                                    </span>
                                  </div>
                                </div>
                                {kpi.trend && (
                                  <div className="mt-4 flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`
                                      ${
                                        kpi.trend.direction === "up"
                                          ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                                          : kpi.trend.direction === "down"
                                          ? "text-rose-600 bg-rose-50 border-rose-100"
                                          : "text-slate-600"
                                      }
                                    `}
                                    >
                                      {kpi.trend.direction === "up"
                                        ? "↑"
                                        : kpi.trend.direction === "down"
                                        ? "↓"
                                        : "→"}{" "}
                                      {kpi.trend.value}%
                                    </Badge>
                                    <span className="text-xs text-slate-400">
                                      {kpi.trend.comparison}
                                    </span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {/* Analysis Sections */}
                        {data.sections
                          ?.sort((a, b) => a.priority - b.priority)
                          .map((section, idx) => (
                            <Card key={idx} className="border-slate-200">
                              <CardHeader className="border-b bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">
                                    {section.icon}
                                  </span>
                                  <CardTitle className="text-lg">
                                    {section.title}
                                  </CardTitle>
                                </div>
                              </CardHeader>
                              <CardContent className="p-6 space-y-6">
                                {/* Insights Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  <div className="lg:col-span-1 space-y-4">
                                    <h4 className="font-semibold text-slate-900 border-l-4 border-indigo-500 pl-3">
                                      Observaciones
                                    </h4>
                                    <ul className="space-y-3">
                                      {section.insights?.map((ins, i) => (
                                        <li
                                          key={i}
                                          className="text-sm text-slate-600 relative pl-4"
                                        >
                                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300" />
                                          {ins}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="lg:col-span-2 space-y-4">
                                    {/* Tables Support */}
                                    {section.tables?.map((table, tIdx) => (
                                      <div key={tIdx} className="space-y-2">
                                        <h5 className="text-sm font-semibold text-slate-700">
                                          {table.title}
                                        </h5>
                                        <div className="rounded-md border overflow-hidden">
                                          <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                                              <tr>
                                                {table.headers?.map((h, i) => (
                                                  <th
                                                    key={i}
                                                    className="px-4 py-3"
                                                  >
                                                    {h}
                                                  </th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {table.rows?.map((row, rIdx) => (
                                                <tr
                                                  key={rIdx}
                                                  className="hover:bg-slate-50 transition-colors"
                                                >
                                                  {row.map((cell, cIdx) => (
                                                    <td
                                                      key={cIdx}
                                                      className="px-4 py-3 text-slate-700"
                                                    >
                                                      {cell}
                                                    </td>
                                                  ))}
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                        {table.footer && (
                                          <p className="text-[11px] text-slate-400 italic">
                                            {table.footer}
                                          </p>
                                        )}
                                      </div>
                                    ))}

                                    {/* Visualizations Support */}
                                    {section.visualizations?.map(
                                      (viz, vIdx) => (
                                        <VisualRenderer key={vIdx} viz={viz} />
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Alerts */}
                                {section.alerts?.map((alert, aIdx) => (
                                  <div
                                    key={aIdx}
                                    className={`p-3 rounded-lg flex items-center gap-3 text-sm ${
                                      alert.type === "warning"
                                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                                        : alert.type === "success"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-blue-50 text-blue-700 border border-blue-100"
                                    }`}
                                  >
                                    <span className="text-lg">
                                      {alert.type === "warning"
                                        ? "⚠️"
                                        : alert.type === "success"
                                        ? "✅"
                                        : "ℹ️"}
                                    </span>
                                    {alert.message}
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          ))}

                        {/* Recommendations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.recommendations?.map((rec, i) => (
                            <Card
                              key={i}
                              className={`border-l-4 ${
                                rec.priority === "high"
                                  ? "border-l-rose-500"
                                  : rec.priority === "medium"
                                  ? "border-l-amber-500"
                                  : "border-l-blue-500"
                              }`}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-center mb-1">
                                  <Badge
                                    variant="outline"
                                    className="capitalize text-[10px]"
                                  >
                                    {rec.category}
                                  </Badge>
                                  <Badge
                                    className={
                                      rec.priority === "high"
                                        ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                                        : rec.priority === "medium"
                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                        : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                    }
                                  >
                                    {rec.priority.toUpperCase()}
                                  </Badge>
                                </div>
                                <CardTitle className="text-base text-slate-800">
                                  {rec.action}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <p className="text-sm text-slate-600">
                                  {rec.expectedImpact}
                                </p>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                                    Esfuerzo: {rec.effort}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </TabsContent>

                <TabsContent value="strategy" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Estratega de Marketing (IA)</CardTitle>
                      <CardDescription>
                        Propuestas accionables basadas en el análisis de datos.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        let strategyData = null;
                        try {
                          strategyData = JSON.parse(report.marketing_strategy);
                        } catch (e) {
                          strategyData = null;
                        }

                        if (!report.marketing_strategy) {
                          return (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                              <div className="bg-indigo-50 p-4 rounded-full">
                                <Rocket className="h-8 w-8 text-indigo-600" />
                              </div>
                              <div className="max-w-md space-y-2">
                                <h3 className="text-xl font-semibold">
                                  ¿Listo para tomar acción?
                                </h3>
                                <p className="text-gray-500">
                                  Genera un plan estratégico personalizado
                                  basado en los hallazgos del análisis de datos.
                                </p>
                              </div>
                              <Button
                                size="lg"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                                onClick={handleGenerateStrategy}
                                disabled={generatingStrategy}
                              >
                                {generatingStrategy ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Pensando estrategias...
                                  </>
                                ) : (
                                  <>
                                    <Bot className="mr-2 h-4 w-4" />
                                    Generar Plan Estratégico
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        }

                        if (!strategyData) {
                          // Fallback to Markdown
                          return (
                            <div className="prose prose-indigo max-w-none dark:prose-invert">
                              <ReactMarkdown>
                                {report.marketing_strategy}
                              </ReactMarkdown>
                            </div>
                          );
                        }

                        // Render Structured JSON Strategy
                        return (
                          <div className="space-y-8">
                            {/* Executive Summary Block */}
                            <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg">
                              <h3 className="text-xl font-bold text-indigo-300 mb-2 flex items-center gap-2">
                                <Rocket className="h-6 w-6" />
                                {strategyData.executiveSummary?.headline ||
                                  strategyData.vision?.title}
                              </h3>
                              <p className="text-slate-300 leading-relaxed text-lg">
                                {strategyData.executiveSummary?.content ||
                                  strategyData.vision?.description}
                              </p>
                            </div>

                            {/* Key Findings (New) */}
                            {strategyData.keyFindings && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {strategyData.keyFindings.map((finding, i) => (
                                  <Card
                                    key={i}
                                    className="bg-slate-50 border-slate-200"
                                  >
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium text-slate-500 uppercase flex justify-between">
                                        Hallazgo Clave
                                        <Badge
                                          variant={
                                            finding.trend === "positive"
                                              ? "default"
                                              : "destructive"
                                          }
                                        >
                                          {finding.trend}
                                        </Badge>
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="font-bold text-slate-800 mb-1">
                                        {finding.finding}
                                      </p>
                                      <p className="text-sm text-slate-500">
                                        Impacto:{" "}
                                        <span className="font-medium text-slate-700">
                                          {finding.impact}
                                        </span>
                                      </p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}

                            {/* Campaigns Grid */}
                            <div>
                              <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                                <Target className="h-5 w-5 text-rose-500" />
                                Campañas Recomendadas
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {strategyData.campaigns?.map((camp, i) => (
                                  <div
                                    key={i}
                                    className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col h-full"
                                  >
                                    <div
                                      className={`absolute top-0 left-0 w-1 h-full ${
                                        camp.priority === "High"
                                          ? "bg-rose-500"
                                          : camp.priority === "Medium"
                                          ? "bg-amber-500"
                                          : "bg-blue-500"
                                      }`}
                                    />
                                    <div className="flex justify-between items-start mb-3">
                                      <h4 className="font-bold text-slate-900 line-clamp-2 pr-2">
                                        {camp.title}
                                      </h4>
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] shrink-0"
                                      >
                                        {camp.priority}
                                      </Badge>
                                    </div>

                                    <div className="space-y-3 text-sm flex-1">
                                      <div>
                                        <p className="text-[10px] uppercase text-slate-400 font-bold">
                                          Objetivo
                                        </p>
                                        <p className="text-slate-700">
                                          {camp.objective}
                                        </p>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <p className="text-[10px] uppercase text-slate-400 font-bold">
                                            Audiencia
                                          </p>
                                          <p className="text-slate-700 text-xs">
                                            {camp.audience}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] uppercase text-slate-400 font-bold">
                                            Canal
                                          </p>
                                          <p className="text-slate-700 text-xs truncate">
                                            {camp.channel}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t mt-2 flex justify-between items-center">
                                        <div>
                                          <p className="text-[10px] uppercase text-slate-400 font-bold">
                                            KPI
                                          </p>
                                          <p className="text-indigo-600 font-semibold text-xs">
                                            {camp.kpi}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] uppercase text-slate-400 font-bold">
                                            Presupuesto
                                          </p>
                                          <p className="text-emerald-600 font-semibold text-xs">
                                            {camp.budget_level}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Retention & Risks */}
                              <div className="space-y-6">
                                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 h-full">
                                  <h3 className="text-lg font-semibold mb-3 text-indigo-900 flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {strategyData.retentionStrategy?.title ||
                                      "Fidelización"}
                                  </h3>
                                  <ul className="space-y-2">
                                    {strategyData.retentionStrategy?.actions?.map(
                                      (act, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-2 text-sm text-indigo-800"
                                        >
                                          <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                          {act}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>

                              <div className="space-y-6">
                                <div className="bg-rose-50 p-6 rounded-lg border border-rose-100 h-full">
                                  <h3 className="text-lg font-semibold mb-3 text-rose-900 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Riesgos Potenciales
                                  </h3>
                                  <ul className="space-y-1">
                                    {strategyData.risks?.map((risk, i) => (
                                      <li
                                        key={i}
                                        className="text-sm text-rose-800 flex items-center gap-2"
                                      >
                                        <span className="text-rose-500 shrink-0">
                                          •
                                        </span>
                                        {risk}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Management Recommendations (New) */}
                            {strategyData.managementRecommendations && (
                              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4 text-emerald-900 flex items-center gap-2">
                                  <TrendingUp className="h-5 w-5" />
                                  Recomendaciones a Gerencia
                                </h3>
                                <div className="space-y-4">
                                  {strategyData.managementRecommendations.map(
                                    (rec, i) => (
                                      <div
                                        key={i}
                                        className="flex gap-4 items-start bg-white p-4 rounded border border-emerald-100 shadow-sm"
                                      >
                                        <div
                                          className={`mt-1 h-3 w-3 rounded-full shrink-0 ${
                                            rec.priority === "High"
                                              ? "bg-emerald-600"
                                              : "bg-emerald-400"
                                          }`}
                                        />
                                        <div>
                                          <h4 className="font-bold text-emerald-950">
                                            {rec.action}
                                          </h4>
                                          <p className="text-sm text-emerald-700 mt-1">
                                            {rec.rationale}
                                          </p>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="ml-auto border-emerald-200 text-emerald-700"
                                        >
                                          {rec.priority}
                                        </Badge>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
