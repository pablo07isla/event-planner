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
  SidebarInset,
} from "./ui/sidebar";
import { Trans } from "@lingui/macro";
import {
  AudioWaveform,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Calendar,
  Search,
  Megaphone,
  Settings,
  Bell,
} from "lucide-react";
import React from "react";

// This is sample data.
const data = {
  teams: [
    {
      name: "Event Planner",
      logo: Calendar,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Frame, // fallback to Frame since Command is not imported
      plan: "Free",
    },
  ],
  navMain: [
    { url: "/", icon: Calendar, title: <Trans>Calendar</Trans> },
    { url: "/search", icon: Search, title: <Trans>Search</Trans> },
    { url: "/marketing", icon: Megaphone, title: <Trans>Marketing</Trans> },
    { url: "/notifications", icon: Bell, title: <Trans>Notifications</Trans> },
    { url: "/settings", icon: Settings, title: <Trans>Settings</Trans> },
  ],
  projects: [
    {
      name: "Agregar Evento",
      url: "#",
      icon: Frame,
    },
  ],
};

export function AppSidebar(props) {
  // Permitir pasar el usuario actual por props, si existe
  // Si el usuario es null o undefined, no mostrar NavUser
  let user = null;
  if (props.currentUserData && typeof props.currentUserData === "object") {
    // Permitir compatibilidad con diferentes estructuras de usuario
    if (
      props.currentUserData.avatar &&
      props.currentUserData.name &&
      props.currentUserData.email
    ) {
      user = props.currentUserData;
    } else if (props.currentUserData.username) {
      // Si el usuario viene de supabase y no tiene email ni avatar, usar valores por defecto
      user = {
        name: props.currentUserData.username,
        email: props.currentUserData.role || "-", // Mostrar el rol en vez del email
        avatar: "/avatars/default.png",
      };
    }
  }
  // Si no hay usuario logueado, no mostrar NavUser
  return (
    <Sidebar variant="inset" collapsible="none" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} onAddEvent={props.onAddEvent} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} onLogout={props.onLogout} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
