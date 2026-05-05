"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, AlertTriangle, CheckCircle2, Loader2, RefreshCw, TrendingDown,
  Package, CalendarX, Zap, ShieldAlert, Activity, ArrowRight, X,
  BarChart2, Target, ChevronDown, ChevronUp, Cpu, Wifi, WifiOff,
  SlidersHorizontal, Info,
} from "lucide-react";
import {
  usePrediccionMasiva,
  usePrediccionIndividual,
  useEntrenamiento,
} from "@/app/hooks/usePrediccion";
import type { PrediccionResponse } from "@/app/types/prediccion";
import { useAuth } from "@/app/context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function nivelRiesgo(p: PrediccionResponse): "CRITICO" | "ALTO" | "MEDIO" | "ESTABLE" {
  const xg = p.xgboost?.nivel_riesgo?.toUpperCase();
  if (xg === "CRITICO" || p.stock_actual === 0) return "CRITICO";
  if (xg === "ALTO" || (p.prophet?.dias_hasta_cero !== null && (p.prophet?.dias_hasta_cero ?? 999) <= 30)) return "ALTO";
  if (xg === "MEDIO" || (p.prophet?.dias_hasta_cero !== null && (p.prophet?.dias_hasta_cero ?? 999) <= 60)) return "MEDIO";
  return "ESTABLE";
}

const RIESGO_CONFIG = {
  CRITICO: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", badge: "#dc2626", label: "Crítico", icon: <ShieldAlert size={14} /> },
  ALTO:    { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", badge: "#ea580c", label: "Alto",    icon: <AlertTriangle size={14} /> },
  MEDIO:   { bg: "#fefce8", border: "#fef08a", text: "#854d0e", badge: "#ca8a04", label: "Medio",   icon: <Activity size={14} /> },
  ESTABLE: { bg: "#f0fdf4", border: "#bbf7d0", text: "#14532d", badge: "#16a34a", label: "Estable", icon: <CheckCircle2 size={14} /> },
};

function pct(val: number | null | undefined): string {
  if (val == null) return "—";
  return (val * 100).toFixed(0) + "%";
}

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function diasLabel(dias: number | null | undefined): string {
  if (dias == null) return "—";
  if (dias === 0) return "Hoy";
  if (dias < 0) return "Agotado";
  return `${dias} días`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function PrediccionClient() {
  const { user } = useAuth();
  const { data, loading, error, servicioActivo, recargar } = usePrediccionMasiva();
  const individual = usePrediccionIndividual();
  const entrenamiento = useEntrenamiento();
  const [filtroRiesgo, setFiltroRiesgo] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [detalleAbierto, setDetalleAbierto] = useState<PrediccionResponse | null>(null);
  const [showEntrenar, setShowEntrenar] = useState(false);

  const esAdmin = user?.rol === "ADMIN";

  const predicciones = data?.predicciones ?? [];

  const filtradas = predicciones.filter((p) => {
    const nivel = nivelRiesgo(p);
    const matchFiltro = filtroRiesgo === "TODOS" || nivel === filtroRiesgo;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchFiltro && matchBusqueda;
  });

  // KPIs
  const criticos = predicciones.filter(p => nivelRiesgo(p) === "CRITICO").length;
  const altos    = predicciones.filter(p => nivelRiesgo(p) === "ALTO").length;
  const medios   = predicciones.filter(p => nivelRiesgo(p) === "MEDIO").length;
  const estables = predicciones.filter(p => nivelRiesgo(p) === "ESTABLE").length;

  return (
    <div className="flex flex-col gap-6 pb-12">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="rounded-[28px] border px-6 py-5"
        style={{ borderColor: "#dbe4ff", background: "linear-gradient(135deg, rgba(11,61,145,0.07) 0%, rgba(139,92,246,0.07) 100%)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(139,92,246,0.12)" }}>
              <Brain size={24} style={{ color: "#8b5cf6" }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                Predicción de Insumos
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
                Motor ML: Prophet + XGBoost · Microservicio Python
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Indicador de estado del servicio */}
            <ServiceStatusBadge activo={servicioActivo} />

            {/* Botón reentrenar (solo ADMIN) */}
            {esAdmin && (
              <button
                onClick={() => setShowEntrenar(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                style={{ backgroundColor: "#8b5cf6", color: "#fff", border: "none", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#7c3aed")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#8b5cf6")}
              >
                <Cpu size={14} /> Reentrenar Modelo
              </button>
            )}

            {/* Refrescar */}
            <button
              onClick={recargar} disabled={loading}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all"
              style={{ borderColor: "#d0d5dd", backgroundColor: "#fff", color: "#374151", fontFamily: "'Poppins', sans-serif", cursor: loading ? "not-allowed" : "pointer" }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.color = "#0b3d91"; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d5dd"; e.currentTarget.style.color = "#374151"; }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* ── ESTADO DE CARGA / ERROR ─────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{ border: "3px solid #ede9fe" }} />
              <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "3px solid transparent", borderTopColor: "#8b5cf6" }} />
              <Brain size={24} style={{ color: "#8b5cf6" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
              Consultando modelos Prophet + XGBoost…
            </p>
          </motion.div>
        )}

        {!loading && error && (
          <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
            <AlertTriangle size={18} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#991b1b", fontFamily: "'Poppins', sans-serif" }}>
                Error al cargar predicciones
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
      {!loading && data && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { ...RIESGO_CONFIG.CRITICO, label: "Críticos",    value: criticos },
            { ...RIESGO_CONFIG.ALTO,    label: "Alto Riesgo", value: altos    },
            { ...RIESGO_CONFIG.MEDIO,   label: "Medio Riesgo",value: medios   },
            { ...RIESGO_CONFIG.ESTABLE, label: "Estables",    value: estables },
          ].map(({ label, value, badge, bg, icon }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setFiltroRiesgo(label === "Críticos" ? "CRITICO" : label === "Alto Riesgo" ? "ALTO" : label === "Medio Riesgo" ? "MEDIO" : "ESTABLE")}
              className="flex items-center gap-2 sm:gap-4 rounded-2xl px-3 sm:px-5 py-3 sm:py-4 cursor-pointer transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: "#fff", boxShadow: "0 1px 12px rgba(0,0,0,0.07)", borderLeft: `4px solid ${badge}` }}>
              <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 42, height: 42, backgroundColor: bg }}>
                <span style={{ color: badge }}>{React.cloneElement(icon as React.ReactElement, { size: 20 } as Record<string, unknown>)}</span>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide leading-tight" style={{ color: badge, fontFamily: "'Poppins', sans-serif" }}>{label}</p>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── TABLA DE PREDICCIONES ──────────────────────────────────────── */}
      {!loading && data && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* Barra de filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Package size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar insumo…"
                style={{ width: "100%", padding: "9px 14px 9px 36px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, fontFamily: "'Poppins', sans-serif", color: "#374151", outline: "none", backgroundColor: "#fff", boxSizing: "border-box" }}
                onFocus={e => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            {/* Filtro por nivel */}
            <div className="flex items-center gap-2 flex-wrap">
              {(["TODOS", "CRITICO", "ALTO", "MEDIO", "ESTABLE"] as const).map(nivel => {
                const cfg = nivel !== "TODOS" ? RIESGO_CONFIG[nivel] : null;
                const active = filtroRiesgo === nivel;
                return (
                  <button key={nivel} onClick={() => setFiltroRiesgo(nivel)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: active ? (cfg?.badge ?? "#0b3d91") : "#f3f4f6",
                      color: active ? "#fff" : "#6b7280",
                      border: "none",
                      cursor: "pointer",
                    }}>
                    {cfg?.icon && <span>{cfg.icon}</span>}
                    {nivel === "TODOS" ? "Todos" : cfg?.label}
                    <span className="ml-0.5 opacity-75">
                      ({nivel === "TODOS" ? predicciones.length
                        : nivel === "CRITICO" ? criticos
                        : nivel === "ALTO" ? altos
                        : nivel === "MEDIO" ? medios
                        : estables})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    {["Insumo", "Stock Actual", "Agotamiento (Prophet)", "Días hasta cero", "XGBoost", "Confianza", "Acciones"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase"
                        style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", borderBottom: "1px solid #eaecf0", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm"
                        style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                        No se encontraron insumos con ese filtro.
                      </td>
                    </tr>
                  ) : (
                    filtradas.map((p, i) => {
                      const nivel = nivelRiesgo(p);
                      const cfg = RIESGO_CONFIG[nivel];
                      return (
                        <motion.tr key={p.insumo_id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          style={{ borderBottom: "1px solid #f3f4f6" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>

                          {/* Insumo */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                                style={{ width: 32, height: 32, backgroundColor: cfg.bg }}>
                                <Package size={14} style={{ color: cfg.badge }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                                  {p.nombre}
                                </p>
                                {p.alerta && (
                                  <p className="text-xs" style={{ color: cfg.text, fontFamily: "'Poppins', sans-serif" }}>
                                    {p.mensaje}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Stock actual */}
                          <td className="px-5 py-3.5">
                            <div>
                              <p className="text-sm font-semibold" style={{ color: p.stock_actual === 0 ? "#dc2626" : "#111827" }}>
                                {(p.stock_actual ?? 0).toLocaleString()} {p.unidad_medida}
                              </p>
                              <p className="text-xs" style={{ color: "#9ca3af" }}>
                                Mín: {p.stock_minimo}
                              </p>
                            </div>
                          </td>

                          {/* Fecha agotamiento */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <CalendarX size={13} style={{ color: p.prophet?.fecha_agotamiento_estimada ? cfg.badge : "#9ca3af" }} />
                              <span className="text-sm font-medium" style={{ color: p.prophet?.fecha_agotamiento_estimada ? cfg.text : "#9ca3af" }}>
                                {fmtFecha(p.prophet?.fecha_agotamiento_estimada)}
                              </span>
                            </div>
                          </td>

                          {/* Días hasta cero */}
                          <td className="px-5 py-3.5">
                            <DiasBadge dias={p.prophet?.dias_hasta_cero} />
                          </td>

                          {/* XGBoost */}
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                              style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                              {cfg.icon}
                              {nivel}
                            </span>
                          </td>

                          {/* Confianza */}
                          <td className="px-5 py-3.5">
                            <ConfianzaBar valor={p.prophet?.confianza} />
                          </td>

                          {/* Acciones */}
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => setDetalleAbierto(p)}
                              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
                              style={{ backgroundColor: "#f5f3ff", color: "#7c3aed", border: "none", cursor: "pointer" }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#ede9fe")}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f5f3ff")}>
                              <BarChart2 size={12} /> Ver detalle
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer tabla */}
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
              <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Mostrando {filtradas.length} de {predicciones.length} insumos
              </p>
              {(data.en_riesgo ?? 0) > 0 && (
                <p className="text-xs font-semibold" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
                  ⚠ {data.en_riesgo} insumo(s) en riesgo requieren atención
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── MODAL DETALLE ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {detalleAbierto && (
          <DetalleModal prediccion={detalleAbierto} onClose={() => setDetalleAbierto(null)} />
        )}
      </AnimatePresence>

      {/* ── MODAL REENTRENAR ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showEntrenar && (
          <EntrenarModal
            entrenamiento={entrenamiento}
            onClose={() => { setShowEntrenar(false); entrenamiento.resultado && recargar(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────────────────────────────────────

function ServiceStatusBadge({ activo }: { activo: boolean | null }) {
  if (activo === null) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2"
      style={{ backgroundColor: activo ? "#f0fdf4" : "#fef2f2", border: `1px solid ${activo ? "#bbf7d0" : "#fecaca"}` }}>
      {activo
        ? <Wifi size={13} style={{ color: "#16a34a" }} />
        : <WifiOff size={13} style={{ color: "#dc2626" }} />}
      <span className="text-xs font-semibold" style={{ color: activo ? "#166534" : "#991b1b", fontFamily: "'Poppins', sans-serif" }}>
        {activo ? "ML Activo" : "ML Inactivo"}
      </span>
    </div>
  );
}

function DiasBadge({ dias }: { dias: number | null | undefined }) {
  if (dias == null) return <span className="text-sm" style={{ color: "#9ca3af" }}>—</span>;

  let bg = "#dcfce7", color = "#166534";
  if (dias === 0 || dias < 0) { bg = "#fef2f2"; color = "#991b1b"; }
  else if (dias <= 30) { bg = "#fecaca"; color = "#991b1b"; }
  else if (dias <= 60) { bg = "#fed7aa"; color = "#9a3412"; }
  else if (dias <= 90) { bg = "#fef9c3"; color = "#854d0e"; }

  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: bg, color }}>
      {dias <= 0 ? "Agotado" : `${dias}d`}
    </span>
  );
}

function ConfianzaBar({ valor }: { valor: number | null | undefined }) {
  if (valor == null) return <span className="text-xs" style={{ color: "#9ca3af" }}>—</span>;
  const pct = Math.round(valor * 100);
  const color = pct >= 80 ? "#16a34a" : pct >= 60 ? "#ca8a04" : "#dc2626";
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="relative h-1.5 w-20 overflow-hidden rounded-full" style={{ backgroundColor: "#f3f4f6" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <span className="text-xs font-semibold" style={{ color, fontFamily: "'Poppins', sans-serif" }}>{pct}%</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DETALLE
// ─────────────────────────────────────────────────────────────────────────────

function DetalleModal({ prediccion: p, onClose }: { prediccion: PrediccionResponse; onClose: () => void }) {
  const nivel = nivelRiesgo(p);
  const cfg = RIESGO_CONFIG[nivel];

  return (
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        className="w-full max-w-2xl overflow-hidden rounded-3xl"
        style={{ backgroundColor: "#fff", boxShadow: "0 25px 80px rgba(0,0,0,0.2)" }}>

        {/* Header modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5"
          style={{ background: `linear-gradient(135deg, ${cfg.bg} 0%, #fff 100%)`, borderBottom: "1px solid #f0f0f4" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <Package size={18} style={{ color: cfg.badge }} />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                {p.nombre}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: cfg.text }}>
                {cfg.icon} Riesgo {cfg.label}
              </span>
            </div>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
            style={{ backgroundColor: "#f3f4f6", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fecaca")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f3f4f6")}>
            <X size={15} style={{ color: "#374151" }} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5">

            {/* Stock info */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: "Stock Actual", value: `${(p.stock_actual ?? 0).toLocaleString()} ${p.unidad_medida}`, color: (p.stock_actual ?? 0) === 0 ? "#dc2626" : "#111827" },
                { label: "Stock Mínimo", value: `${p.stock_minimo} ${p.unidad_medida}`, color: "#6b7280" },
                { label: "Consumo Diario", value: p.prophet?.consumo_diario_promedio != null ? `${p.prophet.consumo_diario_promedio.toFixed(2)} u/día` : "—", color: "#6b7280" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl border px-4 py-3" style={{ borderColor: "#f0f0f4", backgroundColor: "#fafafa" }}>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>{label}</p>
                  <p className="mt-1 text-base font-bold" style={{ color, fontFamily: "'Poppins', sans-serif" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Prophet */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#e0e7ff" }}>
              <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: "#eef2ff", borderBottom: "1px solid #e0e7ff" }}>
                <TrendingDown size={14} style={{ color: "#6366f1" }} />
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#4338ca", fontFamily: "'Poppins', sans-serif" }}>
                  Modelo Prophet — Serie Temporal
                </p>
                {p.prophet?.metodo && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#e0e7ff", color: "#6366f1" }}>
                    {p.prophet.metodo}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 divide-y divide-[#f3f4f6] sm:divide-x">
                {[
                  { label: "Alerta estimada",        value: fmtFecha(p.prophet?.fecha_alerta_estimada) },
                  { label: "Agotamiento estimado",   value: fmtFecha(p.prophet?.fecha_agotamiento_estimada) },
                  { label: "Días hasta stock mín.",  value: diasLabel(p.prophet?.dias_hasta_stock_minimo) },
                  { label: "Días hasta cero",        value: diasLabel(p.prophet?.dias_hasta_cero) },
                  { label: "Confianza",              value: pct(p.prophet?.confianza) },
                  { label: "Historial suficiente",   value: p.prophet?.suficiente_historial == null ? "—" : p.prophet.suficiente_historial ? "Sí" : "No" },
                ].map(({ label, value }) => (
                  <div key={label} className="px-4 py-3">
                    <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>{label}</p>
                    <p className="mt-0.5 text-sm font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* XGBoost */}
            {p.xgboost && (
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#fde68a" }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: "#fefce8", borderBottom: "1px solid #fde68a" }}>
                  <Zap size={14} style={{ color: "#ca8a04" }} />
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#92400e", fontFamily: "'Poppins', sans-serif" }}>
                    Modelo XGBoost — Clasificación de Riesgo
                  </p>
                </div>
                <div className="px-4 py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium" style={{ color: "#6b7280" }}>Nivel de riesgo:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
                      style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                      {cfg.icon} {p.xgboost.nivel_riesgo}
                    </span>
                  </div>
                  {p.xgboost.probabilidades && Object.keys(p.xgboost.probabilidades).length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                        Probabilidades por clase
                      </p>
                      {Object.entries(p.xgboost.probabilidades).map(([clase, prob]) => (
                        <div key={clase} className="flex items-center gap-3">
                          <span className="w-20 text-xs font-medium text-right" style={{ color: "#6b7280" }}>{clase}</span>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#f3f4f6" }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.round(prob * 100)}%`, backgroundColor: "#8b5cf6" }} />
                          </div>
                          <span className="text-xs font-bold w-10 text-right" style={{ color: "#7c3aed" }}>{(prob * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recomendación */}
            {p.recomendacion && (
              <div className="flex items-start gap-3 rounded-2xl border px-4 py-4"
                style={{ borderColor: "#bfdbfe", backgroundColor: "#eff6ff" }}>
                <Info size={16} style={{ color: "#2563eb", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#1d4ed8" }}>Recomendación</p>
                  <p className="text-sm" style={{ color: "#1e40af", fontFamily: "'Poppins', sans-serif" }}>{p.recomendacion}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL REENTRENAR
// ─────────────────────────────────────────────────────────────────────────────

function EntrenarModal({
  entrenamiento,
  onClose,
}: {
  entrenamiento: ReturnType<typeof useEntrenamiento>;
  onClose: () => void;
}) {
  const { resultado, loading, error, entrenar } = entrenamiento;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ backgroundColor: "#fff", boxShadow: "0 25px 80px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5"
          style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", borderBottom: "1px solid #ddd6fe" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: "#ede9fe" }}>
            <Cpu size={20} style={{ color: "#7c3aed" }} />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
              Reentrenar Modelo ML
            </h2>
            <p className="text-xs" style={{ color: "#7c3aed", fontFamily: "'Poppins', sans-serif" }}>
              Prophet + XGBoost
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-5 sm:py-6 flex flex-col gap-4 sm:gap-5">
          {!resultado && !loading && !error && (
            <div>
              <p className="text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                Se reentrenarán los modelos Prophet y XGBoost con todos los datos históricos de movimientos.
                Este proceso puede tomar unos segundos.
              </p>
              <div className="mt-4 flex items-start gap-2 rounded-xl border px-4 py-3"
                style={{ borderColor: "#fde68a", backgroundColor: "#fefce8" }}>
                <AlertTriangle size={14} style={{ color: "#ca8a04", marginTop: 1, flexShrink: 0 }} />
                <p className="text-xs" style={{ color: "#92400e", fontFamily: "'Poppins', sans-serif" }}>
                  Solo disponible para administradores. El modelo se actualizará con los movimientos más recientes.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 animate-spin rounded-full" style={{ border: "3px solid transparent", borderTopColor: "#8b5cf6" }} />
                <Cpu size={22} style={{ color: "#8b5cf6" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "#7c3aed", fontFamily: "'Poppins', sans-serif" }}>
                Reentrenando modelos…
              </p>
            </div>
          )}

          {resultado && (
            <div className={`flex items-start gap-3 rounded-2xl border px-4 py-4`}
              style={{ borderColor: resultado.exito ? "#bbf7d0" : "#fecaca", backgroundColor: resultado.exito ? "#f0fdf4" : "#fef2f2" }}>
              {resultado.exito
                ? <CheckCircle2 size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
                : <AlertTriangle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />}
              <div>
                <p className="text-sm font-semibold" style={{ color: resultado.exito ? "#15803d" : "#991b1b", fontFamily: "'Poppins', sans-serif" }}>
                  {resultado.exito ? "Entrenamiento completado" : "Error en entrenamiento"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: resultado.exito ? "#16a34a" : "#b42318", fontFamily: "'Poppins', sans-serif" }}>
                  {resultado.mensaje}
                  {resultado.registros != null && ` · ${resultado.registros} registros procesados`}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border px-4 py-4"
              style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
              <AlertTriangle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />
              <p className="text-sm" style={{ color: "#991b1b", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={loading}
              className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all"
              style={{ borderColor: "#d0d5dd", color: "#374151", backgroundColor: "#fff", fontFamily: "'Poppins', sans-serif", cursor: loading ? "not-allowed" : "pointer" }}>
              {resultado ? "Cerrar" : "Cancelar"}
            </button>
            {!resultado && (
              <button onClick={entrenar} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: loading ? "#7c3aed" : "#8b5cf6", border: "none", fontFamily: "'Poppins', sans-serif", cursor: loading ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#7c3aed"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = "#8b5cf6"; }}>
                {loading ? <><Loader2 size={14} className="animate-spin" /> Entrenando…</> : <><Cpu size={14} /> Iniciar Entrenamiento</>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
