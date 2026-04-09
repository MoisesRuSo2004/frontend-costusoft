import { SidebarProvider } from "@/app/context/SidebarContext";
import Sidebar from "@/app/components/admin/layout/Sidebar";
import Topbar from "@/app/components/admin/layout/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div
        className="flex h-screen overflow-hidden"
        style={{ backgroundColor: "#f5f6fa" }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Contenido principal */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Topbar */}
          <Topbar />

          {/* Page content */}
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{ padding: "28px 28px 0" }}
          >
            {children}
          </main>

          {/* Footer */}
          <footer
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              height: 48,
              borderTop: "1px solid #eeeff4",
              backgroundColor: "#ffffff",
            }}
          >
            <span
              className="text-xs"
              style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
            >
              © {new Date().getFullYear()} CostuSoft Control — Todos los
              derechos reservados
            </span>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
