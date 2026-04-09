"use client";

import {
  Calculator,
  CheckCircle2,
  ChevronRight,
  Package,
  RefreshCw,
  Ruler,
  School2,
  Shirt,
  TriangleAlert,
} from "lucide-react";
import { useCalculadora } from "@/app/hooks/useCalculadora";

/**
 * Vista del módulo Calculadora de Disponibilidad.
 *
 * Permite verificar si hay stock suficiente para fabricar unidades de
 * uniformes en tallas específicas antes de generar solicitudes.
 */
export default function CalculadoraView() {
  const {
    colegios,
    uniformes,
    tallasDisponibles,
    colegioSeleccionado,
    uniformeSeleccionado,
    formValues,
    resultado,
    loading,
    loadingUniformes,
    loadingTallas,
    verifying,
    error,
    clearMessages,
    reload,
    setColegio,
    setUniforme,
    setTalla,
    setCantidad,
    verify,
    isFormValid,
  } = useCalculadora();

  return (
    <section className="flex flex-col gap-6 pb-8">
      {/* Header */}
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
              style={{ color: "#1d4ed8", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Calculadora
            </p>
            <h1
              className="mt-2 text-3xl font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Verifica insumos antes de producir
            </h1>
            <p
              className="mt-3 text-sm"
              style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Selecciona el colegio, uniforme, talla y cantidad. El sistema calculará
              el stock necesario para cada insumo y te indicará si puedes fabricar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60"
            style={{
              borderColor: "#bfdbfe",
              backgroundColor: "#ffffff",
              color: "#1d4ed8",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Recargar datos
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-2xl border px-4 py-3"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
        >
          <TriangleAlert size={18} style={{ color: "#dc2626" }} />
          <p
            className="text-sm flex-1"
            style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {error}
          </p>
          <button
            type="button"
            onClick={clearMessages}
            className="text-xs font-medium underline"
            style={{ color: "#dc2626" }}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Grid principal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Panel de configuración */}
        <div
          className="rounded-3xl border p-6"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
            >
              <Calculator size={18} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Configuración
              </h2>
              <p
                className="text-sm"
                style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Define los parámetros del cálculo
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {/* Colegio */}
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Colegio *
              </label>
              <div className="relative">
                <School2
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#667085" }}
                />
                <select
                  value={formValues.colegioId}
                  onChange={(e) => setColegio(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
                  style={{
                    borderColor: "#d0d5dd",
                    backgroundColor: "#ffffff",
                    color: "#101828",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  <option value="">
                    {loading ? "Cargando colegios..." : "Selecciona un colegio"}
                  </option>
                  {colegios.map((colegio) => (
                    <option key={colegio.id} value={colegio.id}>
                      {colegio.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Uniforme */}
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Uniforme *
              </label>
              <div className="relative">
                <Shirt
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#667085" }}
                />
                <select
                  value={formValues.uniformeId}
                  onChange={(e) => setUniforme(e.target.value)}
                  disabled={!formValues.colegioId || loadingUniformes}
                  className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
                  style={{
                    borderColor: "#d0d5dd",
                    backgroundColor: "#ffffff",
                    color: "#101828",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  <option value="">
                    {!formValues.colegioId
                      ? "Primero selecciona un colegio"
                      : loadingUniformes
                        ? "Cargando uniformes..."
                        : "Selecciona un uniforme"}
                  </option>
                  {uniformes.map((uniforme) => (
                    <option key={uniforme.id} value={uniforme.id}>
                      {uniforme.prenda}
                      {uniforme.genero ? ` (${uniforme.genero})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {formValues.colegioId && uniformes.length === 0 && !loadingUniformes && (
                <p
                  className="mt-2 text-xs"
                  style={{ color: "#b45309", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Este colegio no tiene uniformes configurados.
                </p>
              )}
            </div>

            {/* Talla */}
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Talla *
              </label>
              <div className="relative">
                <Ruler
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#667085" }}
                />
                <select
                  value={formValues.talla}
                  onChange={(e) => setTalla(e.target.value)}
                  disabled={!formValues.uniformeId || loadingTallas || tallasDisponibles.length === 0}
                  className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
                  style={{
                    borderColor: "#d0d5dd",
                    backgroundColor: "#ffffff",
                    color: "#101828",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  <option value="">
                    {!formValues.uniformeId
                      ? "Primero selecciona un uniforme"
                      : loadingTallas
                        ? "Cargando tallas..."
                        : "Selecciona una talla"}
                  </option>
                  {tallasDisponibles.map((talla) => (
                    <option key={talla} value={talla}>
                      Talla {talla}
                    </option>
                  ))}
                </select>
              </div>
              <p
                className="mt-2 text-xs"
                style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                La talla es obligatoria porque los insumos varían según la talla.
              </p>
            </div>

            {/* Cantidad */}
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Cantidad a fabricar *
              </label>
              <div className="relative">
                <Package
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#667085" }}
                />
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={formValues.cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value) || 0)}
                  className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none"
                  style={{
                    borderColor: "#d0d5dd",
                    backgroundColor: "#ffffff",
                    color: "#101828",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Botón calcular */}
            <button
              type="button"
              onClick={() => void verify()}
              disabled={!isFormValid || verifying}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#1d4ed8",
                opacity: !isFormValid || verifying ? 0.75 : 1,
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              {verifying ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Calculator size={16} />
              )}
              {verifying ? "Calculando..." : "Verificar disponibilidad"}
            </button>
          </div>
        </div>

        {/* Panel de resumen */}
        <div className="space-y-6">
          {/* Contexto seleccionado */}
          <div
            className="rounded-3xl border p-6"
            style={{
              borderColor: "#eaecf0",
              backgroundColor: "#ffffff",
              boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
              >
                <School2 size={18} />
              </div>
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Contexto seleccionado
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Resumen de la configuración actual
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* Colegio */}
              <div
                className="flex items-center justify-between rounded-2xl border p-4"
                style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}
              >
                <div className="flex items-center gap-3">
                  <School2 size={16} style={{ color: "#1d4ed8" }} />
                  <div>
                    <p
                      className="text-xs uppercase tracking-[0.12em]"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      Colegio
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  {colegioSeleccionado?.nombre ?? "—"}
                </p>
              </div>

              {/* Prenda */}
              <div
                className="flex items-center justify-between rounded-2xl border p-4"
                style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}
              >
                <div className="flex items-center gap-3">
                  <Shirt size={16} style={{ color: "#1d4ed8" }} />
                  <div>
                    <p
                      className="text-xs uppercase tracking-[0.12em]"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      Prenda
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  {uniformeSeleccionado?.prenda ?? "—"}
                  {uniformeSeleccionado?.genero ? ` (${uniformeSeleccionado.genero})` : ""}
                </p>
              </div>

              {/* Talla */}
              <div
                className="flex items-center justify-between rounded-2xl border p-4"
                style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}
              >
                <div className="flex items-center gap-3">
                  <Ruler size={16} style={{ color: "#1d4ed8" }} />
                  <div>
                    <p
                      className="text-xs uppercase tracking-[0.12em]"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      Talla
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  {formValues.talla ? `Talla ${formValues.talla}` : "—"}
                </p>
              </div>

              {/* Cantidad */}
              <div
                className="flex items-center justify-between rounded-2xl border p-4"
                style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}
              >
                <div className="flex items-center gap-3">
                  <Package size={16} style={{ color: "#1d4ed8" }} />
                  <div>
                    <p
                      className="text-xs uppercase tracking-[0.12em]"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      Cantidad solicitada
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  {formValues.cantidad} unidad{formValues.cantidad === 1 ? "" : "es"}
                </p>
              </div>
            </div>
          </div>

          {/* Estado del cálculo */}
          {resultado && (
            <div
              className="rounded-3xl border p-6"
              style={{
                borderColor: resultado.disponible ? "#abefc6" : "#fecaca",
                backgroundColor: resultado.disponible ? "#ecfdf3" : "#fef2f2",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: resultado.disponible ? "#d1fadf" : "#fee2e2",
                    color: resultado.disponible ? "#027a48" : "#dc2626",
                  }}
                >
                  {resultado.disponible ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <TriangleAlert size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-lg font-semibold"
                    style={{
                      color: resultado.disponible ? "#027a48" : "#b42318",
                      fontFamily: "var(--font-poppins), sans-serif",
                    }}
                  >
                    {resultado.disponible
                      ? "¡Stock suficiente!"
                      : "Stock insuficiente"}
                  </h3>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {resultado.disponible
                      ? `Puedes fabricar las ${resultado.cantidadSolicitada} unidades solicitadas.`
                      : `Solo puedes fabricar ${resultado.cantidadMaximaFabricable} unidad${resultado.cantidadMaximaFabricable === 1 ? "" : "es"} como máximo.`}
                  </p>
                  {!resultado.disponible && resultado.cantidadMaximaFabricable > 0 && (
                    <p
                      className="mt-2 text-sm font-medium"
                      style={{
                        color: "#b42318",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    >
                      Faltan {resultado.cantidadSolicitada - resultado.cantidadMaximaFabricable} unidades
                      para completar tu solicitud.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados detallados */}
      {resultado && (
        <div
          className="rounded-3xl border p-6"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Detalle por insumo
              </h2>
              <p
                className="text-sm"
                style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                {resultado.nombrePrenda} — Talla {resultado.talla} —{" "}
                {resultado.cantidadSolicitada} unidades
              </p>
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
              style={{
                borderColor: resultado.disponible ? "#abefc6" : "#fecaca",
                backgroundColor: resultado.disponible ? "#ecfdf3" : "#fef2f2",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: resultado.disponible ? "#027a48" : "#dc2626" }}
              />
              <span
                className="text-xs font-semibold"
                style={{
                  color: resultado.disponible ? "#027a48" : "#b42318",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {resultado.disponible ? "Disponible" : "Insuficiente"}
              </span>
            </div>
          </div>

          {/* Tabla de insumos */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc" }}>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    Insumo
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    Cantidad necesaria
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    Stock actual
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    Restante
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultado.detalles.map((insumo) => (
                  <tr
                    key={insumo.insumoId}
                    className="border-t transition-colors hover:bg-[#f8fafc]"
                    style={{ borderColor: "#f2f4f7" }}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <ChevronRight
                          size={14}
                          style={{ color: insumo.suficiente ? "#027a48" : "#dc2626" }}
                        />
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: "#101828",
                              fontFamily: "var(--font-poppins), sans-serif",
                            }}
                          >
                            {insumo.nombreInsumo}
                          </p>
                          <p
                            className="text-xs"
                            style={{
                              color: "#667085",
                              fontFamily: "var(--font-poppins), sans-serif",
                            }}
                          >
                            {insumo.unidadMedida}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-4 py-4 text-right text-sm"
                      style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {insumo.cantidadNecesaria.toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-4 text-right text-sm"
                      style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {insumo.stockActual.toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-4 text-right text-sm"
                      style={{
                        color: insumo.stockRestante > 0 ? "#027a48" : "#dc2626",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    >
                      {insumo.stockRestante.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: insumo.suficiente ? "#ecfdf3" : "#fef2f2",
                          color: insumo.suficiente ? "#027a48" : "#b42318",
                          fontFamily: "var(--font-poppins), sans-serif",
                        }}
                      >
                        {insumo.suficiente ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <TriangleAlert size={12} />
                        )}
                        {insumo.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info adicional */}
          <div
            className="mt-6 rounded-2xl border p-4"
            style={{ borderColor: "#eaecf0", backgroundColor: "#f8fafc" }}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p
                  className="text-xs uppercase tracking-[0.12em]"
                  style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Cantidad solicitada
                </p>
                <p
                  className="mt-1 text-lg font-semibold"
                  style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  {resultado.cantidadSolicitada}
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-[0.12em]"
                  style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Máximo fabricable
                </p>
                <p
                  className="mt-1 text-lg font-semibold"
                  style={{
                    color: resultado.disponible ? "#027a48" : "#b42318",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  {resultado.cantidadMaximaFabricable} unidades
                </p>
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-[0.12em]"
                  style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Tipo de prenda
                </p>
                <p
                  className="mt-1 text-lg font-semibold"
                  style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  {resultado.tipo}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state cuando no hay resultado */}
      {!resultado && !error && (
        <div
          className="rounded-3xl border border-dashed p-8"
          style={{ borderColor: "#d0d5dd" }}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#f8fafc" }}
            >
              <Calculator size={28} style={{ color: "#98a2b3" }} />
            </div>
            <h3
              className="mt-4 text-lg font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Realiza un cálculo
            </h3>
            <p
              className="mt-2 max-w-md text-sm"
              style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Selecciona un colegio, uniforme, talla y cantidad. Luego haz clic en
              "Verificar disponibilidad" para ver el estado de los insumos.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
