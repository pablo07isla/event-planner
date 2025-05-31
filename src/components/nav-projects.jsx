import {  PlusCircle } from "lucide-react";

import {
  
} from "./ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { Trans } from "@lingui/macro";

export function NavProjects({
  projects,
  onAddEvent // nuevo prop para manejar el click
}) {
  const { isMobile } = useSidebar()

  return (
    (<SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton onClick={onAddEvent} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200">
              <PlusCircle className="size-4" />
              <span>
                <Trans>Add Event</Trans>
              </span>
            </SidebarMenuButton>
            
          </SidebarMenuItem>
        ))}
        
      </SidebarMenu>
    </SidebarGroup>)
  );
}

NavProjects.defaultProps = {
  onAddEvent: () => {},
};
