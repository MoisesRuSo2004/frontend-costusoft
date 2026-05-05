import { SidebarProvider } from "@/app/context/SidebarContext";
import InstitucionSidebar from "@/app/components/institucion/layout/InstitucionSidebar";
import InstitucionTopbar from "@/app/components/institucion/layout/InstitucionTopbar";

export default function InstitucionLayout({
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
        <InstitucionSidebar />

        {/* Contenido principal */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Topbar */}
          <InstitucionTopbar />

          {/* Page content */}
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-5 sm:px-6 sm:pt-6 lg:px-7 lg:pt-7"
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
              © {new Date().getFullYear()} CostuSoft — Portal Institucional
            </span>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
