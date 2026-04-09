import { SidebarProvider } from "@/app/context/SidebarContext";
import { NotificacionesProvider } from "@/app/context/NotificacionesContext";
import BodegaSidebar from "@/app/components/bodega/layout/BodegaSidebar";
import BodegaTopbar from "@/app/components/bodega/layout/BodegaTopbar";

export default function BodegaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificacionesProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f4f8f4" }}>
          <BodegaSidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <BodegaTopbar />

            <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: "28px 28px 0" }}>
              {children}
            </main>

            <footer
              className="flex flex-shrink-0 items-center justify-center"
              style={{ height: 48, borderTop: "1px solid #eeeff4", backgroundColor: "#ffffff" }}
            >
              <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                © {new Date().getFullYear()} CostuSoft Control — Panel Bodega
              </span>
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </NotificacionesProvider>
  );
}
