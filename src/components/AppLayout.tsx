import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardProvider, useDashboard } from "@/hooks/useDashboard";
import { Loader2 } from "lucide-react";

const Shell = () => {
  const { loading } = useDashboard();
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 flex items-center border-b bg-card/50 backdrop-blur px-2 gap-3">
          <SidebarTrigger className="h-11 w-11 md:h-9 md:w-9" aria-label="Abrir menu de navegação" />
          <span className="brand-chip">Temperanzza</span>
          <span className="font-display text-sm text-muted-foreground tracking-[0.2em]">
            Custos & Precificação
          </span>
        </header>
        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export const AppLayout = () => (
  <SidebarProvider>
    <DashboardProvider>
      <Shell />
    </DashboardProvider>
  </SidebarProvider>
);
