import ModalEvent from "../components/events/Modal";
import { AppSidebar } from "../components/sidebar/app-sidebar";
import { SiteHeader } from "../components/sidebar/site-header";
import { Badge } from "../components/ui/badge";
// Importaciones de shadcn/ui
import { Button } from "../components/ui/button";
import { Calendar as CalendarUI } from "../components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { SidebarInset } from "../components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { cn } from "../lib/utils";
import { supabase } from "../supabaseClient";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
// Importamos la localización en español
import { Calendar, Search, Building, Eye, Download } from "lucide-react";
import * as XLSX from "xlsx";
import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import CompanyEditSheet from "../components/companies/CompanyEditSheet";

const SearchEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [singleDate, setSingleDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [searchMode, setSearchMode] = useState("company");
  const [selectedCompany] = useState(""); // Restore selectedCompany and setSelectedCompany since it is used in the code logic

  // Estados para controlar la apertura de los popovers de los date pickers
  const [singleDatePopoverOpen, setSingleDatePopoverOpen] = useState(false);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

  // Estados para búsqueda de empresas
  const [activeTab, setActiveTab] = useState("events");
  const [companySearchResults, setCompanySearchResults] = useState([]);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [companyIdType, setCompanyIdType] = useState("");
  const [companyIdNumber, setCompanyIdNumber] = useState("");
  const [companySheetOpen, setCompanySheetOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);

  // Cargar la lista de empresas al iniciar
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { error } = await supabase
          .from("CompanyGroups")
          .select("id, identificationNumber, companyName")
          .order("companyName");

        if (error) throw error;
        // Los datos de las empresas no se utilizan actualmente
      } catch (err) {
        console.error("Error al cargar empresas:", err);
        setError("No se pudieron cargar las empresas");
      }
    };

    fetchCompanies();
  }, []);

  // Limpiar el campo de nombre de empresa cada vez que cambiamos a filtro por empresa
  useEffect(() => {
    if (searchMode === "company") {
      setSearchTerm("");
    }
  }, [searchMode]);

  // Resetear campos y resultados cuando se cambia de tab
  useEffect(() => {
    if (activeTab === "events") {
      // Limpiar búsqueda de empresas
      setCompanySearchTerm("");
      setCompanyIdType("");
      setCompanyIdNumber("");
      setCompanySearchResults([]);
    } else if (activeTab === "companies") {
      // Limpiar búsqueda de eventos
      setSearchTerm("");
      setCompanyId("");
      setSingleDate(null);
      setStartDate(null);
      setEndDate(null);
      setSearchResults([]);
      setSearchMode("company");
    }
    setError(null);
  }, [activeTab]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      // Modificamos la consulta para usar la relación específica
      let query = supabase.from("events").select("*");

      // Filtrar por nombre de empresa
      if (searchTerm) {
        query = query.ilike("companyName", `%${searchTerm}%`);
      }

      // Filtrar por número de identificación de empresa
      if (companyId) {
        // Primero, buscar las empresas que coinciden con el número de identificación
        const { data: matchingCompanies, error: companyError } = await supabase
          .from("CompanyGroups")
          .select("id")
          .ilike("identificationNumber", `%${companyId}%`);

        if (companyError) throw companyError;

        if (matchingCompanies && matchingCompanies.length > 0) {
          // Obtener los IDs de las empresas que coinciden
          const companyIds = matchingCompanies.map((company) => company.id);
          // Filtrar eventos por esos IDs de empresa
          query = query.in("companyGroupId", companyIds);
        } else {
          // Si no hay coincidencias, devolver un conjunto vacío
          setSearchResults([]);
          setLoading(false);
          return;
        }
      }

      // Filtrar por empresa seleccionada
      if (selectedCompany) {
        query = query.eq("companyGroupId", selectedCompany);
      }

      // Filtrar por fecha única (solo eventos en esa fecha)
      if (singleDate && searchMode === "singleDate") {
        // Formatear correctamente la fecha
        const dateOnly = format(singleDate, "yyyy-MM-dd");

        // Crear fechas en UTC para evitar problemas de zona horaria
        const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);

        console.log("Fecha de búsqueda:", dateOnly);
        console.log("Inicio del día (UTC):", startOfDay.toISOString());
        console.log("Fin del día (UTC):", endOfDay.toISOString());

        // Usar formato ISO8601 con offset local para la búsqueda
        query = query
          .gte("start", startOfDay.toISOString())
          .lt("start", endOfDay.toISOString());
      }

      // Filtrar por rango de fechas (solo considerando fecha de inicio)
      if (startDate && endDate && searchMode === "dateRange") {
        // Formatear correctamente las fechas
        const startDateOnly = format(startDate, "yyyy-MM-dd");
        const endDateOnly = format(endDate, "yyyy-MM-dd");

        // Crear fechas en UTC para evitar problemas de zona horaria
        const startOfStartDate = new Date(`${startDateOnly}T00:00:00.000Z`);
        const endOfEndDate = new Date(`${endDateOnly}T23:59:59.999Z`);

        console.log("Rango de fechas:", startDateOnly, "a", endDateOnly);
        console.log("Inicio del rango (UTC):", startOfStartDate.toISOString());
        console.log("Fin del rango (UTC):", endOfEndDate.toISOString());

        query = query
          .gte("start", startOfStartDate.toISOString())
          .lt("start", endOfEndDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Si necesitamos información de la empresa, hacemos una segunda consulta
      if (data && data.length > 0) {
        // Obtener los IDs de empresa únicos
        const companyGroupIds = [
          ...new Set(
            data
              .filter((event) => event.companyGroupId)
              .map((event) => event.companyGroupId)
          ),
        ];

        if (companyGroupIds.length > 0) {
          // Obtener información de las empresas
          const { data: companyData, error: companyError } = await supabase
            .from("CompanyGroups")
            .select("id, companyName, identificationNumber")
            .in("id", companyGroupIds);

          if (companyError) throw companyError;

          // Crear un mapa para acceso rápido
          const companyMap = {};
          companyData.forEach((company) => {
            companyMap[company.id] = company;
          });

          // Enriquecer los resultados con información de la empresa
          data.forEach((event) => {
            if (event.companyGroupId && companyMap[event.companyGroupId]) {
              event.companyInfo = companyMap[event.companyGroupId];
            }
          });
        }
      }

      // Ordenar los resultados por fecha de inicio (de menor a mayor)
      const sortedData = data
        ? [...data].sort((a, b) => {
            return new Date(a.start) - new Date(b.start);
          })
        : [];

      setSearchResults(sortedData);
      console.log("Resultados de búsqueda:", sortedData);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
      setError(`Error al realizar la búsqueda: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar empresas
  const handleCompanySearch = async () => {
    setLoading(true);
    setError(null);
    setCompanySearchResults([]);

    try {
      let query = supabase.from("CompanyGroups").select("*");

      if (companySearchTerm) {
        query = query.ilike("companyName", `%${companySearchTerm}%`);
      }
      if (companyIdNumber) {
        query = query.ilike("identificationNumber", `%${companyIdNumber}%`);
      }
      if (companyIdType) {
        query = query.eq("identificationType", companyIdType);
      }

      const { data, error } = await query.order("companyName");
      if (error) throw error;

      setCompanySearchResults(data || []);
    } catch (err) {
      console.error("Error en la búsqueda de empresas:", err);
      setError(`Error al buscar empresas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handler para ver/editar empresa
  const handleViewCompany = (company) => {
    setCurrentCompany(company);
    setCompanySheetOpen(true);
  };

  // Handler para actualizar empresa después de editar
  const handleCompanySuccess = (updatedCompany) => {
    setCompanySearchResults((prev) =>
      prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c))
    );
    setCompanySheetOpen(false);
  };

  const handleViewEvent = (event) => {
    // Procesar los attachments
    let attachments = [];
    try {
      if (event.attachments) {
        if (typeof event.attachments === "string") {
          attachments = JSON.parse(event.attachments);
        } else if (Array.isArray(event.attachments)) {
          attachments = event.attachments;
        }
      }
    } catch (e) {
      console.error("Error processing attachments:", e);
      attachments = [];
    }

    // Formatear las fechas
    const start = parseISO(event.start);
    const end = parseISO(event.end);

    // Preparar el evento para el modal
    setCurrentEvent({
      id: event.id,
      start: format(start, "yyyy-MM-dd'T'HH:mm"),
      end: format(end, "yyyy-MM-dd'T'HH:mm"),
      allDay: true,
      companyName: event.companyName || "",
      peopleCount: event.peopleCount || "",
      contactName: event.contactName || "",
      foodPackage: Array.isArray(event.foodPackage) ? event.foodPackage : [],
      contactPhone: event.contactPhone || "",
      email: event.email || "",
      eventLocation: event.eventLocation || "",
      eventDescription: event.eventDescription || "",
      deposit: event.deposit || "",
      pendingAmount: event.pendingAmount || "",
      attachments: attachments,
      eventStatus: event.eventStatus || "Pendiente",
      lastModified: event.lastModified || "",
      lastModifiedBy: event.lastModifiedBy || "",
      companyGroupId: event.companyGroupId || null,
      paymentHistory: event.paymentHistory || [],
    });

    setModalOpen(true);
  };

  const handleSaveEvent = async (formData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      // Convertir foodPackage a un array de PostgreSQL
      const foodPackageArray = formData.get("foodPackage")
        ? formData.get("foodPackage").split(",")
        : [];
      const foodPackagePostgres = `{${foodPackageArray
        .map((item) => `"${item}"`)
        .join(",")}}`;

      // Parsear los archivos adjuntos y asegurarse de que sea un array válido
      let attachments = [];
      try {
        const attachmentsStr = formData.get("attachments");
        if (attachmentsStr) {
          attachments = JSON.parse(attachmentsStr);
          attachments = attachments.map((attachment) => ({
            name: attachment.name,
            url: attachment.url,
            path: attachment.path,
          }));
        }
      } catch (e) {
        console.error("Error parsing attachments:", e);
        attachments = [];
      }

      // Parsear historial de pagos
      let paymentHistory = [];
      try {
        const paymentHistoryStr = formData.get("paymentHistory");
        if (paymentHistoryStr) {
          paymentHistory = JSON.parse(paymentHistoryStr);
        }
      } catch (e) {
        console.error("Error parsing paymentHistory:", e);
        paymentHistory = [];
      }

      // Manejar campos numéricos
      const deposit = formData.get("deposit");
      const pendingAmount = formData.get("pendingAmount");
      const peopleCount = formData.get("peopleCount");

      const eventData = {
        start: new Date(formData.get("startDate")).toISOString(),
        end: new Date(formData.get("endDate")).toISOString(),
        companyName: formData.get("companyName"),
        peopleCount: peopleCount ? parseInt(peopleCount, 10) || 0 : 0,
        contactName: formData.get("contactName"),
        foodPackage: foodPackagePostgres,
        contactPhone: formData.get("contactPhone"),
        email: formData.get("email"),
        eventLocation: formData.get("eventLocation"),
        eventDescription: formData.get("eventDescription"),
        deposit: deposit ? parseFloat(deposit.replace(/[^\d.-]/g, "")) || 0 : 0,
        pendingAmount: pendingAmount
          ? parseFloat(pendingAmount.replace(/[^\d.-]/g, "")) || 0
          : 0,
        eventStatus: formData.get("eventStatus"),
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser
          ? currentUser.username
          : "Usuario desconocido",
        companyGroupId: formData.get("companyGroupId"),
        attachments: attachments,
        paymentHistory: paymentHistory,
      };

      console.log("Saving event with data:", eventData);

      let response;
      if (formData.get("id")) {
        const { data, error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", formData.get("id"))
          .select();
        if (error) throw error;
        response = { data };
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert([eventData])
          .select();
        if (error) throw error;
        response = { data };
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("No se recibieron datos después de guardar el evento");
      }

      // Después de guardar, actualizar la lista de resultados
      await handleSearch();

      // Cerrar el modal
      setModalOpen(false);
    } catch (err) {
      console.error("Error detallado al guardar el evento:", err);
      setError(`Error al guardar el evento: ${err.message}`);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      if (currentEvent && currentEvent.id) {
        await supabase.from("events").delete().eq("id", currentEvent.id);

        // Actualizar la lista de resultados
        setSearchResults((prevResults) =>
          prevResults.filter((event) => event.id !== currentEvent.id)
        );

        // Cerrar el modal
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Error al eliminar el evento:", err);
      setError("Error al eliminar el evento. Por favor, inténtelo de nuevo.");
    }
  };

  // Función para formatear fechas con localización en español
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Función para formatear fechas en el botón con locale español
  const formatButtonDate = (date) => {
    return format(date, "PPP", { locale: es });
  };

  const handleDownloadExcel = () => {
    if (searchResults.length === 0) return;

    console.log("Generando Excel con", searchResults.length, "registros");

    const exportData = searchResults.map((event) => {
      // Calcular total si es posible, o simplemente mostrar abono y pendiente
      const deposit = event.deposit || 0;
      const pending = event.pendingAmount || 0;
      const total = deposit + pending;

      return {
        Empresa: event.companyName || "N/A",
        Contacto: event.contactName || "N/A",
        Teléfono: event.contactPhone || "N/A",
        Email: event.email || "N/A",
        "Fecha Inicio": isValidDate(event.start)
          ? format(parseISO(event.start), "dd/MM/yyyy HH:mm", { locale: es })
          : "Fecha inválida",
        "Fecha Fin": isValidDate(event.end)
          ? format(parseISO(event.end), "dd/MM/yyyy HH:mm", { locale: es })
          : "Fecha inválida",
        Personas: event.peopleCount || 0,
        Ubicación: event.eventLocation || "",
        Estado: event.eventStatus || "Pendiente",
        Descripción: event.eventDescription || "",
        Abono: deposit,
        Pendiente: pending,
        "Total (Est. from Abono+Pend)": total,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Eventos");

    // Generar nombre de archivo con fecha actual
    const fileName = `listado_eventos_${format(
      new Date(),
      "yyyy-MM-dd_HH-mm"
    )}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const isValidDate = (dateString) => {
    try {
      return !isNaN(new Date(dateString).getTime());
    } catch (e) {
      return false;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pendiente":
        return {
          bg: "bg-amber-200",
          text: "text-amber-800",
          dot: "bg-amber-500",
        };
      case "Con Abono":
        return {
          bg: "bg-emerald-200",
          text: "text-emerald-800",
          dot: "bg-emerald-500",
        };
      case "Pago Total":
        return {
          bg: "bg-blue-200",
          text: "text-blue-800",
          dot: "bg-blue-500",
        };
      default:
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          dot: "bg-red-500",
        };
    }
  };

  // Real user and handlers for sidebar functionality
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!token || !storedUser) {
      setUser(null);
    } else {
      setUser(storedUser);
    }
  }, []);

  const handleAddEvent = () => {
    setCurrentEvent({
      start: "",
      end: "",
      allDay: true,
      companyName: "",
      peopleCount: "",
      contactName: "",
      foodPackage: [],
      contactPhone: "",
      email: "",
      eventLocation: "",
      eventDescription: "",
      deposit: "",
      pendingAmount: "",
      attachments: null,
      eventStatus: "Pendiente",
    });
    setModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[Sidebar] Error signing out:", error);
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("[Sidebar] Unexpected error during sign out:", err);
    }
  };

  // Layout principal para ocupar todo el alto y ancho disponible
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <AppSidebar
        variant="inset"
        collapsible="offcanvas"
        currentUserData={user}
        onAddEvent={handleAddEvent}
        onLogout={handleLogout}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          <div className="flex-1 min-h-0 min-w-0 overflow-auto p-4 lg:p-6">
            <div className="flex-1 p-8 overflow-auto">
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Búsqueda
              </h1>
              <p className="text-muted-foreground mb-8">
                Encuentra y gestiona eventos y empresas
              </p>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="events"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Eventos
                  </TabsTrigger>
                  <TabsTrigger
                    value="companies"
                    className="flex items-center gap-2"
                  >
                    <Building className="h-4 w-4" />
                    Empresas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="events">
                  <Card>
                    <CardHeader>
                      <CardTitle>Filtros de Búsqueda</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant={
                              searchMode === "company" ? "default" : "outline"
                            }
                            onClick={() => {
                              setSearchMode("company");
                              setSearchTerm(""); // Limpiar campo al cambiar
                            }}
                            className="flex items-center"
                          >
                            <Building className="h-4 w-4 mr-2" />
                            Por Empresa
                          </Button>
                          <Button
                            variant={
                              searchMode === "singleDate"
                                ? "default"
                                : "outline"
                            }
                            onClick={() => {
                              setSearchMode("singleDate");
                              setStartDate(null);
                              setEndDate(null);
                            }}
                            className="flex items-center"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Fecha Específica
                          </Button>
                          <Button
                            variant={
                              searchMode === "dateRange" ? "default" : "outline"
                            }
                            onClick={() => {
                              setSearchMode("dateRange");
                              setSingleDate(null);
                            }}
                            className="flex items-center"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Rango de Fechas
                          </Button>
                        </div>

                        {searchMode === "company" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Nombre de Empresa
                              </label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                  placeholder="Buscar por nombre..."
                                  className="pl-10"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                N° Identificación de Empresa
                              </label>
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={companyId}
                                  onChange={(e) => setCompanyId(e.target.value)}
                                  placeholder="Buscar por N° identificación..."
                                  className="pl-10"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {searchMode === "singleDate" && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Fecha del Evento
                            </label>
                            <div>
                              <Popover
                                open={singleDatePopoverOpen}
                                onOpenChange={setSingleDatePopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !singleDate && "text-muted-foreground"
                                    )}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {singleDate
                                      ? formatButtonDate(singleDate)
                                      : "Seleccionar fecha"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <CalendarUI
                                    mode="single"
                                    selected={singleDate}
                                    onSelect={(date) => {
                                      setSingleDate(date);
                                      setSingleDatePopoverOpen(false);
                                    }}
                                    initialFocus
                                    locale={es}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        )}

                        {searchMode === "dateRange" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Desde
                              </label>
                              <div>
                                <Popover
                                  open={startDatePopoverOpen}
                                  onOpenChange={setStartDatePopoverOpen}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                      )}
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {startDate
                                        ? formatButtonDate(startDate)
                                        : "Fecha inicio"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <CalendarUI
                                      mode="single"
                                      selected={startDate}
                                      onSelect={(date) => {
                                        setStartDate(date);
                                        setStartDatePopoverOpen(false);
                                      }}
                                      initialFocus
                                      disabled={(date) =>
                                        endDate && date > endDate
                                      }
                                      locale={es}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Hasta
                              </label>
                              <div>
                                <Popover
                                  open={endDatePopoverOpen}
                                  onOpenChange={setEndDatePopoverOpen}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                      )}
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {endDate
                                        ? formatButtonDate(endDate)
                                        : "Fecha fin"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <CalendarUI
                                      mode="single"
                                      selected={endDate}
                                      onSelect={(date) => {
                                        setEndDate(date);
                                        setEndDatePopoverOpen(false);
                                      }}
                                      initialFocus
                                      disabled={(date) =>
                                        startDate && date < startDate
                                      }
                                      locale={es}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-center mt-6">
                          <Button
                            onClick={handleSearch}
                            className="w-full sm:w-auto"
                          >
                            <Search className="h-5 w-5 mr-2" />
                            Buscar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {loading && (
                    <div className="flex justify-center my-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}

                  {error && (
                    <Card className="mt-8 border-destructive">
                      <CardContent className="pt-6">
                        <p className="text-destructive">{error}</p>
                      </CardContent>
                    </Card>
                  )}

                  {searchResults.length > 0 ? (
                    <Card className="mt-8">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xl">
                          Resultados encontrados ({searchResults.length})
                        </CardTitle>
                        <Button
                          onClick={handleDownloadExcel}
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar Excel
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Empresa</TableHead>
                              <TableHead>Contacto</TableHead>
                              <TableHead>Fecha del Evento</TableHead>
                              <TableHead>Correo electrónico</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searchResults.map((event) => (
                              <TableRow key={event.id}>
                                <TableCell>
                                  <div className="font-medium">
                                    {event.companyName}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {event.peopleCount} personas
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>{event.contactName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {event.contactPhone}
                                  </div>
                                </TableCell>
                                <TableCell>{formatDate(event.start)}</TableCell>
                                <TableCell>{event.email}</TableCell>
                                <TableCell>
                                  <Badge
                                    className={`${
                                      getStatusColor(event.eventStatus).bg
                                    } ${
                                      getStatusColor(event.eventStatus).text
                                    } whitespace-nowrap`}
                                  >
                                    {event.eventStatus}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewEvent(event)}
                                    className="flex items-center"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    !loading && (
                      <Card className="mt-8">
                        <CardContent className="text-center py-6">
                          <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            No hay resultados que mostrar
                          </h3>
                          <p className="text-muted-foreground">
                            {searchResults.length === 0 &&
                            (singleDate ||
                              startDate ||
                              endDate ||
                              searchTerm ||
                              companyId)
                              ? "No se encontraron eventos que coincidan con tu búsqueda. Intenta con otros criterios."
                              : "Utiliza los filtros para buscar eventos por empresa o fecha."}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  )}
                </TabsContent>

                <TabsContent value="companies">
                  <Card>
                    <CardHeader>
                      <CardTitle>Filtros de Búsqueda de Empresas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Nombre de Empresa
                            </label>
                            <Input
                              type="text"
                              value={companySearchTerm}
                              onChange={(e) =>
                                setCompanySearchTerm(e.target.value)
                              }
                              placeholder="Buscar por nombre..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Tipo de Identificación
                            </label>
                            <select
                              value={companyIdType}
                              onChange={(e) => setCompanyIdType(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Todos</option>
                              <option value="NIT">NIT</option>
                              <option value="CC">CC</option>
                              <option value="CE">CE</option>
                              <option value="PP">PP</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              N° Identificación
                            </label>
                            <Input
                              type="text"
                              value={companyIdNumber}
                              onChange={(e) =>
                                setCompanyIdNumber(e.target.value)
                              }
                              placeholder="Buscar por N°..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Button
                            onClick={handleCompanySearch}
                            className="w-full sm:w-auto"
                          >
                            <Search className="h-5 w-5 mr-2" />
                            Buscar Empresas
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {loading && (
                    <div className="flex justify-center my-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}

                  {error && (
                    <Card className="mt-8 border-destructive">
                      <CardContent className="pt-6">
                        <p className="text-destructive">{error}</p>
                      </CardContent>
                    </Card>
                  )}

                  {companySearchResults.length > 0 ? (
                    <Card className="mt-8">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Empresa</TableHead>
                              <TableHead>Identificación</TableHead>
                              <TableHead>Contacto</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Ciudad</TableHead>
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {companySearchResults.map((company) => (
                              <TableRow key={company.id}>
                                <TableCell>
                                  <div className="font-medium">
                                    {company.companyName}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>{company.identificationType}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {company.identificationNumber}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>{company.contactPerson}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {company.phone}
                                  </div>
                                </TableCell>
                                <TableCell>{company.email}</TableCell>
                                <TableCell>{company.city || "-"}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewCompany(company)}
                                    className="flex items-center"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver/Editar
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    !loading && (
                      <Card className="mt-8">
                        <CardContent className="text-center py-6">
                          <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
                            <Building className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            No hay resultados que mostrar
                          </h3>
                          <p className="text-muted-foreground">
                            {companySearchResults.length === 0 &&
                            (companySearchTerm ||
                              companyIdNumber ||
                              companyIdType)
                              ? "No se encontraron empresas que coincidan con tu búsqueda."
                              : "Utiliza los filtros para buscar empresas."}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  )}
                </TabsContent>
              </Tabs>

              <ModalEvent
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                event={currentEvent}
              />

              <CompanyEditSheet
                open={companySheetOpen}
                onClose={() => setCompanySheetOpen(false)}
                company={currentCompany}
                onSuccess={handleCompanySuccess}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default SearchEvents;
