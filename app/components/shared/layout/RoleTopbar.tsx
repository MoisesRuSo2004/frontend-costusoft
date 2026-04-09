"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, LogOut, Menu, UserCircle } from "lucide-react";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";

interface RoleTopbarProps {
  pageTitles: Record<string, string>;
  fallbackTitle: string;
  accentColor: string;
  accentSoft: string;
  /** Fallback si el auth todavía está cargando */
  userName?: string;
  userRoleLabel?: string;
  userEmail?: string;
  profileHref?: string;
  showLogout?: boolean;
}

const DROPDOWN_VARIANTS = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  USER: "Secretaria / Usuario",
  BODEGA: "Operador Bodega",
};

export default function RoleTopbar({
  pageTitles,
  fallbackTitle,
  accentColor,
  accentSoft,
  userName = "Usuario",
  userRoleLabel = "Sistema",
  userEmail = "",
  profileHref,
  showLogout = false,
}: RoleTopbarProps) {
  const pathname = usePathname();
  const { toggleMobile } = useSidebar();
  const { user, logout } = useAuth();
  const [userOpen, setUserOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [alertCount] = useState(0);
  const userRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // Datos reales del usuario autenticado, con fallback a los props
  const displayName = user?.username ?? userName;
  const displayEmail = user?.correo ?? userEmail;
  const displayRole = user ? (ROLE_LABELS[user.rol] ?? user.rol) : userRoleLabel;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pageTitle = pageTitles[pathname] ?? fallbackTitle;

  const handleLogout = () => {
    setUserOpen(false);
    logout();
  };

  return (
    <header
      className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between px-4 sm:px-6"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f0f0f4",
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobile}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-300 ease-in-out lg:hidden"
          style={{ borderColor: "#e5e7eb", color: "#6b7280", backgroundColor: "transparent" }}
          onMouseEnter={(event) => {
            event.currentTarget.style.borderColor = accentColor;
            event.currentTarget.style.color = accentColor;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.borderColor = "#e5e7eb";
            event.currentTarget.style.color = "#6b7280";
          }}
        >
          <Menu size={18} />
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-5 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-sm font-medium" style={{ color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}>
            {pageTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Campana */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            onClick={() => { setBellOpen((c) => !c); setUserOpen(false); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: bellOpen ? accentSoft : "transparent",
              borderColor: bellOpen ? accentColor : "#e5e7eb",
              color: bellOpen ? accentColor : "#6b7280",
            }}
          >
            <Bell size={16} />
            {alertCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: "#ef4444" }}
              >
                {alertCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {bellOpen && (
              <motion.div
                variants={DROPDOWN_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border"
                style={{ borderColor: "#f0f0f4", backgroundColor: "#ffffff", boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
              >
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "#f0f0f4" }}>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: accentColor, fontFamily: "var(--font-poppins), sans-serif" }}>
                    Alertas
                  </span>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Sin alertas por el momento
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden h-6 w-px sm:block" style={{ backgroundColor: "#e5e7eb" }} />

        {/* Menú de usuario */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => { setUserOpen((c) => !c); setBellOpen(false); }}
            className="flex items-center gap-2 rounded-2xl border px-2.5 py-1.5 transition-all duration-300 ease-in-out sm:px-3"
            style={{
              backgroundColor: userOpen ? accentSoft : "transparent",
              borderColor: userOpen ? accentColor : "transparent",
            }}
          >
            <Image
              src="/img/undraw_profile.svg"
              alt={displayName}
              width={32}
              height={32}
              className="rounded-full object-cover"
              style={{ border: "2px solid #e5e7eb" }}
            />
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-sm font-semibold" style={{ color: "#111827", fontFamily: "var(--font-poppins), sans-serif" }}>
                {displayName}
              </p>
              <p className="text-[11px]" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                {displayRole}
              </p>
            </div>
            <ChevronDown
              size={14}
              style={{
                color: "#98a2b3",
                transform: userOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease-in-out",
              }}
            />
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                variants={DROPDOWN_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-14 w-60 overflow-hidden rounded-2xl border"
                style={{ borderColor: "#f0f0f4", backgroundColor: "#ffffff", boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
              >
                {/* Info de usuario */}
                <div className="border-b px-4 py-4" style={{ borderColor: "#f0f0f4" }}>
                  <div className="flex items-center gap-3">
                    <Image
                      src="/img/undraw_profile.svg"
                      alt={displayName}
                      width={34}
                      height={34}
                      className="rounded-full object-cover"
                      style={{ border: "2px solid #e5e7eb" }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: "#111827", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {displayName}
                      </p>
                      <p className="truncate text-[11px]" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {displayEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mi perfil */}
                {profileHref ? (
                  <Link
                    href={profileHref}
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm transition-all duration-300 ease-in-out"
                    style={{ color: "#374151", textDecoration: "none", fontFamily: "var(--font-poppins), sans-serif" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentSoft; e.currentTarget.style.color = accentColor; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#374151"; }}
                  >
                    <UserCircle size={15} />
                    Mi perfil
                  </Link>
                ) : (
                  <div className="flex items-center gap-2.5 px-4 py-3 text-sm" style={{ color: "#d1d5db", fontFamily: "var(--font-poppins), sans-serif" }}>
                    <UserCircle size={15} />
                    Mi perfil
                  </div>
                )}

                {/* Cerrar sesión */}
                {showLogout && (
                  <>
                    <div style={{ height: 1, backgroundColor: "#f0f0f4" }} />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm transition-all duration-300 ease-in-out"
                      style={{ color: "#374151", backgroundColor: "transparent", fontFamily: "var(--font-poppins), sans-serif" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fff5f5"; e.currentTarget.style.color = "#dc2626"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#374151"; }}
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
