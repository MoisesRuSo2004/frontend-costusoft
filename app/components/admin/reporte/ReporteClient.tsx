"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, CalendarDays, FileText, FileSpreadsheet, ArrowLeft, Archive,
  ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Package, TrendingUp,
  TrendingDown, Clock, Truck, AlertCircle, CheckCircle2, Loader2,
  MoreVertical, Download, RefreshCw,
} from "lucide-react";
import { useReportes } from "@/app/hooks/useReportes";
import { useColegios } from "@/app/hooks/useColegios";
import type { FiltroRequest, TipoInforme, ReporteResponse } from "@/app/types/reporte";

const TIPOS_INFORME: { value: TipoInforme; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { value: "GENERAL", label: "General", desc: "Todos los insumos con entradas y salidas", icon: <BarChart2 size={16} />, color: "#0b3d91" },
  { value: "ENTRADAS", label: "Entradas", desc: "Solo insumos con movimientos de entrada", icon: <ArrowDownToLine size={16} />, color: "#49c21b" },
  { value: "SALIDAS", label: "Salidas", desc: "Solo insumos con movimientos de salida", icon: <ArrowUpFromLine size={16} />, color: "#c2410c" },
  { value: "STOCK_BAJO", label: "Stock Bajo", desc: "Insumos bajo el mínimo o en cero", icon: <AlertTriangle size={16} />, color: "#f59e0b" },
  { value: "ROTACION", label: "Rotación", desc: "Índice de rotación por insumo", icon: <TrendingUp size={16} />, color: "#8b5cf6" },
  { value: "CONSUMO_PROMEDIO", label: "Consumo Promedio", desc: "Tasa de consumo con tendencia", icon: <TrendingDown size={16} />, color: "#06b6d4" },
  { value: "PEDIDOS", label: "Pedidos", desc: "Estado de pedidos con semáforo", icon: <Truck size={16} />, color: "#ec4899" },
];

interface FormState {
  tipoInforme: TipoInforme | "";
  fechaInicio: string;
  fechaFin: string;
  proveedorId: number | "";
  colegioId: number | "";
  estadoPedido: string;
}

const EMPTY_FORM: FormState = {
  tipoInforme: "",
  fechaInicio: "",
  fechaFin: "",
  proveedorId: "",
  colegioId: "",
  estadoPedido: "",
};

export default function ReporteClient() {
  const { reporte, loading, exporting, error, generarReporte, exportarPdf, exportarExcel, limpiar } = useReportes();
  const { colegios } = useColegios();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({});

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.tipoInforme) errs.tipoInforme = "tipoInforme";
    if (!form.fechaInicio) errs.fechaInicio = "fechaInicio";
    if (!form.fechaFin) errs.fechaFin = "fechaFin";
    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) errs.fechaFin = "rango";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const filtro: FiltroRequest = {
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      tipoInforme: form.tipoInforme as TipoInforme,
      ...(form.proveedorId && { proveedorId: Number(form.proveedorId) }),
      ...(form.colegioId && { colegioId: Number(form.colegioId) }),
      ...(form.estadoPedido && { estadoPedido: form.estadoPedido }),
    };

    await generarReporte(filtro);
  };

  const handleExportPdf = async () => {
    const filtro: FiltroRequest = {
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      tipoInforme: form.tipoInforme as TipoInforme,
      ...(form.proveedorId && { proveedorId: Number(form.proveedorId) }),
      ...(form.colegioId && { colegioId: Number(form.colegioId) }),
      ...(form.estadoPedido && { estadoPedido: form.estadoPedido }),
    };
    await exportarPdf(filtro);
  };

  const handleExportExcel = async () => {
    const filtro: FiltroRequest = {
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      tipoInforme: form.tipoInforme as TipoInforme,
      ...(form.proveedorId && { proveedorId: Number(form.proveedorId) }),
      ...(form.colegioId && { colegioId: Number(form.colegioId) }),
      ...(form.estadoPedido && { estadoPedido: form.estadoPedido }),
    };
    await exportarExcel(filtro);
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <AnimatePresence mode="wait">
        {!reporte ? (
          <FiltrosPanel key="filtros" form={form} setForm={setForm} formErrors={formErrors} loading={loading} onSubmit={handleGenerar} />
        ) : (
          <ResultadosPanel key="resultados" reporte={reporte} form={form} colegios={colegios} exporting={exporting} onVolver={() => { limpiar(); setForm(EMPTY_FORM); }} onExportPdf={handleExportPdf} onExportExcel={handleExportExcel} />
        )}
      </AnimatePresence>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-center gap-3 rounded-2xl border px-5 py-4"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
          <AlertCircle size={18} style={{ color: "#dc2626" }} />
          <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
        </motion.div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PANEL DE FILTROS
// ═════════════════════════════════════════════════════════════════════════════

function FiltrosPanel({
  form, setForm, formErrors, loading, onSubmit,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  formErrors: Partial<FormState>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}) {
  const { colegios } = useColegios();
  const inpStyle = (err?: boolean) => ({
    width: "100%",
    padding: "11px 14px",
    border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 10,
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    color: "#374151",
    outline: "none",
    backgroundColor: "#fff",
    cursor: "pointer",
    boxSizing: "border-box" as const,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
      <div className="rounded-3xl border p-8" style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}>
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(11,61,145,0.10)" }}>
            <BarChart2 size={24} style={{ color: "#0b3d91" }} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
              Generar Reporte
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
              Selecciona los criterios para generar un informe detallado
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-8">
          {/* Tipo de informe */}
          <div>
            <label style={{ display: "block", marginBottom: 12, fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase" }}>
              Tipo de Informe <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {TIPOS_INFORME.map(({ value, label, desc, icon, color }) => {
                const active = form.tipoInforme === value;
                return (
                  <button
                    key={value} type="button"
                    onClick={() => { setForm({ ...form, tipoInforme: value }); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: active ? color : "#e5e7eb",
                      backgroundColor: active ? color + "12" : "#fafafa",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ color: active ? color : "#9ca3af" }}>{icon}</div>
                    <span className="text-xs font-semibold text-center" style={{ color: active ? color : "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
            {formErrors.tipoInforme && <p className="text-xs mt-2" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>Selecciona un tipo de informe</p>}
          </div>

          {/* Rango de fechas */}
          <div>
            <label style={{ display: "block", marginBottom: 12, fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase" }}>
              Rango de Fechas <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs block mb-2" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>Desde</label>
                <input
                  type="date" value={form.fechaInicio}
                  onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                  style={inpStyle(!!formErrors.fechaInicio)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.fechaInicio ? "#fca5a5" : "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
                />
                {formErrors.fechaInicio && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Requerido</p>}
              </div>
              <div>
                <label className="text-xs block mb-2" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>Hasta</label>
                <input
                  type="date" value={form.fechaFin}
                  onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                  style={inpStyle(!!formErrors.fechaFin)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = formErrors.fechaFin ? "#fca5a5" : "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
                />
                {formErrors.fechaFin === "rango" && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Fecha final debe ser mayor</p>}
                {formErrors.fechaFin === "fechaFin" && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>Requerido</p>}
              </div>
            </div>
          </div>

          {/* Filtros opcionales por tipo */}
          {(form.tipoInforme === "ENTRADAS" || form.tipoInforme === "GENERAL") && (
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase" }}>
                Proveedor (Opcional)
              </label>
              <select
                value={form.proveedorId}
                onChange={(e) => setForm({ ...form, proveedorId: e.target.value ? Number(e.target.value) : "" })}
                style={inpStyle()}
              >
                <option value="">Todos los proveedores</option>
                {/* TODO: cargar proveedores del API */}
              </select>
            </div>
          )}

          {(form.tipoInforme === "SALIDAS" || form.tipoInforme === "GENERAL" || form.tipoInforme === "PEDIDOS") && (
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase" }}>
                Colegio (Opcional)
              </label>
              <select
                value={form.colegioId}
                onChange={(e) => setForm({ ...form, colegioId: e.target.value ? Number(e.target.value) : "" })}
                style={inpStyle()}
              >
                <option value="">Todos los colegios</option>
                {colegios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )}

          {form.tipoInforme === "PEDIDOS" && (
            <div>
              <label style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase" }}>
                Estado del Pedido (Opcional)
              </label>
              <select
                value={form.estadoPedido}
                onChange={(e) => setForm({ ...form, estadoPedido: e.target.value })}
                style={inpStyle()}
              >
                <option value="">Todos los estados</option>
                <option value="BORRADOR">Borrador</option>
                <option value="CALCULADO">Calculado</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="EN_PRODUCCION">En Producción</option>
                <option value="LISTO_PARA_ENTREGA">Listo para Entrega</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          )}

          {/* Botón generar */}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: loading ? "#3aad17" : "#0b3d91",
              color: "#fff",
              fontFamily: "'Poppins', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#49c21b"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0b3d91"; }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generando...</> : <><BarChart2 size={16} /> Generar Reporte</>}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PANEL DE RESULTADOS
// ═════════════════════════════════════════════════════════════════════════════

function ResultadosPanel({
  reporte, form, colegios, exporting, onVolver, onExportPdf, onExportExcel,
}: {
  reporte: ReporteResponse;
  form: FormState;
  colegios: any[];
  exporting: boolean;
  onVolver: () => void;
  onExportPdf: () => Promise<void>;
  onExportExcel: () => Promise<void>;
}) {
  const tipoInfo = TIPOS_INFORME.find(t => t.value === form.tipoInforme);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
              Reporte Generado
            </h1>
            <p className="text-sm mt-1" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
              {tipoInfo?.label} · {form.fechaInicio} a {form.fechaFin}
            </p>
          </div>
          <button
            onClick={onVolver}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
            style={{ border: "1.5px solid #e5e7eb", backgroundColor: "#fff", color: "#374151", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.color = "#0b3d91"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
          >
            <ArrowLeft size={14} /> Volver
          </button>
        </div>

        {/* Export buttons */}
        <div className="flex gap-3">
          <button
            onClick={onExportPdf} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
            style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", fontFamily: "'Poppins', sans-serif", cursor: exporting ? "not-allowed" : "pointer" }}
            onMouseEnter={(e) => { if (!exporting) e.currentTarget.style.backgroundColor = "#b91c1c"; }}
            onMouseLeave={(e) => { if (!exporting) e.currentTarget.style.backgroundColor = "#dc2626"; }}
          >
            <Download size={14} /> Descargar PDF
          </button>
          <button
            onClick={onExportExcel} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all"
            style={{ backgroundColor: "#15803d", color: "#fff", border: "none", fontFamily: "'Poppins', sans-serif", cursor: exporting ? "not-allowed" : "pointer" }}
            onMouseEnter={(e) => { if (!exporting) e.currentTarget.style.backgroundColor = "#166534"; }}
            onMouseLeave={(e) => { if (!exporting) e.currentTarget.style.backgroundColor = "#15803d"; }}
          >
            <Download size={14} /> Descargar Excel
          </button>
        </div>

        {/* Resumen */}
        <ResumenCards resumen={reporte.resumen} tipoInforme={form.tipoInforme as TipoInforme} />

        {/* Tabla según tipo de informe */}
        {form.tipoInforme === "GENERAL" || form.tipoInforme === "ENTRADAS" || form.tipoInforme === "SALIDAS" || form.tipoInforme === "STOCK_BAJO" ? (
          <TablaGeneral items={reporte.items || []} />
        ) : form.tipoInforme === "ROTACION" ? (
          <TablaRotacion items={reporte.rotacion || []} />
        ) : form.tipoInforme === "CONSUMO_PROMEDIO" ? (
          <TablaConsumo items={reporte.consumo || []} />
        ) : form.tipoInforme === "PEDIDOS" ? (
          <TablaPedidos items={reporte.pedidos || []} />
        ) : null}
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTES DE TABLA POR TIPO
// ═════════════════════════════════════════════════════════════════════════════

function ResumenCards({ resumen, tipoInforme }: { resumen: any; tipoInforme: TipoInforme }) {
  const cards: { label: string; value: number | string; color: string; icon: React.ReactNode }[] = [];

  if (tipoInforme === "GENERAL" || tipoInforme === "ENTRADAS" || tipoInforme === "SALIDAS" || tipoInforme === "STOCK_BAJO") {
    cards.push(
      { label: "Total Insumos", value: resumen.totalInsumos || 0, color: "#0b3d91", icon: <Archive size={18} /> },
      { label: "Total Entradas", value: (resumen.totalEntradas || 0).toLocaleString(), color: "#49c21b", icon: <ArrowDownToLine size={18} /> },
      { label: "Total Salidas", value: (resumen.totalSalidas || 0).toLocaleString(), color: "#c2410c", icon: <ArrowUpFromLine size={18} /> }
    );
    if (resumen.insumosConStockBajo !== undefined) cards.push({ label: "Stock Bajo", value: resumen.insumosConStockBajo, color: "#f59e0b", icon: <AlertTriangle size={18} /> });
    if (resumen.insumosConStockCero !== undefined) cards.push({ label: "Stock Cero", value: resumen.insumosConStockCero, color: "#ef4444", icon: <AlertTriangle size={18} /> });
  } else if (tipoInforme === "ROTACION") {
    cards.push(
      { label: "Alta Rotación", value: resumen.insumosAltaRotacion || 0, color: "#49c21b", icon: <TrendingUp size={18} /> },
      { label: "Stock Muerto", value: resumen.insumosStockMuerto || 0, color: "#ef4444", icon: <AlertTriangle size={18} /> }
    );
  } else if (tipoInforme === "CONSUMO_PROMEDIO") {
    cards.push(
      { label: "Tendencia Creciente", value: resumen.insumosTendenciaCreciente || 0, color: "#49c21b", icon: <TrendingUp size={18} /> },
      { label: "Tendencia Decreciente", value: resumen.insumosTendenciaDecreciente || 0, color: "#f59e0b", icon: <TrendingDown size={18} /> }
    );
  } else if (tipoInforme === "PEDIDOS") {
    cards.push(
      { label: "🟢 Verdes", value: resumen.pedidosVerdes || 0, color: "#49c21b", icon: <CheckCircle2 size={18} /> },
      { label: "🟡 Amarillos", value: resumen.pedidosAmarillos || 0, color: "#f59e0b", icon: <Clock size={18} /> },
      { label: "🔴 Rojos", value: resumen.pedidosRojos || 0, color: "#ef4444", icon: <AlertTriangle size={18} /> }
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, color, icon }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl px-4 py-4"
          style={{ backgroundColor: "#fff", boxShadow: "0 1px 10px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}
        >
          <div style={{ color }}>{icon}</div>
          <div>
            <p className="text-xs font-medium uppercase" style={{ color, fontFamily: "'Poppins', sans-serif" }}>{label}</p>
            <p className="text-lg font-bold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TablaGeneral({ items }: { items: any[] }) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(items.length / perPage);
  const paged = items.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#eaecf0", backgroundColor: "#fff" }}>
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #eaecf0" }}>
              {["Insumo", "Unidad", "Tipo", "Entradas", "Salidas", "Stock Actual", "Stock Mín.", "Estado"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: "#111827" }}>{item.nombreInsumo}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7280" }}>{item.unidadMedida}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7280" }}>{item.tipo}</td>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: "#49c21b" }}>{item.entradas.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: "#c2410c" }}>{item.salidas.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: "#111827" }}>{item.stockActual.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7280" }}>{item.stockMinimo}</td>
                <td className="px-5 py-3 text-xs font-semibold">
                  <span className="px-2.5 py-1 rounded-full" style={{
                    backgroundColor: item.stockCero ? "#fef2f2" : item.stockBajo ? "#fef3c7" : "#f0fdf4",
                    color: item.stockCero ? "#dc2626" : item.stockBajo ? "#b45309" : "#16a34a",
                  }}>
                    {item.stockCero ? "Crítico" : item.stockBajo ? "Bajo" : "OK"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}

function TablaRotacion({ items }: { items: any[] }) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(items.length / perPage);
  const paged = items.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#eaecf0", backgroundColor: "#fff" }}>
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #eaecf0" }}>
              {["Insumo", "Stock Actual", "Salidas Período", "Índice Rotación", "Días Cobertura", "Categoría", "Estado"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: "#111827" }}>{item.nombreInsumo}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7280" }}>{item.stockActual.toLocaleString()} {item.unidadMedida}</td>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: "#49c21b" }}>{item.totalSalidas.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: "#0b3d91" }}>{item.indiceRotacion.toFixed(2)} u/mes</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7280" }}>{item.diasCobertura ? `${item.diasCobertura} días` : "—"}</td>
                <td className="px-5 py-3 text-xs font-semibold">{item.categoriaRotacion}</td>
                <td className="px-5 py-3 text-xs">
                  <span className="px-2.5 py-1 rounded-full" style={{
                    backgroundColor: item.stockMuerto ? "#fef2f2" : "#f0fdf4",
                    color: item.stockMuerto ? "#dc2626" : "#16a34a",
                  }}>
                    {item.stockMuerto ? "Muerto" : "Activo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}

function TablaConsumo({ items }: { items: any[] }) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(items.length / perPage);
  const paged = items.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#eaecf0", backgroundColor: "#fff" }}>
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #eaecf0" }}>
              {["Insumo", "Consumo Diario", "Consumo Semanal", "Consumo Mensual", "Días Cobertura", "Tendencia"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td className="px-5 py-3 text-sm font-medium" style={{ color: "#111827" }}>{item.nombreInsumo}</td>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: "#06b6d4" }}>{item.consumoDiario.toFixed(2)}</td>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: "#06b6d4" }}>{item.consumoSemanal.toFixed(2)}</td>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: "#06b6d4" }}>{item.consumoMensual.toFixed(2)}</td>
                <td className="px-5 py-3 text-sm" style={{ color: "#6b7280" }}>{item.diasCoberturaEstimados ? `${item.diasCoberturaEstimados} días` : "—"}</td>
                <td className="px-5 py-3 text-xs font-semibold">
                  <span className="px-2.5 py-1 rounded-full" style={{
                    backgroundColor: item.tendencia === "Creciente" ? "#dcfce7" : item.tendencia === "Decreciente" ? "#fef3c7" : "#f3f4f6",
                    color: item.tendencia === "Creciente" ? "#166534" : item.tendencia === "Decreciente" ? "#b45309" : "#374151",
                  }}>
                    {item.tendencia}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}

function TablaPedidos({ items }: { items: any[] }) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(items.length / perPage);
  const paged = items.slice((page - 1) * perPage, page * perPage);

  const semaforoColor = (semaforo: string) => {
    switch (semaforo) {
      case "VERDE": return { bg: "#dcfce7", text: "#166534" };
      case "AMARILLO": return { bg: "#fef3c7", text: "#b45309" };
      case "ROJO": return { bg: "#fecaca", text: "#991b1b" };
      case "ENTREGADO": return { bg: "#dbeafe", text: "#1e40af" };
      case "CANCELADO": return { bg: "#f3f4f6", text: "#6b7280" };
      default: return { bg: "#f3f4f6", text: "#6b7280" };
    }
  };

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#eaecf0", backgroundColor: "#fff" }}>
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #eaecf0" }}>
              {["#", "Colegio", "Fecha Pedido", "Entrega Est.", "Días Rest.", "Semáforo", "Cumplimiento", "Estado"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((item, i) => {
              const colors = semaforoColor(item.semaforo);
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: "#6b7280" }}>{item.numeroPedido}</td>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: "#111827" }}>{item.colegio}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: "#6b7280" }}>{item.fechaPedido?.split(" ")[0]}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: "#6b7280" }}>{item.fechaEstimadaEntrega || "—"}</td>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: item.diasRestantes && item.diasRestantes < 0 ? "#ef4444" : "#111827" }}>
                    {item.diasRestantes !== null ? item.diasRestantes : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: colors.bg, color: colors.text }}>
                      {item.semaforo}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium">{item.porcentajeCumplimiento !== null ? `${item.porcentajeCumplimiento}%` : "—"}</td>
                  <td className="px-5 py-3 text-xs font-semibold">{item.estado}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}

function PaginationControls({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-4" style={{ borderTop: "1px solid #eaecf0" }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}>
        ◀ Anterior
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: p === page ? "none" : "1px solid #e5e7eb",
            backgroundColor: p === page ? "#0b3d91" : "transparent",
            color: p === page ? "#fff" : "#374151",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}>
        Siguiente ▶
      </button>
    </div>
  );
}
