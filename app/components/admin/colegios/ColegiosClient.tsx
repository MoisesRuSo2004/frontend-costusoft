"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Search, Pencil, Trash2, X, Save, Loader2,
  AlertTriangle, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight,
  MapPin, Shirt, RefreshCw, Eye,
} from "lucide-react";
import { useColegios, useColegiosCrud } from "@/app/hooks/useColegios";
import type { ColegioResponse, ColegioRequest } from "@/app/types/colegio";
import { useAuth } from "@/app/context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const lbl: React.CSSProperties = {
  display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500,
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

function fmtDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function focusOn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#0b3d91";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.1)";
}
function focusOff(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, err?: boolean) {
  e.currentTarget.style.borderColor = err ? "#fca5a5" : "#e5e7eb";
  e.currentTarget.style.boxShadow = "none";
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLIENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ColegiosClient() {
  const { user } = useAuth();
  const { colegios, total, totalPages, page, loading, error, recargar } = useColegios(10);
  const crud = useColegiosCrud();
  const esAdmin = user?.rol === "ADMIN";

  const [busqueda, setBusqueda] = useState("");
  const [modalCrear, setModalCrear] = useState(false);
  const [editando, setEditando] = useState<ColegioResponse | null>(null);
  const [eliminando, setEliminando] = useState<ColegioResponse | null>(null);
  const [detalleColegio, setDetalleColegio] = useState<ColegioResponse | null>(null);
  const [toast, setToast] = useState<{ tipo: "ok" | "err"; msg: string } | null>(null);

  const showToast = (tipo: "ok" | "err", msg: string) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const filtrados = colegios.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.direccion ?? "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCrear = async (data: ColegioRequest) => {
    try {
      await crud.crear(data);
      setModalCrear(false);
      showToast("ok", "Colegio creado correctamente");
      recargar(page);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Error al crear colegio");
    }
  };

  const handleEditar = async (data: ColegioRequest) => {
    if (!editando) return;
    try {
      await crud.actualizar(editando.id, data);
      setEditando(null);
      showToast("ok", "Colegio actualizado correctamente");
      recargar(page);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Error al actualizar colegio");
    }
  };

  const handleEliminar = async () => {
    if (!eliminando) return;
    try {
      await crud.eliminar(eliminando.id);
      setEliminando(null);
      showToast("ok", "Colegio eliminado correctamente");
      recargar(page);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Error al eliminar colegio");
    }
  };

  const handleVerDetalle = async (c: ColegioResponse) => {
    setDetalleColegio(c);
    await crud.cargarDetalle(c.id);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-5 right-5 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-lg"
            style={{
              borderColor: toast.tipo === "ok" ? "#bbf7d0" : "#fecaca",
              backgroundColor: toast.tipo === "ok" ? "#f0fdf4" : "#fef2f2",
              minWidth: 280,
            }}>
            {toast.tipo === "ok"
              ? <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
              : <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />}
            <p className="text-sm font-medium" style={{ color: toast.tipo === "ok" ? "#15803d" : "#991b1b", fontFamily: "'Poppins', sans-serif" }}>
              {toast.msg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="rounded-[28px] border px-6 py-5"
        style={{ borderColor: "#dbe4ff", background: "linear-gradient(135deg, rgba(11,61,145,0.07) 0%, rgba(73,194,27,0.06) 100%)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(11,61,145,0.10)" }}>
              <Building2 size={24} style={{ color: "#0b3d91" }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                Colegios
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
                {total} colegio{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => recargar(page)} disabled={loading}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all"
              style={{ borderColor: "#d0d5dd", backgroundColor: "#fff", color: "#374151", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.color = "#0b3d91"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d5dd"; e.currentTarget.style.color = "#374151"; }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setModalCrear(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: "#0b3d91", border: "none", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#49c21b")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0b3d91")}>
              <Plus size={16} /> Nuevo Colegio
            </button>
          </div>
        </div>
      </div>

      {/* ── ERROR ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
            <AlertCircle size={18} style={{ color: "#dc2626" }} />
            <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BUSCADOR ────────────────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
        <input
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o dirección…"
          style={{ ...inp(), paddingLeft: 38, fontSize: 13 }}
          onFocus={focusOn} onBlur={e => focusOff(e)}
        />
      </div>

      {/* ── TABLA ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 size={20} className="animate-spin" style={{ color: "#0b3d91" }} />
            <p className="text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>Cargando colegios…</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Building2 size={36} style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              {busqueda ? "No se encontraron coincidencias." : "No hay colegios registrados aún."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  {["Colegio", "Dirección", "Uniformes", "Creado", "Acciones"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", borderBottom: "1px solid #eaecf0", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c, i) => (
                  <motion.tr key={c.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>

                    {/* Nombre */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                          style={{ backgroundColor: "rgba(11,61,145,0.08)" }}>
                          <Building2 size={15} style={{ color: "#0b3d91" }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                          {c.nombre}
                        </p>
                      </div>
                    </td>

                    {/* Dirección */}
                    <td className="px-5 py-3.5">
                      {c.direccion ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} style={{ color: "#9ca3af", flexShrink: 0 }} />
                          <span className="text-sm" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                            {c.direccion}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: "#d1d5db" }}>—</span>
                      )}
                    </td>

                    {/* Uniformes */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: c.totalUniformes > 0 ? "rgba(11,61,145,0.08)" : "#f3f4f6",
                          color: c.totalUniformes > 0 ? "#0b3d91" : "#9ca3af",
                        }}>
                        <Shirt size={11} />
                        {c.totalUniformes} uniforme{c.totalUniformes !== 1 ? "s" : ""}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                        {fmtDate(c.createdAt)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <ActionBtn onClick={() => handleVerDetalle(c)} color="#0b3d91" title="Ver detalle">
                          <Eye size={13} />
                        </ActionBtn>
                        <ActionBtn onClick={() => setEditando(c)} color="#0b3d91" title="Editar">
                          <Pencil size={13} />
                        </ActionBtn>
                        {esAdmin && (
                          <ActionBtn onClick={() => setEliminando(c)} color="#dc2626" title="Eliminar" danger>
                            <Trash2 size={13} />
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
            <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              Página {page + 1} de {totalPages} · {total} colegios
            </p>
            <div className="flex items-center gap-1">
              <PagBtn onClick={() => recargar(page - 1)} disabled={page === 0}><ChevronLeft size={14} /></PagBtn>
              {Array.from({ length: totalPages }, (_, i) => (
                <PagBtn key={i} onClick={() => recargar(i)} active={i === page}>{i + 1}</PagBtn>
              ))}
              <PagBtn onClick={() => recargar(page + 1)} disabled={page >= totalPages - 1}><ChevronRight size={14} /></PagBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL CREAR ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalCrear && (
          <ColegioFormModal
            titulo="Nuevo Colegio"
            submitting={crud.submitting}
            onClose={() => setModalCrear(false)}
            onSubmit={handleCrear}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL EDITAR ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editando && (
          <ColegioFormModal
            titulo="Editar Colegio"
            inicial={{ nombre: editando.nombre, direccion: editando.direccion ?? "" }}
            submitting={crud.submitting}
            onClose={() => setEditando(null)}
            onSubmit={handleEditar}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL ELIMINAR ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {eliminando && (
          <ConfirmModal
            titulo="Eliminar Colegio"
            mensaje={`¿Seguro que deseas eliminar "${eliminando.nombre}"? Esta acción no se puede deshacer.`}
            submitting={crud.submitting}
            onConfirm={handleEliminar}
            onClose={() => setEliminando(null)}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL DETALLE ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {detalleColegio && (
          <DetalleModal
            colegio={detalleColegio}
            detalle={crud.detalle}
            loading={crud.loadingDetalle}
            onClose={() => { setDetalleColegio(null); crud.limpiarDetalle(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES UI
// ─────────────────────────────────────────────────────────────────────────────

function ActionBtn({ onClick, color, title, danger, children }: {
  onClick: () => void; color: string; title: string; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} title={title}
      className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
      style={{ backgroundColor: danger ? "#fef2f2" : `${color}10`, border: "none", cursor: "pointer" }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = danger ? "#fecaca" : `${color}22`)}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = danger ? "#fef2f2" : `${color}10`)}>
      <span style={{ color }}>{children}</span>
    </button>
  );
}

function PagBtn({ onClick, disabled, active, children }: {
  onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: active ? 700 : 500, fontFamily: "'Poppins', sans-serif",
        backgroundColor: active ? "#0b3d91" : "transparent",
        color: active ? "#fff" : "#6b7280",
        border: active ? "none" : "1px solid #e5e7eb",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL FORMULARIO (CREAR / EDITAR)
// ─────────────────────────────────────────────────────────────────────────────

function ColegioFormModal({
  titulo, inicial, submitting, onClose, onSubmit,
}: {
  titulo: string;
  inicial?: { nombre: string; direccion: string };
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: ColegioRequest) => Promise<void>;
}) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [direccion, setDireccion] = useState(inicial?.direccion ?? "");
  const [errors, setErrors] = useState<{ nombre?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { nombre?: string } = {};
    if (!nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (nombre.trim().length > 150) errs.nombre = "Máximo 150 caracteres";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    await onSubmit({ nombre: nombre.trim(), direccion: direccion.trim() || undefined });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader icon={<Building2 size={20} style={{ color: "#0b3d91" }} />} titulo={titulo} onClose={onClose} />
      <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
        <div>
          <label style={lbl}>Nombre del colegio <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            value={nombre} onChange={e => { setNombre(e.target.value); setErrors({}); }}
            placeholder="Ej. Colegio San Martín"
            maxLength={150}
            style={inp(!!errors.nombre)}
            onFocus={focusOn} onBlur={e => focusOff(e, !!errors.nombre)}
          />
          {errors.nombre && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>{errors.nombre}</p>}
        </div>

        <div>
          <label style={lbl}>Dirección <span style={{ color: "#9ca3af", fontSize: 11, textTransform: "none" }}>(opcional)</span></label>
          <textarea
            value={direccion} onChange={e => setDireccion(e.target.value)}
            placeholder="Ej. Cra. 15 # 23-45, Bogotá"
            rows={2}
            maxLength={250}
            style={{ ...inp(), resize: "none", height: "auto" }}
            onFocus={focusOn} onBlur={e => focusOff(e)}
          />
          <p className="mt-1 text-xs text-right" style={{ color: "#9ca3af" }}>{direccion.length}/250</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={submitting}
            className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all"
            style={{ borderColor: "#d0d5dd", color: "#374151", backgroundColor: "#fff", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: submitting ? "#3b82f6" : "#0b3d91", border: "none", fontFamily: "'Poppins', sans-serif", cursor: submitting ? "not-allowed" : "pointer" }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = "#49c21b"; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = "#0b3d91"; }}>
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Guardando…</> : <><Save size={14} /> Guardar</>}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL CONFIRMAR ELIMINAR
// ─────────────────────────────────────────────────────────────────────────────

function ConfirmModal({ titulo, mensaje, submitting, onConfirm, onClose }: {
  titulo: string; mensaje: string; submitting: boolean;
  onConfirm: () => Promise<void>; onClose: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader icon={<AlertTriangle size={20} style={{ color: "#dc2626" }} />} titulo={titulo} onClose={onClose} danger />
      <div className="px-6 py-5 flex flex-col gap-5">
        <p className="text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif", lineHeight: 1.6 }}>{mensaje}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={submitting}
            className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
            style={{ borderColor: "#d0d5dd", color: "#374151", backgroundColor: "#fff", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#dc2626", border: "none", fontFamily: "'Poppins', sans-serif", cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Eliminando…</> : <><Trash2 size={14} /> Eliminar</>}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DETALLE
// ─────────────────────────────────────────────────────────────────────────────

function DetalleModal({ colegio, detalle, loading, onClose }: {
  colegio: ColegioResponse;
  detalle: import("@/app/types/colegio").ColegioConUniformes | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader icon={<Building2 size={20} style={{ color: "#0b3d91" }} />} titulo={colegio.nombre} onClose={onClose} />
      <div className="px-6 py-5 flex flex-col gap-4">
        {/* Info básica */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:grid-cols-2">
          {[
            { label: "Dirección", value: colegio.direccion || "—" },
            { label: "Uniformes", value: `${colegio.totalUniformes} tipo(s)` },
            { label: "Creado", value: fmtDate(colegio.createdAt) },
            { label: "Actualizado", value: fmtDate(colegio.updatedAt) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border px-4 py-3" style={{ borderColor: "#f0f0f4", backgroundColor: "#fafafa" }}>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>{label}</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Uniformes */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
            Uniformes asociados
          </p>
          {loading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={16} className="animate-spin" style={{ color: "#0b3d91" }} />
              <span className="text-sm" style={{ color: "#9ca3af" }}>Cargando uniformes…</span>
            </div>
          ) : !detalle || detalle.uniformes.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border px-4 py-3"
              style={{ borderColor: "#f0f0f4", backgroundColor: "#fafafa" }}>
              <Shirt size={15} style={{ color: "#d1d5db" }} />
              <span className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Sin uniformes registrados
              </span>
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#eaecf0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    {["Prenda", "Talla", "Género"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase"
                        style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", borderBottom: "1px solid #eaecf0" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detalle.uniformes.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td className="px-4 py-2.5 text-sm font-medium" style={{ color: "#111827" }}>{u.prenda}</td>
                      <td className="px-4 py-2.5 text-sm" style={{ color: "#6b7280" }}>{u.talla}</td>
                      <td className="px-4 py-2.5 text-sm" style={{ color: "#6b7280" }}>{u.genero}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <button onClick={onClose}
          className="w-full rounded-xl border py-2.5 text-sm font-medium"
          style={{ borderColor: "#d0d5dd", color: "#374151", backgroundColor: "#fff", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
          Cerrar
        </button>
      </div>
    </ModalOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVOS DE MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ backgroundColor: "#fff", boxShadow: "0 25px 80px rgba(0,0,0,0.18)" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalHeader({ icon, titulo, onClose, danger }: {
  icon: React.ReactNode; titulo: string; onClose: () => void; danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-5"
      style={{
        background: danger
          ? "linear-gradient(135deg, #fef2f2 0%, #fff 100%)"
          : "linear-gradient(135deg, rgba(11,61,145,0.06) 0%, #fff 100%)",
        borderBottom: "1px solid #f0f0f4",
      }}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl"
          style={{ backgroundColor: danger ? "#fef2f2" : "rgba(11,61,145,0.08)" }}>
          {icon}
        </div>
        <h2 className="text-base font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{titulo}</h2>
      </div>
      <button onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
        style={{ backgroundColor: "#f3f4f6", border: "none", cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fecaca")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f3f4f6")}>
        <X size={15} style={{ color: "#374151" }} />
      </button>
    </div>
  );
}
