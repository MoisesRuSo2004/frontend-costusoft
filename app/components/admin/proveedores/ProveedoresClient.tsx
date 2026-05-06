"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Plus, Search, Pencil, Trash2, X, Save, Loader2,
  AlertCircle, CheckCircle2, ChevronLeft, ChevronRight,
  Phone, MapPin, Hash, Mail, RefreshCw, Building2, Eye,
} from "lucide-react";
import { useProveedores, useProveedoresCrud } from "@/app/hooks/useProveedores";
import type { ProveedorResponse, ProveedorRequest } from "@/app/types/proveedor";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE ESTILO
// ─────────────────────────────────────────────────────────────────────────────

const lbl: React.CSSProperties = {
  display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600,
  color: "#374151", fontFamily: "'Poppins', sans-serif",
  textTransform: "uppercase", letterSpacing: "0.06em",
};

function inp(err?: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "11px 14px",
    border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 10, fontSize: 14, fontFamily: "'Poppins', sans-serif",
    color: "#111827", outline: "none", backgroundColor: "#fff",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };
}

function focusOn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#1d4ed8";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.1)";
}
function focusOff(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, err?: boolean) {
  e.currentTarget.style.borderColor = err ? "#fca5a5" : "#e5e7eb";
  e.currentTarget.style.boxShadow = "none";
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

const AVATAR_COLORS = ["#1d4ed8", "#7c3aed", "#0891b2", "#16a34a", "#c2410c", "#ca8a04"];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function initials(nombre: string) {
  const parts = nombre.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : nombre.slice(0, 2).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

interface Toast { id: number; type: "success" | "error"; msg: string; }

const EMPTY_FORM: ProveedorRequest = {
  nombre: "", nit: "", telefono: "", direccion: "", correo: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function ProveedoresClient() {
  const { proveedores, total, totalPages, page, loading, error, recargar } = useProveedores(10);
  const crud = useProveedoresCrud();

  const [busqueda, setBusqueda] = useState("");
  const [modalCrear, setModalCrear] = useState(false);
  const [editando, setEditando] = useState<ProveedorResponse | null>(null);
  const [eliminando, setEliminando] = useState<ProveedorResponse | null>(null);
  const [detalle, setDetalle] = useState<ProveedorResponse | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextToastId, setNextToastId] = useState(0);

  // ── Toast ──────────────────────────────────────────────────────────────────

  function toast(type: "success" | "error", msg: string) {
    const id = nextToastId;
    setNextToastId(n => n + 1);
    setToasts(t => [...t, { id, type, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  // ── Filtro local ───────────────────────────────────────────────────────────

  const filtrados = proveedores.filter(p =>
    busqueda === "" ||
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nit.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.correo?.toLowerCase().includes(busqueda.toLowerCase()) ?? false)
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <section className="flex flex-col gap-6 pb-8">

      {/* ── Header ── */}
      <div className="rounded-[28px] border px-6 py-6"
        style={{ borderColor: "#dbeafe", background: "linear-gradient(135deg, rgba(29,78,216,0.10) 0%, rgba(15,23,42,0.06) 100%)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#1d4ed8", fontFamily: "'Poppins', sans-serif" }}>
              Gestión
            </p>
            <h1 className="mt-2 text-2xl font-semibold"
              style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
              Proveedores
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#475467", fontFamily: "'Poppins', sans-serif" }}>
              {total} proveedor{total !== 1 ? "es" : ""} registrado{total !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => recargar(page)}
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition"
              style={{ borderColor: "#bfdbfe", backgroundColor: "#fff", color: "#1d4ed8", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Recargar
            </button>
            <button onClick={() => setModalCrear(true)}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition"
              style={{ backgroundColor: "#1d4ed8", color: "#fff", fontFamily: "'Poppins', sans-serif", cursor: "pointer", boxShadow: "0 4px 14px rgba(29,78,216,0.35)" }}>
              <Plus size={15} />
              Nuevo proveedor
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: total, color: "#1d4ed8", bg: "#eff6ff" },
          { label: "Con correo", value: proveedores.filter(p => !!p.correo).length, color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Con teléfono", value: proveedores.filter(p => !!p.telefono).length, color: "#0891b2", bg: "#ecfeff" },
          { label: "Con dirección", value: proveedores.filter(p => !!p.direccion).length, color: "#16a34a", bg: "#f0fdf4" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border p-5"
            style={{ borderColor: "#f3f4f6", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>{k.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: k.color, fontFamily: "'Poppins', sans-serif" }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border px-5 py-4"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
          <AlertCircle size={16} style={{ color: "#dc2626" }} />
          <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
        </div>
      )}

      {/* ── Barra de búsqueda ── */}
      <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "#f3f4f6" }}>
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, NIT o correo…"
            style={{
              ...inp(),
              paddingLeft: 38,
              backgroundColor: "#f9fafb",
              border: "1.5px solid #f3f4f6",
            }}
          />
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="rounded-2xl border bg-white overflow-hidden"
        style={{ borderColor: "#f3f4f6", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 size={20} className="animate-spin" style={{ color: "#1d4ed8" }} />
            <p className="text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>Cargando proveedores…</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Truck size={40} style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              {busqueda ? "No hay resultados para tu búsqueda." : "No hay proveedores registrados."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: "#f9fafb" }}>
                    {["Proveedor", "NIT", "Teléfono", "Correo", "Dirección", "Creado", "Acciones"].map(h => (
                      <th key={h} className="px-5 py-3 text-left"
                        style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p, i) => (
                    <motion.tr key={p.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: "1px solid #f9fafb" }}
                      className="hover:bg-blue-50/30 transition-colors">
                      {/* Proveedor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 text-white text-xs font-bold"
                            style={{ backgroundColor: avatarColor(p.id), fontFamily: "'Poppins', sans-serif" }}>
                            {initials(p.nombre)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                              {p.nombre}
                            </p>
                            <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                              {p.nit}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* NIT */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
                          style={{ backgroundColor: "#f0f9ff", color: "#0369a1", fontFamily: "'Poppins', sans-serif" }}>
                          <Hash size={11} />
                          {p.nit}
                        </span>
                      </td>
                      {/* Teléfono */}
                      <td className="px-5 py-4">
                        {p.telefono
                          ? <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                              <Phone size={13} style={{ color: "#9ca3af" }} />
                              {p.telefono}
                            </span>
                          : <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>
                        }
                      </td>
                      {/* Correo */}
                      <td className="px-5 py-4">
                        {p.correo
                          ? <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                              <Mail size={13} style={{ color: "#9ca3af" }} />
                              {p.correo}
                            </span>
                          : <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>
                        }
                      </td>
                      {/* Dirección */}
                      <td className="px-5 py-4 max-w-[180px]">
                        {p.direccion
                          ? <span className="inline-flex items-start gap-1.5 text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                              <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#9ca3af" }} />
                              <span className="truncate block max-w-[140px]">{p.direccion}</span>
                            </span>
                          : <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>
                        }
                      </td>
                      {/* Creado */}
                      <td className="px-5 py-4">
                        <span className="text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
                          {fmtDate(p.createdAt)}
                        </span>
                      </td>
                      {/* Acciones */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setDetalle(p)}
                            title="Ver detalle"
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition"
                            style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", cursor: "pointer" }}>
                            <Eye size={14} />
                          </button>
                          <button onClick={() => setEditando(p)}
                            title="Editar"
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition"
                            style={{ backgroundColor: "#f5f3ff", color: "#7c3aed", cursor: "pointer" }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setEliminando(p)}
                            title="Eliminar"
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition"
                            style={{ backgroundColor: "#fff1f2", color: "#e11d48", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col divide-y divide-gray-50">
              {filtrados.map(p => (
                <div key={p.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: avatarColor(p.id), fontFamily: "'Poppins', sans-serif" }}>
                        {initials(p.nombre)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>{p.nombre}</p>
                        <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>NIT: {p.nit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDetalle(p)} className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", cursor: "pointer" }}>
                        <Eye size={14} />
                      </button>
                      <button onClick={() => setEditando(p)} className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "#f5f3ff", color: "#7c3aed", cursor: "pointer" }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setEliminando(p)} className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "#fff1f2", color: "#e11d48", cursor: "pointer" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {(p.correo || p.telefono) && (
                    <div className="mt-2 flex flex-wrap gap-3 pl-13">
                      {p.telefono && (
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#667085" }}>
                          <Phone size={11} />{p.telefono}
                        </span>
                      )}
                      {p.correo && (
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#667085" }}>
                          <Mail size={11} />{p.correo}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Paginación ── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: "1px solid #f3f4f6" }}>
            <p className="text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
              Página {page + 1} de {totalPages} · {total} resultados
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => recargar(page - 1)} disabled={page === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40"
                style={{ borderColor: "#e5e7eb", color: "#374151", cursor: page === 0 ? "not-allowed" : "pointer" }}>
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => recargar(page + 1)} disabled={page + 1 >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40"
                style={{ borderColor: "#e5e7eb", color: "#374151", cursor: page + 1 >= totalPages ? "not-allowed" : "pointer" }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODALES
      ═══════════════════════════════════════════════════════════════════════ */}

      <AnimatePresence>
        {/* ── Modal Crear ── */}
        {modalCrear && (
          <ProveedorModal
            titulo="Nuevo proveedor"
            initial={EMPTY_FORM}
            submitting={crud.submitting}
            onClose={() => setModalCrear(false)}
            onSubmit={async (form) => {
              try {
                await crud.crear(form);
                toast("success", "Proveedor creado exitosamente");
                setModalCrear(false);
                recargar(page);
              } catch (e) {
                toast("error", e instanceof Error ? e.message : "Error al crear proveedor");
              }
            }}
          />
        )}

        {/* ── Modal Editar ── */}
        {editando && (
          <ProveedorModal
            titulo="Editar proveedor"
            initial={{
              nombre: editando.nombre,
              nit: editando.nit,
              telefono: editando.telefono ?? "",
              direccion: editando.direccion ?? "",
              correo: editando.correo ?? "",
            }}
            submitting={crud.submitting}
            onClose={() => setEditando(null)}
            onSubmit={async (form) => {
              try {
                await crud.actualizar(editando.id, form);
                toast("success", "Proveedor actualizado correctamente");
                setEditando(null);
                recargar(page);
              } catch (e) {
                toast("error", e instanceof Error ? e.message : "Error al actualizar proveedor");
              }
            }}
          />
        )}

        {/* ── Modal Eliminar ── */}
        {eliminando && (
          <ModalOverlay onClose={() => setEliminando(null)}>
            <motion.div key="modal-delete"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white p-8"
              style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.18)" }}
              onClick={e => e.stopPropagation()}>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#fff1f2" }}>
                <Trash2 size={22} style={{ color: "#e11d48" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                Eliminar proveedor
              </h2>
              <p className="text-sm mb-1" style={{ color: "#475467", fontFamily: "'Poppins', sans-serif" }}>
                ¿Estás seguro de que deseas eliminar a{" "}
                <span className="font-semibold" style={{ color: "#101828" }}>{eliminando.nombre}</span>?
              </p>
              <p className="text-xs mb-7" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Esta acción no se puede deshacer y podría afectar insumos asociados a este proveedor.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setEliminando(null)}
                  className="flex-1 rounded-xl border py-2.5 text-sm font-semibold transition"
                  style={{ borderColor: "#e5e7eb", color: "#374151", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button
                  disabled={crud.submitting}
                  onClick={async () => {
                    try {
                      await crud.eliminar(eliminando.id);
                      toast("success", "Proveedor eliminado");
                      setEliminando(null);
                      recargar(page);
                    } catch (e) {
                      toast("error", e instanceof Error ? e.message : "Error al eliminar");
                    }
                  }}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#e11d48", color: "#fff", fontFamily: "'Poppins', sans-serif", cursor: crud.submitting ? "not-allowed" : "pointer", opacity: crud.submitting ? 0.7 : 1 }}>
                  {crud.submitting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  Eliminar
                </button>
              </div>
            </motion.div>
          </ModalOverlay>
        )}

        {/* ── Modal Detalle ── */}
        {detalle && (
          <ModalOverlay onClose={() => setDetalle(null)}>
            <motion.div key="modal-detalle"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white"
              style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.18)" }}
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-7 py-5"
                style={{ borderBottom: "1px solid #f3f4f6" }}>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white font-bold text-sm"
                    style={{ backgroundColor: avatarColor(detalle.id), fontFamily: "'Poppins', sans-serif" }}>
                    {initials(detalle.nombre)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                      {detalle.nombre}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: "#f0f9ff", color: "#0369a1" }}>
                      <Hash size={11} />{detalle.nit}
                    </span>
                  </div>
                </div>
                <button onClick={() => setDetalle(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition"
                  style={{ backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "pointer" }}>
                  <X size={16} />
                </button>
              </div>
              {/* Body */}
              <div className="px-7 py-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetalleField icon={<Hash size={14} />} label="NIT" value={detalle.nit} />
                <DetalleField icon={<Phone size={14} />} label="Teléfono" value={detalle.telefono} />
                <DetalleField icon={<Mail size={14} />} label="Correo" value={detalle.correo} fullWidth />
                <DetalleField icon={<MapPin size={14} />} label="Dirección" value={detalle.direccion} fullWidth />
                <DetalleField icon={<Building2 size={14} />} label="Registrado" value={fmtDate(detalle.createdAt)} />
                <DetalleField icon={<Building2 size={14} />} label="Actualizado" value={fmtDate(detalle.updatedAt)} />
              </div>
              <div className="flex justify-end gap-3 px-7 pb-6">
                <button onClick={() => { setDetalle(null); setEditando(detalle); }}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: "#1d4ed8", color: "#fff", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
                  <Pencil size={14} />Editar
                </button>
              </div>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* ── Toast stack ── */}
      <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-[200] flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              className="flex items-center gap-3 rounded-2xl px-5 py-3.5 w-full sm:w-auto"
              style={{
                backgroundColor: t.type === "success" ? "#ecfdf5" : "#fef2f2",
                border: `1.5px solid ${t.type === "success" ? "#6ee7b7" : "#fecaca"}`,
                boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                minWidth: 220, maxWidth: "calc(100vw - 2rem)",
              }}>
              {t.type === "success"
                ? <CheckCircle2 size={16} style={{ color: "#059669", flexShrink: 0 }} />
                : <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
              }
              <p className="text-sm font-medium" style={{
                color: t.type === "success" ? "#065f46" : "#b42318",
                fontFamily: "'Poppins', sans-serif",
              }}>{t.msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPO DE DETALLE
// ─────────────────────────────────────────────────────────────────────────────

function DetalleField({
  icon, label, value, fullWidth,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
        <span style={{ color: "#d1d5db" }}>{icon}</span>
        {label}
      </p>
      <p className="text-sm font-medium" style={{ color: value ? "#101828" : "#d1d5db", fontFamily: "'Poppins', sans-serif" }}>
        {value || "—"}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div key="overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL FORMULARIO (CREAR / EDITAR)
// ─────────────────────────────────────────────────────────────────────────────

interface ProveedorModalProps {
  titulo: string;
  initial: ProveedorRequest;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (form: ProveedorRequest) => Promise<void>;
}

function ProveedorModal({ titulo, initial, submitting, onClose, onSubmit }: ProveedorModalProps) {
  const [form, setForm] = useState<ProveedorRequest>({ ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof ProveedorRequest, string>>>({});

  function set(k: keyof ProveedorRequest, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (form.nombre.length > 150) e.nombre = "Máximo 150 caracteres";
    if (!form.nit.trim()) e.nit = "El NIT es obligatorio";
    else if (form.nit.length > 20) e.nit = "Máximo 20 caracteres";
    if (form.telefono && form.telefono.length > 20) e.telefono = "Máximo 20 caracteres";
    if (form.direccion && form.direccion.length > 250) e.direccion = "Máximo 250 caracteres";
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = "Correo inválido";
    if (form.correo && form.correo.length > 100) e.correo = "Máximo 100 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    const payload: ProveedorRequest = {
      nombre: form.nombre.trim(),
      nit: form.nit.trim(),
      ...(form.telefono?.trim() ? { telefono: form.telefono.trim() } : {}),
      ...(form.direccion?.trim() ? { direccion: form.direccion.trim() } : {}),
      ...(form.correo?.trim() ? { correo: form.correo.trim() } : {}),
    };
    await onSubmit(payload);
  }

  return (
    <ModalOverlay onClose={onClose}>
      <motion.div key="modal-form"
        initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }}
        className="w-full max-w-lg rounded-3xl bg-white"
        style={{ boxShadow: "0 24px 64px rgba(15,23,42,0.20)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: "1px solid #f3f4f6" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#eff6ff" }}>
              <Truck size={18} style={{ color: "#1d4ed8" }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
              {titulo}
            </h2>
          </div>
          <button onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition"
            style={{ backgroundColor: "#f3f4f6", color: "#6b7280", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">

          {/* Nombre */}
          <div>
            <label style={lbl}>Nombre del proveedor *</label>
            <input
              value={form.nombre}
              onChange={e => set("nombre", e.target.value)}
              placeholder="Ej. Distribuidora Textil S.A."
              style={inp(!!errors.nombre)}
              onFocus={focusOn} onBlur={e => focusOff(e, !!errors.nombre)}
            />
            {errors.nombre && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.nombre}</p>}
          </div>

          {/* NIT */}
          <div>
            <label style={lbl}>NIT *</label>
            <div className="relative">
              <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
              <input
                value={form.nit}
                onChange={e => set("nit", e.target.value)}
                placeholder="Ej. 900123456-7"
                style={{ ...inp(!!errors.nit), paddingLeft: 36 }}
                onFocus={focusOn} onBlur={e => focusOff(e, !!errors.nit)}
              />
            </div>
            {errors.nit && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.nit}</p>}
          </div>

          {/* Teléfono + Correo */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label style={lbl}>Teléfono</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  value={form.telefono ?? ""}
                  onChange={e => set("telefono", e.target.value)}
                  placeholder="Ej. 3001234567"
                  style={{ ...inp(!!errors.telefono), paddingLeft: 36 }}
                  onFocus={focusOn} onBlur={e => focusOff(e, !!errors.telefono)}
                />
              </div>
              {errors.telefono && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.telefono}</p>}
            </div>
            <div>
              <label style={lbl}>Correo electrónico</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  value={form.correo ?? ""}
                  onChange={e => set("correo", e.target.value)}
                  placeholder="proveedor@empresa.com"
                  type="email"
                  style={{ ...inp(!!errors.correo), paddingLeft: 36 }}
                  onFocus={focusOn} onBlur={e => focusOff(e, !!errors.correo)}
                />
              </div>
              {errors.correo && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.correo}</p>}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label style={lbl}>Dirección</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-3.5" style={{ color: "#9ca3af" }} />
              <textarea
                value={form.direccion ?? ""}
                onChange={e => set("direccion", e.target.value)}
                placeholder="Ej. Calle 45 #23-10, Bogotá"
                rows={2}
                style={{
                  ...inp(!!errors.direccion),
                  paddingLeft: 36,
                  resize: "none",
                  lineHeight: 1.6,
                }}
                onFocus={focusOn} onBlur={e => focusOff(e, !!errors.direccion)}
              />
            </div>
            {errors.direccion && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.direccion}</p>}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border py-2.5 text-sm font-semibold transition"
              style={{ borderColor: "#e5e7eb", color: "#374151", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#1d4ed8", color: "#fff",
                fontFamily: "'Poppins', sans-serif",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.75 : 1,
                boxShadow: "0 4px 14px rgba(29,78,216,0.3)",
              }}>
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {submitting ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </motion.div>
    </ModalOverlay>
  );
}
