import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  SidebarMenuAction,
  SidebarInset,
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
  ChevronDown,
  User2,
} from "lucide-react";
import PropTypes from "prop-types";
import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { url: "/", icon: Calendar, title: <Trans>Calendar</Trans> },
  { url: "/search", icon: Search, title: <Trans>Search</Trans> },
  { url: "/marketing", icon: Megaphone, title: <Trans>Marketing</Trans> },
  { url: "/notifications", icon: Bell, title: <Trans>Notifications</Trans> },
  { url: "/settings", icon: Settings, title: <Trans>Settings</Trans> },
];

function ShadSidebar({ currentUser, onAddEvent, onLogout }) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* Header con título y trigger */}
      <SidebarInset>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sidebar-primary-foreground">
                    <Calendar className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-md leading-tight">
                    <span className="truncate font-semibold">
                      <Trans>Event Planner</Trans>
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      <Trans>Professional</Trans>
                    </span>
                  </div>
                </div>
              </SidebarMenuButton>
              <SidebarTrigger />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Contenido principal con navegación */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className=" gap-2 text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors no-underline"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Grupo de acciones rápidas */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <Trans>Quick Actions</Trans>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onAddEvent}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <PlusCircle className="size-4" />
                    <span>
                      <Trans>Add Event</Trans>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        {/* Footer con información del usuario */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors"
                  >
                    <Avatar.Root className="h-8 w-8 rounded-lg">
                      <Avatar.Fallback className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium text-sm">
                        {currentUser
                          ? currentUser.charAt(0).toUpperCase()
                          : "?"}
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {currentUser}
                      </span>
                      <span className="truncate text-xs text-sidebar-foreground/70">
                        <Trans>Administrator</Trans>
                      </span>
                    </div>
                    <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem className="gap-2 p-2">
                    <div className="flex items-center gap-2">
                      <Avatar.Root className="h-8 w-8 rounded-sm">
                        <Avatar.Fallback className="rounded-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium text-sm">
                          {currentUser
                            ? currentUser.charAt(0).toUpperCase()
                            : "?"}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {currentUser}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          <Trans>Administrator</Trans>
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User2 className="size-4" />
                    <Trans>Account</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Settings className="size-4" />
                    <Trans>Settings</Trans>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    onClick={onLogout}
                  >
                    <LogOut className="size-4" />
                    <Trans>Sign Out</Trans>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarInset>
    </Sidebar>
  );
}

ShadSidebar.propTypes = {
  currentUser: PropTypes.string.isRequired,
  onAddEvent: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default ShadSidebar;
