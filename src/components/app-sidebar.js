import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "./ui/sidebar";
import { Trans } from "@lingui/macro";
import {
  AudioWaveform,
  Frame,
  PieChart,
  Calendar,
  Search,
  Settings,
  Sparkles,
  Building2,
  Zap,
} from "lucide-react";
import React from "react";

// Enhanced data with modern icons and gradients
const data = {
  teams: [
    {
      name: "Event Planner",
      logo: Calendar,
      plan: "Enterprise",
      gradient: "from-blue-600 to-purple-600",
      bgColor:
        "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20",
    },
    {
      name: "Acme Corp.",
      logo: Building2,
      plan: "Startup",
      gradient: "from-emerald-600 to-teal-600",
      bgColor:
        "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
    },
    {
      name: "Evil Corp.",
      logo: Zap,
      plan: "Free",
      gradient: "from-orange-600 to-red-600",
      bgColor:
        "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    },
  ],
  navMain: [
    {
      url: "/dashboard",
      icon: PieChart,
      title: <Trans>Dashboard</Trans>,
      badge: "3",
      description: "Vista general del sistema",
    },
    {
      url: "pages/calendar",
      icon: Calendar,
      title: <Trans>Calendar</Trans>,
      description: "Gestiona tus eventos",
    },
    {
      url: "/search",
      icon: Search,
      title: <Trans>Search</Trans>,
      description: "Buscar contenido",
    },
    // {
    //   url: "/settings",
    //   icon: Settings,
    //   title: <Trans>Settings</Trans>,
    //   description: "Configuración del sistema",
    // },
  ],
  navMainCollapsible: [
    {
      url: "#",
      icon: Settings,
      title: <Trans>Settings</Trans>,
      description: "Configuración del sistema",
      items: [
        {
          title: "Crear usuario",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Agregar Evento",
      url: "#",
      icon: Sparkles,
      description: "Crear nuevo evento",
      featured: true,
    },
  ],
};

export function AppSidebar(props) {
  // Enhanced user handling with better defaults
  let user = null;
  if (props.currentUserData && typeof props.currentUserData === "object") {
    if (
      props.currentUserData.avatar &&
      props.currentUserData.name &&
      props.currentUserData.email
    ) {
      user = props.currentUserData;
    } else if (props.currentUserData.username) {
      user = {
        name: props.currentUserData.username,
        email: props.currentUserData.email || "Usuario",
        avatar: "/avatars/default.png",
        status: "online", // Add status for modern look
        role: props.currentUserData.role, // <-- Asegura que role esté presente
      };
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className={`
        group/sidebar border-r border-gray-200/60 dark:border-gray-800/60
        bg-white/80 dark:bg-gray-950/80 
        backdrop-blur-xl backdrop-saturate-150
        shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20
        transition-all duration-300 ease-in-out
        ${props.className || ""}
      `}
      style={{
        "--sidebar-width-icon": "4.5rem",

        ...props.style,
      }}
    >
      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/50 dark:to-gray-900/20 pointer-events-none" />

      <SidebarHeader className="relative z-10 border-b border-gray-200/40 dark:border-gray-800/40 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm">
        <div className="p-1 flex items-center justify-between gap-2">
          <TeamSwitcher teams={data.teams} />
        </div>

        {/* Modern accent line */}
        <div className="absolute bottom-0 left-3 right-4 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      </SidebarHeader>

      <SidebarContent className="relative z-10 bg-transparent">
        <div className="space-y-2 p-2">
          {/* Enhanced navigation section */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              Navegación
            </div>
            <NavMain
              items={data.navMain}
              itemscollapsibles={data.navMainCollapsible}
              user={user}
            />
          </div>

          {/* Enhanced projects section */}
          <div className="space-y-1 pt-4">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 " />
              Acciones
            </div>
            <NavProjects
              projects={data.projects}
              onAddEvent={props.onAddEvent}
            />
          </div>
        </div>

        {/* Modern floating elements */}
        <div className="absolute top-20 right-2 w-1 h-8 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300" />
      </SidebarContent>

      <SidebarFooter className="relative z-10 border-t border-gray-200/40 dark:border-gray-800/40 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm">
        {user && (
          <div className="p-2">
            <NavUser user={user} onLogout={props.onLogout} />
          </div>
        )}

        {/* Modern accent line */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </SidebarFooter>

      {/* Modern glow effect */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-32 bg-gradient-to-r from-blue-500/5 via-purple-500/10 to-transparent rounded-l-full opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </Sidebar>
  );
}
