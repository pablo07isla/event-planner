import { AppSidebar } from "./components/app-sidebar";
import ChartAreaInteractive from "./components/chart-area-interactive.jsx";
import DataTable from "./components/data-table.jsx";
import SectionCards from "./components/section-cards.jsx";
import { SiteHeader } from "./components/site-header";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import data from "./dashboard/data.json";
import React from "react";

export default function Dashboard() {
  return (
    <div className="app-container min-h-screen flex">
      <AppSidebar variant="inset" collapsible="offcanvas" />
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
                    Overview
                  </h2>
                  <p className="text-muted-foreground">
                    Key metrics and performance indicators
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
