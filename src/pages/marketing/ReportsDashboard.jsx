import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { toast } from "sonner";
import {
  Bot,
  Calendar,
  FileText,
  Loader2,
  Plus,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { AppSidebar } from "../../components/sidebar/app-sidebar";
import { SiteHeader } from "../../components/sidebar/site-header";
import { SidebarInset } from "../../components/ui/sidebar";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";

export default function ReportsDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    period_start: "",
    period_end: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("marketing_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast.error("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateReport = async () => {
    if (!formData.title || !formData.period_start || !formData.period_end) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "marketing-intelligence",
        {
          body: {
            action: "generate_analysis",
            title: formData.title,
            period_start: formData.period_start,
            period_end: formData.period_end,
          },
        }
      );

      if (error) throw error;

      toast.success("¡Análisis Generado con Éxito!");
      setShowModal(false);

      // Add to list and navigate immediately or refresh
      setReports([data, ...reports]);
      navigate(`/reports/${data.id}`);
    } catch (err) {
      console.error("Error generating report:", err);
      toast.error("Error al generar el reporte: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper for Status Badge
  const getStatusBadge = (status) => {
    const styles = {
      analyzed: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    const labels = {
      analyzed: "Análisis Listo",
      completed: "Estrategia Completa",
      failed: "Fallido",
      processing: "Procesando",
    };
    return (
      <Badge variant="outline" className={styles[status] || styles.processing}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <AppSidebar
        variant="inset"
        collapsible="offcanvas"
        currentUserData={user}
        onAddEvent={() => {}} // No functionality needed here for adding events
        onLogout={handleLogout}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          <div className="flex-1 min-h-0 min-w-0 overflow-auto p-8 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Inteligencia de Mercado
                  </h1>
                  <p className="text-gray-500 mt-2">
                    Genera reportes impulsados por IA para analizar tus eventos
                    y crear estrategias de marketing.
                  </p>
                </div>
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Generar Nuevo Reporte
                </Button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-48 bg-gray-100 animate-pulse rounded-xl border"
                    />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Bot className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    No hay reportes aún
                  </h3>
                  <p className="text-gray-500">
                    Comienza generando tu primer análisis de mercado.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.map((report) => (
                    <Card
                      key={report.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/reports/${report.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-semibold line-clamp-1">
                            {report.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(report.period_start), "MMM d", {
                            locale: es,
                          })}{" "}
                          -{" "}
                          {format(new Date(report.period_end), "MMM d, yyyy", {
                            locale: es,
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>
                            {report.total_events || 0} Eventos analizados
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(report.status)}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-between group text-indigo-600 hover:text-indigo-700 p-0 hover:bg-transparent"
                        >
                          Ver Detalles
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* CREATE MODAL */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generar Análisis de Mercado</DialogTitle>
            <DialogDescription>
              El Agente Analista revisará los datos de tus eventos y empresas
              para encontrar tendencias.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título del Reporte</Label>
              <Input
                id="title"
                placeholder="Ej: Análisis Q4 2025"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Fecha Inicio</Label>
                <Input
                  id="start"
                  type="date"
                  value={formData.period_start}
                  onChange={(e) =>
                    setFormData({ ...formData, period_start: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">Fecha Fin</Label>
                <Input
                  id="end"
                  type="date"
                  value={formData.period_end}
                  onChange={(e) =>
                    setFormData({ ...formData, period_end: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateReport}
              disabled={isGenerating}
              className="bg-indigo-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Generar Análisis
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
