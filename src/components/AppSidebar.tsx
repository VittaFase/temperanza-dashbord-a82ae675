import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Package2, Settings, Sliders, LogOut, ShoppingCart, BarChart3, Calculator } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import sealAsset from "@/assets/temperanzza-seal.png.asset.json";

const items = [
  { title: "Resumo", url: "/", icon: LayoutDashboard },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Blends", url: "/blends", icon: Package2 },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingCart },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Simulação", url: "/simulacao", icon: Sliders },
];

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => path === "/" ? pathname === "/" : pathname.startsWith(path);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <img
            src={sealAsset.url}
            alt="Brasão Temperanzza"
            className="h-10 w-10 shrink-0 rounded-full bg-brand-paper object-contain p-0.5 ring-1 ring-sidebar-border"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.28em] uppercase text-accent leading-none">
                Temperanzza
              </p>
              <p className="font-display text-base leading-tight mt-1">Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-[0.25em] uppercase">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/"} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && user && (
          <p className="px-3 py-1 text-[11px] text-muted-foreground truncate">{user.email}</p>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
