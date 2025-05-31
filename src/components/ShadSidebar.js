import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
} from "./ui/sidebar";
import { Trans } from "@lingui/macro";
import * as Avatar from "@radix-ui/react-avatar";
import {
  Calendar,
  Search,
  Megaphone,
  Settings,
  Bell,
  LogOut,
  PlusCircle,
} from "lucide-react";
import PropTypes from "prop-types";
import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/", icon: Calendar, label: <Trans>Calendar</Trans> },
  { path: "/search", icon: Search, label: <Trans>Search</Trans> },
  { path: "/marketing", icon: Megaphone, label: <Trans>Marketing</Trans> },
  { path: "/notifications", icon: Bell, label: <Trans>Notifications</Trans> },
  { path: "/settings", icon: Settings, label: <Trans>Settings</Trans> },
];

function ShadSidebar({ currentUser, onAddEvent, onLogout }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-4">
          <span className="font-bold text-lg tracking-tight">
            <Trans>Event Planner</Trans>
          </span>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map(({ path, icon: Icon, label }) => (
              <SidebarMenuItem key={path}>
                <NavLink to={path} style={{ textDecoration: "none" }}>
                  {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive}>
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <button
          onClick={onAddEvent}
          className="w-full flex items-center gap-2 bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-400 transition"
        >
          <PlusCircle className="h-5 w-5" />
          <span>
            <Trans>Add Event</Trans>
          </span>
        </button>
        <SidebarSeparator />
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar.Root className="bg-indigo-400 h-10 w-10 rounded-full flex items-center justify-center">
            <Avatar.Fallback className="text-white font-medium">
              {currentUser ? currentUser.charAt(0).toUpperCase() : "?"}
            </Avatar.Fallback>
          </Avatar.Root>
          <div>
            <p className="font-medium text-indigo-900 dark:text-indigo-100">
              {currentUser}
            </p>
            <p className="text-xs text-indigo-400">
              <Trans>Administrator</Trans>
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-700 py-2 px-2 rounded-lg hover:bg-indigo-100 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>
            <Trans>Sign Out</Trans>
          </span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

ShadSidebar.propTypes = {
  currentUser: PropTypes.string.isRequired,
  onAddEvent: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default ShadSidebar;
