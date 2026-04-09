"use client";

import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  CheckCircle2,
  Package,
  RefreshCw,
  Shirt,
  Truck,
  Users,
} from "lucide-react";
import { useDashboard } from "@/app/hooks/useDashboard";
import type { DashboardData, MovimientoReciente } from "@/app/types/dashboard";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("es", {
    month: "short",
  });
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-3xl border p-5"
      style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-3 flex-1">
          <div className="h-3 w-24 rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
          <div className="h-8 w-16 rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
          <div className="h-2.5 w-32 rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
        </div>
        <div className="h-11 w-11 rounded-2xl" style={{ backgroundColor: "#e5e7eb" }} />
      </div>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  subtitle,
  accent,
  icon: Icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  accent: string;
  icon: typeof Package;
}) {
  return (
    <div
      className="rounded-3xl border p-5 transition-shadow duration-200"
      style={{
        borderColor: "#eaecf0",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 20px rgba(15,23,42,0.05)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px rgba(15,23,42,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 20px rgba(15,23,42,0.05)";
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-[0.12em]"
            style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {title}
          </p>
          <p
            className="mt-2 text-3xl font-bold"
            style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {value}
          </p>
          <p
            className="mt-1.5 text-xs leading-relaxed"
            style={{ color: "#98a2b3", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {subtitle}
          </p>
        </div>
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function MovimientosChart({
  entradas,
  salidas,
}: {
  entradas: Record<string, number>;
  salidas: Record<string, number>;
}) {
  const months = Object.keys(entradas);
  const allValues = [...Object.values(entradas), ...Object.values(salidas)];
  const maxVal = Math.max(1, ...allValues);

  const CHART_H = 110;
  const BAR_W = 14;
  const BAR_GAP = 5;
  const GROUP_W = BAR_W * 2 + BAR_GAP + 18;
  const PADDING_L = 36;
  const PADDING_B = 28;
  const totalW = PADDING_L + months.length * GROUP_W + 10;
  const totalH = CHART_H + PADDING_B;

  // Grid lines: 0%, 25%, 50%, 75%, 100%
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      width="100%"
      height={totalH}
      style={{ overflow: "visible" }}
    >
      {/* Grid lines */}
      {gridLines.map((pct) => {
        const y = CHART_H - pct * CHART_H;
        const label = Math.round(pct * maxVal);
        return (
          <g key={pct}>
            <line
              x1={PADDING_L - 6}
              y1={y}
              x2={totalW - 4}
              y2={y}
              stroke="#f0f0f4"
              strokeWidth={1}
            />
            <text
              x={PADDING_L - 10}
              y={y + 4}
              textAnchor="end"
              fontSize={8}
              fill="#c0c7d0"
              fontFamily="var(--font-poppins), sans-serif"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {months.map((month, i) => {
        const x = PADDING_L + i * GROUP_W;
        const eVal = entradas[month] ?? 0;
        const sVal = salidas[month] ?? 0;
        const eH = maxVal === 0 ? 0 : (eVal / maxVal) * CHART_H;
        const sH = maxVal === 0 ? 0 : (sVal / maxVal) * CHART_H;

        return (
          <g key={month}>
            {/* Entrada bar (azul) */}
            <rect
              x={x}
              y={CHART_H - eH}
              width={BAR_W}
              height={Math.max(eH, eVal > 0 ? 3 : 0)}
              rx={4}
              fill="#0b3d91"
              opacity={0.85}
            />
            {/* Salida bar (verde) */}
            <rect
              x={x + BAR_W + BAR_GAP}
              y={CHART_H - sH}
              width={BAR_W}
              height={Math.max(sH, sVal > 0 ? 3 : 0)}
              rx={4}
              fill="#49c21b"
              opacity={0.85}
            />
            {/* Month label */}
            <text
              x={x + BAR_W}
              y={CHART_H + 18}
              textAnchor="middle"
              fontSize={9}
              fill="#9ca3af"
              fontFamily="var(--font-poppins), sans-serif"
              style={{ textTransform: "capitalize" }}
            >
              {monthLabel(month)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Movimiento Item ──────────────────────────────────────────────────────────

function MovimientoItem({ mov, isLast }: { mov: MovimientoReciente; isLast: boolean }) {
  const isEntrada = mov.tipo === "ENTRADA";
  const color = isEntrada ? "#0b3d91" : "#49c21b";
  const bgColor = isEntrada ? "rgba(11,61,145,0.08)" : "rgba(73,194,27,0.10)";
  const Icon = isEntrada ? ArrowDownToLine : ArrowUpFromLine;

  return (
    <div className="flex gap-3">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: bgColor, color }}
        >
          <Icon size={14} />
        </div>
        {!isLast && (
          <div className="mt-1 w-px flex-1" style={{ backgroundColor: "#eaecf0", minHeight: 16 }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span
            className="text-xs font-semibold uppercase tracking-[0.10em]"
            style={{ color, fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {mov.tipo}
          </span>
          <span
            className="text-[10px]"
            style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {formatDate(mov.fecha)}
          </span>
        </div>
        <p
          className="mt-1 text-sm leading-relaxed"
          style={{ color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {mov.descripcion}
        </p>
        <p
          className="mt-0.5 text-[11px]"
          style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {mov.totalItems} ítem{mov.totalItems !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard({ data }: { data: DashboardData }) {
  const stockCritico = data.insumosConStockBajo + data.insumosConStockCero;
  const totalUniformes = Object.values(data.uniformesPorColegio).reduce((a, b) => a + b, 0);

  const kpiPrimary = [
    {
      title: "Insumos registrados",
      value: data.totalInsumos,
      subtitle: "Materiales activos en inventario",
      accent: "#0b3d91",
      icon: Package,
    },
    {
      title: "Entradas totales",
      value: data.totalEntradas,
      subtitle: "Ingresos acumulados al almacén",
      accent: "#49c21b",
      icon: ArrowDownToLine,
    },
    {
      title: "Salidas totales",
      value: data.totalSalidas,
      subtitle: "Despachos acumulados del almacén",
      accent: "#f59e0b",
      icon: ArrowUpFromLine,
    },
    {
      title: "Colegios",
      value: data.totalColegios,
      subtitle: "Instituciones vinculadas al sistema",
      accent: "#7c3aed",
      icon: Building2,
    },
  ];

  const kpiSecondary = [
    {
      title: "Uniformes",
      value: data.totalUniformes,
      subtitle: "Referencias de uniforme registradas",
      accent: "#db2777",
      icon: Shirt,
    },
    {
      title: "Proveedores",
      value: data.totalProveedores,
      subtitle: "Proveedores activos en el sistema",
      accent: "#0891b2",
      icon: Truck,
    },
    {
      title: "Usuarios",
      value: data.totalUsuarios,
      subtitle: "Cuentas de acceso al sistema",
      accent: "#4f46e5",
      icon: Users,
    },
    {
      title: "Alertas de stock",
      value: stockCritico,
      subtitle:
        stockCritico === 0
          ? "Sin insumos en estado crítico"
          : `${data.insumosConStockCero} sin stock · ${data.insumosConStockBajo} bajo mínimo`,
      accent: stockCritico === 0 ? "#16a34a" : "#dc2626",
      icon: AlertTriangle,
    },
  ];

  return (
    <section className="flex flex-col gap-6 pb-10">

      {/* ── Alerta de stock ───────────────────────────────────────────── */}
      {stockCritico === 0 ? (
        <div
          className="flex items-center gap-3 rounded-2xl border px-5 py-3.5"
          style={{
            borderColor: "#bbf7d0",
            backgroundColor: "#f0fdf4",
          }}
        >
          <CheckCircle2 size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
          <p
            className="text-sm font-medium"
            style={{ color: "#15803d", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Todos los insumos tienen stock en niveles normales. Sin alertas activas.
          </p>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 rounded-2xl border px-5 py-3.5"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
        >
          <AlertTriangle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />
          <p
            className="text-sm font-medium"
            style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Atención: {data.insumosConStockCero} insumo(s) sin stock y{" "}
            {data.insumosConStockBajo} por debajo del mínimo. Revisa el inventario.
          </p>
        </div>
      )}

      {/* ── KPIs primarios ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpiPrimary.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ── KPIs secundarios ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpiSecondary.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* ── Gráfico + Movimientos recientes ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Gráfico de barras */}
        <div
          className="col-span-1 rounded-3xl border p-6 lg:col-span-3"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 20px rgba(15,23,42,0.05)",
          }}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Movimientos últimos 7 meses
              </h2>
              <p
                className="mt-0.5 text-xs"
                style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Entradas vs Salidas del almacén por mes
              </p>
            </div>
            {/* Leyenda */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#0b3d91" }} />
                <span className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>Entradas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#49c21b" }} />
                <span className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>Salidas</span>
              </div>
            </div>
          </div>

          <MovimientosChart
            entradas={data.entradasPorMes}
            salidas={data.salidasPorMes}
          />
        </div>

        {/* Últimos movimientos */}
        <div
          className="col-span-1 rounded-3xl border p-6 lg:col-span-2"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 20px rgba(15,23,42,0.05)",
          }}
        >
          <h2
            className="mb-5 text-base font-semibold"
            style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Actividad reciente
          </h2>

          {data.ultimosMovimientos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Package size={28} style={{ color: "#d1d5db" }} />
              <p
                className="text-sm"
                style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Sin movimientos registrados
              </p>
            </div>
          ) : (
            <div>
              {data.ultimosMovimientos.map((mov, idx) => (
                <MovimientoItem
                  key={idx}
                  mov={mov}
                  isLast={idx === data.ultimosMovimientos.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Uniformes por colegio ─────────────────────────────────────── */}
      <div
        className="rounded-3xl border p-6"
        style={{
          borderColor: "#eaecf0",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 20px rgba(15,23,42,0.05)",
        }}
      >
        <div className="mb-5">
          <h2
            className="text-base font-semibold"
            style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Uniformes por colegio
          </h2>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Distribución de referencias de uniforme registradas por institución
          </p>
        </div>

        {Object.keys(data.uniformesPorColegio).length === 0 ? (
          <p className="text-sm" style={{ color: "#9ca3af" }}>Sin datos disponibles.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(data.uniformesPorColegio).map(([nombre, count]) => {
              const pct = totalUniformes === 0 ? 0 : Math.round((count / totalUniformes) * 100);
              return (
                <div key={nombre}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "#374151", fontFamily: "var(--font-poppins), sans-serif", maxWidth: "70%" }}
                    >
                      {nombre}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                      >
                        {count} uniforme{count !== 1 ? "s" : ""}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-2 w-full rounded-full overflow-hidden"
                    style={{ backgroundColor: "#f3f4f6" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #0b3d91 0%, #49c21b 100%)",
                        minWidth: count > 0 ? "8px" : "0",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
