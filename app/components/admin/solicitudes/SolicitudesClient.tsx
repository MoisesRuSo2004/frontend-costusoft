"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, RefreshCw, CheckCircle2, XCircle, AlertCircle,
  Loader2, ChevronDown, ChevronUp, Package, ArrowDownToLine,
  ArrowUpFromLine, ShoppingCart, Clock, Hash, Building2,
  User, Calendar, X, AlertTriangle,
} from "lucide-react";
import { useSolicitudes } from "@/app/hooks/useSolicitudes";
import type { PedidoResponse } from "@/app/types/pedido";
import type { EntradaResponse } from "@/app/types/entrada";
import type { SalidaResponse } from "@/app/types/salida";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

interface Toast { id: number; type: "success" | "error"; msg: string; }

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE MOTIVO (cancelar / rechazar)
// ─────────────────────────────────────────────────────────────────────────────

interface MotivoModalProps {
  titulo: string;
  descripcion: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}

function MotivoModal({ titulo, descripcion, submitting, onClose, onConfirm }: MotivoModalProps) {
  const [motivo, setMotivo] = useState("");
  const [err, setErr] = useState(false);

  function handleConfirm() {
    if (!motivo.trim()) { setErr(true); return; }
    onConfirm(motivo.trim());
  }

  return (
    <motion.div key="overlay-motivo"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-3xl bg-white p-7"
        style={{ boxShadow: "0 24px 64px rgba(15,23,42,0.20)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0"
            style={{ backgroundColor: "#fff7ed" }}>
            <AlertTriangle size={20} style={{ color: "#ea580c" }} />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>{titulo}</h3>
            <p className="text-xs" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>{descripcion}</p>
          </div>
        </div>
        <div className="mb-5">
          <label className="block mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>Motivo *</label>
          <textarea
            rows={3}
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setErr(false); }}
            placeholder="Describe el motivo…"
            style={{
              width: "100%", padding: "11px 14px",
              border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
              borderRadius: 10, fontSize: 14, fontFamily: "'Poppins', sans-serif",
              color: "#111827", outline: "none", resize: "none",
              boxSizing: "border-box",
            }}
          />
          {err && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>El motivo es obligatorio</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-xl border py-2.5 text-sm font-semibold"
            style={{ borderColor: "#e5e7eb", color: "#374151", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={submitting}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: "#ea580c", color: "#fff", fontFamily: "'Poppins', sans-serif", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.75 : 1 }}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Confirmar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN COLAPSABLE
// ─────────────────────────────────────────────────────────────────────────────

interface SeccionProps {
  titulo: string;
  count: number;
  loading: boolean;
  color: string;
  bg: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Seccion({ titulo, count, loading, color, bg, icon, children }: SeccionProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border bg-white overflow-hidden"
      style={{ borderColor: "#f3f4f6", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 transition hover:bg-gray-50"
        style={{ cursor: "pointer" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: bg }}>
            <span style={{ color }}>{icon}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>{titulo}</p>
          </div>
          <span className="ml-1 flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold"
            style={{ backgroundColor: count > 0 ? bg : "#f3f4f6", color: count > 0 ? color : "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
            {loading ? "…" : count}
          </span>
        </div>
        {open ? <ChevronUp size={16} style={{ color: "#9ca3af" }} /> : <ChevronDown size={16} style={{ color: "#9ca3af" }} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}>
            <div style={{ borderTop: "1px solid #f9fafb" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE PEDIDO CALCULADO
// ─────────────────────────────────────────────────────────────────────────────

interface PedidoCardProps {
  pedido: PedidoResponse;
  submitting: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

function PedidoCard({ pedido, submitting, onConfirmar, onCancelar }: PedidoCardProps) {
  const [open, setOpen] = useState(false);
  const disponible = pedido.disponibleCompleto;
  const pct = pedido.porcentajeCumplimiento ?? 0;

  return (
    <div className="px-6 py-4" style={{ borderBottom: "1px solid #f9fafb" }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Info principal */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: "#eff6ff" }}>
            <ShoppingCart size={18} style={{ color: "#1d4ed8" }} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                {pedido.numeroPedido}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${disponible ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                {disponible ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                {disponible ? "Stock disponible" : `${pct.toFixed(0)}% disponible`}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
              <span className="inline-flex items-center gap-1"><Building2 size={11} />{pedido.colegio.nombre}</span>
              <span className="inline-flex items-center gap-1"><User size={11} />{pedido.creadoPor}</span>
              <span className="inline-flex items-center gap-1"><Calendar size={11} />{fmtDate(pedido.fechaCreacion)}</span>
              <span className="inline-flex items-center gap-1"><Hash size={11} />{pedido.detalles.length} prenda{pedido.detalles.length !== 1 ? "s" : ""}</span>
            </div>
            {pedido.insumoLimitante && (
              <p className="mt-1.5 text-xs" style={{ color: "#ea580c", fontFamily: "'Poppins', sans-serif" }}>
                Insumo limitante: <span className="font-semibold">{pedido.insumoLimitante}</span>
              </p>
            )}
          </div>
        </div>
        {/* Acciones */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setOpen(o => !o)}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition"
            style={{ borderColor: "#e5e7eb", color: "#374151", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Detalles
          </button>
          <button onClick={onCancelar} disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition"
            style={{ backgroundColor: "#fff1f2", color: "#e11d48", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Poppins', sans-serif" }}>
            <XCircle size={13} />Cancelar
          </button>
          <button onClick={onConfirmar} disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition"
            style={{ backgroundColor: "#1d4ed8", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Poppins', sans-serif", boxShadow: "0 2px 8px rgba(29,78,216,0.25)" }}>
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Confirmar
          </button>
        </div>
      </div>

      {/* Acordeón de detalles */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div className="mt-4 rounded-xl overflow-hidden" style={{ border: "1px solid #f3f4f6" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    {["Uniforme", "Talla", "Cantidad", "Disponible"].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold uppercase tracking-wider"
                        style={{ color: "#6b7280", fontSize: 10, fontFamily: "'Poppins', sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedido.detalles.map(d => (
                    <tr key={d.id} style={{ borderTop: "1px solid #f9fafb" }}>
                      <td className="px-4 py-2 font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>{d.nombreUniforme}</td>
                      <td className="px-4 py-2" style={{ color: "#667085" }}>{d.talla}</td>
                      <td className="px-4 py-2" style={{ color: "#667085" }}>{d.cantidad}</td>
                      <td className="px-4 py-2">
                        {d.disponibleIndividual === null ? (
                          <span style={{ color: "#9ca3af" }}>—</span>
                        ) : d.disponibleIndividual ? (
                          <span className="inline-flex items-center gap-1" style={{ color: "#16a34a" }}><CheckCircle2 size={11} />Sí</span>
                        ) : (
                          <span className="inline-flex items-center gap-1" style={{ color: "#dc2626" }}><XCircle size={11} />No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pedido.observaciones && (
              <p className="mt-3 text-xs px-1" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
                <span className="font-semibold">Obs:</span> {pedido.observaciones}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE ENTRADA PENDIENTE
// ─────────────────────────────────────────────────────────────────────────────

interface EntradaCardProps {
  entrada: EntradaResponse;
  submitting: boolean;
  onConfirmar: () => void;
  onRechazar: () => void;
}

function EntradaCard({ entrada, submitting, onConfirmar, onRechazar }: EntradaCardProps) {
  const [open, setOpen] = useState(false);
  const total = entrada.detalles.reduce((s, d) => s + d.cantidad, 0);

  return (
    <div className="px-6 py-4" style={{ borderBottom: "1px solid #f9fafb" }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: "#f0fdf4" }}>
            <ArrowDownToLine size={18} style={{ color: "#16a34a" }} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                Entrada #{entrada.id}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: "#fef9c3", color: "#a16207" }}>
                <Clock size={11} />Pendiente
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
              {entrada.proveedorNombre && (
                <span className="inline-flex items-center gap-1"><Building2 size={11} />{entrada.proveedorNombre}</span>
              )}
              <span className="inline-flex items-center gap-1"><Calendar size={11} />{fmtDate(entrada.fecha)}</span>
              <span className="inline-flex items-center gap-1"><Package size={11} />{entrada.detalles.length} insumo{entrada.detalles.length !== 1 ? "s" : ""} · {total} unid.</span>
            </div>
            {entrada.descripcion && (
              <p className="mt-1 text-xs truncate max-w-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                {entrada.descripcion}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setOpen(o => !o)}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "#e5e7eb", color: "#374151", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Ver
          </button>
          <button onClick={onRechazar} disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
            style={{ backgroundColor: "#fff1f2", color: "#e11d48", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Poppins', sans-serif" }}>
            <XCircle size={13} />Rechazar
          </button>
          <button onClick={onConfirmar} disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
            style={{ backgroundColor: "#16a34a", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Poppins', sans-serif", boxShadow: "0 2px 8px rgba(22,163,74,0.25)" }}>
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Confirmar
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div className="mt-4 rounded-xl overflow-hidden" style={{ border: "1px solid #f3f4f6" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    {["Insumo", "Cantidad", "Unidad"].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold uppercase tracking-wider"
                        style={{ color: "#6b7280", fontSize: 10, fontFamily: "'Poppins', sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entrada.detalles.map(d => (
                    <tr key={d.id} style={{ borderTop: "1px solid #f9fafb" }}>
                      <td className="px-4 py-2 font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>{d.nombreInsumo}</td>
                      <td className="px-4 py-2" style={{ color: "#667085" }}>{d.cantidad}</td>
                      <td className="px-4 py-2" style={{ color: "#9ca3af" }}>{d.unidadMedida}</td>
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

// ─────────────────────────────────────────────────────────────────────────────
// CARD DE SALIDA PENDIENTE
// ─────────────────────────────────────────────────────────────────────────────

interface SalidaCardProps {
  salida: SalidaResponse;
  submitting: boolean;
  onConfirmar: () => void;
  onRechazar: () => void;
}

function SalidaCard({ salida, submitting, onConfirmar, onRechazar }: SalidaCardProps) {
  const [open, setOpen] = useState(false);
  const total = salida.detalles.reduce((s, d) => s + d.cantidad, 0);

  return (
    <div className="px-6 py-4" style={{ borderBottom: "1px solid #f9fafb" }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{ backgroundColor: "#fef3c7" }}>
            <ArrowUpFromLine size={18} style={{ color: "#d97706" }} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                Salida #{salida.id}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: "#fef9c3", color: "#a16207" }}>
                <Clock size={11} />Pendiente
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
              {salida.colegioNombre && (
                <span className="inline-flex items-center gap-1"><Building2 size={11} />{salida.colegioNombre}</span>
              )}
              <span className="inline-flex items-center gap-1"><User size={11} />{salida.creadoPor}</span>
              <span className="inline-flex items-center gap-1"><Calendar size={11} />{fmtDate(salida.fecha)}</span>
              <span className="inline-flex items-center gap-1"><Package size={11} />{salida.detalles.length} insumo{salida.detalles.length !== 1 ? "s" : ""} · {total} unid.</span>
            </div>
            {salida.descripcion && (
              <p className="mt-1 text-xs truncate max-w-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                {salida.descripcion}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setOpen(o => !o)}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "#e5e7eb", color: "#374151", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Ver
          </button>
          <button onClick={onRechazar} disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
            style={{ backgroundColor: "#fff1f2", color: "#e11d48", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Poppins', sans-serif" }}>
            <XCircle size={13} />Rechazar
          </button>
          <button onClick={onConfirmar} disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
            style={{ backgroundColor: "#d97706", color: "#fff", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Poppins', sans-serif", boxShadow: "0 2px 8px rgba(217,119,6,0.25)" }}>
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Confirmar
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div className="mt-4 rounded-xl overflow-hidden" style={{ border: "1px solid #f3f4f6" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    {["Insumo", "Cantidad", "Unidad"].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-semibold uppercase tracking-wider"
                        style={{ color: "#6b7280", fontSize: 10, fontFamily: "'Poppins', sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {salida.detalles.map(d => (
                    <tr key={d.id} style={{ borderTop: "1px solid #f9fafb" }}>
                      <td className="px-4 py-2 font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>{d.nombreInsumo}</td>
                      <td className="px-4 py-2" style={{ color: "#667085" }}>{d.cantidad}</td>
                      <td className="px-4 py-2" style={{ color: "#9ca3af" }}>{d.unidadMedida}</td>
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

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function SolicitudesClient() {
  const sol = useSolicitudes();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(0);

  // Motivo modal state
  const [motivoModal, setMotivoModal] = useState<{
    titulo: string;
    descripcion: string;
    onConfirm: (motivo: string) => Promise<void>;
  } | null>(null);

  function toast(type: "success" | "error", msg: string) {
    const id = nextId;
    setNextId(n => n + 1);
    setToasts(t => [...t, { id, type, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }

  async function withToast(fn: () => Promise<boolean>, ok: string, fail: string) {
    const success = await fn();
    toast(success ? "success" : "error", success ? ok : fail);
  }

  function openMotivo(titulo: string, descripcion: string, onConfirm: (m: string) => Promise<void>) {
    setMotivoModal({ titulo, descripcion, onConfirm });
  }

  const totalPendiente = sol.totalSolicitudes;

  return (
    <section className="flex flex-col gap-6 pb-8">

      {/* ── Header ── */}
      <div className="rounded-[28px] border px-6 py-6"
        style={{ borderColor: "#e0e7ff", background: "linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(15,23,42,0.05) 100%)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#4f46e5", fontFamily: "'Poppins', sans-serif" }}>
              Bandeja unificada
            </p>
            <h1 className="mt-2 text-2xl font-semibold"
              style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
              Solicitudes pendientes
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#475467", fontFamily: "'Poppins', sans-serif" }}>
              {sol.loading ? "Cargando…" : `${totalPendiente} solicitud${totalPendiente !== 1 ? "es" : ""} esperando acción`}
            </p>
          </div>
          <button onClick={sol.reload}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition"
            style={{ borderColor: "#c7d2fe", backgroundColor: "#fff", color: "#4f46e5", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
            <RefreshCw size={15} className={sol.loading ? "animate-spin" : ""} />
            Recargar
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pedidos", value: sol.pedidosCalculados.length, loading: sol.loadingPedidos, color: "#1d4ed8", bg: "#eff6ff", icon: <ShoppingCart size={16} /> },
          { label: "Entradas", value: sol.entradasPendientes.length, loading: sol.loadingEntradas, color: "#16a34a", bg: "#f0fdf4", icon: <ArrowDownToLine size={16} /> },
          { label: "Salidas",  value: sol.salidasPendientes.length,  loading: sol.loadingSalidas,  color: "#d97706", bg: "#fef3c7", icon: <ArrowUpFromLine size={16} /> },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border p-5"
            style={{ borderColor: "#f3f4f6", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: k.color }}>{k.icon}</span>
              <p className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>{k.label}</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: k.color, fontFamily: "'Poppins', sans-serif" }}>
              {k.loading ? <Loader2 size={22} className="animate-spin" style={{ display: "inline" }} /> : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Error global ── */}
      {sol.error && (
        <div className="flex items-center gap-3 rounded-2xl border px-5 py-4"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
          <AlertCircle size={16} style={{ color: "#dc2626" }} />
          <p className="text-sm flex-1" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{sol.error}</p>
          <button onClick={sol.clearMessages} style={{ color: "#9ca3af", cursor: "pointer" }}><X size={14} /></button>
        </div>
      )}

      {/* ── Estado vacío ── */}
      {!sol.loading && totalPendiente === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 rounded-2xl border bg-white"
          style={{ borderColor: "#f3f4f6" }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: "#f9fafb" }}>
            <Inbox size={28} style={{ color: "#d1d5db" }} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              Todo al día
            </p>
            <p className="text-sm mt-1" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              No hay solicitudes pendientes en este momento.
            </p>
          </div>
        </div>
      )}

      {/* ── Sección Pedidos CALCULADOS ── */}
      {(sol.pedidosCalculados.length > 0 || sol.loadingPedidos) && (
        <Seccion
          titulo="Pedidos calculados"
          count={sol.pedidosCalculados.length}
          loading={sol.loadingPedidos}
          color="#1d4ed8" bg="#eff6ff"
          icon={<ShoppingCart size={16} />}>
          {sol.loadingPedidos ? (
            <div className="flex items-center justify-center gap-2 py-10">
              <Loader2 size={18} className="animate-spin" style={{ color: "#1d4ed8" }} />
              <span className="text-sm" style={{ color: "#667085" }}>Cargando pedidos…</span>
            </div>
          ) : sol.pedidosCalculados.map(p => (
            <PedidoCard key={p.id} pedido={p}
              submitting={sol.submitting}
              onConfirmar={() => withToast(
                () => sol.confirmarPedido(p.id),
                `Pedido ${p.numeroPedido} confirmado. Stock reservado.`,
                "Error al confirmar el pedido"
              )}
              onCancelar={() => openMotivo(
                "Cancelar pedido",
                `Pedido ${p.numeroPedido} — ${p.colegio.nombre}`,
                async (motivo) => {
                  await withToast(
                    () => sol.cancelarPedido(p.id, motivo),
                    "Pedido cancelado",
                    "Error al cancelar el pedido"
                  );
                  setMotivoModal(null);
                }
              )}
            />
          ))}
        </Seccion>
      )}

      {/* ── Sección Entradas PENDIENTES ── */}
      {(sol.entradasPendientes.length > 0 || sol.loadingEntradas) && (
        <Seccion
          titulo="Entradas de insumos"
          count={sol.entradasPendientes.length}
          loading={sol.loadingEntradas}
          color="#16a34a" bg="#f0fdf4"
          icon={<ArrowDownToLine size={16} />}>
          {sol.loadingEntradas ? (
            <div className="flex items-center justify-center gap-2 py-10">
              <Loader2 size={18} className="animate-spin" style={{ color: "#16a34a" }} />
              <span className="text-sm" style={{ color: "#667085" }}>Cargando entradas…</span>
            </div>
          ) : sol.entradasPendientes.map(e => (
            <EntradaCard key={e.id} entrada={e}
              submitting={sol.submitting}
              onConfirmar={() => withToast(
                () => sol.confirmarEntrada(e.id),
                `Entrada #${e.id} confirmada. Stock incrementado.`,
                "Error al confirmar la entrada"
              )}
              onRechazar={() => openMotivo(
                "Rechazar entrada",
                `Entrada #${e.id}${e.proveedorNombre ? ` — ${e.proveedorNombre}` : ""}`,
                async (motivo) => {
                  await withToast(
                    () => sol.rechazarEntrada(e.id, motivo),
                    "Entrada rechazada",
                    "Error al rechazar la entrada"
                  );
                  setMotivoModal(null);
                }
              )}
            />
          ))}
        </Seccion>
      )}

      {/* ── Sección Salidas PENDIENTES ── */}
      {(sol.salidasPendientes.length > 0 || sol.loadingSalidas) && (
        <Seccion
          titulo="Salidas de insumos"
          count={sol.salidasPendientes.length}
          loading={sol.loadingSalidas}
          color="#d97706" bg="#fef3c7"
          icon={<ArrowUpFromLine size={16} />}>
          {sol.loadingSalidas ? (
            <div className="flex items-center justify-center gap-2 py-10">
              <Loader2 size={18} className="animate-spin" style={{ color: "#d97706" }} />
              <span className="text-sm" style={{ color: "#667085" }}>Cargando salidas…</span>
            </div>
          ) : sol.salidasPendientes.map(s => (
            <SalidaCard key={s.id} salida={s}
              submitting={sol.submitting}
              onConfirmar={() => withToast(
                () => sol.confirmarSalida(s.id),
                `Salida #${s.id} confirmada. Stock descontado.`,
                "Error al confirmar la salida"
              )}
              onRechazar={() => openMotivo(
                "Rechazar salida",
                `Salida #${s.id}${s.colegioNombre ? ` — ${s.colegioNombre}` : ""}`,
                async (motivo) => {
                  await withToast(
                    () => sol.rechazarSalida(s.id, motivo),
                    "Salida rechazada",
                    "Error al rechazar la salida"
                  );
                  setMotivoModal(null);
                }
              )}
            />
          ))}
        </Seccion>
      )}

      {/* ── Modal motivo (cancelar/rechazar) ── */}
      <AnimatePresence>
        {motivoModal && (
          <MotivoModal
            titulo={motivoModal.titulo}
            descripcion={motivoModal.descripcion}
            submitting={sol.submitting}
            onClose={() => setMotivoModal(null)}
            onConfirm={motivoModal.onConfirm}
          />
        )}
      </AnimatePresence>

      {/* ── Toast stack ── */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              className="flex items-center gap-3 rounded-2xl px-5 py-3.5"
              style={{
                backgroundColor: t.type === "success" ? "#ecfdf5" : "#fef2f2",
                border: `1.5px solid ${t.type === "success" ? "#6ee7b7" : "#fecaca"}`,
                boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                minWidth: 260, maxWidth: 380,
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
