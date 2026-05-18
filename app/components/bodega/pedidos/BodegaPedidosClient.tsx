"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle, CheckCircle, ChevronLeft, ChevronRight,
  ClipboardList, Eye, History, Package, Play,
  RefreshCw, School2, Shirt, Truck, X, XCircle,
} from "lucide-react";
import { useBodegaPedidos, type BodegaTab } from "@/app/hooks/useBodegaPedidos";
import type { PedidoResponse, HistorialPedidoResponse } from "@/app/types/pedido";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function pct(p: number | null | undefined) {
  if (p == null) return null;
  return Math.round(p);
}

// ── Badges ─────────────────────────────────────────────────────────────────────

const TAB_META: Record<BodegaTab, { label: string; color: string; bg: string; acción: string; icon: React.ElementType }> = {
  CONFIRMADO:         { label: "Confirmados",         color: "#1d4ed8", bg: "#eff6ff", acción: "Iniciar Producción", icon: Play  },
  EN_PRODUCCION:      { label: "En Producción",       color: "#15803d", bg: "#f0fdf4", acción: "Marcar Listo",       icon: CheckCircle },
  LISTO_PARA_ENTREGA: { label: "Listos para Entrega", color: "#b45309", bg: "#fef3c7", acción: "Registrar Entrega",  icon: Truck },
};

function BadgeEstado({ estado }: { estado: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    CONFIRMADO:         { color: "#1d4ed8", bg: "#dbeafe", label: "Confirmado"         },
    EN_PRODUCCION:      { color: "#15803d", bg: "#bbf7d0", label: "En Producción"      },
    LISTO_PARA_ENTREGA: { color: "#b45309", bg: "#fde68a", label: "Listo para Entrega" },
  };
  const s = map[estado] ?? { color: "#6b7280", bg: "#f3f4f6", label: estado };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ color: s.color, backgroundColor: s.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

// ── Skeleton row ───────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "#f1f5f9", width: `${60 + i * 5}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ── Action button ──────────────────────────────────────────────────────────────

function ActionBtn({
  tab, pedido, actionKey, onClick,
}: {
  tab: BodegaTab;
  pedido: PedidoResponse;
  actionKey: string | null;
  onClick: () => void;
}) {
  const meta = TAB_META[tab];
  const Icon = meta.icon;
  const key = tab === "CONFIRMADO" ? `iniciar-${pedido.id}` : tab === "EN_PRODUCCION" ? `listo-${pedido.id}` : `entregar-${pedido.id}`;
  const busy = actionKey === key;

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-60"
      style={{ backgroundColor: meta.color, color: "#fff" }}
    >
      {busy ? (
        <RefreshCw size={12} className="animate-spin" />
      ) : (
        <Icon size={12} />
      )}
      {busy ? "Procesando…" : meta.acción}
    </button>
  );
}

// ── Panel de detalle (slide-in) ────────────────────────────────────────────────

function DetallePanel({
  open, pedido, historial, loadingDetalle, loadingHistorial, activeTab, actionKey,
  onClose, onAccion,
}: {
  open: boolean;
  pedido: PedidoResponse | null;
  historial: HistorialPedidoResponse[];
  loadingDetalle: boolean;
  loadingHistorial: boolean;
  activeTab: BodegaTab;
  actionKey: string | null;
  onClose: () => void;
  onAccion: (p: PedidoResponse) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full flex-col overflow-hidden shadow-2xl"
            style={{ width: "min(520px, 95vw)", backgroundColor: "#fff" }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#e5e7eb" }}>
              <div>
                <p className="text-xs font-medium" style={{ color: "#6b7280" }}>Detalle de pedido</p>
                <p className="text-base font-bold" style={{ color: "#111827", fontFamily: "var(--font-poppins)" }}>
                  {pedido?.numeroPedido ?? "—"}
                </p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
                <X size={18} style={{ color: "#6b7280" }} />
              </button>
            </div>

            {loadingDetalle ? (
              <div className="flex flex-1 items-center justify-center">
                <RefreshCw size={28} className="animate-spin" style={{ color: "#15803d" }} />
              </div>
            ) : pedido ? (
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: "thin" }}>

                {/* Resumen */}
                <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <School2 size={15} style={{ color: "#15803d" }} />
                    <span className="text-sm font-semibold" style={{ color: "#111827" }}>{pedido.colegio?.nombre}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "#6b7280" }}>
                    <div><span className="font-medium">Estado: </span><BadgeEstado estado={pedido.estado} /></div>
                    <div><span className="font-medium">Entrega est.: </span>{fmt(pedido.fechaEstimadaEntrega)}</div>
                    <div><span className="font-medium">Creado: </span>{fmt(pedido.fechaCreacion)}</div>
                    {pedido.factorCumplimiento != null && (
                      <div><span className="font-medium">Disponibilidad: </span>
                        <span style={{ color: (pct(pedido.factorCumplimiento) ?? 0) >= 100 ? "#15803d" : "#b45309" }}>
                          {pct(pedido.factorCumplimiento)}%
                        </span>
                      </div>
                    )}
                  </div>
                  {pedido.insumoLimitante && (
                    <p className="text-xs mt-2 px-2 py-1 rounded-lg" style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}>
                      ⚠ Stock parcial — limitante: {pedido.insumoLimitante}
                    </p>
                  )}
                </div>

                {/* Acción principal */}
                <div className="flex justify-center">
                  <ActionBtn tab={activeTab} pedido={pedido} actionKey={actionKey} onClick={() => onAccion(pedido)} />
                </div>

                {/* Prendas */}
                <div>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#374151" }}>
                    <Shirt size={13} /> Prendas del pedido
                  </p>
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#e5e7eb" }}>
                    <table className="w-full text-xs">
                      <thead style={{ backgroundColor: "#f8fafc" }}>
                        <tr>
                          {["Prenda", "Talla", "Cant."].map(h => (
                            <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: "#6b7280" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pedido.detalles?.map((d, i) => (
                          <tr key={d.id} style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : undefined }}>
                            <td className="px-3 py-2" style={{ color: "#111827" }}>{d.nombreUniforme}</td>
                            <td className="px-3 py-2" style={{ color: "#6b7280" }}>{d.talla}</td>
                            <td className="px-3 py-2 font-semibold" style={{ color: "#111827" }}>{d.cantidad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Insumos */}
                {pedido.resumenInsumos && pedido.resumenInsumos.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#374151" }}>
                      <Package size={13} /> Insumos requeridos
                    </p>
                    <div className="space-y-1.5">
                      {pedido.resumenInsumos.map(ins => (
                        <div key={ins.insumoId}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                          style={{
                            backgroundColor: ins.suficiente ? "#f0fdf4" : "#fef9c3",
                            border: `1px solid ${ins.suficiente ? "#bbf7d0" : "#fde68a"}`,
                          }}>
                          <span style={{ color: "#374151" }}>{ins.nombre}</span>
                          <span className="font-semibold" style={{ color: ins.suficiente ? "#15803d" : "#b45309" }}>
                            {ins.suficiente ? "✓ Disponible" : `⚠ Falta ${ins.faltante}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historial */}
                <div>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#374151" }}>
                    <History size={13} /> Historial de cambios
                  </p>
                  {loadingHistorial ? (
                    <div className="flex justify-center py-4">
                      <RefreshCw size={16} className="animate-spin" style={{ color: "#15803d" }} />
                    </div>
                  ) : historial.length === 0 ? (
                    <p className="text-xs text-center py-3" style={{ color: "#9ca3af" }}>Sin historial registrado</p>
                  ) : (
                    <ol className="relative border-l ml-2" style={{ borderColor: "#e5e7eb" }}>
                      {historial.map((h, i) => (
                        <li key={i} className="mb-4 ml-4">
                          <div className="absolute -left-1.5 h-3 w-3 rounded-full border-2"
                            style={{ backgroundColor: "#15803d", borderColor: "#fff" }} />
                          <p className="text-[11px] font-semibold" style={{ color: "#111827" }}>{h.accion}</p>
                          <p className="text-[11px]" style={{ color: "#6b7280" }}>
                            por <strong>{h.realizadoPor}</strong> · {fmt(h.fechaAccion)}
                          </p>
                        </li>
                      ))}
                    </ol>
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

export default function BodegaPedidosClient({ initialPedidoId }: { initialPedidoId?: number }) {
  const {
    activeTab, switchTab,
    pedidos, page, totalPages, totalElements, loading,
    error, successMsg, actionKey,
    panelOpen, pedidoSeleccionado, historial, loadingDetalle, loadingHistorial,
    openPanel, closePanel, goToPage, recargar, clearMessages,
    iniciarProduccion, marcarListo, entregar,
    confirmadosTotal, enProduccionTotal, listosTotal,
  } = useBodegaPedidos();

  // Deep-link desde notificación
  useEffect(() => {
    if (!initialPedidoId) return;
    void openPanel({ id: initialPedidoId } as PedidoResponse);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPedidoId]);

  // Auto-cerrar mensajes
  useEffect(() => {
    if (!successMsg && !error) return;
    const t = setTimeout(clearMessages, 4000);
    return () => clearTimeout(t);
  }, [successMsg, error, clearMessages]);

  function handleAccion(pedido: PedidoResponse) {
    if (activeTab === "CONFIRMADO")         void iniciarProduccion(pedido);
    else if (activeTab === "EN_PRODUCCION") void marcarListo(pedido);
    else                                    void entregar(pedido);
  }

  const TABS: { id: BodegaTab; label: string; count: number; color: string }[] = [
    { id: "CONFIRMADO",         label: "Confirmados",         count: confirmadosTotal,   color: "#1d4ed8" },
    { id: "EN_PRODUCCION",      label: "En Producción",       count: enProduccionTotal,  color: "#15803d" },
    { id: "LISTO_PARA_ENTREGA", label: "Listos para Entrega", count: listosTotal,        color: "#b45309" },
  ];

  const meta = TAB_META[activeTab];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#111827", fontFamily: "var(--font-poppins)" }}>
            Pedidos de Producción
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
            Gestiona el flujo de producción — confirma insumos y avanza el estado de cada pedido
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
            <CheckCircle size={16} />
            {successMsg}
          </motion.div>
        )}
        {error && (
          <motion.div
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
            style={activeTab === tab.id
              ? { backgroundColor: tab.color, color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
              : { backgroundColor: "#fff", color: "#6b7280", border: "1px solid #e5e7eb" }
            }
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={activeTab === tab.id
                  ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
                  : { backgroundColor: `${tab.color}15`, color: tab.color }
                }
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tabla principal ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#fff", border: "1px solid #eaecf0", boxShadow: "0 1px 8px rgba(15,23,42,0.04)" }}>

        {/* Tabla desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #eaecf0" }}>
              <tr>
                {["Pedido", "Colegio", "Prendas", "Disponibilidad", "Entrega Est.", "Acción"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wide" style={{ color: "#6b7280" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <ClipboardList size={40} className="mx-auto mb-3" style={{ color: "#d1d5db" }} />
                    <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
                      No hay pedidos en estado "{meta.label}"
                    </p>
                  </td>
                </tr>
              ) : (
                pedidos.map((p, i) => {
                  const pct_ = pct(p.factorCumplimiento);
                  const totalPrendas = p.detalles?.reduce((s, d) => s + d.cantidad, 0) ?? 0;
                  return (
                    <tr
                      key={p.id}
                      className="group transition-colors cursor-pointer"
                      style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : undefined }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}
                      onClick={() => openPanel(p)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-xs" style={{ color: "#111827", fontFamily: "var(--font-poppins)" }}>
                            {p.numeroPedido}
                          </p>
                          <p className="text-[11px]" style={{ color: "#9ca3af" }}>{fmt(p.fechaCreacion)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <School2 size={13} style={{ color: "#15803d", flexShrink: 0 }} />
                          <span className="text-xs" style={{ color: "#374151" }}>{p.colegio?.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#374151" }}>
                        {totalPrendas} uds
                        <span className="ml-1 text-[11px]" style={{ color: "#9ca3af" }}>
                          ({p.detalles?.length ?? 0} tipos)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {pct_ != null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "#e5e7eb" }}>
                              <div className="h-1.5 rounded-full" style={{
                                width: `${Math.min(pct_, 100)}%`,
                                backgroundColor: pct_ >= 100 ? "#15803d" : pct_ >= 60 ? "#f59e0b" : "#ef4444",
                              }} />
                            </div>
                            <span className="text-xs font-semibold" style={{
                              color: pct_ >= 100 ? "#15803d" : pct_ >= 60 ? "#b45309" : "#dc2626",
                            }}>{pct_}%</span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: "#9ca3af" }}>Sin calcular</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#6b7280" }}>
                        {fmt(p.fechaEstimadaEntrega)}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); openPanel(p); }}
                            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                            title="Ver detalle"
                          >
                            <Eye size={15} style={{ color: "#6b7280" }} />
                          </button>
                          <ActionBtn tab={activeTab} pedido={p} actionKey={actionKey} onClick={() => handleAccion(p)} />
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
          ) : pedidos.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList size={36} className="mx-auto mb-2" style={{ color: "#d1d5db" }} />
              <p className="text-sm" style={{ color: "#6b7280" }}>No hay pedidos en esta cola</p>
            </div>
          ) : (
            pedidos.map(p => {
              const pct_ = pct(p.factorCumplimiento);
              const totalPrendas = p.detalles?.reduce((s, d) => s + d.cantidad, 0) ?? 0;
              return (
                <div key={p.id} className="p-4 space-y-3" onClick={() => openPanel(p)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#111827", fontFamily: "var(--font-poppins)" }}>
                        {p.numeroPedido}
                      </p>
                      <p className="text-xs" style={{ color: "#6b7280" }}>{p.colegio?.nombre}</p>
                    </div>
                    <BadgeEstado estado={p.estado} />
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: "#6b7280" }}>
                    <span>{totalPrendas} prendas · Entrega: {fmt(p.fechaEstimadaEntrega)}</span>
                    {pct_ != null && (
                      <span style={{ color: pct_ >= 100 ? "#15803d" : "#b45309" }}>{pct_}%</span>
                    )}
                  </div>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <ActionBtn tab={activeTab} pedido={p} actionKey={actionKey} onClick={() => handleAccion(p)} />
                    <button
                      onClick={e => { e.stopPropagation(); openPanel(p); }}
                      className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                      style={{ borderColor: "#d1d5db", color: "#6b7280" }}
                    >
                      Ver detalle
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
              {totalElements} pedidos · Página {page + 1} de {totalPages}
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
        pedido={pedidoSeleccionado}
        historial={historial}
        loadingDetalle={loadingDetalle}
        loadingHistorial={loadingHistorial}
        activeTab={activeTab}
        actionKey={actionKey}
        onClose={closePanel}
        onAccion={p => { handleAccion(p); closePanel(); }}
      />
    </div>
  );
}
