import ChartAreaInteractive from "../components/dashboard/chart-area-interactive.jsx";
import SectionCards from "../components/dashboard/section-cards.jsx";
import ModalEvent from "../components/events/Modal";
import { AppSidebar } from "../components/sidebar/app-sidebar";
import { SiteHeader } from "../components/sidebar/site-header.jsx";
import { SidebarInset } from "../components/ui/sidebar";
import { supabase } from "../supabaseClient";
import { Trans } from "@lingui/macro";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Dashboard() {
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

  const [showEventModal, setShowEventModal] = useState(false);
  const [modalEventData, setModalEventData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch events from Supabase
  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("events").select();
    if (!error) setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = () => {
    setModalEventData(null); // Nuevo evento
    setShowEventModal(true);
  };

  const handleCloseEventModal = () => setShowEventModal(false);
  const handleSaveEvent = async (formData) => {
    try {
      // Obtener usuario actual
      const currentUser = JSON.parse(localStorage.getItem("user"));
      // Construir el objeto evento desde formData
      const eventData = {};
      for (let [key, value] of formData.entries()) {
        let mappedKey = key;
        if (key === "startDate") mappedKey = "start";
        if (key === "endDate") mappedKey = "end";
        if (mappedKey === "foodPackage") {
          eventData[mappedKey] = value ? value.split(",") : [];
        } else if (mappedKey === "attachments") {
          try {
            eventData[mappedKey] = value ? JSON.parse(value) : [];
          } catch (e) {
            eventData[mappedKey] = [];
          }
        } else if (
          mappedKey === "peopleCount" ||
          mappedKey === "deposit" ||
          mappedKey === "pendingAmount"
        ) {
          eventData[mappedKey] = value === "" ? 0 : Number(value);
        } else {
          eventData[mappedKey] = value;
        }
      }
      // Agregar campos de auditoría
      eventData.lastModified = new Date().toISOString();
      eventData.lastModifiedBy = currentUser
        ? currentUser.username
        : "Usuario desconocido";      // Si es edición
      if (eventData.id) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", eventData.id)
          .select();
        if (error) throw error;
        toast.success("Evento editado exitosamente.");
        setTimeout(() => {
          setShowEventModal(false);
          fetchEvents();
        }, 300);
      } else {
        const { error } = await supabase
          .from("events")
          .insert([eventData])
          .select();
        if (error) throw error;
        toast.success("Evento creado exitosamente.");
        setTimeout(() => {
          setShowEventModal(false);
          fetchEvents();
        }, 300);
      }
    } catch (err) {
      toast.error("Error al guardar el evento: " + (err.message || err));
    }
  };
  const handleDeleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);
      if (error) throw error;
      toast.success("Evento eliminado exitosamente.");
      setTimeout(() => {
        setShowEventModal(false);
        fetchEvents();
      }, 300);
    } catch (err) {
      toast.error("Error al eliminar el evento: " + (err.message || err));
    }
  };

  const handleLogout = async () => {
    try {
      // Si usas supabase:
      if (window.supabase && window.supabase.auth) {
        const { error } = await window.supabase.auth.signOut();
        if (error) {
          console.error("[Sidebar] Error signing out:", error);
        }
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/login";
    } catch (err) {
      console.error("[Sidebar] Unexpected error during sign out:", err);
    }
  };

  return (
    <div className="app-container min-h-screen flex">
      <AppSidebar
        variant="inset"
        collapsible="offcanvas"
        currentUserData={user}
        onAddEvent={handleAddEvent}
        onLogout={handleLogout}
      />
      <SidebarInset>
        <SiteHeader />
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="w-full max-w-none">
            {/* Content Grid Layout */}
            <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:gap-8 lg:p-8">
              {/* Section Cards - Top Section */}
              <section className="w-full">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                      <Trans>Proximos Eventos</Trans>
                    </h2>
                    <p className="text-muted-foreground">
                      <Trans>Preparate para lo que viene</Trans>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/pages/calendar")}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <Trans>Ir a calendario</Trans>
                  </button>
                </div>
                <SectionCards
                  events={events}
                  loading={loading}
                  refreshEvents={fetchEvents}
                  onDelete={handleDeleteEvent}
                  onSave={handleSaveEvent}
                />
              </section>
              {/* Chart Section - Middle Section */}
              <section className="w-full">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                    <Trans>Analytics</Trans>
                  </h2>
                  <p className="text-muted-foreground">
                    <Trans>Interactive data visualization and trends</Trans>
                  </p>
                </div>
                <div className="rounded-lg border bg-card shadow-sm">
                  <ChartAreaInteractive />
                </div>
              </section>
              {/* Data Table Section - Bottom Section */}
              {/* <section className="w-full">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                    <Trans>Data Overview</Trans>
                  </h2>
                  <p className="text-muted-foreground">
                    <Trans>Detailed information and records</Trans>
                  </p>
                </div>
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                  <DataTable data={data} />
                </div>
              </section> */}
            </div>
          </div>
        </main>
        {showEventModal && (
          <ModalEvent
            isOpen={showEventModal}
            onClose={handleCloseEventModal}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            event={modalEventData}
          />
        )}
      </SidebarInset>
    </div>
  );
}
