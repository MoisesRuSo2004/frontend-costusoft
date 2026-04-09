"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Search,
  RefreshCw,
  AlertCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart2,
  Activity,
  Zap,
  ShieldCheck,
} from "lucide-react";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
type Prediccion = "si" | "no";
type Riesgo = "CRÍTICO" | "ALTO" | "MEDIO" | "ESTABLE";

interface PrediccionItem {
  id: number;
  nombreInsumo: string;
  stockActual: number;
  unidad: string;
  consumoPromedio3m: number; // unidades promedio por mes en últimos 3 meses
  prediccion: Prediccion;
  diasRestantes: number; // días estimados hasta agotamiento
  tendencia: "subiendo" | "estable" | "bajando";
}

// ─────────────────────────────────────────────
// MOCK
// ─────────────────────────────────────────────
const MOCK: PrediccionItem[] = [
  {
    id: 1,
    nombreInsumo: "Hilo 40/2 Blanco",
    stockActual: 850,
    unidad: "Cono",
    consumoPromedio3m: 107,
    prediccion: "no",
    diasRestantes: 238,
    tendencia: "estable",
  },
  {
    id: 2,
    nombreInsumo: "Tela Popelina Azul",
    stockActual: 45,
    unidad: "Metro",
    consumoPromedio3m: 28,
    prediccion: "si",
    diasRestantes: 48,
    tendencia: "bajando",
  },
  {
    id: 3,
    nombreInsumo: "Botones 15mm Negros",
    stockActual: 1200,
    unidad: "Unidad",
    consumoPromedio3m: 267,
    prediccion: "no",
    diasRestantes: 135,
    tendencia: "estable",
  },
  {
    id: 4,
    nombreInsumo: "Cierre Invisible 60cm",
    stockActual: 0,
    unidad: "Unidad",
    consumoPromedio3m: 67,
    prediccion: "si",
    diasRestantes: 0,
    tendencia: "bajando",
  },
  {
    id: 5,
    nombreInsumo: "Elástico 2cm Natural",
    stockActual: 320,
    unidad: "Metro",
    consumoPromedio3m: 67,
    prediccion: "no",
    diasRestantes: 143,
    tendencia: "subiendo",
  },
  {
    id: 6,
    nombreInsumo: "Entretela Termoadhesiva",
    stockActual: 18,
    unidad: "Metro",
    consumoPromedio3m: 15,
    prediccion: "si",
    diasRestantes: 36,
    tendencia: "bajando",
  },
  {
    id: 7,
    nombreInsumo: "Hilo 20/2 Negro",
    stockActual: 600,
    unidad: "Cono",
    consumoPromedio3m: 7,
    prediccion: "no",
    diasRestantes: 257,
    tendencia: "estable",
  },
  {
    id: 8,
    nombreInsumo: "Aguja Industrial #14",
    stockActual: 0,
    unidad: "Unidad",
    consumoPromedio3m: 4,
    prediccion: "si",
    diasRestantes: 0,
    tendencia: "bajando",
  },
  {
    id: 9,
    nombreInsumo: "Tela Lino Beige",
    stockActual: 92,
    unidad: "Metro",
    consumoPromedio3m: 18,
    prediccion: "no",
    diasRestantes: 153,
    tendencia: "subiendo",
  },
  {
    id: 10,
    nombreInsumo: "Ribete Dorado 1cm",
    stockActual: 410,
    unidad: "Metro",
    consumoPromedio3m: 60,
    prediccion: "no",
    diasRestantes: 205,
    tendencia: "estable",
  },
  {
    id: 11,
    nombreInsumo: "Hilo 40/2 Rojo",
    stockActual: 130,
    unidad: "Cono",
    consumoPromedio3m: 83,
    prediccion: "si",
    diasRestantes: 47,
    tendencia: "bajando",
  },
  {
    id: 12,
    nombreInsumo: "Botones 10mm Blancos",
    stockActual: 350,
    unidad: "Unidad",
    consumoPromedio3m: 50,
    prediccion: "no",
    diasRestantes: 210,
    tendencia: "estable",
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function getRiesgo(item: PrediccionItem): Riesgo {
  if (item.stockActual === 0) return "CRÍTICO";
  if (item.diasRestantes <= 45) return "ALTO";
  if (item.diasRestantes <= 90) return "MEDIO";
  return "ESTABLE";
}

const RIESGO_STYLE: Record<
  Riesgo,
  { bg: string; color: string; border: string; label: string }
> = {
  CRÍTICO: {
    bg: "#dc262618",
    color: "#dc2626",
    border: "#fca5a5",
    label: "Crítico",
  },
  ALTO: { bg: "#f59e0b18", color: "#b45309", border: "#fcd34d", label: "Alto" },
  MEDIO: {
    bg: "#3b82f618",
    color: "#1d4ed8",
    border: "#93c5fd",
    label: "Medio",
  },
  ESTABLE: {
    bg: "#49c21b18",
    color: "#2a9912",
    border: "#86efac",
    label: "Estable",
  },
};

const RIESGO_ICON: Record<Riesgo, React.ReactNode> = {
  CRÍTICO: <AlertTriangle size={12} />,
  ALTO: <AlertCircle size={12} />,
  MEDIO: <Activity size={12} />,
  ESTABLE: <CheckCircle size={12} />,
};

const TENDENCIA_STYLE = {
  subiendo: { label: "↑ Subiendo", color: "#dc2626" },
  estable: { label: "→ Estable", color: "#6b7280" },
  bajando: { label: "↓ Bajando", color: "#49c21b" },
};

// Porcentaje de días hasta 1 año (max 100%)
function pctDias(dias: number) {
  return Math.min(Math.round((dias / 365) * 100), 100);
}

// ─────────────────────────────────────────────
// GAUGE SVG – arco semicircular de riesgo
// ─────────────────────────────────────────────
function RiesgoGauge({ dias, riesgo }: { dias: number; riesgo: Riesgo }) {
  const pct = pctDias(dias);
  const angle = (pct / 100) * 180; // 0° = izquierda, 180° = derecha
  const R = 54;
  const cx = 70;
  const cy = 70;

  // Punto en el arco
  const rad = ((angle - 180) * Math.PI) / 180;
  const nx = cx + R * Math.cos(rad);
  const ny = cy + R * Math.sin(rad);

  // Color del arco según riesgo
  const trackColor = RIESGO_STYLE[riesgo].color;
  const bgArc = "#f0f0f4";

  // Arco de fondo (semicírculo)
  const bgPath = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;

  // Arco de progreso
  const progressAngle = Math.min(angle, 180);
  const radP = ((progressAngle - 180) * Math.PI) / 180;
  const px = cx + R * Math.cos(radP);
  const py = cy + R * Math.sin(radP);
  const large = progressAngle > 90 ? 1 : 0;
  const progressPath = `M ${cx - R} ${cy} A ${R} ${R} 0 ${large} 1 ${px} ${py}`;

  return (
    <svg width={140} height={80} viewBox="0 0 140 80">
      {/* Track */}
      <path
        d={bgPath}
        fill="none"
        stroke={bgArc}
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Progress */}
      {pct > 0 && (
        <path
          d={progressPath}
          fill="none"
          stroke={trackColor}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.8}
        />
      )}
      {/* Aguja */}
      <circle cx={nx} cy={ny} r={5} fill={trackColor} />
      {/* Valor */}
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize={16}
        fontWeight={700}
        fill={trackColor}
        fontFamily="'Poppins', sans-serif"
      >
        {dias === 0 ? "0d" : `${dias}d`}
      </text>
      <text
        x={cx}
        y={cy + 26}
        textAnchor="middle"
        fontSize={9}
        fill="#9ca3af"
        fontFamily="'Poppins', sans-serif"
      >
        días estimados
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// MODAL ANÁLISIS
// ─────────────────────────────────────────────
function AnalisisModal({
  item,
  onClose,
}: {
  item: PrediccionItem;
  onClose: () => void;
}) {
  const riesgo = getRiesgo(item);
  const rs = RIESGO_STYLE[riesgo];
  const tend = TENDENCIA_STYLE[item.tendencia];
  const consumoPct = Math.min(
    Math.round((item.consumoPromedio3m / Math.max(item.stockActual, 1)) * 100),
    100,
  );

  const interpretacion =
    item.stockActual === 0
      ? "El insumo está completamente agotado. Se requiere reposición inmediata para no detener la producción."
      : item.prediccion === "si"
        ? `Con el consumo promedio actual de ${item.consumoPromedio3m} ${item.unidad}/mes, el stock se agotará en aproximadamente ${item.diasRestantes} días. Se recomienda generar una orden de reposición a la brevedad.`
        : `El stock actual es suficiente para cubrir aproximadamente ${item.diasRestantes} días de operación. No se requiere acción inmediata, pero conviene monitorear la tendencia de consumo.`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="relative w-full mx-4 overflow-hidden"
          style={{
            maxWidth: 520,
            backgroundColor: "#fff",
            borderRadius: 22,
            boxShadow: "0 28px 80px rgba(0,0,0,0.22)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, ${riesgo === "CRÍTICO" || riesgo === "ALTO" ? "#0b3d91" : "#0b3d91"} 0%, #041d47 100%)`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  width: 42,
                  height: 42,
                  backgroundColor: rs.color + "30",
                }}
              >
                <TrendingUp size={20} style={{ color: rs.color }} />
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Análisis de predicción
                </p>
                <h3
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "'Poppins', sans-serif", maxWidth: 280 }}
                >
                  {item.nombreInsumo}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                padding: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
              }
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Gauge + estado */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center">
                <RiesgoGauge dias={item.diasRestantes} riesgo={riesgo} />
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {/* Badge predicción */}
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: rs.bg,
                      color: rs.color,
                      border: `1px solid ${rs.border}`,
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {RIESGO_ICON[riesgo]}
                    {item.prediccion === "si" ? "Se agotará" : "Stock estable"}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: "#f5f6fa",
                      color: tend.color,
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {tend.label}
                  </span>
                </div>

                {/* Datos clave */}
                {[
                  {
                    label: "Stock actual",
                    value: `${item.stockActual.toLocaleString()} ${item.unidad}`,
                  },
                  {
                    label: "Consumo prom. 3 meses",
                    value: `${item.consumoPromedio3m} ${item.unidad}/mes`,
                  },
                  {
                    label: "Días hasta agotamiento",
                    value:
                      item.diasRestantes === 0
                        ? "Agotado"
                        : `~${item.diasRestantes} días`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span
                      className="text-xs"
                      style={{
                        color: "#9ca3af",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: "#111827",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barra de consumo vs stock */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium"
                  style={{
                    color: "#374151",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Tasa de consumo mensual vs stock
                </span>
                <span className="text-xs font-bold" style={{ color: rs.color }}>
                  {consumoPct}%
                </span>
              </div>
              <div
                className="rounded-full overflow-hidden"
                style={{ height: 8, backgroundColor: "#f0f0f4" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${consumoPct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: rs.color }}
                />
              </div>
              <p
                className="text-[10px] mt-1"
                style={{
                  color: "#9ca3af",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Cada mes se consume el {consumoPct}% del stock disponible actual
              </p>
            </div>

            {/* Separador */}
            <div style={{ borderTop: "1px solid #f0f0f4" }} />

            {/* Interpretación */}
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{
                backgroundColor: rs.bg,
                border: `1px solid ${rs.border}`,
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.prediccion === "si" ? (
                  <AlertTriangle size={16} style={{ color: rs.color }} />
                ) : (
                  <ShieldCheck size={16} style={{ color: rs.color }} />
                )}
              </div>
              <div>
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{
                    color: rs.color,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Interpretación automática
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    color: "#374151",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {interpretacion}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm rounded-xl transition-all"
              style={{
                border: "1.5px solid #e5e7eb",
                backgroundColor: "transparent",
                color: "#6b7280",
                fontFamily: "'Poppins', sans-serif",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#9ca3af")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#e5e7eb")
              }
            >
              Cerrar
            </button>
            <Link
              href="/inventario"
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: "#0b3d91",
                color: "#fff",
                textDecoration: "none",
                fontFamily: "'Poppins', sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#49c21b")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#0b3d91")
              }
            >
              <Package size={14} /> Ir a inventario
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function PrediccionClient() {
  const [items, setItems] = useState<PrediccionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [riesgoFilter, setRiesgoFilter] = useState("");
  const [analisisItem, setAnalisisItem] = useState<PrediccionItem | null>(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // ── Load ──
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: reemplazar con → const data = await getPredicciones();
      await new Promise((r) => setTimeout(r, 600));
      setItems(MOCK);
    } catch {
      setError("No se pudo cargar las predicciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Filtrado ──
  const filtered = items.filter((item) => {
    const matchQ = item.nombreInsumo
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchR = riesgoFilter ? getRiesgo(item) === riesgoFilter : true;
    return matchQ && matchR;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  // ── Stats ──
  const criticos = items.filter((i) => getRiesgo(i) === "CRÍTICO").length;
  const altos = items.filter((i) => getRiesgo(i) === "ALTO").length;
  const medios = items.filter((i) => getRiesgo(i) === "MEDIO").length;
  const estables = items.filter((i) => getRiesgo(i) === "ESTABLE").length;

  const buildPages = (total: number, current: number) =>
    Array.from({ length: total }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === total || Math.abs(p - current) <= 1)
      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
        acc.push(p);
        return acc;
      }, []);

  return (
    <>
      <div className="flex flex-col gap-6 pb-7">
        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
            >
              Predicción de Agotamiento
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
            >
              Modelo de predicción basado en el consumo promedio de los últimos
              3 meses.
            </p>
          </div>
          <Link
            href="/inventario"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all"
            style={{
              border: "1.5px solid #e5e7eb",
              backgroundColor: "#fff",
              color: "#374151",
              textDecoration: "none",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0b3d91";
              e.currentTarget.style.color = "#0b3d91";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#374151";
            }}
          >
            <ArrowLeft size={14} /> Volver al inventario
          </Link>
        </motion.div>

        {/* ── Stat cards de riesgo ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07 }}
          className="grid grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Crítico",
              value: criticos,
              color: "#dc2626",
              icon: AlertTriangle,
              riesgo: "CRÍTICO" as Riesgo,
            },
            {
              label: "Alto",
              value: altos,
              color: "#b45309",
              icon: AlertCircle,
              riesgo: "ALTO" as Riesgo,
            },
            {
              label: "Medio",
              value: medios,
              color: "#1d4ed8",
              icon: Activity,
              riesgo: "MEDIO" as Riesgo,
            },
            {
              label: "Estable",
              value: estables,
              color: "#2a9912",
              icon: CheckCircle,
              riesgo: "ESTABLE" as Riesgo,
            },
          ].map(({ label, value, color, icon: Icon, riesgo }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-4 cursor-pointer transition-all"
              style={{
                backgroundColor:
                  riesgoFilter === riesgo ? color + "10" : "#fff",
                boxShadow:
                  riesgoFilter === riesgo
                    ? `0 0 0 2px ${color}`
                    : "0 1px 10px rgba(0,0,0,0.06)",
                borderLeft: `4px solid ${color}`,
              }}
              onClick={() => {
                setRiesgoFilter(riesgoFilter === riesgo ? "" : riesgo);
                setPage(1);
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 40, height: 40, backgroundColor: color + "18" }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color, fontFamily: "'Poppins', sans-serif" }}
                >
                  {label}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: "#111827",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Alerta si hay críticos ── */}
        <AnimatePresence>
          {criticos > 0 && !riesgoFilter && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl"
              style={{
                backgroundColor: "#fee2e2",
                border: "1px solid #fca5a5",
              }}
            >
              <Zap size={17} style={{ color: "#dc2626", flexShrink: 0 }} />
              <p
                className="text-sm font-medium"
                style={{
                  color: "#dc2626",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Hay <strong>{criticos}</strong> insumo{criticos > 1 ? "s" : ""}{" "}
                completamente agotado{criticos > 1 ? "s" : ""}. Se requiere
                reposición inmediata.
              </p>
              <Link
                href="/entradas-add"
                className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex-shrink-0"
                style={{
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  textDecoration: "none",
                  fontFamily: "'Poppins', sans-serif",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#b91c1c")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#dc2626")
                }
              >
                Nueva entrada →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tabla card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#fff",
            boxShadow: "0 1px 12px rgba(0,0,0,0.07)",
            border: "1px solid #f0f0f4",
          }}
        >
          {/* Toolbar */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
            style={{ borderBottom: "1px solid #f0f0f4" }}
          >
            <div className="flex items-center gap-2">
              <BarChart2 size={16} style={{ color: "#0b3d91" }} />
              <p
                className="text-sm font-semibold"
                style={{
                  color: "#111827",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Resultados de Predicción
              </p>
              {riesgoFilter && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: RIESGO_STYLE[riesgoFilter as Riesgo].bg,
                    color: RIESGO_STYLE[riesgoFilter as Riesgo].color,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {riesgoFilter}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Limpiar filtro */}
              {riesgoFilter && (
                <button
                  onClick={() => {
                    setRiesgoFilter("");
                    setPage(1);
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
                  style={{
                    border: "1.5px solid #fca5a5",
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <X size={11} /> Limpiar
                </button>
              )}

              {/* Buscador */}
              <div className="relative">
                <Search
                  size={13}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar insumo..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    paddingLeft: 32,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: "'Poppins', sans-serif",
                    outline: "none",
                    width: 190,
                    color: "#374151",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#0b3d91")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#e5e7eb")
                  }
                />
              </div>

              {/* Refresh */}
              <button
                onClick={load}
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 36,
                  height: 36,
                  border: "1.5px solid #e5e7eb",
                  backgroundColor: "transparent",
                  color: "#6b7280",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0b3d91";
                  e.currentTarget.style.color = "#0b3d91";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.color = "#6b7280";
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 700,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#fafafa" }}>
                  {[
                    "Insumo",
                    "Stock actual",
                    "Consumo prom./mes",
                    "Días estimados",
                    "Nivel de riesgo",
                    "Tendencia",
                    "Análisis",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color: "#9ca3af",
                        fontFamily: "'Poppins', sans-serif",
                        borderBottom: "1px solid #f0f0f4",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f7f7f9" }}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div
                            className="animate-pulse rounded"
                            style={{
                              height: 13,
                              width: j === 0 ? 160 : 70,
                              backgroundColor: "#f3f4f6",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center">
                      <div
                        className="flex items-center justify-center gap-2 text-sm"
                        style={{ color: "#dc2626" }}
                      >
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <TrendingUp
                        size={32}
                        style={{ color: "#d1d5db", margin: "0 auto 8px" }}
                      />
                      <p
                        className="text-sm"
                        style={{
                          color: "#9ca3af",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        Sin resultados
                      </p>
                    </td>
                  </tr>
                ) : (
                  paged.map((item, i) => {
                    const riesgo = getRiesgo(item);
                    const rs = RIESGO_STYLE[riesgo];
                    const tend = TENDENCIA_STYLE[item.tendencia];
                    const pct = pctDias(item.diasRestantes);

                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom:
                            i < paged.length - 1 ? "1px solid #f7f7f9" : "none",
                          transition: "background-color 0.12s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fafbff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        {/* Insumo */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex items-center justify-center rounded-lg flex-shrink-0"
                              style={{
                                width: 34,
                                height: 34,
                                backgroundColor: rs.bg,
                              }}
                            >
                              <Package size={15} style={{ color: rs.color }} />
                            </div>
                            <span
                              className="text-sm font-medium"
                              style={{
                                color: "#111827",
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              {item.nombreInsumo}
                            </span>
                          </div>
                        </td>

                        {/* Stock actual */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-sm font-bold"
                            style={{
                              color:
                                item.stockActual === 0 ? "#dc2626" : "#374151",
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            {item.stockActual.toLocaleString()} {item.unidad}
                          </span>
                        </td>

                        {/* Consumo */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-sm"
                            style={{
                              color: "#6b7280",
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            {item.consumoPromedio3m} {item.unidad}/mes
                          </span>
                        </td>

                        {/* Días + minibarra */}
                        <td className="px-5 py-3.5" style={{ minWidth: 120 }}>
                          <div>
                            <span
                              className="text-sm font-semibold block"
                              style={{
                                color: rs.color,
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              {item.diasRestantes === 0
                                ? "Agotado"
                                : `~${item.diasRestantes} días`}
                            </span>
                            <div
                              className="rounded-full mt-1 overflow-hidden"
                              style={{
                                height: 4,
                                width: 100,
                                backgroundColor: "#f0f0f4",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: rs.color,
                                  transition: "width 0.6s ease",
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Riesgo badge */}
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: rs.bg,
                              color: rs.color,
                              border: `1px solid ${rs.border}`,
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            {RIESGO_ICON[riesgo]}
                            {rs.label}
                          </span>
                        </td>

                        {/* Tendencia */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-xs font-semibold"
                            style={{
                              color: tend.color,
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            {tend.label}
                          </span>
                        </td>

                        {/* Acción */}
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setAnalisisItem(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
                            style={{
                              backgroundColor: "#0b3d91",
                              color: "#fff",
                              border: "none",
                              fontFamily: "'Poppins', sans-serif",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#49c21b")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#0b3d91")
                            }
                          >
                            <TrendingUp size={12} /> Ver análisis
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && filtered.length > 0 && (
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              style={{ borderTop: "1px solid #f0f0f4" }}
            >
              <span
                className="text-xs"
                style={{
                  color: "#9ca3af",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Mostrando {start + 1}–
                {Math.min(start + perPage, filtered.length)} de{" "}
                {filtered.length} insumos
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 32,
                    height: 32,
                    border: "1.5px solid #e5e7eb",
                    backgroundColor: "transparent",
                    color: page === 1 ? "#d1d5db" : "#374151",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                {buildPages(totalPages, page).map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`e${i}`}
                      className="px-1 text-xs"
                      style={{ color: "#9ca3af" }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className="flex items-center justify-center rounded-lg text-xs font-medium"
                      style={{
                        width: 32,
                        height: 32,
                        border: `1.5px solid ${page === p ? "#0b3d91" : "#e5e7eb"}`,
                        backgroundColor: page === p ? "#0b3d91" : "transparent",
                        color: page === p ? "#fff" : "#374151",
                        cursor: "pointer",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 32,
                    height: 32,
                    border: "1.5px solid #e5e7eb",
                    backgroundColor: "transparent",
                    color: page === totalPages ? "#d1d5db" : "#374151",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  padding: "4px 10px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: "'Poppins', sans-serif",
                  color: "#374151",
                  outline: "none",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                }}
              >
                {[5, 10, 25].map((n) => (
                  <option key={n} value={n}>
                    {n} / pág
                  </option>
                ))}
              </select>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal análisis */}
      {analisisItem && (
        <AnalisisModal
          item={analisisItem}
          onClose={() => setAnalisisItem(null)}
        />
      )}
    </>
  );
}
