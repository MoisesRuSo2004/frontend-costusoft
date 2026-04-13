"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import UserAvatar from "@/app/components/shared/ui/UserAvatar";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, ChevronDown, LogOut, Menu, UserCircle,
  ShoppingCart, ArrowDownToLine, ArrowUpFromLine,
  RefreshCw, Inbox,
} from "lucide-react";
import { useSidebar } from "@/app/context/SidebarContext";
import { useAuth } from "@/app/context/AuthContext";
import type { NotifItem } from "@/app/context/NotificacionesContext";

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
  notifItems?: NotifItem[];
  notifTotal?: number;
  notifLoading?: boolean;
  onNotifRefetch?: () => void;
  notifHref?: string;
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

// ── Config de tipos de notificación ──────────────────────────────────────────

const NOTIF_CONFIG = {
  pedido:  { color: "#1d4ed8", bg: "#eff6ff",  icon: ShoppingCart,    label: "Pedido"  },
  entrada: { color: "#16a34a", bg: "#f0fdf4",  icon: ArrowDownToLine, label: "Entrada" },
  salida:  { color: "#d97706", bg: "#fef3c7",  icon: ArrowUpFromLine, label: "Salida"  },
} as const;

// ── Componente ────────────────────────────────────────────────────────────────

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
  notifItems = [],
  notifTotal = 0,
  notifLoading = false,
  onNotifRefetch,
  notifHref = "/solicitudes",
}: RoleTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleMobile } = useSidebar();
  const { user, logout } = useAuth();
  const [userOpen, setUserOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const alertCount = notifTotal;

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
        {/* ── Campana de notificaciones ── */}
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
            {/* Animación pulse cuando hay pendientes */}
            {alertCount > 0 && !bellOpen && (
              <span
                className="absolute inset-0 rounded-2xl animate-ping"
                style={{ backgroundColor: accentColor, opacity: 0.15 }}
              />
            )}
            <Bell size={16} />
            {alertCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: "#ef4444", lineHeight: 1 }}
              >
                {alertCount > 99 ? "99+" : alertCount}
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
                className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border"
                style={{
                  borderColor: "#f0f0f4",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 20px 48px rgba(0,0,0,0.14)",
                  zIndex: 50,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.14em]"
                      style={{ color: accentColor, fontFamily: "var(--font-poppins), sans-serif" }}>
                      Solicitudes pendientes
                    </span>
                    {alertCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: "#ef4444" }}>
                        {alertCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { onNotifRefetch?.(); }}
                    disabled={notifLoading}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition"
                    style={{ color: "#9ca3af", cursor: "pointer" }}
                    title="Actualizar"
                  >
                    <RefreshCw size={13} className={notifLoading ? "animate-spin" : ""} />
                  </button>
                </div>

                {/* Lista */}
                {notifItems.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: "#f9fafb" }}>
                      <Inbox size={20} style={{ color: "#d1d5db" }} />
                    </div>
                    <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                      Todo al día
                    </p>
                    <p className="text-xs" style={{ color: "#d1d5db", fontFamily: "var(--font-poppins), sans-serif" }}>
                      Sin solicitudes pendientes
                    </p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                    {notifItems.map((item, i) => {
                      const cfg = NOTIF_CONFIG[item.tipo];
                      const Icn = cfg.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setBellOpen(false);
                            router.push(notifHref);
                          }}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition"
                          style={{
                            borderTop: i > 0 ? "1px solid #f9fafb" : undefined,
                            fontFamily: "var(--font-poppins), sans-serif",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundColor: cfg.bg }}
                          >
                            <Icn size={14} style={{ color: cfg.color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold"
                              style={{ color: "#101828" }}>
                              {item.titulo}
                            </p>
                            <p className="truncate text-xs"
                              style={{ color: "#9ca3af" }}>
                              {item.subtitulo}
                            </p>
                          </div>
                          <span className="flex-shrink-0 mt-0.5 h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Footer → ir a solicitudes */}
                <div style={{ borderTop: "1px solid #f3f4f6" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setBellOpen(false);
                      router.push(notifHref);
                    }}
                    className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold transition"
                    style={{ color: accentColor, fontFamily: "var(--font-poppins), sans-serif", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = accentSoft; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    Ver todas las solicitudes
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
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
            <UserAvatar
              name={displayName}
              size={32}
              accentColor={accentColor}
              borderWidth={2}
              borderColor="#e5e7eb"
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
                    <UserAvatar
                      name={displayName}
                      size={40}
                      accentColor={accentColor}
                      borderWidth={2}
                      borderColor={accentColor + "33"}
                      shadow="0 2px 8px rgba(0,0,0,0.10)"
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
