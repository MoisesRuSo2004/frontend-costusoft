"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, RefreshCw, CheckCircle2, XCircle, Clock,
  Loader2, ChevronDown, ChevronUp, Building2, User, Calendar,
  X, AlertTriangle, Eye, Send, Search, Filter,
} from "lucide-react";
import { solicitudEspecialService } from "@/app/services/solicitudEspecialService";
import type {
  SolicitudEspecialAdminResponse,
  EstadoSolicitudEspecial,
} from "@/app/types/solicitudEspecial";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const TIPO_LABELS: Record<string, string> = {
  AJUSTE_TALLA:         "Ajuste de talla",
  PEDIDO_URGENTE:       "Pedido urgente",
  CAMBIO_FECHA_ENTREGA: "Cambio de fecha",
  CONSULTA_GENERAL:     "Consulta general",
  DEVOLUCION:           "Devolución",
};

const ESTADO_CONFIG: Record<EstadoSolicitudEspecial, {
  label: string; color: string; bg: string; icon: React.ReactNode;
}> = {
  PENDIENTE:   { label: "Pendiente",   color: "#d97706", bg: "#fef3c7", icon: <Clock size={12} /> },
  EN_REVISION: { label: "En revisión", color: "#2563eb", bg: "#eff6ff", icon: <Eye  size={12} /> },
  RESUELTA:    { label: "Resuelta",    color: "#16a34a", bg: "#f0fdf4", icon: <CheckCircle2 size={12} /> },
  RECHAZADA:   { label: "Rechazada",   color: "#dc2626", bg: "#fff1f2", icon: <XCircle size={12} /> },
};

interface Toast { id: number; type: "success" | "error"; msg: string; }

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DE GESTIÓN
// ─────────────────────────────────────────────────────────────────────────────

interface GestionModalProps {
  solicitud: SolicitudEspecialAdminResponse;
  onClose: () => void;
  onSuccess: (updated: SolicitudEspecialAdminResponse, msg: string) => void;
}

function GestionModal({ solicitud, onClose, onSuccess }: GestionModalProps) {
  const [estado, setEstado] = useState<EstadoSolicitudEspecial>(solicitud.estado);
  const [respuesta, setRespuesta] = useState(solicitud.respuesta ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit() {
    if (estado === "RESUELTA" && !respuesta.trim()) {
      setErr("Debes incluir una respuesta al resolver la solicitud.");
      return;
    }
    if (estado === "RECHAZADA" && !respuesta.trim()) {
      setErr("Debes indicar el motivo del rechazo.");
      return;
    }
    setSubmitting(true);
    setErr("");
    try {
      const updated = await solicitudEspecialService.gestionar(solicitud.id, {
        estado,
        respuesta: respuesta.trim() || undefined,
      });
      onSuccess(updated, `Solicitud actualizada a "${ESTADO_CONFIG[estado].label}"`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al gestionar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      key="overlay-gestion"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-3xl bg-white overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(15,23,42,0.20)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid #f3f4f6" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl flex-shrink-0"
              style={{ backgroundColor: "#f5f3ff" }}>
              <MessageSquare size={18} style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                Gestionar solicitud
              </h3>
              <p className="text-xs" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
                {solicitud.colegioNombre} · {TIPO_LABELS[solicitud.tipo] ?? solicitud.tipo}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition"
            style={{ color: "#9ca3af" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Detalle de la solicitud */}
          <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: "#f9fafb" }}>
            <p className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              Asunto
            </p>
            <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
              {solicitud.asunto}
            </p>
            <p className="text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              {solicitud.descripcion}
            </p>
          </div>

          {/* Cambiar estado */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              Cambiar estado
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["EN_REVISION", "RESUELTA", "RECHAZADA", "PENDIENTE"] as EstadoSolicitudEspecial[]).map((e) => {
                const cfg = ESTADO_CONFIG[e];
                const active = estado === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEstado(e)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all border"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      backgroundColor: active ? cfg.bg : "transparent",
                      borderColor: active ? cfg.color : "#e5e7eb",
                      color: active ? cfg.color : "#6b7280",
                    }}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Respuesta */}
          <div>
            <label className="block mb-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              Respuesta {(estado === "RESUELTA" || estado === "RECHAZADA") ? "*" : "(opcional)"}
            </label>
            <textarea
              rows={4}
              value={respuesta}
              onChange={e => { setRespuesta(e.target.value); setErr(""); }}
              placeholder="Escribe una respuesta para la institución…"
              style={{
                width: "100%", padding: "11px 14px",
                border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
                borderRadius: 12, fontSize: 14,
                fontFamily: "'Poppins', sans-serif",
                outline: "none", resize: "vertical",
                color: "#101828",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#7c3aed"; }}
              onBlur={e => { e.currentTarget.style.borderColor = err ? "#fca5a5" : "#e5e7eb"; }}
            />
            {err && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
                <AlertTriangle size={12} /> {err}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button type="button" onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition"
            style={{ backgroundColor: "#f3f4f6", color: "#374151", fontFamily: "'Poppins', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#e5e7eb"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: "#7c3aed", fontFamily: "'Poppins', sans-serif" }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = "#6d28d9"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#7c3aed"; }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Guardar cambios
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA SOLICITUD
// ─────────────────────────────────────────────────────────────────────────────

interface SolicitudCardProps {
  solicitud: SolicitudEspecialAdminResponse;
  onGestionar: (s: SolicitudEspecialAdminResponse) => void;
}

function SolicitudCard({ solicitud, onGestionar }: SolicitudCardProps) {
  const [expanded, setExpanded] = useState(false);
  const estadoCfg = ESTADO_CONFIG[solicitud.estado];

  return (
    <div className="rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: "#f0f0f4", backgroundColor: "#ffffff" }}>
      {/* Header row */}
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
          style={{ backgroundColor: "#f5f3ff" }}>
          <MessageSquare size={16} style={{ color: "#7c3aed" }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-1">
            <span className="text-sm font-bold truncate" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
              {solicitud.asunto}
            </span>
            <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold flex-shrink-0"
              style={{ backgroundColor: estadoCfg.bg, color: estadoCfg.color, fontFamily: "'Poppins', sans-serif" }}>
              {estadoCfg.icon}&nbsp;{estadoCfg.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
            <span className="flex items-center gap-1">
              <Building2 size={11} /> {solicitud.colegioNombre}
            </span>
            <span className="flex items-center gap-1">
              <User size={11} /> {solicitud.username}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {fmtDate(solicitud.createdAt)}
            </span>
            <span className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>
              {TIPO_LABELS[solicitud.tipo] ?? solicitud.tipo}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => onGestionar(solicitud)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition"
            style={{ backgroundColor: "#7c3aed", fontFamily: "'Poppins', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#6d28d9"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#7c3aed"; }}
          >
            <Send size={11} /> Gestionar
          </button>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition"
            style={{ color: "#9ca3af" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expandible */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
              {/* Descripción */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                  Descripción
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                  {solicitud.descripcion}
                </p>
              </div>

              {/* Respuesta del admin (si existe) */}
              {solicitud.respuesta && (
                <div className="rounded-xl p-3" style={{ backgroundColor: "#f0fdf4", borderLeft: "3px solid #16a34a" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: "#16a34a", fontFamily: "'Poppins', sans-serif" }}>
                    Respuesta · {fmtDateTime(solicitud.fechaRespuesta)}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                    {solicitud.respuesta}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN COLAPSABLE
// ─────────────────────────────────────────────────────────────────────────────

interface SeccionProps {
  titulo: string;
  count: number;
  color: string;
  bg: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Seccion({ titulo, count, color, bg, defaultOpen = false, children }: SeccionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl border overflow-hidden" style={{ borderColor: "#f0f0f4" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-5 py-4 transition"
        style={{ backgroundColor: bg, fontFamily: "'Poppins', sans-serif" }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color }}>{titulo}</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
            style={{ backgroundColor: color }}>
            {count}
          </span>
        </div>
        {open ? <ChevronUp size={16} style={{ color }} /> : <ChevronDown size={16} style={{ color }} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden", backgroundColor: "#ffffff" }}
          >
            <div className="p-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function SolicitudesInstitucionalesClient() {
  const [items, setItems] = useState<SolicitudEspecialAdminResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoSolicitudEspecial | "TODOS">("TODOS");
  const [gestionando, setGestionando] = useState<SolicitudEspecialAdminResponse | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const addToast = useCallback((type: Toast["type"], msg: string) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, type, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  // ── Carga ──────────────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const page = await solicitudEspecialService.listar({ size: 50, sort: "createdAt,desc" });
      setItems(page.content);
    } catch (e) {
      addToast("error", e instanceof Error ? e.message : "Error al cargar solicitudes.");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { void cargar(); }, [cargar]);

  // ── Gestionar callback ─────────────────────────────────────────────────────

  function handleSuccess(updated: SolicitudEspecialAdminResponse, msg: string) {
    setItems(prev => prev.map(s => s.id === updated.id ? updated : s));
    setGestionando(null);
    addToast("success", msg);
  }

  // ── Filtrado / búsqueda ────────────────────────────────────────────────────

  const filtered = items.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.asunto.toLowerCase().includes(q) ||
      s.colegioNombre.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      s.descripcion.toLowerCase().includes(q);
    const matchEstado = filterEstado === "TODOS" || s.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const pendientes   = filtered.filter(s => s.estado === "PENDIENTE");
  const enRevision   = filtered.filter(s => s.estado === "EN_REVISION");
  const resueltas    = filtered.filter(s => s.estado === "RESUELTA");
  const rechazadas   = filtered.filter(s => s.estado === "RECHAZADA");

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fc", fontFamily: "'Poppins', sans-serif" }}>
      {/* ── Toast stack ── */}
      <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-[60] flex flex-col gap-2 pointer-events-none items-end">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl pointer-events-auto"
              style={{
                backgroundColor: t.type === "success" ? "#16a34a" : "#dc2626",
                fontFamily: "'Poppins', sans-serif",
                maxWidth: "calc(100vw - 2rem)",
              }}
            >
              {t.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Header de página ── */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#f5f3ff" }}>
              <MessageSquare size={22} style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                Solicitudes Institucionales
              </h1>
              <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                {items.length} solicitud{items.length !== 1 ? "es" : ""} registrada{items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void cargar()}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60"
            style={{ backgroundColor: "#f5f3ff", color: "#7c3aed", fontFamily: "'Poppins', sans-serif" }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#ede9fe"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f5f3ff"; }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>

        {/* ── Barra de búsqueda + filtros ── */}
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "#9ca3af" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por asunto, colegio, usuario…"
              className="w-full rounded-2xl border pl-9 pr-4 py-2.5 text-sm"
              style={{
                borderColor: "#e5e7eb", outline: "none",
                fontFamily: "'Poppins', sans-serif", color: "#101828",
                backgroundColor: "#ffffff",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#7c3aed"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: "#9ca3af" }} />
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value as EstadoSolicitudEspecial | "TODOS")}
              className="rounded-2xl border px-3 py-2.5 text-sm"
              style={{
                borderColor: "#e5e7eb", outline: "none",
                fontFamily: "'Poppins', sans-serif", color: "#374151",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_REVISION">En revisión</option>
              <option value="RESUELTA">Resuelta</option>
              <option value="RECHAZADA">Rechazada</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div className="px-6 pb-12 space-y-4">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 size={22} className="animate-spin" style={{ color: "#7c3aed" }} />
            <span className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              Cargando solicitudes…
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl"
              style={{ backgroundColor: "#f5f3ff" }}>
              <MessageSquare size={28} style={{ color: "#c4b5fd" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              {search || filterEstado !== "TODOS" ? "Sin resultados para tu búsqueda" : "No hay solicitudes registradas"}
            </p>
            <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              {search || filterEstado !== "TODOS"
                ? "Prueba con otros filtros o términos de búsqueda"
                : "Cuando una institución envíe una solicitud aparecerá aquí"}
            </p>
          </div>
        ) : (
          <>
            {pendientes.length > 0 && (
              <Seccion
                titulo="Pendientes"
                count={pendientes.length}
                color="#d97706"
                bg="#fffbeb"
                defaultOpen
              >
                {pendientes.map(s => (
                  <SolicitudCard key={s.id} solicitud={s} onGestionar={setGestionando} />
                ))}
              </Seccion>
            )}

            {enRevision.length > 0 && (
              <Seccion
                titulo="En revisión"
                count={enRevision.length}
                color="#2563eb"
                bg="#eff6ff"
                defaultOpen
              >
                {enRevision.map(s => (
                  <SolicitudCard key={s.id} solicitud={s} onGestionar={setGestionando} />
                ))}
              </Seccion>
            )}

            {resueltas.length > 0 && (
              <Seccion
                titulo="Resueltas"
                count={resueltas.length}
                color="#16a34a"
                bg="#f0fdf4"
              >
                {resueltas.map(s => (
                  <SolicitudCard key={s.id} solicitud={s} onGestionar={setGestionando} />
                ))}
              </Seccion>
            )}

            {rechazadas.length > 0 && (
              <Seccion
                titulo="Rechazadas"
                count={rechazadas.length}
                color="#dc2626"
                bg="#fff1f2"
              >
                {rechazadas.map(s => (
                  <SolicitudCard key={s.id} solicitud={s} onGestionar={setGestionando} />
                ))}
              </Seccion>
            )}
          </>
        )}
      </div>

      {/* ── Modal de gestión ── */}
      <AnimatePresence>
        {gestionando && (
          <GestionModal
            key={gestionando.id}
            solicitud={gestionando}
            onClose={() => setGestionando(null)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
