"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  RefreshCw,
  Ruler,
  School2,
  Shirt,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCalculadora } from "@/app/hooks/useCalculadora";
import type { ResultadoPrendaPedido } from "@/app/types/calculadora";

const FONT = "'Poppins', sans-serif";

/* ─────────────────────────────────────────────
   Subcomponente: fila de acordeón por prenda
───────────────────────────────────────────── */
function PrendaAccordion({ prenda }: { prenda: ResultadoPrendaPedido }) {
  const [open, setOpen] = useState(false);
  const ok = prenda.disponibleIndividual;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: ok ? "#abefc6" : "#fecaca" }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#f8fafc]"
        style={{ backgroundColor: ok ? "#f0fdf4" : "#fef2f2" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
            style={{ backgroundColor: ok ? "#d1fadf" : "#fee2e2" }}
          >
            {ok ? (
              <CheckCircle2 size={15} style={{ color: "#027a48" }} />
            ) : (
              <TriangleAlert size={15} style={{ color: "#dc2626" }} />
            )}
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "#101828", fontFamily: FONT }}
            >
              {prenda.prenda}
              {prenda.genero ? ` (${prenda.genero})` : ""}
              {" — "}Talla {prenda.talla}
            </p>
            <p className="text-xs" style={{ color: "#667085", fontFamily: FONT }}>
              {prenda.cantidadSolicitada} unid. solicitadas
              {" · "}máx. fabricable: {prenda.cantidadMaxima}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: ok ? "#ecfdf3" : "#fef2f2",
              color: ok ? "#027a48" : "#b42318",
              fontFamily: FONT,
            }}
          >
            {ok ? "Disponible" : "Insuficiente"}
          </span>
          {open ? (
            <ChevronUp size={16} style={{ color: "#667085" }} />
          ) : (
            <ChevronDown size={16} style={{ color: "#667085" }} />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div className="overflow-x-auto border-t" style={{ borderColor: "#f2f4f7" }}>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    {["Insumo", "Necesario", "Stock", "Restante", "Estado"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${i === 0 ? "text-left" : "text-right"} ${i === 4 ? "text-center" : ""}`}
                        style={{ color: "#667085", fontFamily: FONT }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prenda.insumos.map((ins) => (
                    <tr
                      key={ins.insumoId}
                      className="border-t hover:bg-[#fafafa]"
                      style={{ borderColor: "#f2f4f7" }}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: "#101828", fontFamily: FONT }}>
                          {ins.nombreInsumo}
                        </p>
                        <p className="text-xs" style={{ color: "#98a2b3", fontFamily: FONT }}>
                          {ins.unidadMedida}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: "#475467", fontFamily: FONT }}>
                        {ins.cantidadNecesaria.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: "#475467", fontFamily: FONT }}>
                        {ins.stockActual.toFixed(2)}
                      </td>
                      <td
                        className="px-4 py-3 text-right text-sm font-medium"
                        style={{ color: ins.stockRestante > 0 ? "#027a48" : "#dc2626", fontFamily: FONT }}
                      >
                        {ins.stockRestante.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: ins.suficiente ? "#ecfdf3" : "#fef2f2",
                            color: ins.suficiente ? "#027a48" : "#b42318",
                            fontFamily: FONT,
                          }}
                        >
                          {ins.suficiente ? <CheckCircle2 size={11} /> : <TriangleAlert size={11} />}
                          {ins.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Vista principal
───────────────────────────────────────────── */
export default function CalculadoraView() {
  const {
    colegios,
    uniformes,
    tallasDisponibles,
    colegioSeleccionado,
    formValues,
    lineas,
    resultado,
    loading,
    loadingUniformes,
    loadingTallas,
    calculando,
    error,
    agregarError,
    isLineaValida,
    setColegio,
    setUniforme,
    setTalla,
    setCantidad,
    agregarLinea,
    quitarLinea,
    calcularPedido,
    limpiar,
    reload,
    clearError,
  } = useCalculadora();

  const totalUnidades = lineas.reduce((s, l) => s + l.cantidad, 0);
  const pct = resultado?.porcentajeCumplimiento ?? 0;
  const pctColor = pct >= 100 ? "#027a48" : pct >= 60 ? "#b45309" : "#dc2626";
  const pctBg = pct >= 100 ? "#ecfdf3" : pct >= 60 ? "#fffbeb" : "#fef2f2";

  return (
    <section className="flex flex-col gap-6 pb-10">

      {/* ── Header ───────────────────────────────────────────── */}
      <div
        className="rounded-[28px] border px-6 py-6"
        style={{
          borderColor: "#dbeafe",
          background: "linear-gradient(135deg, rgba(29,78,216,0.10) 0%, rgba(15,23,42,0.06) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p
              className="text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: "#1d4ed8", fontFamily: FONT }}
            >
              Calculadora de pedido
            </p>
            <h1 className="mt-2 text-3xl font-semibold" style={{ color: "#101828", fontFamily: FONT }}>
              Verifica insumos antes de producir
            </h1>
            <p className="mt-3 text-sm" style={{ color: "#475467", fontFamily: FONT }}>
              Agrega varias prendas con sus tallas y cantidades. El sistema calculará si tienes
              stock suficiente para todo el pedido de forma consolidada.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lineas.length > 0 && (
              <button
                type="button"
                onClick={limpiar}
                className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
                style={{ borderColor: "#fecaca", backgroundColor: "#fff5f5", color: "#b42318", fontFamily: FONT }}
              >
                <Trash2 size={15} />
                Limpiar todo
              </button>
            )}
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60"
              style={{ borderColor: "#bfdbfe", backgroundColor: "#ffffff", color: "#1d4ed8", fontFamily: FONT }}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Recargar datos
            </button>
          </div>
        </div>
      </div>

      {/* ── Error global ─────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
          >
            <TriangleAlert size={18} style={{ color: "#dc2626" }} />
            <p className="text-sm flex-1" style={{ color: "#b42318", fontFamily: FONT }}>{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="rounded-lg p-1 transition hover:bg-red-100"
            >
              <X size={14} style={{ color: "#dc2626" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dos columnas: Form + Resumen ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

        {/* ── Panel izquierdo: Formulario + lista ── */}
        <div
          className="rounded-3xl border p-6 flex flex-col gap-6"
          style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}
        >
          {/* Título panel */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
            >
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: FONT }}>
                Armar pedido
              </h2>
              <p className="text-sm" style={{ color: "#667085", fontFamily: FONT }}>
                Selecciona prenda y agrégala al pedido
              </p>
            </div>
          </div>

          {/* ── Fila de selects ── */}
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Colegio */}
            <div className="sm:col-span-2">
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: FONT }}
              >
                Colegio *
              </label>
              <div className="relative">
                <School2
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: lineas.length > 0 ? "#1d4ed8" : "#667085" }}
                />
                <select
                  value={formValues.colegioId}
                  onChange={(e) => setColegio(e.target.value)}
                  disabled={loading || lineas.length > 0}
                  className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed"
                  style={{
                    borderColor: lineas.length > 0 ? "#bfdbfe" : "#d0d5dd",
                    backgroundColor: lineas.length > 0 ? "#eff6ff" : "#ffffff",
                    color: "#101828",
                    fontFamily: FONT,
                  }}
                >
                  <option value="">
                    {loading ? "Cargando colegios..." : "Selecciona un colegio"}
                  </option>
                  {colegios.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              {lineas.length > 0 && (
                <p className="mt-1.5 text-xs" style={{ color: "#1d4ed8", fontFamily: FONT }}>
                  Pedido fijado para <span className="font-semibold">{colegioSeleccionado?.nombre}</span>.
                  Para cambiar de colegio, usa <span className="font-semibold">Limpiar todo</span>.
                </p>
              )}
            </div>

            {/* Uniforme */}
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: FONT }}
              >
                Prenda *
              </label>
              <div className="relative">
                <Shirt size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#667085" }} />
                <select
                  value={formValues.uniformeId}
                  onChange={(e) => setUniforme(e.target.value)}
                  disabled={!formValues.colegioId || loadingUniformes}
                  className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
                  style={{ borderColor: "#d0d5dd", backgroundColor: "#ffffff", color: "#101828", fontFamily: FONT }}
                >
                  <option value="">
                    {!formValues.colegioId
                      ? "Primero selecciona colegio"
                      : loadingUniformes
                        ? "Cargando..."
                        : "Selecciona prenda"}
                  </option>
                  {uniformes.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.prenda}{u.genero ? ` (${u.genero})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Talla */}
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: FONT }}
              >
                Talla *
              </label>
              <div className="relative">
                <Ruler size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#667085" }} />
                <select
                  value={formValues.talla}
                  onChange={(e) => setTalla(e.target.value)}
                  disabled={!formValues.uniformeId || loadingTallas || tallasDisponibles.length === 0}
                  className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
                  style={{ borderColor: "#d0d5dd", backgroundColor: "#ffffff", color: "#101828", fontFamily: FONT }}
                >
                  <option value="">
                    {!formValues.uniformeId
                      ? "Primero selecciona prenda"
                      : loadingTallas
                        ? "Cargando..."
                        : "Selecciona talla"}
                  </option>
                  {tallasDisponibles.map((t) => (
                    <option key={t} value={t}>Talla {t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cantidad + botón Agregar */}
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: FONT }}
              >
                Cantidad *
              </label>
              <div className="relative">
                <Package size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#667085" }} />
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={formValues.cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value) || 1)}
                  className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none"
                  style={{ borderColor: "#d0d5dd", backgroundColor: "#ffffff", color: "#101828", fontFamily: FONT }}
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={agregarLinea}
                disabled={!isLineaValida}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "#1d4ed8", fontFamily: FONT }}
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>
          </div>

          {/* ── Error inline agregar ── */}
          <AnimatePresence>
            {agregarError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 rounded-2xl border px-4 py-3"
                style={{ borderColor: "#fca5a5", backgroundColor: "#fef2f2" }}
              >
                <AlertTriangle size={15} style={{ color: "#dc2626", flexShrink: 0 }} />
                <p className="text-sm" style={{ color: "#b42318", fontFamily: FONT }}>{agregarError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Lista de prendas agregadas ── */}
          {lineas.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p
                className="text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: FONT }}
              >
                Prendas en el pedido ({lineas.length})
              </p>
              {lineas.map((linea, idx) => (
                <motion.div
                  key={linea.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between rounded-2xl border px-4 py-3"
                  style={{ borderColor: "#eaecf0", backgroundColor: "#f8fafc" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontFamily: FONT }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#101828", fontFamily: FONT }}>
                        {linea.prenda}{linea.genero ? ` (${linea.genero})` : ""}
                        {" — "}Talla {linea.talla}
                      </p>
                      <p className="text-xs" style={{ color: "#667085", fontFamily: FONT }}>
                        {linea.cantidad} unidad{linea.cantidad !== 1 ? "es" : ""}
                        {" · "}{colegioSeleccionado?.nombre ?? ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarLinea(linea.key)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-red-100"
                    style={{ color: "#dc2626" }}
                    title="Quitar prenda"
                  >
                    <X size={15} />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-10"
              style={{ borderColor: "#d0d5dd" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <Package size={22} style={{ color: "#98a2b3" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "#667085", fontFamily: FONT }}>
                No hay prendas en el pedido
              </p>
              <p className="mt-1 text-xs text-center max-w-xs" style={{ color: "#98a2b3", fontFamily: FONT }}>
                Selecciona colegio, prenda, talla y cantidad. Luego haz clic en Agregar.
              </p>
            </div>
          )}
        </div>

        {/* ── Panel derecho: Resumen + Calcular ── */}
        <div className="flex flex-col gap-5">

          {/* Tarjeta resumen */}
          <div
            className="rounded-3xl border p-6"
            style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: "#101828", fontFamily: FONT }}>
              Resumen del pedido
            </h2>

            <div className="space-y-3">
              <div
                className="flex items-center justify-between rounded-2xl border p-4"
                style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}
              >
                <p className="text-sm" style={{ color: "#667085", fontFamily: FONT }}>Colegio</p>
                <p className="text-sm font-semibold truncate max-w-[160px]" style={{ color: "#101828", fontFamily: FONT }}>
                  {colegioSeleccionado?.nombre ?? "—"}
                </p>
              </div>
              <div
                className="flex items-center justify-between rounded-2xl border p-4"
                style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}
              >
                <p className="text-sm" style={{ color: "#667085", fontFamily: FONT }}>Prendas distintas</p>
                <p className="text-lg font-bold" style={{ color: "#1d4ed8", fontFamily: FONT }}>
                  {lineas.length}
                </p>
              </div>
              <div
                className="flex items-center justify-between rounded-2xl border p-4"
                style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}
              >
                <p className="text-sm" style={{ color: "#667085", fontFamily: FONT }}>Unidades totales</p>
                <p className="text-lg font-bold" style={{ color: "#1d4ed8", fontFamily: FONT }}>
                  {totalUnidades}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void calcularPedido()}
              disabled={lineas.length === 0 || calculando}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: "#1d4ed8", fontFamily: FONT }}
            >
              {calculando ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Calculator size={16} />
              )}
              {calculando ? "Calculando..." : "Calcular pedido completo"}
            </button>
          </div>

          {/* Resultado global */}
          <AnimatePresence>
            {resultado && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border p-6 flex flex-col gap-5"
                style={{
                  borderColor: resultado.disponibleCompleto ? "#abefc6" : "#fecaca",
                  backgroundColor: resultado.disponibleCompleto ? "#f0fdf4" : "#fef2f2",
                }}
              >
                {/* Badge */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: resultado.disponibleCompleto ? "#d1fadf" : "#fee2e2",
                      color: resultado.disponibleCompleto ? "#027a48" : "#dc2626",
                    }}
                  >
                    {resultado.disponibleCompleto ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      <TriangleAlert size={22} />
                    )}
                  </div>
                  <div>
                    <p
                      className="text-base font-bold"
                      style={{
                        color: resultado.disponibleCompleto ? "#027a48" : "#b42318",
                        fontFamily: FONT,
                      }}
                    >
                      {resultado.disponibleCompleto ? "Pedido completable" : "Stock insuficiente"}
                    </p>
                    <p className="text-xs" style={{ color: "#667085", fontFamily: FONT }}>
                      Resultado consolidado
                    </p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "#475467", fontFamily: FONT }}>
                      Cumplimiento del pedido
                    </span>
                    <span className="text-xs font-bold" style={{ color: pctColor, fontFamily: FONT }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full h-2.5"
                    style={{ backgroundColor: "#e5e7eb" }}
                  >
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pctColor }}
                    />
                  </div>
                </div>

                {/* Insumo limitante */}
                {resultado.insumoLimitante && (
                  <div
                    className="rounded-2xl border px-4 py-3 flex items-start gap-2"
                    style={{ borderColor: "#fde68a", backgroundColor: "#fffbeb" }}
                  >
                    <AlertTriangle size={14} style={{ color: "#b45309", marginTop: 1, flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: "#92400e", fontFamily: FONT }}>
                      <span className="font-semibold">Insumo limitante:</span>{" "}
                      {resultado.insumoLimitante}
                    </p>
                  </div>
                )}

                {/* Stats mini */}
                <div
                  className="rounded-2xl border px-4 py-3"
                  style={{ borderColor: pctBg === "#ecfdf3" ? "#abefc6" : "#fecaca", backgroundColor: pctBg }}
                >
                  <p className="text-xs" style={{ color: "#667085", fontFamily: FONT }}>
                    Factor de cumplimiento
                  </p>
                  <p className="text-lg font-bold" style={{ color: pctColor, fontFamily: FONT }}>
                    {(resultado.factorCumplimiento * 100).toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Resultados detallados ───────────────────────────── */}
      <AnimatePresence>
        {resultado && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Por prenda */}
            <div
              className="rounded-3xl border p-6"
              style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}
            >
              <h2 className="text-lg font-semibold mb-1" style={{ color: "#101828", fontFamily: FONT }}>
                Resultado por prenda
              </h2>
              <p className="text-sm mb-5" style={{ color: "#667085", fontFamily: FONT }}>
                Haz clic en cada prenda para ver el detalle de insumos
              </p>
              <div className="flex flex-col gap-3">
                {resultado.prendas.map((p) => (
                  <PrendaAccordion key={`${p.uniformeId}-${p.talla}`} prenda={p} />
                ))}
              </div>
            </div>

            {/* Insumos consolidados */}
            <div
              className="rounded-3xl border p-6"
              style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}
            >
              <h2 className="text-lg font-semibold mb-1" style={{ color: "#101828", fontFamily: FONT }}>
                Insumos consolidados
              </h2>
              <p className="text-sm mb-5" style={{ color: "#667085", fontFamily: FONT }}>
                Todos los insumos requeridos para el pedido completo
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc" }}>
                      {["Insumo", "Stock actual", "Total necesario", "Faltante", "Estado"].map((h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] ${i === 0 ? "text-left" : "text-right"} ${i === 4 ? "text-center" : ""}`}
                          style={{ color: "#667085", fontFamily: FONT }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.resumenInsumos.map((ins) => (
                      <tr
                        key={ins.insumoId}
                        className="border-t transition-colors hover:bg-[#f8fafc]"
                        style={{ borderColor: "#f2f4f7" }}
                      >
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium" style={{ color: "#101828", fontFamily: FONT }}>
                            {ins.nombreInsumo}
                          </p>
                          <p className="text-xs" style={{ color: "#98a2b3", fontFamily: FONT }}>
                            {ins.unidadMedida}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-right text-sm" style={{ color: "#475467", fontFamily: FONT }}>
                          {ins.stockActual.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium" style={{ color: "#101828", fontFamily: FONT }}>
                          {ins.totalNecesario.toFixed(2)}
                        </td>
                        <td
                          className="px-4 py-4 text-right text-sm font-semibold"
                          style={{ color: ins.faltante > 0 ? "#dc2626" : "#027a48", fontFamily: FONT }}
                        >
                          {ins.faltante > 0 ? `-${ins.faltante.toFixed(2)}` : "OK"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{
                              backgroundColor: ins.suficiente ? "#ecfdf3" : "#fef2f2",
                              color: ins.suficiente ? "#027a48" : "#b42318",
                              fontFamily: FONT,
                            }}
                          >
                            {ins.suficiente ? <CheckCircle2 size={12} /> : <TriangleAlert size={12} />}
                            {ins.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ─────────────────────────────────────── */}
      {!resultado && !error && lineas.length === 0 && (
        <div
          className="rounded-3xl border border-dashed p-10"
          style={{ borderColor: "#d0d5dd" }}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
              style={{ backgroundColor: "#f8fafc" }}
            >
              <Calculator size={28} style={{ color: "#98a2b3" }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: FONT }}>
              Arma tu pedido
            </h3>
            <p className="mt-2 max-w-md text-sm" style={{ color: "#667085", fontFamily: FONT }}>
              Selecciona colegio, prenda, talla y cantidad. Agrégalas una a una.
              Cuando tengas todas, haz clic en{" "}
              <span className="font-semibold" style={{ color: "#1d4ed8" }}>
                Calcular pedido completo
              </span>{" "}
              para ver si tienes stock suficiente.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
