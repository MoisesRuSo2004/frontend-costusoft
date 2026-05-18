"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle, ArrowDownToLine, ArrowUpFromLine,
  CheckCircle, ChevronLeft, ChevronRight,
  Eye, Package, RefreshCw, X, XCircle,
} from "lucide-react";
import { useBodegaCola, type ColaTab } from "@/app/hooks/useBodegaCola";
import type { EntradaResponse } from "@/app/types/entrada";
import type { SalidaResponse } from "@/app/types/salida";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function isEntrada(item: EntradaResponse | SalidaResponse): item is EntradaResponse {
  return "proveedorNombre" in item || "proveedorId" in item;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "#f1f5f9", width: `${55 + i * 7}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Modal de rechazo ───────────────────────────────────────────────────────────

function RechazarModal({
  open,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  loading: boolean;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}) {
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (!open) setMotivo("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: "#fff" }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#fef2f2" }}>
                  <XCircle size={16} style={{ color: "#dc2626" }} />
                </div>
                <h3 className="text-base font-bold" style={{ color: "#111827", fontFamily: "var(--font-poppins)" }}>
                  Rechazar movimiento
                </h3>
              </div>
              <button onClick={onCancel} className="rounded-lg p-1.5 transition-colors hover:bg-gray-100">
                <X size={16} style={{ color: "#6b7280" }} />
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: "#6b7280" }}>
              Indica el motivo del rechazo. Esta información quedará registrada en el historial.
            </p>

            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: Cantidades no coinciden con la orden de compra..."
              rows={4}
              className="w-full rounded-xl border px-3 py-2.5 text-sm resize-none outline-none transition-colors"
              style={{
                borderColor: "#d1d5db",
                color: "#111827",
                fontFamily: "var(--font-poppins)",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#dc2626")}
              onBlur={e => (e.currentTarget.style.borderColor = "#d1d5db")}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={onCancel}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: "#d1d5db", color: "#374151" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { if (motivo.trim()) onConfirm(motivo.trim()); }}
                disabled={!motivo.trim() || loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
                style={{ backgroundColor: "#dc2626", color: "#fff" }}
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                {loading ? "Rechazando…" : "Confirmar rechazo"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Panel de detalle ───────────────────────────────────────────────────────────

function DetallePanel({
  open,
  item,
  tab,
  loadingDetalle,
  actionKey,
  onClose,
  onConfirmar,
  onRechazar,
}: {
  open: boolean;
  item: EntradaResponse | SalidaResponse | null;
  tab: ColaTab;
  loadingDetalle: boolean;
  actionKey: string | null;
  onClose: () => void;
  onConfirmar: (item: EntradaResponse | SalidaResponse) => void;
  onRechazar: (item: EntradaResponse | SalidaResponse) => void;
}) {
  const entrada = item && isEntrada(item) ? item as EntradaResponse : null;
  const salida  = item && !isEntrada(item) ? item as SalidaResponse : null;

  const confirmarKey = item ? `confirmar-${item.id}` : "";
  const rechazarKey  = item ? `rechazar-${item.id}`  : "";
  const busyConfirmar = actionKey === confirmarKey;
  const busyRechazar  = actionKey === rechazarKey;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full flex-col overflow-hidden shadow-2xl"
            style={{ width: "min(480px, 95vw)", backgroundColor: "#fff" }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#e5e7eb" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: tab === "entradas" ? "#f0fdf4" : "#fef3c7" }}>
                  {tab === "entradas"
                    ? <ArrowDownToLine size={16} style={{ color: "#15803d" }} />
                    : <ArrowUpFromLine size={16} style={{ color: "#b45309" }} />
                  }
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#6b7280" }}>
                    {tab === "entradas" ? "Entrada de insumos" : "Salida de insumos"}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#111827", fontFamily: "var(--font-poppins)" }}>
                    {tab === "entradas"
                      ? (entrada?.proveedorNombre ?? "Sin proveedor")
                      : (salida?.colegioNombre ?? "Sin colegio")
                    }
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
                <X size={18} style={{ color: "#6b7280" }} />
              </button>
            </div>

            {loadingDetalle ? (
              <div className="flex flex-1 items-center justify-center">
                <RefreshCw size={28} className="animate-spin" style={{ color: "#15803d" }} />
              </div>
            ) : item ? (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: "thin" }}>

                {/* Info general */}
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="grid grid-cols-2 gap-y-2 text-xs" style={{ color: "#6b7280" }}>
                    <div>
                      <span className="font-semibold block" style={{ color: "#374151" }}>Fecha</span>
                      {fmt(item.fecha)}
                    </div>
                    {tab === "entradas" && entrada?.proveedorNombre && (
                      <div>
                        <span className="font-semibold block" style={{ color: "#374151" }}>Proveedor</span>
                        {entrada.proveedorNombre}
                      </div>
                    )}
                    {tab === "salidas" && salida?.colegioNombre && (
                      <div>
                        <span className="font-semibold block" style={{ color: "#374151" }}>Colegio</span>
                        {salida.colegioNombre}
                      </div>
                    )}
                    {tab === "salidas" && salida?.creadoPor && (
                      <div>
                        <span className="font-semibold block" style={{ color: "#374151" }}>Solicitado por</span>
                        {salida.creadoPor}
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="font-semibold block" style={{ color: "#374151" }}>Descripción</span>
                      {item.descripcion || "—"}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onConfirmar(item)}
                    disabled={busyConfirmar || busyRechazar}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-60"
                    style={{ backgroundColor: "#15803d", color: "#fff" }}
                  >
                    {busyConfirmar ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    {busyConfirmar ? "Procesando…" : "Confirmar"}
                  </button>
                  <button
                    onClick={() => onRechazar(item)}
                    disabled={busyConfirmar || busyRechazar}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-all disabled:opacity-60"
                    style={{ borderColor: "#fca5a5", color: "#dc2626", backgroundColor: "#fef2f2" }}
                  >
                    {busyRechazar ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                    {busyRechazar ? "Procesando…" : "Rechazar"}
                  </button>
                </div>

                {/* Detalles (insumos) */}
                <div>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#374151" }}>
                    <Package size={13} />
                    {tab === "entradas" ? "Insumos a ingresar" : "Insumos a despachar"}
                  </p>
                  {item.detalles?.length > 0 ? (
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#e5e7eb" }}>
                      <table className="w-full text-xs">
                        <thead style={{ backgroundColor: "#f8fafc" }}>
                          <tr>
                            {["Insumo", "Cantidad", "Unidad"].map(h => (
                              <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: "#6b7280" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.detalles.map((d, i) => (
                            <tr key={d.id} style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : undefined }}>
                              <td className="px-3 py-2.5 font-medium" style={{ color: "#111827" }}>{d.nombreInsumo}</td>
                              <td className="px-3 py-2.5 font-semibold" style={{ color: "#374151" }}>{d.cantidad}</td>
                              <td className="px-3 py-2.5" style={{ color: "#6b7280" }}>{d.unidadMedida}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-center py-4" style={{ color: "#9ca3af" }}>Sin detalles registrados</p>
                  )}
                </div>
              </div>
            ) : null}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function BodegaColaClient({ initialTab }: { initialTab: ColaTab }) {
  const {
    activeTab, switchTab,
    items, page, totalPages, totalElements, loading,
    error, successMsg, actionKey,
    panelOpen, itemSeleccionado, loadingDetalle,
    rechazandoItem, setRechazandoItem,
    openPanel, closePanel, goToPage, recargar, clearMessages,
    confirmar, rechazar,
    entradasTotal, salidasTotal,
  } = useBodegaCola(initialTab);

  // Auto-cerrar mensajes
  useEffect(() => {
    if (!successMsg && !error) return;
    const t = setTimeout(clearMessages, 4000);
    return () => clearTimeout(t);
  }, [successMsg, error, clearMessages]);

  const TABS: { id: ColaTab; label: string; count: number; color: string; icon: React.ElementType }[] = [
    { id: "entradas", label: "Entradas pendientes", count: entradasTotal, color: "#15803d", icon: ArrowDownToLine },
    { id: "salidas",  label: "Salidas pendientes",  count: salidasTotal,  color: "#b45309", icon: ArrowUpFromLine },
  ];

  const accentColor = activeTab === "entradas" ? "#15803d" : "#b45309";
  const emptyIcon   = activeTab === "entradas" ? ArrowDownToLine : ArrowUpFromLine;
  const EmptyIcon   = emptyIcon;

  const busyRechazar = rechazandoItem
    ? actionKey === `rechazar-${rechazandoItem.id}`
    : false;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#111827", fontFamily: "var(--font-poppins)" }}>
            Cola de trabajo
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
            Revisa y procesa las entradas y salidas de insumos pendientes de confirmación
          </p>
        </div>
        <button
          onClick={recargar}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
          style={{ borderColor: "#d1d5db", color: "#374151" }}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* ── Alertas ── */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <CheckCircle size={16} /> {successMsg}
          </motion.div>
        )}
        {error && (
          <motion.div
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
              style={activeTab === tab.id
                ? { backgroundColor: tab.color, color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                : { backgroundColor: "#fff", color: "#6b7280", border: "1px solid #e5e7eb" }
              }
            >
              <Icon size={14} />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={activeTab === tab.id
                    ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { backgroundColor: `${tab.color}18`, color: tab.color }
                  }
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tabla ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#fff", border: "1px solid #eaecf0", boxShadow: "0 1px 8px rgba(15,23,42,0.04)" }}>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #eaecf0" }}>
              <tr>
                {["Fecha", activeTab === "entradas" ? "Proveedor" : "Colegio", "Descripción", "Insumos", "Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wide" style={{ color: "#6b7280" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <EmptyIcon size={40} className="mx-auto mb-3" style={{ color: "#d1d5db" }} />
                    <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
                      No hay {activeTab === "entradas" ? "entradas" : "salidas"} pendientes
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Todo está al día</p>
                  </td>
                </tr>
              ) : (
                items.map((item, i) => {
                  const entrada = isEntrada(item) ? item as EntradaResponse : null;
                  const salida  = !isEntrada(item) ? item as SalidaResponse : null;
                  const origen  = entrada?.proveedorNombre ?? salida?.colegioNombre ?? "—";
                  const busyC   = actionKey === `confirmar-${item.id}`;
                  const busyR   = actionKey === `rechazar-${item.id}`;

                  return (
                    <tr
                      key={item.id}
                      className="cursor-pointer transition-colors"
                      style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : undefined }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
                      onClick={() => openPanel(item, activeTab)}
                    >
                      <td className="px-4 py-3 text-xs" style={{ color: "#374151" }}>
                        <p className="font-semibold">{fmt(item.fecha)}</p>
                        <p style={{ color: "#9ca3af" }}>{fmt(item.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium" style={{ color: "#111827" }}>
                        {origen}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[200px]" style={{ color: "#6b7280" }}>
                        <span className="line-clamp-2">{item.descripcion || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#374151" }}>
                        <span className="font-semibold">{item.detalles?.length ?? 0}</span>
                        <span style={{ color: "#9ca3af" }}> tipo{item.detalles?.length !== 1 ? "s" : ""}</span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); openPanel(item, activeTab); }}
                            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                            title="Ver detalle"
                          >
                            <Eye size={15} style={{ color: "#6b7280" }} />
                          </button>
                          <button
                            onClick={() => confirmar(item, activeTab)}
                            disabled={busyC || busyR}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-60"
                            style={{ backgroundColor: "#15803d", color: "#fff" }}
                          >
                            {busyC ? <RefreshCw size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                            {busyC ? "…" : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setRechazandoItem(item)}
                            disabled={busyC || busyR}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-60"
                            style={{ borderColor: "#fca5a5", color: "#dc2626", backgroundColor: "#fef2f2" }}
                          >
                            {busyR ? <RefreshCw size={11} className="animate-spin" /> : <XCircle size={11} />}
                            {busyR ? "…" : "Rechazar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Cards móvil */}
        <div className="md:hidden divide-y" style={{ divideColor: "#f1f5f9" }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-4 rounded animate-pulse" style={{ backgroundColor: "#f1f5f9", width: `${50 + j * 15}%` }} />
                ))}
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <EmptyIcon size={36} className="mx-auto mb-2" style={{ color: "#d1d5db" }} />
              <p className="text-sm" style={{ color: "#6b7280" }}>
                No hay {activeTab === "entradas" ? "entradas" : "salidas"} pendientes
              </p>
            </div>
          ) : (
            items.map(item => {
              const entrada = isEntrada(item) ? item as EntradaResponse : null;
              const salida  = !isEntrada(item) ? item as SalidaResponse : null;
              const origen  = entrada?.proveedorNombre ?? salida?.colegioNombre ?? "—";
              const busyC   = actionKey === `confirmar-${item.id}`;
              const busyR   = actionKey === `rechazar-${item.id}`;

              return (
                <div key={item.id} className="p-4 space-y-3" onClick={() => openPanel(item, activeTab)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#111827", fontFamily: "var(--font-poppins)" }}>
                        {origen}
                      </p>
                      <p className="text-xs" style={{ color: "#6b7280" }}>{fmt(item.fecha)}</p>
                    </div>
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: accentColor + "18", color: accentColor }}>
                      {item.detalles?.length ?? 0} insumos
                    </span>
                  </div>
                  {item.descripcion && (
                    <p className="text-xs line-clamp-2" style={{ color: "#6b7280" }}>{item.descripcion}</p>
                  )}
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => confirmar(item, activeTab)}
                      disabled={busyC || busyR}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold disabled:opacity-60"
                      style={{ backgroundColor: "#15803d", color: "#fff" }}
                    >
                      {busyC ? <RefreshCw size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                      Confirmar
                    </button>
                    <button
                      onClick={() => setRechazandoItem(item)}
                      disabled={busyC || busyR}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold disabled:opacity-60"
                      style={{ borderColor: "#fca5a5", color: "#dc2626", backgroundColor: "#fef2f2" }}
                    >
                      {busyR ? <RefreshCw size={11} className="animate-spin" /> : <XCircle size={11} />}
                      Rechazar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: "#eaecf0" }}>
            <p className="text-xs" style={{ color: "#6b7280" }}>
              {totalElements} registros · Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                className="rounded-lg border p-1.5 transition-colors disabled:opacity-40 hover:bg-gray-50"
                style={{ borderColor: "#d1d5db" }}
              >
                <ChevronLeft size={15} style={{ color: "#374151" }} />
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="rounded-lg border p-1.5 transition-colors disabled:opacity-40 hover:bg-gray-50"
                style={{ borderColor: "#d1d5db" }}
              >
                <ChevronRight size={15} style={{ color: "#374151" }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Panel de detalle ── */}
      <DetallePanel
        open={panelOpen}
        item={itemSeleccionado}
        tab={activeTab}
        loadingDetalle={loadingDetalle}
        actionKey={actionKey}
        onClose={closePanel}
        onConfirmar={item => confirmar(item, activeTab)}
        onRechazar={item => { closePanel(); setRechazandoItem(item); }}
      />

      {/* ── Modal de rechazo ── */}
      <RechazarModal
        open={rechazandoItem !== null}
        loading={busyRechazar}
        onConfirm={motivo => {
          if (rechazandoItem) {
            void rechazar(rechazandoItem, motivo, activeTab);
            setRechazandoItem(null);
          }
        }}
        onCancel={() => setRechazandoItem(null)}
      />
    </div>
  );
}
