"use client";

import { useSidebar } from "./ui/sidebar";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

export function NavMain({ items }) {
  const { state } = useSidebar(); // "collapsed" o "expanded"

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navega</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url} className={state === "collapsed" ? "justify-start" : ""}>
            <SidebarMenuButton
              tooltip={item.title}
              
            >
              <a
                href={item.url}
                className="flex items-center gap-2 no-underline text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              >
                {item.icon && <item.icon />}
                {state !== "collapsed" && <span>{item.title}</span>}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
