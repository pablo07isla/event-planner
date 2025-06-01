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
    <div className="app-container">
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col dashboard-main-content">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <SectionCards />
              <ChartAreaInteractive />
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
