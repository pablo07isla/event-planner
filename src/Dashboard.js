import { AppSidebar } from "./components/app-sidebar";
import ChartAreaInteractive from "./components/chart-area-interactive.jsx";
import DataTable from "./components/data-table.jsx";
import SectionCards from "./components/section-cards.jsx";
import { SiteHeader } from "./components/site-header";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import data from "./dashboard/data.json";
import React, { useState, useEffect } from "react";

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

  const handleAddEvent = () => {
    // Puedes redirigir a la página de eventos o abrir un modal, según tu flujo
    window.location.href = "/events";
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
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                    Proximos Eventos
                  </h2>
                  <p className="text-muted-foreground">
                    Preparate para lo que viene
                  </p>
                </div>
                <SectionCards />
              </section>
              {/* Chart Section - Middle Section */}
              <section className="w-full">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                    Analytics
                  </h2>
                  <p className="text-muted-foreground">
                    Interactive data visualization and trends
                  </p>
                </div>
                <div className="rounded-lg border bg-card shadow-sm">
                  <ChartAreaInteractive />
                </div>
              </section>
              {/* Data Table Section - Bottom Section */}
              <section className="w-full">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                    Data Overview
                  </h2>
                  <p className="text-muted-foreground">
                    Detailed information and records
                  </p>
                </div>
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                  <DataTable data={data} />
                </div>
              </section>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
