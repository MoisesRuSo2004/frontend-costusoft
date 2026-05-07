"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownToLine, ArrowUpFromLine, CheckCheck,
  ClipboardList, Inbox, RefreshCw, ShieldAlert, XCircle,
} from "lucide-react";
import { useWarehouseRequests } from "@/app/hooks/useWarehouseRequests";
import type { EntradaResponse } from "@/app/types/entrada";
import type { SalidaResponse } from "@/app/types/salida";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtFecha(s: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s));
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, accent, icon: Icon,
}: {
  label: string; value: number; sub: string; accent: string; icon: typeof ClipboardList;
}) {
  return (
    <div className="rounded-3xl border p-5" style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>{label}</p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>{value}</p>
          <p className="mt-2 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>{sub}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accent}18`, color: accent }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

// ─── Estado badge ─────────────────────────────────────────────────────────────

const ESTADO_STYLES = {
  PENDIENTE:  { label: "Pendiente",  bg: "#fff7e6", color: "#b76e00" },
  CONFIRMADA: { label: "Confirmada", bg: "#ecfdf3", color: "#027a48" },
  RECHAZADA:  { label: "Rechazada",  bg: "#fef3f2", color: "#b42318" },
} as const;

function EstadoBadge({ estado }: { estado: keyof typeof ESTADO_STYLES }) {
  const s = ESTADO_STYLES[estado];
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.color, fontFamily: "var(--font-poppins), sans-serif" }}>
      {s.label}
    </span>
  );
}

// ─── Motivo modal ─────────────────────────────────────────────────────────────

function MotivoModal({
  titulo, onConfirm, onClose, loading,
}: {
  titulo: string; onConfirm: (m: string) => void; onClose: () => void; loading: boolean;
}) {
  const [motivo, setMotivo] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (!motivo.trim()) { setErr("Escribe el motivo del rechazo."); return; }
    onConfirm(motivo.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }} transition={{ duration: 0.18 }}
        className="w-full max-w-md rounded-3xl border p-6"
        style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 24px 64px rgba(15,23,42,0.22)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: "#fef3f2", color: "#b42318" }}>
            <XCircle size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Rechazar {titulo}
            </h3>
            <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Registra el motivo físico o documental del rechazo.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
            Motivo de rechazo
          </label>
          <textarea
            rows={4} value={motivo} onChange={e => setMotivo(e.target.value)}
            placeholder="Ej: faltante físico, dañado, referencia incorrecta"
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "#d0d5dd", color: "#101828", resize: "none", fontFamily: "var(--font-poppins), sans-serif" }}
          />
        </div>
        {err && (
          <div className="mt-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
            {err}
          </div>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button type="button" onClick={onClose} className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold sm:w-auto" style={{ borderColor: "#d0d5dd", color: "#475467", backgroundColor: "#ffffff", fontFamily: "var(--font-poppins), sans-serif" }}>
            Cancelar
          </button>
          <button type="button" disabled={loading} onClick={submit} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white sm:w-auto" style={{ backgroundColor: "#b42318", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-poppins), sans-serif" }}>
            Guardar rechazo
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Fila de entrada ──────────────────────────────────────────────────────────

function EntradaRow({
  entrada, actionKey, onConfirmar, onRechazar,
}: {
  entrada: EntradaResponse;
  actionKey: string | null;
  onConfirmar: (id: number) => void;
  onRechazar: (id: number, motivo: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const key = `e-${entrada.id}`;
  const busy = actionKey === key;
  const isPending = entrada.estado === "PENDIENTE";

  return (
    <>
      <tr className="border-t" style={{ borderColor: "#f2f4f7" }}>
        <td className="px-5 py-4 align-top">
          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: "#eff8ff", color: "#175cd3", fontFamily: "var(--font-poppins), sans-serif" }}>
            Entrada
          </span>
        </td>
        <td className="px-5 py-4 align-top">
          <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            #{entrada.id}
          </p>
          <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            {fmtFecha(entrada.createdAt ?? entrada.fecha)}
          </p>
        </td>
        <td className="px-5 py-4 align-top">
          <p className="text-sm font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            {entrada.proveedorNombre ?? "—"}
          </p>
          <p className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            {entrada.descripcion}
          </p>
        </td>
        <td className="px-5 py-4 align-top">
          <div className="flex flex-col gap-1">
            {entrada.detalles.map(d => (
              <span key={d.id} className="text-xs" style={{ color: "#344054", fontFamily: "var(--font-poppins), sans-serif" }}>
                {d.nombreInsumo} — {d.cantidad} {d.unidadMedida}
              </span>
            ))}
          </div>
          {entrada.motivoRechazo && (
            <p className="mt-1 text-xs" style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
              Motivo: {entrada.motivoRechazo}
            </p>
          )}
        </td>
        <td className="px-5 py-4 align-top">
          <EstadoBadge estado={entrada.estado} />
          {entrada.confirmadaPor && (
            <p className="mt-1 text-xs" style={{ color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}>
              Por {entrada.confirmadaPor}
            </p>
          )}
        </td>
        <td className="px-5 py-4 align-top">
          {isPending ? (
            <div className="flex items-center gap-2">
              <button type="button" disabled={!!actionKey} onClick={() => setModalOpen(true)}
                className="rounded-xl border px-3 py-2 text-xs font-semibold transition"
                style={{ borderColor: "#fecaca", backgroundColor: "#fff5f5", color: "#b42318", cursor: actionKey ? "not-allowed" : "pointer", opacity: actionKey ? 0.7 : 1, fontFamily: "var(--font-poppins), sans-serif" }}>
                Rechazar
              </button>
              <button type="button" disabled={!!actionKey} onClick={() => onConfirmar(entrada.id)}
                className="rounded-xl border px-3 py-2 text-xs font-semibold text-white transition"
                style={{ borderColor: "#15803d", backgroundColor: "#15803d", cursor: actionKey ? "not-allowed" : "pointer", opacity: actionKey ? 0.7 : 1, fontFamily: "var(--font-poppins), sans-serif" }}>
                {busy ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          ) : (
            <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>—</span>
          )}
        </td>
      </tr>
      <AnimatePresence>
        {modalOpen && (
          <MotivoModal
            titulo={`Entrada #${entrada.id}`}
            loading={busy}
            onConfirm={m => { onRechazar(entrada.id, m); setModalOpen(false); }}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Fila de salida ───────────────────────────────────────────────────────────

function SalidaRow({
  salida, actionKey, onConfirmar, onRechazar,
}: {
  salida: SalidaResponse;
  actionKey: string | null;
  onConfirmar: (id: number) => void;
  onRechazar: (id: number, motivo: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const key = `s-${salida.id}`;
  const busy = actionKey === key;
  const isPending = salida.estado === "PENDIENTE";

  return (
    <>
      <tr className="border-t" style={{ borderColor: "#f2f4f7" }}>
        <td className="px-5 py-4 align-top">
          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: "#fff4ed", color: "#c4320a", fontFamily: "var(--font-poppins), sans-serif" }}>
            Salida
          </span>
        </td>
        <td className="px-5 py-4 align-top">
          <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            #{salida.id}
          </p>
          <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            {fmtFecha(salida.createdAt ?? salida.fecha)}
          </p>
        </td>
        <td className="px-5 py-4 align-top">
          <p className="text-sm font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            {salida.colegioNombre ?? "—"}
          </p>
          <p className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            {salida.descripcion}
          </p>
        </td>
        <td className="px-5 py-4 align-top">
          <div className="flex flex-col gap-1">
            {salida.detalles.map(d => (
              <span key={d.id} className="text-xs" style={{ color: "#344054", fontFamily: "var(--font-poppins), sans-serif" }}>
                {d.nombreInsumo} — {d.cantidad} {d.unidadMedida}
              </span>
            ))}
          </div>
          {salida.motivoRechazo && (
            <p className="mt-1 text-xs" style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
              Motivo: {salida.motivoRechazo}
            </p>
          )}
        </td>
        <td className="px-5 py-4 align-top">
          <EstadoBadge estado={salida.estado} />
          {salida.confirmadoPor && (
            <p className="mt-1 text-xs" style={{ color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}>
              Por {salida.confirmadoPor}
            </p>
          )}
        </td>
        <td className="px-5 py-4 align-top">
          {isPending ? (
            <div className="flex items-center gap-2">
              <button type="button" disabled={!!actionKey} onClick={() => setModalOpen(true)}
                className="rounded-xl border px-3 py-2 text-xs font-semibold transition"
                style={{ borderColor: "#fecaca", backgroundColor: "#fff5f5", color: "#b42318", cursor: actionKey ? "not-allowed" : "pointer", opacity: actionKey ? 0.7 : 1, fontFamily: "var(--font-poppins), sans-serif" }}>
                Rechazar
              </button>
              <button type="button" disabled={!!actionKey} onClick={() => onConfirmar(salida.id)}
                className="rounded-xl border px-3 py-2 text-xs font-semibold text-white transition"
                style={{ borderColor: "#15803d", backgroundColor: "#15803d", cursor: actionKey ? "not-allowed" : "pointer", opacity: actionKey ? 0.7 : 1, fontFamily: "var(--font-poppins), sans-serif" }}>
                {busy ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          ) : (
            <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>—</span>
          )}
        </td>
      </tr>
      <AnimatePresence>
        {modalOpen && (
          <MotivoModal
            titulo={`Salida #${salida.id}`}
            loading={busy}
            onConfirm={m => { onRechazar(salida.id, m); setModalOpen(false); }}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Card de entrada (mobile) ─────────────────────────────────────────────────

function EntradaCard({
  entrada, actionKey, onConfirmar, onRechazar,
}: {
  entrada: EntradaResponse;
  actionKey: string | null;
  onConfirmar: (id: number) => void;
  onRechazar: (id: number, motivo: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const key = `e-${entrada.id}`;
  const busy = actionKey === key;
  const isPending = entrada.estado === "PENDIENTE";

  return (
    <>
      <div className="px-4 py-4" style={{ borderTop: "1px solid #f2f4f7" }}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: "#eff8ff", color: "#175cd3", fontFamily: "var(--font-poppins), sans-serif" }}>
            Entrada #{entrada.id}
          </span>
          <EstadoBadge estado={entrada.estado} />
        </div>
        <p className="text-xs mb-1" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
          {fmtFecha(entrada.createdAt ?? entrada.fecha)}
        </p>
        {entrada.proveedorNombre && (
          <p className="text-sm font-semibold mb-1" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            {entrada.proveedorNombre}
          </p>
        )}
        {entrada.descripcion && (
          <p className="text-xs mb-2" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            {entrada.descripcion}
          </p>
        )}
        <div className="flex flex-col gap-0.5 mb-3">
          {entrada.detalles.map(d => (
            <span key={d.id} className="text-xs" style={{ color: "#344054", fontFamily: "var(--font-poppins), sans-serif" }}>
              • {d.nombreInsumo} — {d.cantidad} {d.unidadMedida}
            </span>
          ))}
        </div>
        {entrada.motivoRechazo && (
          <p className="text-xs mb-2" style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
            Motivo: {entrada.motivoRechazo}
          </p>
        )}
        {entrada.confirmadaPor && (
          <p className="text-xs mb-2" style={{ color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}>
            Confirmada por {entrada.confirmadaPor}
          </p>
        )}
        {isPending && (
          <div className="flex gap-2 mt-1">
            <button type="button" disabled={!!actionKey} onClick={() => setModalOpen(true)}
              className="flex-1 rounded-xl border py-2 text-xs font-semibold transition"
              style={{ borderColor: "#fecaca", backgroundColor: "#fff5f5", color: "#b42318", cursor: actionKey ? "not-allowed" : "pointer", opacity: actionKey ? 0.7 : 1, fontFamily: "var(--font-poppins), sans-serif" }}>
              Rechazar
            </button>
            <button type="button" disabled={!!actionKey} onClick={() => onConfirmar(entrada.id)}
              className="flex-1 rounded-xl py-2 text-xs font-semibold text-white transition"
              style={{ backgroundColor: "#15803d", cursor: actionKey ? "not-allowed" : "pointer", opacity: actionKey ? 0.7 : 1, fontFamily: "var(--font-poppins), sans-serif" }}>
              {busy ? "Procesando…" : "Confirmar"}
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {modalOpen && (
          <MotivoModal titulo={`Entrada #${entrada.id}`} loading={busy}
            onConfirm={m => { onRechazar(entrada.id, m); setModalOpen(false); }}
            onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Card de salida (mobile) ──────────────────────────────────────────────────

function SalidaCard({
  salida, actionKey, onConfirmar, onRechazar,
}: {
  salida: SalidaResponse;
  actionKey: string | null;
  onConfirmar: (id: number) => void;
  onRechazar: (id: number, motivo: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const key = `s-${salida.id}`;
  const busy = actionKey === key;
  const isPending = salida.estado === "PENDIENTE";

  return (
    <>
      <div className="px-4 py-4" style={{ borderTop: "1px solid #f2f4f7" }}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: "#fff4ed", color: "#c4320a", fontFamily: "var(--font-poppins), sans-serif" }}>
            Salida #{salida.id}
          </span>
          <EstadoBadge estado={salida.estado} />
        </div>
        <p className="text-xs mb-1" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
          {fmtFecha(salida.createdAt ?? salida.fecha)}
        </p>
        {salida.colegioNombre && (
          <p className="text-sm font-semibold mb-1" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            {salida.colegioNombre}
          </p>
        )}
        {salida.descripcion && (
          <p className="text-xs mb-2" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            {salida.descripcion}
          </p>
        )}
        <div className="flex flex-col gap-0.5 mb-3">
          {salida.detalles.map(d => (
            <span key={d.id} className="text-xs" style={{ color: "#344054", fontFamily: "var(--font-poppins), sans-serif" }}>
              • {d.nombreInsumo} — {d.cantidad} {d.unidadMedida}
            </span>
          ))}
        </div>
        {salida.motivoRechazo && (
          <p className="text-xs mb-2" style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
            Motivo: {salida.motivoRechazo}
          </p>
        )}
        {salida.confirmadoPor && (
          <p className="text-xs mb-2" style={{ color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}>
            Confirmada por {salida.confirmadoPor}
          </p>
        )}
        {isPending && (
          <div className="flex gap-2 mt-1">
            <button type="button" disabled={!!actionKey} onClick={() => setModalOpen(true)}
              className="flex-1 rounded-xl border py-2 text-xs font-semibold transition"
              style={{ borderColor: "#fecaca", backgroundColor: "#fff5f5", color: "#b42318", cursor: actionKey ? "not-allowed" : "pointer", opacity: actionKey ? 0.7 : 1, fontFamily: "var(--font-poppins), sans-serif" }}>
              Rechazar
            </button>
            <button type="button" disabled={!!actionKey} onClick={() => onConfirmar(salida.id)}
              className="flex-1 rounded-xl py-2 text-xs font-semibold text-white transition"
              style={{ backgroundColor: "#15803d", cursor: actionKey ? "not-allowed" : "pointer", opacity: actionKey ? 0.7 : 1, fontFamily: "var(--font-poppins), sans-serif" }}>
              {busy ? "Procesando…" : "Confirmar"}
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {modalOpen && (
          <MotivoModal titulo={`Salida #${salida.id}`} loading={busy}
            onConfirm={m => { onRechazar(salida.id, m); setModalOpen(false); }}
            onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Cola vacía ───────────────────────────────────────────────────────────────

function ColaVacia() {
  return (
    <div className="flex flex-col items-center gap-4 py-14" style={{ borderTop: "1px solid #f2f4f7" }}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "#f0fdf4" }}>
        <Inbox size={24} style={{ color: "#86efac" }} />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
          Cola limpia
        </p>
        <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
          No hay solicitudes que coincidan con el filtro seleccionado.
        </p>
      </div>
    </div>
  );
}

// ─── Esqueleto de carga ───────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-3xl" style={{ backgroundColor: "#e5e7eb" }} />
      ))}
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

type TabType = "TODAS" | "ENTRADAS" | "SALIDAS";

export default function BodegaDashboard() {
  const {
    entradasPendientes, salidasPendientes,
    recientes,
    stats, loading, actionKey, error, successMsg,
    clearSuccess, recargar,
    confirmarEntrada, rechazarEntrada,
    confirmarSalida, rechazarSalida,
  } = useWarehouseRequests();

  const [tab, setTab] = useState<TabType>("TODAS");
  const [search, setSearch] = useState("");

  const allPendientes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const ent = entradasPendientes.filter(e =>
      !q ||
      String(e.id).includes(q) ||
      (e.proveedorNombre ?? "").toLowerCase().includes(q) ||
      e.descripcion.toLowerCase().includes(q) ||
      e.detalles.some(d => d.nombreInsumo.toLowerCase().includes(q))
    );
    const sal = salidasPendientes.filter(s =>
      !q ||
      String(s.id).includes(q) ||
      (s.colegioNombre ?? "").toLowerCase().includes(q) ||
      s.descripcion.toLowerCase().includes(q) ||
      s.detalles.some(d => d.nombreInsumo.toLowerCase().includes(q))
    );
    return { ent, sal };
  }, [entradasPendientes, salidasPendientes, search]);

  const TABS: { id: TabType; label: string; count: number }[] = [
    { id: "TODAS",   label: "Todas",   count: entradasPendientes.length + salidasPendientes.length },
    { id: "ENTRADAS", label: "Entradas", count: entradasPendientes.length },
    { id: "SALIDAS",  label: "Salidas",  count: salidasPendientes.length },
  ];

  return (
    <section className="flex flex-col gap-6 pb-8">
      {/* Banner header */}
      <div className="rounded-[28px] border px-4 py-5 sm:px-6 sm:py-6"
        style={{ borderColor: "#bbf7d0", background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(5,46,22,0.08) 100%)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#15803d", fontFamily: "var(--font-poppins), sans-serif" }}>
              Rol Bodega
            </p>
            <h1 className="mt-2 text-2xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Cola de validación física de inventario
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
              Confirma o rechaza entradas y salidas PENDIENTES. El stock cambia únicamente tras confirmación desde bodega.
            </p>
          </div>
          <button type="button" onClick={() => void recargar()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
            style={{ borderColor: "#bbf7d0", backgroundColor: "#ffffff", color: "#15803d", fontFamily: "var(--font-poppins), sans-serif" }}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Actualizar cola
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Pendientes totales" value={stats.totalPendientes} sub="Esperando validación física" accent="#f59e0b" icon={ClipboardList} />
        <KpiCard label="Entradas pendientes" value={stats.entradasPendientes} sub="Ingresos por validar" accent="#1d4ed8" icon={ArrowDownToLine} />
        <KpiCard label="Salidas pendientes" value={stats.salidasPendientes} sub="Despachos por validar" accent="#d97706" icon={ArrowUpFromLine} />
        <KpiCard label="Procesadas hoy" value={stats.procesadasEnSesion} sub="Confirmadas o rechazadas en esta sesión" accent="#15803d" icon={CheckCheck} />
      </div>

      {/* Mensajes */}
      {successMsg && (
        <button type="button" onClick={clearSuccess}
          className="rounded-2xl border px-4 py-3 text-left text-sm"
          style={{ borderColor: "#abefc6", backgroundColor: "#ecfdf3", color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}>
          {successMsg} — Click para cerrar
        </button>
      )}
      {error && (
        <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
          {error}
        </div>
      )}

      {/* Área principal: Cola + Actividad reciente */}
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Cola de trabajo */}
        <div className="rounded-3xl border overflow-hidden" style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}>
          {/* Header cola */}
          <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
            style={{ borderColor: "#f0f0f4" }}>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                Cola de trabajo
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                Valida físicamente antes de confirmar.
              </p>
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ID, proveedor, colegio, insumo..."
              className="w-full rounded-2xl border px-4 py-2.5 text-sm outline-none sm:w-72"
              style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b px-4 py-3 sm:px-6" style={{ borderColor: "#f0f0f4" }}>
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition"
                style={{
                  backgroundColor: tab === t.id ? "#f0fdf4" : "transparent",
                  color: tab === t.id ? "#15803d" : "#667085",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}>
                {t.label}
                {t.count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                    style={{ backgroundColor: tab === t.id ? "#15803d" : "#9ca3af" }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Contenido de la cola */}
          {loading ? (
            <div className="p-6"><Skeleton /></div>
          ) : (() => {
            const isEmpty =
              (tab === "TODAS"    && allPendientes.ent.length === 0 && allPendientes.sal.length === 0) ||
              (tab === "ENTRADAS" && allPendientes.ent.length === 0) ||
              (tab === "SALIDAS"  && allPendientes.sal.length === 0);
            return (
              <>
                {/* ── Vista móvil: cards (< md) ── */}
                <div className="md:hidden">
                  {tab !== "SALIDAS" && allPendientes.ent.map(e => (
                    <EntradaCard key={`e-${e.id}`} entrada={e} actionKey={actionKey}
                      onConfirmar={confirmarEntrada} onRechazar={rechazarEntrada} />
                  ))}
                  {tab !== "ENTRADAS" && allPendientes.sal.map(s => (
                    <SalidaCard key={`s-${s.id}`} salida={s} actionKey={actionKey}
                      onConfirmar={confirmarSalida} onRechazar={rechazarSalida} />
                  ))}
                  {isEmpty && <ColaVacia />}
                </div>

                {/* ── Vista desktop: tabla (md+) ── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse">
                    <thead style={{ backgroundColor: "#f8fafc" }}>
                      <tr>
                        {["Tipo", "ID / Fecha", "Referencia", "Insumos", "Estado", "Acciones"].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em]"
                            style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tab !== "SALIDAS" && allPendientes.ent.map(e => (
                        <EntradaRow key={`e-${e.id}`} entrada={e} actionKey={actionKey}
                          onConfirmar={confirmarEntrada} onRechazar={rechazarEntrada} />
                      ))}
                      {tab !== "ENTRADAS" && allPendientes.sal.map(s => (
                        <SalidaRow key={`s-${s.id}`} salida={s} actionKey={actionKey}
                          onConfirmar={confirmarSalida} onRechazar={rechazarSalida} />
                      ))}
                    </tbody>
                  </table>
                  {isEmpty && <ColaVacia />}
                </div>
              </>
            );
          })()}
        </div>

        {/* Actividad reciente */}
        <div className="rounded-3xl border p-4 sm:p-5" style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}>
          <h2 className="text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            Actividad reciente
          </h2>
          <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            Últimas solicitudes procesadas
          </p>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl" style={{ backgroundColor: "#e5e7eb" }} />
              ))}
            </div>
          ) : recientes.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <ShieldAlert size={28} style={{ color: "#d1d5db" }} />
              <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                Sin actividad aún
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {recientes.map(r => {
                const isEntrada = r.tipo === "entrada";
                const colorTipo = isEntrada ? "#1d4ed8" : "#d97706";
                const bgTipo = isEntrada ? "#eff8ff" : "#fff4ed";
                const Icon = isEntrada ? ArrowDownToLine : ArrowUpFromLine;
                const estadoStyle = ESTADO_STYLES[r.estado as keyof typeof ESTADO_STYLES];
                return (
                  <div key={`${r.tipo}-${r.id}`} className="flex items-start gap-3 rounded-2xl border p-3"
                    style={{ borderColor: "#f3f4f6", backgroundColor: "#fcfcfd" }}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: bgTipo }}>
                      <Icon size={14} style={{ color: colorTipo }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {r.label}
                      </p>
                      <p className="truncate text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {r.sub}
                      </p>
                    </div>
                    <span className="flex-shrink-0 mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: estadoStyle.bg, color: estadoStyle.color, fontFamily: "var(--font-poppins), sans-serif" }}>
                      {estadoStyle.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
