import { SidebarProvider } from "@/app/context/SidebarContext";
import { NotificacionesProvider } from "@/app/context/NotificacionesContext";
import UserSidebar from "@/app/components/user/layout/UserSidebar";
import UserTopbar from "@/app/components/user/layout/UserTopbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificacionesProvider>
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f5f7fb" }}>
        <UserSidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <UserTopbar />

          <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: "28px 28px 0" }}>
            {children}
          </main>

          <footer
            className="flex flex-shrink-0 items-center justify-center"
            style={{ height: 48, borderTop: "1px solid #eeeff4", backgroundColor: "#ffffff" }}
          >
            <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
              © {new Date().getFullYear()} CostuSoft Control — Panel USER
            </span>
          </footer>
        </div>
      </div>
    </SidebarProvider>
    </NotificacionesProvider>
  );
}
