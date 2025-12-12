import React, { useState, useEffect } from "react";
import { AppSidebar } from "../components/sidebar/app-sidebar";
import { SiteHeader } from "../components/sidebar/site-header";
import { SidebarInset } from "../components/ui/sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Calendar, Building } from "lucide-react";
import { supabase } from "../supabaseClient";
import { format, parseISO } from "date-fns";
import * as XLSX from "xlsx";
import { es } from "date-fns/locale";

// Components
import ModalEvent from "../components/events/Modal";
import CompanyEditSheet from "../components/companies/CompanyEditSheet";
import EventSearchFilters from "../components/search/EventSearchFilters";
import EventResultsTable from "../components/search/EventResultsTable";
import CompanySearchFilters from "../components/search/CompanySearchFilters";
import CompanyResultsTable from "../components/search/CompanyResultsTable";

// Hooks
import { useEventSearch } from "../hooks/useEventSearch";
import { useCompanySearch } from "../hooks/useCompanySearch";
import { useEventMutations } from "../hooks/useEventMutations";

const SearchEvents = () => {
  // Global/Layout State
  const [activeTab, setActiveTab] = useState("events");
  const [modalOpen, setModalOpen] = useState(false);
  const [companySheetOpen, setCompanySheetOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [user, setUser] = useState(null);

  // Hooks
  const {
    searchTerm,
    setSearchTerm,
    companyId,
    setCompanyId,
    singleDate,
    setSingleDate,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchResults,
    setSearchResults, // Needed for optimistic updates if we wanted, or manual set
    loading: eventLoading,
    error: eventError,
    searchMode,
    setSearchMode,
    handleSearch,
  } = useEventSearch();

  const {
    companySearchResults,
    setCompanySearchResults,
    companySearchTerm,
    setCompanySearchTerm,
    companyIdType,
    setCompanyIdType,
    companyIdNumber,
    setCompanyIdNumber,
    loading: companyLoading,
    error: companyError,
    handleCompanySearch,
  } = useCompanySearch();

  // Mutation Hook
  const { handleSaveEvent, handleDeleteEvent } = useEventMutations({
    setModalOpen,
    setError: (msg) => console.error(msg), // Basic error handling, could improve
    onSuccess: handleSearch, // Refresh events on success
    currentEvent,
  });

  // Auth User Effect
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!token || !storedUser) {
      setUser(null);
    } else {
      setUser(storedUser);
    }
  }, []);

  // Reset logic when switching tabs
  useEffect(() => {
    if (activeTab === "events") {
      setCompanySearchTerm("");
      setCompanyIdType("");
      setCompanyIdNumber("");
      setCompanySearchResults([]);
    } else if (activeTab === "companies") {
      setSearchTerm("");
      setCompanyId("");
      setSingleDate(null);
      setStartDate(null);
      setEndDate(null);
      setSearchResults([]);
      setSearchMode("company");
    }
  }, [
    activeTab,
    setCompanySearchTerm,
    setCompanyIdType,
    setCompanyIdNumber,
    setCompanySearchResults,
    setSearchTerm,
    setCompanyId,
    setSingleDate,
    setStartDate,
    setEndDate,
    setSearchResults,
    setSearchMode,
  ]);

  // Handlers
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("[Sidebar] Error signing out:", err);
    }
  };

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

  const handleViewEvent = (event) => {
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

    const start = parseISO(event.start);
    const end = parseISO(event.end);

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

  const handleViewCompany = (company) => {
    setCurrentCompany(company);
    setCompanySheetOpen(true);
  };

  const handleCompanySuccess = (updatedCompany) => {
    setCompanySearchResults((prev) =>
      prev.map((c) => (c.id === updatedCompany.id ? updatedCompany : c))
    );
    setCompanySheetOpen(false);
  };

  // Move Excel Download Logic here or to hook?
  // Let's keep it here or extracted to util. Keeping here as simple local helper for now.
  const handleDownloadExcel = () => {
    if (searchResults.length === 0) return;
    console.log("Generando Excel con", searchResults.length, "registros");

    const exportData = searchResults.map((event) => {
      const deposit = event.deposit || 0;
      const pending = event.pendingAmount || 0;
      const total = deposit + pending;

      const isValidDate = (dateString) => {
        try {
          return !isNaN(new Date(dateString).getTime());
        } catch (e) {
          return false;
        }
      };

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
    const fileName = `listado_eventos_${format(
      new Date(),
      "yyyy-MM-dd_HH-mm"
    )}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

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
                      <EventSearchFilters
                        searchMode={searchMode}
                        setSearchMode={setSearchMode}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        companyId={companyId}
                        setCompanyId={setCompanyId}
                        singleDate={singleDate}
                        setSingleDate={setSingleDate}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        handleSearch={handleSearch}
                      />
                    </CardContent>
                  </Card>

                  <EventResultsTable
                    searchResults={searchResults}
                    loading={eventLoading}
                    error={eventError}
                    handleViewEvent={handleViewEvent}
                    handleDownloadExcel={handleDownloadExcel}
                  />
                </TabsContent>

                <TabsContent value="companies">
                  <Card>
                    <CardHeader>
                      <CardTitle>Filtros de Búsqueda de Empresas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CompanySearchFilters
                        companySearchTerm={companySearchTerm}
                        setCompanySearchTerm={setCompanySearchTerm}
                        companyIdType={companyIdType}
                        setCompanyIdType={setCompanyIdType}
                        companyIdNumber={companyIdNumber}
                        setCompanyIdNumber={setCompanyIdNumber}
                        handleCompanySearch={handleCompanySearch}
                      />
                    </CardContent>
                  </Card>

                  <CompanyResultsTable
                    companySearchResults={companySearchResults}
                    loading={companyLoading}
                    error={companyError}
                    handleViewCompany={handleViewCompany}
                  />
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
