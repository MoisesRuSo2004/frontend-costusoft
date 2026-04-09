"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, CalendarDays, FileText, FileSpreadsheet,
  ArrowLeft, Archive, ArrowDownToLine, ArrowUpFromLine,
  AlertTriangle, Package, ChevronLeft, ChevronRight,
  SlidersHorizontal, CheckSquare, Circle, CheckCircle2,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
type TipoInforme   = "insumos" | "entradas" | "salidas";
type TipoReporte   = "acumulado" | "agrupado";

interface FiltrosForm {
  tipoInforme: TipoInforme | "";
  fechaInicio: string;
  fechaFin: string;
  tipoReporte: TipoReporte;
  soloConMovimiento: boolean;
}

interface ReporteRow {
  id: number;
  insumo: string;
  entradas: number;
  salidas: number;
  stockActual: number;
  unidad: string;
}

interface ReporteSummary {
  totalInsumos: number;
  totalEntradas: number;
  totalSalidas: number;
  insumosCero: number;
  rows: ReporteRow[];
  filtros: FiltrosForm;
}

// ─────────────────────────────────────────────
// MOCK — simula la respuesta del API
// ─────────────────────────────────────────────
function generarMockReporte(f: FiltrosForm): ReporteSummary {
  const rows: ReporteRow[] = [
    { id: 1,  insumo: "Hilo 40/2 Blanco",       entradas: 500, salidas: 215, stockActual: 850,  unidad: "Cono"   },
    { id: 2,  insumo: "Tela Popelina Azul",      entradas: 80,  salidas: 30,  stockActual: 45,   unidad: "Metro"  },
    { id: 3,  insumo: "Botones 15mm Negros",     entradas: 3000,salidas: 800, stockActual: 1200, unidad: "Unidad" },
    { id: 4,  insumo: "Cierre Invisible 60cm",   entradas: 200, salidas: 200, stockActual: 0,    unidad: "Unidad" },
    { id: 5,  insumo: "Elástico 2cm Natural",    entradas: 500, salidas: 200, stockActual: 320,  unidad: "Metro"  },
    { id: 6,  insumo: "Entretela Termoadhesiva", entradas: 100, salidas: 45,  stockActual: 18,   unidad: "Metro"  },
    { id: 7,  insumo: "Hilo 20/2 Negro",         entradas: 400, salidas: 20,  stockActual: 600,  unidad: "Cono"   },
    { id: 8,  insumo: "Aguja Industrial #14",    entradas: 100, salidas: 12,  stockActual: 0,    unidad: "Unidad" },
    { id: 9,  insumo: "Tela Lino Beige",         entradas: 120, salidas: 55,  stockActual: 92,   unidad: "Metro"  },
    { id: 10, insumo: "Ribete Dorado 1cm",       entradas: 600, salidas: 180, stockActual: 410,  unidad: "Metro"  },
  ].filter((r) => f.soloConMovimiento ? (r.entradas > 0 || r.salidas > 0) : true);

  return {
    totalInsumos:  rows.length,
    totalEntradas: rows.reduce((s, r) => s + r.entradas, 0),
    totalSalidas:  rows.reduce((s, r) => s + r.salidas, 0),
    insumosCero:   rows.filter((r) => r.stockActual === 0).length,
    rows,
    filtros: f,
  };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const TIPO_INFORME_LABEL: Record<TipoInforme, string> = {
  insumos:  "Informe de Insumos",
  entradas: "Informe de Entradas",
  salidas:  "Informe de Salidas",
};

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

// ─────────────────────────────────────────────
// FORMULARIO DE FILTROS
// ─────────────────────────────────────────────
function FiltrosPanel({ onGenerate }: { onGenerate: (f: FiltrosForm) => void }) {
  const [form, setForm] = useState<FiltrosForm>({
    tipoInforme:       "",
    fechaInicio:       "",
    fechaFin:          "",
    tipoReporte:       "acumulado",
    soloConMovimiento: false,
  });
  const [errors, setErrors] = useState<Partial<FiltrosForm>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Partial<FiltrosForm> = {} as any;
    if (!form.tipoInforme) (e as any).tipoInforme = true;
    if (!form.fechaInicio) (e as any).fechaInicio = true;
    if (!form.fechaFin)    (e as any).fechaFin    = true;
    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio)
      (e as any).fechaFin = "rango";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    // TODO: fetch real al API → await generarReporte(form)
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    onGenerate(form as FiltrosForm & { tipoInforme: TipoInforme });
  };

  const selectStyle = (hasErr?: boolean) => ({
    width: "100%",
    padding: "11px 14px",
    border: `1.5px solid ${hasErr ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 10,
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    color: "#374151",
    outline: "none",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  const inputStyle = (hasErr?: boolean) => ({
    ...selectStyle(hasErr),
    cursor: "text",
  });

  const focusOn  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#0b3d91";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.1)";
  };
  const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasErr?: boolean) => {
    e.currentTarget.style.borderColor = hasErr ? "#fca5a5" : "#e5e7eb";
    e.currentTarget.style.boxShadow = "none";
  };

  const TIPOS: { value: TipoInforme; label: string; icon: React.ReactNode; color: string }[] = [
    { value: "insumos",  label: "Insumos",  icon: <Archive size={15} />,          color: "#0b3d91" },
    { value: "entradas", label: "Entradas", icon: <ArrowDownToLine size={15} />,  color: "#49c21b" },
    { value: "salidas",  label: "Salidas",  icon: <ArrowUpFromLine size={15} />,  color: "#c2410c" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#fff", boxShadow: "0 1px 24px rgba(0,0,0,0.09)", border: "1px solid #f0f0f4" }}
      >
        {/* Header */}
        <div
          className="px-8 py-6 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #0b3d91 0%, #072d6e 100%)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ width: 44, height: 44, backgroundColor: "rgba(73,194,27,0.2)" }}>
            <BarChart2 size={22} style={{ color: "#49c21b" }} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Generar Reporte
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Poppins', sans-serif" }}>
              Selecciona los criterios para generar el informe
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-6">

          {/* Tipo de informe — cards seleccionables */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-3"
              style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              Tipo de Informe <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TIPOS.map(({ value, label, icon, color }) => {
                const active = form.tipoInforme === value;
                return (
                  <button
                    key={value} type="button"
                    onClick={() => { setForm({ ...form, tipoInforme: value }); setErrors({ ...errors, tipoInforme: undefined }); }}
                    className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all"
                    style={{
                      border: `1.5px solid ${active ? color : "#e5e7eb"}`,
                      backgroundColor: active ? color + "12" : "#fafafa",
                      cursor: "pointer",
                    }}
                  >
                    <div className="flex items-center justify-center rounded-lg"
                      style={{ width: 36, height: 36, backgroundColor: active ? color + "22" : "#f3f4f6" }}>
                      <span style={{ color: active ? color : "#9ca3af" }}>{icon}</span>
                    </div>
                    <span className="text-xs font-semibold"
                      style={{ color: active ? color : "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
            {(errors as any).tipoInforme && (
              <p className="text-xs mt-1.5" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
                Selecciona un tipo de informe
              </p>
            )}
          </div>

          {/* Rango de fechas */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-3"
              style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              Rango de Fechas <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                  Desde
                </label>
                <div className="relative">
                  <CalendarDays size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                  <input
                    type="date" value={form.fechaInicio}
                    onChange={(e) => { setForm({ ...form, fechaInicio: e.target.value }); setErrors({ ...errors, fechaInicio: undefined }); }}
                    style={{ ...inputStyle((errors as any).fechaInicio), paddingLeft: 36 }}
                    onFocus={focusOn} onBlur={(e) => focusOff(e, (errors as any).fechaInicio)}
                  />
                </div>
                {(errors as any).fechaInicio && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Requerido</p>}
              </div>
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                  Hasta
                </label>
                <div className="relative">
                  <CalendarDays size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                  <input
                    type="date" value={form.fechaFin}
                    onChange={(e) => { setForm({ ...form, fechaFin: e.target.value }); setErrors({ ...errors, fechaFin: undefined }); }}
                    style={{ ...inputStyle((errors as any).fechaFin), paddingLeft: 36 }}
                    onFocus={focusOn} onBlur={(e) => focusOff(e, (errors as any).fechaFin)}
                  />
                </div>
                {(errors as any).fechaFin === "rango" && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Fecha inválida</p>}
                {(errors as any).fechaFin === true && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Requerido</p>}
              </div>
            </div>
          </div>

          {/* Tipo de Reporte — radio visual */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-3"
              style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              Tipo de Reporte
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["acumulado", "agrupado"] as TipoReporte[]).map((t) => {
                const active = form.tipoReporte === t;
                return (
                  <button key={t} type="button"
                    onClick={() => setForm({ ...form, tipoReporte: t })}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                    style={{
                      border: `1.5px solid ${active ? "#0b3d91" : "#e5e7eb"}`,
                      backgroundColor: active ? "#0b3d9108" : "#fafafa",
                      cursor: "pointer",
                    }}
                  >
                    <div className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        width: 20, height: 20,
                        border: `2px solid ${active ? "#0b3d91" : "#d1d5db"}`,
                        backgroundColor: active ? "#0b3d91" : "transparent",
                      }}>
                      {active && <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#fff" }} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize"
                        style={{ color: active ? "#0b3d91" : "#374151", fontFamily: "'Poppins', sans-serif" }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </p>
                      <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                        {t === "acumulado" ? "Totales del período" : "Agrupado por insumo"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solo con movimiento — checkbox custom */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-3"
              style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              Opciones adicionales
            </label>
            <button
              type="button"
              onClick={() => setForm({ ...form, soloConMovimiento: !form.soloConMovimiento })}
              className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all"
              style={{
                border: `1.5px solid ${form.soloConMovimiento ? "#0b3d91" : "#e5e7eb"}`,
                backgroundColor: form.soloConMovimiento ? "#0b3d9108" : "#fafafa",
                cursor: "pointer",
              }}
            >
              <div
                className="flex items-center justify-center rounded-md flex-shrink-0 transition-all"
                style={{
                  width: 20, height: 20,
                  border: `2px solid ${form.soloConMovimiento ? "#0b3d91" : "#d1d5db"}`,
                  backgroundColor: form.soloConMovimiento ? "#0b3d91" : "transparent",
                }}
              >
                {form.soloConMovimiento && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: form.soloConMovimiento ? "#0b3d91" : "#374151", fontFamily: "'Poppins', sans-serif" }}>
                  Mostrar solo insumos con movimiento
                </p>
                <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                  Excluye insumos sin entradas ni salidas en el período
                </p>
              </div>
            </button>
          </div>

          {/* Botón generar */}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: loading ? "#072d6e" : "#0b3d91",
              color: "#fff",
              border: "none",
              fontFamily: "'Poppins', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#49c21b"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0b3d91"; }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Generando reporte...</>
            ) : (
              <><BarChart2 size={16} /> Generar Reporte</>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// VISTA DE RESULTADOS
// ─────────────────────────────────────────────
function ResultadosPanel({
  data, onVolver,
}: {
  data: ReporteSummary;
  onVolver: () => void;
}) {
  const [page, setPage]     = useState(1);
  const [perPage]           = useState(10);
  const totalPages          = Math.ceil(data.rows.length / perPage);
  const start               = (page - 1) * perPage;
  const paged               = data.rows.slice(start, start + perPage);

  const handleExport = (tipo: "pdf" | "excel") => {
    // TODO: conectar con endpoint de exportación
    alert(`Exportando como ${tipo.toUpperCase()}...`);
  };

  const buildPages = (total: number, current: number) =>
    Array.from({ length: total }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === total || Math.abs(p - current) <= 1)
      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
        acc.push(p); return acc;
      }, []);

  const STATS = [
    { label: "Total Insumos",     value: data.totalInsumos,                   color: "#0b3d91", icon: Archive           },
    { label: "Total Entradas",    value: data.totalEntradas.toLocaleString(),  color: "#49c21b", icon: ArrowDownToLine    },
    { label: "Total Salidas",     value: data.totalSalidas.toLocaleString(),   color: "#c2410c", icon: ArrowUpFromLine    },
    { label: "Insumos en Cero",   value: data.insumosCero,                    color: "#f59e0b", icon: AlertTriangle      },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-6"
    >
      {/* ── Header resultado ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
            Reporte Generado
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
            {TIPO_INFORME_LABEL[data.filtros.tipoInforme as TipoInforme]} · {data.filtros.tipoReporte.charAt(0).toUpperCase() + data.filtros.tipoReporte.slice(1)}
          </p>
        </div>
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all"
          style={{ border: "1.5px solid #e5e7eb", backgroundColor: "#fff", color: "#374151", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.color = "#0b3d91"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
        >
          <ArrowLeft size={14} /> Volver a filtros
        </button>
      </div>

      {/* ── Filtros aplicados ── */}
      <div
        className="flex flex-wrap items-center gap-3 px-5 py-4 rounded-2xl"
        style={{ backgroundColor: "#f5f6fa", border: "1px solid #eeeff4" }}
      >
        <SlidersHorizontal size={14} style={{ color: "#9ca3af", flexShrink: 0 }} />
        {[
          { label: "Informe",  value: TIPO_INFORME_LABEL[data.filtros.tipoInforme as TipoInforme] },
          { label: "Período",  value: `${fmtDate(data.filtros.fechaInicio)} → ${fmtDate(data.filtros.fechaFin)}` },
          { label: "Tipo",     value: data.filtros.tipoReporte.charAt(0).toUpperCase() + data.filtros.tipoReporte.slice(1) },
          ...(data.filtros.soloConMovimiento ? [{ label: "Filtro", value: "Solo con movimiento" }] : []),
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>{label}:</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: "#0b3d9112", color: "#0b3d91", fontFamily: "'Poppins', sans-serif" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Export buttons ── */}
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
          Exportar como:
        </p>
        <button
          onClick={() => handleExport("pdf")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
          style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
        >
          <FileText size={15} /> PDF
        </button>
        <button
          onClick={() => handleExport("excel")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
          style={{ backgroundColor: "#15803d", color: "#fff", border: "none", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#166534")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#15803d")}
        >
          <FileSpreadsheet size={15} /> Excel
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, color, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{ backgroundColor: "#fff", boxShadow: "0 1px 10px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}
          >
            <div className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 42, height: 42, backgroundColor: color + "18" }}>
              <Icon size={19} style={{ color }} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color, fontFamily: "'Poppins', sans-serif" }}>
                {label}
              </p>
              <p className="text-2xl font-bold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                {value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Tabla resultados ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.28 }}
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#fff", boxShadow: "0 1px 12px rgba(0,0,0,0.07)", border: "1px solid #f0f0f4" }}
      >
        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid #f0f0f4" }}>
          <div className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, backgroundColor: "#0b3d9110" }}>
            <Package size={16} style={{ color: "#0b3d91" }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
            Lista de Insumos
          </p>
          <span className="ml-auto text-xs px-3 py-1 rounded-full font-medium"
            style={{ backgroundColor: "#f5f6fa", color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
            {data.rows.length} registros
          </span>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ backgroundColor: "#fafafa" }}>
                {["#", "Insumo", "Entradas", "Salidas", "Stock Actual"].map((h) => (
                  <th key={h}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif", borderBottom: "1px solid #f0f0f4", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Package size={32} style={{ color: "#d1d5db", margin: "0 auto 8px" }} />
                    <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                      Sin resultados para los filtros aplicados
                    </p>
                  </td>
                </tr>
              ) : (
                paged.map((row, i) => {
                  const stockColor = row.stockActual === 0 ? "#dc2626" : row.stockActual < 50 ? "#b45309" : "#374151";
                  return (
                    <tr
                      key={row.id}
                      style={{ borderBottom: i < paged.length - 1 ? "1px solid #f7f7f9" : "none", transition: "background-color 0.12s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafbff")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* # */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono" style={{ color: "#9ca3af" }}>{start + i + 1}</span>
                      </td>

                      {/* Insumo */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                            style={{ width: 32, height: 32, backgroundColor: "#f0f5ff" }}>
                            <Package size={14} style={{ color: "#0b3d91" }} />
                          </div>
                          <span className="text-sm font-medium" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                            {row.insumo}
                          </span>
                        </div>
                      </td>

                      {/* Entradas */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: "#49c21b18", color: "#2a9912", fontFamily: "'Poppins', sans-serif" }}>
                          <ArrowDownToLine size={11} />
                          +{row.entradas.toLocaleString()} {row.unidad}
                        </span>
                      </td>

                      {/* Salidas */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: "#c2410c12", color: "#c2410c", fontFamily: "'Poppins', sans-serif" }}>
                          <ArrowUpFromLine size={11} />
                          -{row.salidas.toLocaleString()} {row.unidad}
                        </span>
                      </td>

                      {/* Stock actual */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold" style={{ color: stockColor, fontFamily: "'Poppins', sans-serif" }}>
                          {row.stockActual.toLocaleString()}
                          {row.stockActual === 0 && (
                            <span className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                              Sin stock
                            </span>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.rows.length > perPage && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4" style={{ borderTop: "1px solid #f0f0f4" }}>
            <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              Mostrando {start + 1}–{Math.min(start + perPage, data.rows.length)} de {data.rows.length} insumos
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}
                className="flex items-center justify-center rounded-lg"
                style={{ width: 32, height: 32, border: "1.5px solid #e5e7eb", backgroundColor: "transparent", color: page === 1 ? "#d1d5db" : "#374151", cursor: page === 1 ? "not-allowed" : "pointer" }}>
                <ChevronLeft size={14} />
              </button>
              {buildPages(totalPages, page).map((p, i) =>
                p === "…"
                  ? <span key={`e${i}`} className="px-1 text-xs" style={{ color: "#9ca3af" }}>…</span>
                  : <button key={p} onClick={() => setPage(p as number)}
                      className="flex items-center justify-center rounded-lg text-xs font-medium"
                      style={{ width: 32, height: 32, border: `1.5px solid ${page === p ? "#0b3d91" : "#e5e7eb"}`, backgroundColor: page === p ? "#0b3d91" : "transparent", color: page === p ? "#fff" : "#374151", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
                      {p}
                    </button>
              )}
              <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}
                className="flex items-center justify-center rounded-lg"
                style={{ width: 32, height: 32, border: "1.5px solid #e5e7eb", backgroundColor: "transparent", color: page === totalPages ? "#d1d5db" : "#374151", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function ReporteClient() {
  const [resultado, setResultado] = useState<ReporteSummary | null>(null);

  const handleGenerate = (filtros: FiltrosForm) => {
    // TODO: reemplazar generarMockReporte con fetch real → await fetchReporte(filtros)
    const data = generarMockReporte(filtros);
    setResultado(data);
  };

  return (
    <div className="pb-7">
      <AnimatePresence mode="wait">
        {!resultado ? (
          <motion.div key="filtros" className="py-4">
            <FiltrosPanel onGenerate={handleGenerate} />
          </motion.div>
        ) : (
          <motion.div key="resultado" className="py-2">
            <ResultadosPanel data={resultado} onVolver={() => setResultado(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}