"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, RefreshCw, ArrowUpFromLine, AlertCircle, Package,
  ChevronLeft, ChevronRight, X, Eye, Trash2, CheckCircle2, Filter,
} from "lucide-react";
import { useSalidas } from "@/app/hooks/useSalidas";
import type { SalidaResponse } from "@/app/types/salida";
import type { EstadoMovimiento } from "@/app/types/entrada";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

const ESTADO_STYLE: Record<EstadoMovimiento, { bg: string; color: string; dot: string; label: string }> = {
  PENDIENTE:  { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b", label: "Pendiente" },
  CONFIRMADA: { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", label: "Confirmada" },
  RECHAZADA:  { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444", label: "Rechazada" },
};

function EstadoBadge({ estado }: { estado: EstadoMovimiento }) {
  const st = ESTADO_STYLE[estado];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: st.bg, color: st.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
      {st.label}
    </span>
  );
}

// ─── Modal Detalle ────────────────────────────────────────────────────────────

function DetalleModal({ salida, onClose }: { salida: SalidaResponse; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }} className="w-full max-w-lg rounded-3xl border p-6"
        style={{ backgroundColor: "#fff", borderColor: "#eaecf0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "85vh", overflowY: "auto" }}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(245,158,11,0.10)" }}>
              <ArrowUpFromLine size={18} style={{ color: "#b45309" }} />
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                Salida #{salida.id}
              </h3>
              <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                {formatDate(salida.fecha)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EstadoBadge estado={salida.estado} />
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ color: "#9ca3af" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#374151")} onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
            <span style={{ color: "#667085" }}>Descripción</span>
            <span className="font-medium max-w-[60%] text-right" style={{ color: "#101828" }}>{salida.descripcion}</span>
          </div>
          <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
            <span style={{ color: "#667085" }}>Creado por</span>
            <span className="font-medium" style={{ color: "#101828" }}>{salida.creadoPor}</span>
          </div>
          {salida.colegioNombre && (
            <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
              <span style={{ color: "#667085" }}>Colegio destino</span>
              <span className="font-medium" style={{ color: "#101828" }}>{salida.colegioNombre}</span>
            </div>
          )}
          {salida.confirmadoPor && (
            <div className="flex justify-between text-sm" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
              <span style={{ color: "#667085" }}>Confirmado por</span>
              <span className="font-medium" style={{ color: "#16a34a" }}>{salida.confirmadoPor}</span>
            </div>
          )}
          {salida.motivoRechazo && (
            <div className="rounded-2xl p-3" style={{ backgroundColor: "#fef2f2" }}>
              <p className="text-xs font-medium" style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
                Motivo de rechazo: {salida.motivoRechazo}
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-4" style={{ borderColor: "#f0f0f4" }}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            Ítems ({salida.detalles.length})
          </p>
          <div className="space-y-2">
            {salida.detalles.map(d => (
              <div key={d.id} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ backgroundColor: "#f9fafb" }}>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(245,158,11,0.10)" }}>
                    <Package size={12} style={{ color: "#b45309" }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>{d.insumo.nombre}</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "#b45309", fontFamily: "var(--font-poppins), sans-serif" }}>
                  -{d.cantidad} {d.insumo.unidad}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Modal Eliminar ───────────────────────────────────────────────────────────

function EliminarModal({ id, onClose, onConfirm, saving }: { id: number; onClose: () => void; onConfirm: () => void; saving: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }} className="w-full max-w-sm rounded-3xl border p-6"
        style={{ backgroundColor: "#fff", borderColor: "#eaecf0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "#fef2f2" }}>
          <Trash2 size={20} style={{ color: "#dc2626" }} />
        </div>
        <h3 className="mb-2 text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>Eliminar salida #{id}</h3>
        <p className="mb-5 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
          Solo se pueden eliminar salidas en estado PENDIENTE o RECHAZADA.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border py-2.5 text-sm font-medium"
            style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}>Cancelar</button>
          <button onClick={onConfirm} disabled={saving} className="flex-1 rounded-2xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#dc2626", fontFamily: "var(--font-poppins), sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Paginación ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, totalElements, onChange }: { page: number; totalPages: number; totalElements: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t px-2 pt-4" style={{ borderColor: "#f0f0f4" }}>
      <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
        {totalElements} salida{totalElements !== 1 ? "s" : ""} · Página {page + 1} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button onClick={() => onChange(page - 1)} disabled={page === 0}
          className="flex h-8 w-8 items-center justify-center rounded-xl border transition disabled:opacity-40"
          style={{ borderColor: "#e5e7eb", color: "#374151" }}><ChevronLeft size={15} /></button>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}
          className="flex h-8 w-8 items-center justify-center rounded-xl border transition disabled:opacity-40"
          style={{ borderColor: "#e5e7eb", color: "#374151" }}><ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SalidasClient() {
  const { data, loading, saving, error, successMsg, page, setPage, estadoFilter, filtrarEstado, reload, eliminar, clearMessages } = useSalidas();
  const [search, setSearch] = useState("");
  const [detalleSalida, setDetalleSalida] = useState<SalidaResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const salidas = data?.content ?? [];

  const filtered = search.trim()
    ? salidas.filter(s =>
        s.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        s.creadoPor.toLowerCase().includes(search.toLowerCase()) ||
        String(s.id).includes(search)
      )
    : salidas;

  const kpis = {
    total: data?.totalElements ?? 0,
    pendientes: salidas.filter(s => s.estado === "PENDIENTE").length,
    confirmadas: salidas.filter(s => s.estado === "CONFIRMADA").length,
    rechazadas: salidas.filter(s => s.estado === "RECHAZADA").length,
  };

  return (
    <section className="flex flex-col gap-6 pb-10">

      {/* Header */}
      <div className="rounded-[28px] border px-6 py-5"
        style={{ borderColor: "#fde68a", background: "linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(11,61,145,0.07) 100%)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#b45309", fontFamily: "var(--font-poppins), sans-serif" }}>
              Inventario
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Salidas de Insumos
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Despachos del almacén — flujo ADMIN → BODEGA con validación de stock.
            </p>
          </div>
          <Link href="/salidas/add" className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition"
            style={{ backgroundColor: "#b45309", fontFamily: "var(--font-poppins), sans-serif" }}>
            <Plus size={15} /> Nueva Salida
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: kpis.total, color: "#b45309" },
          { label: "Pendientes", value: kpis.pendientes, color: "#f59e0b" },
          { label: "Confirmadas", value: kpis.confirmadas, color: "#16a34a" },
          { label: "Rechazadas", value: kpis.rechazadas, color: "#dc2626" },
        ].map(k => (
          <div key={k.label} className="rounded-3xl border p-4" style={{ borderColor: "#eaecf0", backgroundColor: "#fff" }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>{k.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: k.color, fontFamily: "var(--font-poppins), sans-serif" }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}>
            <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
            <p className="flex-1 text-sm" style={{ color: "#15803d", fontFamily: "var(--font-poppins), sans-serif" }}>{successMsg}</p>
            <button onClick={clearMessages}><X size={14} style={{ color: "#86efac" }} /></button>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
            <AlertCircle size={16} style={{ color: "#dc2626" }} />
            <p className="flex-1 text-sm" style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>{error}</p>
            <button onClick={clearMessages}><X size={14} style={{ color: "#fca5a5" }} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla */}
      <div className="rounded-3xl border" style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}>
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center" style={{ borderColor: "#f0f0f4" }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por descripción o usuario..."
              className="w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm outline-none"
              style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }} />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: "#9ca3af" }} />
            <select value={estadoFilter} onChange={e => filtrarEstado(e.target.value as EstadoMovimiento | "")}
              className="rounded-2xl border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif", backgroundColor: "#fff" }}>
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
          </div>
          <button onClick={reload} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium"
            style={{ borderColor: "#e5e7eb", color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>

        {loading && !data ? (
          <div className="flex flex-col gap-3 p-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-2xl" style={{ backgroundColor: "#f3f4f6" }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ArrowUpFromLine size={40} style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>Sin salidas para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f4" }}>
                  {["#", "Fecha", "Descripción", "Ítems", "Colegio", "Creado por", "Estado", "Acciones"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(salida => (
                  <tr key={salida.id} style={{ borderBottom: "1px solid #f9fafb" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td className="px-5 py-4 text-sm font-medium" style={{ color: "#b45309", fontFamily: "var(--font-poppins), sans-serif" }}>#{salida.id}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>{formatDate(salida.fecha)}</td>
                    <td className="px-5 py-4 max-w-[200px]">
                      <p className="truncate text-sm" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>{salida.descripcion}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "rgba(180,83,9,0.08)", color: "#b45309" }}>
                        {salida.detalles.length} ítem{salida.detalles.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {salida.colegioNombre ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>{salida.creadoPor}</td>
                    <td className="px-5 py-4"><EstadoBadge estado={salida.estado} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDetalleSalida(salida)} title="Ver detalle"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border transition"
                          style={{ borderColor: "#e5e7eb", color: "#374151" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#b45309"; e.currentTarget.style.color = "#b45309"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}>
                          <Eye size={13} />
                        </button>
                        {salida.estado !== "CONFIRMADA" && (
                          <button onClick={() => setDeleteId(salida.id)} title="Eliminar"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border transition"
                            style={{ borderColor: "#e5e7eb", color: "#374151" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#fecaca"; e.currentTarget.style.color = "#dc2626"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-5">
          <Pagination page={page} totalPages={data?.totalPages ?? 0} totalElements={data?.totalElements ?? 0} onChange={setPage} />
        </div>
      </div>

      <AnimatePresence>
        {detalleSalida && <DetalleModal salida={detalleSalida} onClose={() => setDetalleSalida(null)} />}
        {deleteId !== null && (
          <EliminarModal id={deleteId} saving={saving} onClose={() => setDeleteId(null)}
            onConfirm={async () => { await eliminar(deleteId); setDeleteId(null); }} />
        )}
      </AnimatePresence>
    </section>
  );
}
