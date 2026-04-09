"use client";

import { Calculator, CheckCircle2, RefreshCw, School2, Shirt, TriangleAlert } from "lucide-react";
import { useCalculadora } from "@/app/hooks/useCalculadora";

function StepBadge({ index, label }: { index: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontFamily: "var(--font-poppins), sans-serif" }}>
        {index}
      </div>
      <span className="text-sm font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
        {label}
      </span>
    </div>
  );
}

export default function CalculadoraView() {
  const {
    colegios,
    uniformes,
    colegioSeleccionado,
    formValues,
    resultado,
    loading,
    verifying,
    creating,
    error,
    successMessage,
    clearMessages,
    reload,
    setColegio,
    setUniforme,
    setCantidad,
    verify,
    createRequest,
  } = useCalculadora();

  return (
    <section className="flex flex-col gap-6 pb-8">
      <div
        className="rounded-[28px] border px-6 py-6"
        style={{
          borderColor: "#dbeafe",
          background: "linear-gradient(135deg, rgba(29,78,216,0.10) 0%, rgba(15,23,42,0.06) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "#1d4ed8", fontFamily: "var(--font-poppins), sans-serif" }}>
              Calculadora
            </p>
            <h1 className="mt-2 text-3xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Verifica insumos antes de generar la solicitud
            </h1>
            <p className="mt-3 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
              Selecciona colegio, uniforme y cantidad. El sistema consultara los insumos necesarios y, desde ese resultado, podras generar la solicitud de salida pendiente para bodega.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
            style={{ borderColor: "#bfdbfe", backgroundColor: "#ffffff", color: "#1d4ed8", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            <RefreshCw size={16} />
            Recargar datos
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StepBadge index={1} label="Selecciona colegio" />
        <StepBadge index={2} label="Elige uniforme y cantidad" />
        <StepBadge index={3} label="Verifica y genera solicitud" />
      </div>

      {error ? (
        <button
          type="button"
          onClick={clearMessages}
          className="rounded-2xl border px-4 py-3 text-left text-sm"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {error}
        </button>
      ) : null}

      {successMessage ? (
        <button
          type="button"
          onClick={clearMessages}
          className="rounded-2xl border px-4 py-3 text-left text-sm"
          style={{ borderColor: "#abefc6", backgroundColor: "#ecfdf3", color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {successMessage}
        </button>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div
          className="rounded-3xl border p-5"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}>
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                Configuracion de calculo
              </h2>
              <p className="text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                Usa solo datos reales del backend para verificar disponibilidad.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl" style={{ backgroundColor: "#e5e7eb" }} />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
                  Colegio
                </label>
                <select
                  value={formValues.colegioId}
                  onChange={(event) => setColegio(event.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "#d0d5dd", backgroundColor: "#ffffff", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  <option value="">Selecciona un colegio</option>
                  {colegios.map((colegio) => (
                    <option key={colegio.id} value={colegio.id}>
                      {colegio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
                  Uniforme
                </label>
                <select
                  value={formValues.uniformeId}
                  onChange={(event) => setUniforme(event.target.value)}
                  disabled={!colegioSeleccionado || uniformes.length === 0}
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
                  style={{ borderColor: "#d0d5dd", backgroundColor: "#ffffff", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  <option value="">Selecciona un uniforme</option>
                  {uniformes.map((uniforme) => (
                    <option key={uniforme.id} value={uniforme.id}>
                      {uniforme.nombre}
                    </option>
                  ))}
                </select>
                {colegioSeleccionado && uniformes.length === 0 ? (
                  <p className="mt-2 text-xs" style={{ color: "#b45309", fontFamily: "var(--font-poppins), sans-serif" }}>
                    El backend de colegios no esta devolviendo uniformes asociados para este selector.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
                  Cantidad
                </label>
                <input
                  type="number"
                  min={1}
                  value={formValues.cantidad}
                  onChange={(event) => setCantidad(Number(event.target.value || 0))}
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: "#d0d5dd", backgroundColor: "#ffffff", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                />
              </div>

              <button
                type="button"
                onClick={() => void verify()}
                disabled={verifying || loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition"
                style={{ backgroundColor: "#1d4ed8", opacity: verifying ? 0.75 : 1, fontFamily: "var(--font-poppins), sans-serif" }}
              >
                {verifying ? <RefreshCw size={16} className="animate-spin" /> : <Calculator size={16} />}
                {verifying ? "Calculando..." : "Calcular insumos"}
              </button>
            </div>
          )}
        </div>

        <div
          className="rounded-3xl border p-5"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}>
              <School2 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                Contexto seleccionado
              </h2>
              <p className="text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                Revisa rapidamente los datos del calculo antes de enviar la solicitud.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border p-4" style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}>
              <div className="flex items-center gap-3">
                <School2 size={16} style={{ color: "#1d4ed8" }} />
                <div>
                  <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Colegio
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                    {colegioSeleccionado?.nombre ?? "Sin seleccionar"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4" style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}>
              <div className="flex items-center gap-3">
                <Shirt size={16} style={{ color: "#1d4ed8" }} />
                <div>
                  <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Uniforme y cantidad
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                    {uniformes.find((uniforme) => uniforme.id === formValues.uniformeId)?.nombre ?? "Sin seleccionar"}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                    {formValues.cantidad} unidad{formValues.cantidad === 1 ? "" : "es"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4" style={{ borderColor: "#eaecf0", backgroundColor: resultado ? (resultado.suficiente ? "#ecfdf3" : "#fef2f2") : "#fcfcfd" }}>
              <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                Estado del calculo
              </p>
              <p className="mt-2 text-sm font-semibold" style={{ color: resultado ? (resultado.suficiente ? "#027a48" : "#b42318") : "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                {resultado ? (resultado.suficiente ? "Stock suficiente para esta solicitud" : "Hay insumos insuficientes en el resultado") : "Aun no se ha ejecutado la verificacion"}
              </p>
              {resultado?.mensaje ? (
                <p className="mt-2 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                  {resultado.mensaje}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-3xl border p-5"
        style={{
          borderColor: "#eaecf0",
          backgroundColor: "#ffffff",
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Resultado de la verificacion
            </h2>
            <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              El resultado de la calculadora sera la base para generar la solicitud de salida pendiente.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void createRequest()}
            disabled={!resultado || creating || verifying}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed"
            style={{ backgroundColor: "#1d4ed8", opacity: !resultado || creating ? 0.65 : 1, fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {creating ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {creating ? "Generando solicitud..." : "Generar solicitud"}
          </button>
        </div>

        {!resultado ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-12 text-center" style={{ borderColor: "#d0d5dd" }}>
            <TriangleAlert size={28} style={{ color: "#98a2b3" }} />
            <p className="mt-3 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Ejecuta la calculadora para ver los insumos requeridos antes de generar la solicitud.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  {["Insumo", "Requerido", "Stock", "Estado"].map((label) => (
                    <th
                      key={label}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultado.items.map((item) => (
                  <tr key={item.id} className="border-t transition-colors duration-200 ease-in-out hover:bg-[#f8fafc]" style={{ borderColor: "#f2f4f7" }}>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {item.nombre}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {item.cantidadRequerida} {item.unidad}
                    </td>
                    <td className="px-4 py-4 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {item.stockDisponible} {item.unidad}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: item.suficiente ? "#ecfdf3" : "#fef2f2",
                          color: item.suficiente ? "#027a48" : "#b42318",
                          fontFamily: "var(--font-poppins), sans-serif",
                        }}
                      >
                        {item.suficiente ? "Suficiente" : "Insuficiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
