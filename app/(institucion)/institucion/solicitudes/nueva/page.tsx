"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { institucionService } from "@/app/services/institucion.service";
import type { TipoSolicitud } from "@/app/types/institucion";

// ─── Config ──────────────────────────────────────────────────────────────────

const TIPOS: { value: TipoSolicitud; label: string; desc: string; color: string }[] = [
  { value: "AJUSTE_TALLA",         label: "Ajuste de talla",           desc: "Corregir tallas en un pedido existente",     color: "#6366f1" },
  { value: "PEDIDO_URGENTE",       label: "Pedido urgente",            desc: "Solicitar priorización en producción",       color: "#dc2626" },
  { value: "CAMBIO_FECHA_ENTREGA", label: "Cambio de fecha de entrega", desc: "Modificar la fecha estimada de entrega",   color: "#d97706" },
  { value: "CONSULTA_GENERAL",     label: "Consulta general",          desc: "Preguntas sobre pedidos o procesos",         color: "#0891b2" },
  { value: "DEVOLUCION",           label: "Devolución / corrección",   desc: "Reportar errores o solicitar correcciones",  color: "#7c3aed" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "'Poppins', sans-serif",
  color: "#101828",
  backgroundColor: "#ffffff",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

const FOCUS = { borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99,102,241,0.12)" };
const BLUR = { borderColor: "#e5e7eb", boxShadow: "none" };

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function NuevaSolicitudPage() {
  const router = useRouter();

  const [tipo, setTipo] = useState<TipoSolicitud>("CONSULTA_GENERAL");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim()) { setError("El asunto es obligatorio."); return; }
    if (!descripcion.trim()) { setError("La descripción es obligatoria."); return; }
    if (descripcion.length > 1000) { setError("La descripción no puede superar 1000 caracteres."); return; }

    setLoading(true);
    setError("");
    try {
      await institucionService.crearSolicitud({ tipo, asunto: asunto.trim(), descripcion: descripcion.trim() });
      setSuccess(true);
      setTimeout(() => router.push("/institucion/solicitudes"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0" }}
        >
          <CheckCircle2 size={40} style={{ color: "#16a34a" }} />
        </motion.div>
        <h2 className="text-2xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
          ¡Solicitud enviada!
        </h2>
        <p className="text-sm text-center max-w-sm" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
          Tu solicitud fue registrada y está en estado <strong>Pendiente</strong>. El equipo Costusoft responderá pronto.
        </p>
        <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
          Redirigiendo...
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 pb-10 max-w-2xl">

      {/* Volver */}
      <Link
        href="/institucion/solicitudes"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
      >
        <ArrowLeft size={15} /> Volver a solicitudes
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
          Nueva solicitud
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
          Envía una solicitud al equipo Costusoft. Responderán a la brevedad.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── Tipo de solicitud ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border p-6"
          style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}
        >
          <h2
            className="mb-4 text-base font-semibold"
            style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
          >
            Tipo de solicitud
          </h2>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TIPOS.map(({ value, label, desc, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTipo(value)}
                className="flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all"
                style={{
                  borderColor: tipo === value ? color : "#e5e7eb",
                  backgroundColor: tipo === value ? `${color}0c` : "#fafafa",
                  cursor: "pointer",
                }}
              >
                <div
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: tipo === value ? color : "#d1d5db",
                    backgroundColor: tipo === value ? color : "transparent",
                  }}
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: tipo === value ? color : "#101828", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
                  >
                    {desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Detalle ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border p-6"
          style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}
        >
          <div className="flex flex-col gap-4">
            {/* Asunto */}
            <div>
              <label className="block mb-1.5 text-xs font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                Asunto <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={asunto}
                onChange={(e) => { setAsunto(e.target.value); setError(""); }}
                maxLength={200}
                placeholder="Ej: Corrección de tallas pedido PED-2026-0045"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.currentTarget.style, FOCUS)}
                onBlur={(e) => Object.assign(e.currentTarget.style, BLUR)}
              />
              <p className="mt-1 text-right text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                {asunto.length}/200
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label className="block mb-1.5 text-xs font-medium" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                Descripción <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => { setDescripcion(e.target.value); setError(""); }}
                maxLength={1000}
                rows={5}
                placeholder="Describe en detalle lo que necesitas. Sé específico para agilizar la respuesta."
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={(e) => Object.assign(e.currentTarget.style, FOCUS)}
                onBlur={(e) => Object.assign(e.currentTarget.style, BLUR)}
              />
              <p className="mt-1 text-right text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                {descripcion.length}/1000
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-2xl border px-4 py-3"
              style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
            >
              <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botones */}
        <div className="flex gap-3">
          <Link
            href="/institucion/solicitudes"
            className="flex-1 flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors"
            style={{
              borderColor: "#e5e7eb",
              backgroundColor: "#ffffff",
              color: "#374151",
              fontFamily: "'Poppins', sans-serif",
              textDecoration: "none",
            }}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors"
            style={{
              backgroundColor: loading ? "#a5b4fc" : "#6366f1",
              cursor: loading ? "not-allowed" : "pointer",
              border: "none",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4f46e5"; }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366f1"; }}
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Enviando...</>
            ) : (
              <><Send size={15} /> Enviar solicitud</>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
