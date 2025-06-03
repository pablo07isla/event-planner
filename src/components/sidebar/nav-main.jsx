"use client";

import { useSidebar } from "../ui/sidebar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import { ChevronRight } from "lucide-react"

export function NavMain({ items, itemscollapsibles, user }) {
  const { state } = useSidebar(); // "collapsed" o "expanded"

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            asChild
          >
            <a
              href={item.url}
              className={`flex items-center no-underline text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors ${
                state === "collapsed" ? "justify-start pl-3" : "gap-2"
              }`}
            >
              {item.icon && <item.icon />}
              {state !== "collapsed" && <span>{item.title}</span>}
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      {/* Solo muestra los items colapsables si el usuario es admin */}
      {user?.role === "admin" &&
        itemscollapsibles.map((itemcollapsible) => (
          <Collapsible
            key={itemcollapsible.title}
            asChild
            defaultOpen={itemcollapsible.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={itemcollapsible.title}>
                  {itemcollapsible.icon && <itemcollapsible.icon />}
                  <span>{itemcollapsible.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {itemcollapsible.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href="/pages/create-user" className="no-underline">
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
    </SidebarMenu>
  );
}