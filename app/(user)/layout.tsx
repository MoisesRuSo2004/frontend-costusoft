import { SidebarProvider } from "@/app/context/SidebarContext";
import UserSidebar from "@/app/components/user/layout/UserSidebar";
import UserTopbar from "@/app/components/user/layout/UserTopbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#f5f7fb" }}>
        <UserSidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <UserTopbar />

          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-0 sm:px-6 sm:pt-6 lg:px-7 lg:pt-7">
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
  );
}
