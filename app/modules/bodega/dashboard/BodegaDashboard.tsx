"use client";

import { useRouter } from "next/navigation";
import {
  ArrowDownToLine, ArrowUpFromLine, CheckCheck,
  ChevronRight, ClipboardList, RefreshCw, ShieldAlert,
} from "lucide-react";
import { useWarehouseRequests } from "@/app/hooks/useWarehouseRequests";

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, accent, icon: Icon,
}: {
  label: string; value: number; sub: string; accent: string; icon: typeof ClipboardList;
}) {
  return (
    <div className="rounded-3xl border p-5"
      style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>{label}</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>{value}</p>
          <p className="mt-2 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>{sub}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0"
          style={{ backgroundColor: `${accent}18`, color: accent }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

// ─── Card de acceso a cola ────────────────────────────────────────────────────

function ColaAccessCard({
  label, count, sub, accent, icon: Icon, href,
}: {
  label: string; count: number; sub: string; accent: string; icon: typeof ArrowDownToLine; href: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="group w-full text-left rounded-3xl border p-5 transition-all hover:shadow-md"
      style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 2px 12px rgba(15,23,42,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0"
            style={{ backgroundColor: `${accent}14`, color: accent }}>
            <Icon size={22} />
          </div>
          <div>
            <p className="text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              {label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              {sub}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {count > 0 && (
            <span className="rounded-full px-3 py-1 text-sm font-bold"
              style={{ backgroundColor: `${accent}14`, color: accent }}>
              {count}
            </span>
          )}
          <ChevronRight size={18} style={{ color: "#9ca3af" }}
            className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}

// ─── Actividad reciente ───────────────────────────────────────────────────────

const ESTADO_STYLES = {
  PENDIENTE:  { label: "Pendiente",  bg: "#fff7e6", color: "#b76e00" },
  CONFIRMADA: { label: "Confirmada", bg: "#ecfdf3", color: "#027a48" },
  RECHAZADA:  { label: "Rechazada",  bg: "#fef3f2", color: "#b42318" },
} as const;

// ─── Dashboard principal ──────────────────────────────────────────────────────

export default function BodegaDashboard() {
  const {
    recientes,
    stats, loading, error,
    recargar,
  } = useWarehouseRequests();

  return (
    <section className="flex flex-col gap-6 pb-8">
      {/* Banner */}
      <div className="rounded-[28px] border px-4 py-5 sm:px-6 sm:py-6"
        style={{ borderColor: "#bbf7d0", background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(5,46,22,0.08) 100%)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "#15803d", fontFamily: "var(--font-poppins), sans-serif" }}>
              Rol Bodega
            </p>
            <h1 className="mt-2 text-2xl font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Resumen de operaciones
            </h1>
            <p className="mt-2 text-sm"
              style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
              Vista general del estado del inventario. Usa la cola de trabajo para confirmar o rechazar movimientos pendientes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void recargar()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
            style={{ borderColor: "#bbf7d0", backgroundColor: "#ffffff", color: "#15803d", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border px-4 py-3 text-sm"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Pendientes totales"
          value={stats.totalPendientes}
          sub="Esperando validación física"
          accent="#f59e0b"
          icon={ClipboardList}
        />
        <KpiCard
          label="Entradas pendientes"
          value={stats.entradasPendientes}
          sub="Ingresos por validar"
          accent="#1d4ed8"
          icon={ArrowDownToLine}
        />
        <KpiCard
          label="Salidas pendientes"
          value={stats.salidasPendientes}
          sub="Despachos por validar"
          accent="#d97706"
          icon={ArrowUpFromLine}
        />
        <KpiCard
          label="Procesadas en sesión"
          value={stats.procesadasEnSesion}
          sub="Confirmadas o rechazadas hoy"
          accent="#15803d"
          icon={CheckCheck}
        />
      </div>

      {/* Accesos rápidos a cola + actividad reciente */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">

        {/* Accesos a la cola */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Cola de trabajo
            </h2>
            <p className="mt-1 text-sm"
              style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Selecciona una categoría para revisar y procesar los movimientos pendientes.
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-3xl"
                  style={{ backgroundColor: "#e5e7eb" }} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <ColaAccessCard
                label="Entradas pendientes"
                count={stats.entradasPendientes}
                sub={stats.entradasPendientes > 0
                  ? `${stats.entradasPendientes} entrada${stats.entradasPendientes !== 1 ? "s" : ""} esperando confirmación`
                  : "Todo al día — sin entradas por validar"}
                accent="#1d4ed8"
                icon={ArrowDownToLine}
                href="/bodega/cola?tab=entradas"
              />
              <ColaAccessCard
                label="Salidas pendientes"
                count={stats.salidasPendientes}
                sub={stats.salidasPendientes > 0
                  ? `${stats.salidasPendientes} salida${stats.salidasPendientes !== 1 ? "s" : ""} esperando confirmación`
                  : "Todo al día — sin salidas por validar"}
                accent="#d97706"
                icon={ArrowUpFromLine}
                href="/bodega/cola?tab=salidas"
              />
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="rounded-3xl border p-4 sm:p-5"
          style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}>
          <h2 className="text-base font-semibold"
            style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            Actividad reciente
          </h2>
          <p className="mt-1 text-xs"
            style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            Últimos movimientos procesados
          </p>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl" style={{ backgroundColor: "#e5e7eb" }} />
              ))}
            </div>
          ) : recientes.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <ShieldAlert size={28} style={{ color: "#d1d5db" }} />
              <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                Sin actividad aún
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {recientes.map(r => {
                const isEnt = r.tipo === "entrada";
                const colorTipo = isEnt ? "#1d4ed8" : "#d97706";
                const bgTipo    = isEnt ? "#eff8ff" : "#fff4ed";
                const Icon      = isEnt ? ArrowDownToLine : ArrowUpFromLine;
                const estadoStyle = ESTADO_STYLES[r.estado as keyof typeof ESTADO_STYLES]
                  ?? { label: r.estado, bg: "#f3f4f6", color: "#6b7280" };

                return (
                  <div key={`${r.tipo}-${r.id}`}
                    className="flex items-start gap-3 rounded-2xl border p-3"
                    style={{ borderColor: "#f3f4f6", backgroundColor: "#fcfcfd" }}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: bgTipo }}>
                      <Icon size={14} style={{ color: colorTipo }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold"
                        style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {r.label}
                      </p>
                      <p className="truncate text-xs"
                        style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {r.sub}
                      </p>
                    </div>
                    <span className="flex-shrink-0 mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: estadoStyle.bg, color: estadoStyle.color, fontFamily: "var(--font-poppins), sans-serif" }}>
                      {estadoStyle.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
