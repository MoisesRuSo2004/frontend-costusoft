"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "@/app/context/SidebarContext";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Número que aparece como badge (ej: solicitudes pendientes) */
  badge?: number;
}

export interface SidebarNavGroup {
  heading: string | null;
  items: SidebarNavItem[];
}

interface RoleSidebarProps {
  nav: SidebarNavGroup[];
  brandSubtitle: string;
  gradient: string;
  shadow: string;
  activeBackground: string;
  activeText: string;
  activeIndicator: string;
  hoverBackground: string;
  logoGlow?: string;
}

export default function RoleSidebar({
  nav,
  brandSubtitle,
  gradient,
  shadow,
  activeBackground,
  activeText,
  activeIndicator,
  hoverBackground,
  logoGlow,
}: RoleSidebarProps) {
  const pathname = usePathname();
  const { collapsed, mobileOpen, closeMobile, toggleCollapsed } = useSidebar();

  // Cierra el sidebar deslizando hacia la izquierda en móvil
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 48) closeMobile(); // swipe left > 48px → cerrar
  };

  useEffect(() => {
    closeMobile();
  }, [closeMobile, pathname]);

  const showText = mobileOpen || !collapsed;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menu lateral"
        onClick={closeMobile}
        className={`fixed inset-0 z-30 bg-slate-950/40 transition-opacity duration-300 ease-in-out lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] transform flex-col overflow-hidden transition-all duration-300 ease-in-out lg:static lg:z-30 lg:h-screen ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${collapsed ? "lg:w-[84px]" : "lg:w-[272px]"} w-[272px]`}
        style={{ background: gradient, boxShadow: shadow }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
          aria-hidden
        >
          <defs>
            <pattern
              id="role-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="white"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#role-grid)" />
        </svg>

        <div
          className="relative flex items-center gap-3 border-b px-4 py-5"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Image
            src="/logo/logo.svg"
            alt="CostuSoft"
            width={36}
            height={36}
            className="rounded-xl object-contain"
            style={logoGlow ? { filter: logoGlow } : undefined}
          />
          <AnimatePresence initial={false}>
            {showText ? (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <p
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  CostuSoft
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  {brandSubtitle}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <nav
          className="relative flex-1 overflow-y-auto px-3 py-4 scrollbar-minimal"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.15) transparent",
          }}
        >
          {nav.map((group, groupIndex) => (
            <div
              key={`${group.heading ?? "group"}-${groupIndex}`}
              className="mb-3"
            >
              {group.heading ? (
                showText ? (
                  <div className="px-3 pb-2 pt-4">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{
                        color: "rgba(255,255,255,0.35)",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    >
                      {group.heading}
                    </span>
                  </div>
                ) : (
                  <div
                    className="mx-3 my-3 h-px"
                    style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
                  />
                )
              ) : null}

              <div className="space-y-1">
                {group.items.map(({ label, href, icon: Icon, badge }) => {
                  const active = isActive(href);

                  return (
                    <Link
                      key={`${label}-${href}`}
                      href={href}
                      title={!showText ? label : undefined}
                      className="group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300 ease-in-out"
                      style={{
                        backgroundColor: active
                          ? activeBackground
                          : "transparent",
                        color: active ? activeText : "rgba(255,255,255,0.72)",
                        textDecoration: "none",
                        justifyContent: showText ? "flex-start" : "center",
                      }}
                      onMouseEnter={(event) => {
                        if (!active) {
                          event.currentTarget.style.backgroundColor =
                            hoverBackground;
                        }
                      }}
                      onMouseLeave={(event) => {
                        if (!active) {
                          event.currentTarget.style.backgroundColor =
                            "transparent";
                        }
                      }}
                    >
                      {active ? (
                        <span
                          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full"
                          style={{ backgroundColor: activeIndicator }}
                        />
                      ) : null}

                      {/* Icono + punto badge cuando está colapsado */}
                      <span className="relative flex-shrink-0">
                        <Icon
                          size={18}
                          strokeWidth={active ? 2.2 : 1.8}
                          style={{
                            color: active
                              ? activeText
                              : "rgba(255,255,255,0.62)",
                          }}
                        />
                        {badge && !showText ? (
                          <span
                            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white"
                            style={{
                              backgroundColor: "#ef4444",
                              lineHeight: 1,
                            }}
                          >
                            {badge > 99 ? "99+" : badge}
                          </span>
                        ) : null}
                      </span>

                      <AnimatePresence initial={false}>
                        {showText ? (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.16 }}
                            className="flex flex-1 items-center justify-between truncate text-sm"
                            style={{
                              color: active
                                ? activeText
                                : "rgba(255,255,255,0.78)",
                              fontWeight: active ? 600 : 500,
                              fontFamily: "var(--font-poppins), sans-serif",
                            }}
                          >
                            {label}
                            {badge ? (
                              <span
                                className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                                style={{
                                  backgroundColor: "#ef4444",
                                  flexShrink: 0,
                                }}
                              >
                                {badge > 99 ? "99+" : badge}
                              </span>
                            ) : null}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div
          className="hidden border-t px-3 py-4 lg:flex lg:justify-end"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-300 ease-in-out"
            style={{
              borderColor: "rgba(255,255,255,0.14)",
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              cursor: "pointer",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor =
                "rgba(255,255,255,0.16)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor =
                "rgba(255,255,255,0.08)";
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Estilos minimalistas para el scrollbar */}
      <style jsx>{`
        .scrollbar-minimal {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        .scrollbar-minimal::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-minimal::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-minimal::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        .scrollbar-minimal::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        /* Ocultar scrollbar cuando no hay hover (opcional - descomentar si se quiere)
        @media (hover: hover) {
          .scrollbar-minimal {
            scrollbar-width: none;
          }
          .scrollbar-minimal::-webkit-scrollbar {
            width: 0;
          }
          .scrollbar-minimal:hover {
            scrollbar-width: thin;
          }
          .scrollbar-minimal:hover::-webkit-scrollbar {
            width: 4px;
          }
        }
        */
      `}</style>
    </>
  );
}
