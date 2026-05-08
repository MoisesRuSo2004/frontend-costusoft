"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Mail, SendHorizonal } from "lucide-react";
import { seguridadService } from "@/app/services/seguridad.service";

export default function RecuperarPasswordPage() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  const FOCUS_STYLE = {
    borderColor: "#0b3d91",
    boxShadow: "0 0 0 3px rgba(11,61,145,0.1)",
  };

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) { setError("El correo es obligatorio."); return; }
    if (!isEmail(correo)) { setError("Ingresa un correo válido."); return; }

    setLoading(true);
    setError("");
    try {
      await seguridadService.olvidarPassword({ correo });
      setSent(true);
    } catch (err) {
      // El backend retorna el mismo mensaje si el correo no existe (anti-enumeración)
      // Solo mostramos error si es un problema técnico real
      setError(err instanceof Error ? err.message : "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "11px 16px",
    border: "1.5px solid #e5e7eb", borderRadius: 10,
    fontSize: 14, fontFamily: "'Poppins', sans-serif",
    color: "#111827", backgroundColor: "#fff",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-8 py-12">
      {/* Volver */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <Link href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#0b3d91")}
          onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
          <ArrowLeft size={15} /> Volver al login
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#eff6ff", border: "1px solid #dbeafe" }}>
          <Mail size={22} style={{ color: "#0b3d91" }} />
        </div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
          Recuperar contraseña
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, fontFamily: "'Poppins', sans-serif", lineHeight: 1.6 }}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña. El enlace expira en 15 minutos.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {sent ? (
          /* ── Estado de éxito ── */
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0" }}>
              <CheckCircle2 size={40} style={{ color: "#16a34a" }} />
            </div>
            <h2 className="text-xl font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
              ¡Revisa tu correo!
            </h2>
            <p className="text-sm" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", lineHeight: 1.7, maxWidth: 340 }}>
              Si la dirección <strong>{correo}</strong> está registrada, recibirás un enlace de recuperación en los próximos minutos.
            </p>

            {/* Instrucción de producción */}
            <div className="w-full rounded-xl border px-4 py-3 text-left"
              style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}>
              <p className="text-xs font-semibold" style={{ color: "#166534", fontFamily: "'Poppins', sans-serif", marginBottom: 4 }}>
                ✉️ Revisa tu bandeja de entrada
              </p>
              <p className="text-xs" style={{ color: "#15803d", fontFamily: "'Poppins', sans-serif", lineHeight: 1.6 }}>
                Te enviamos un correo con el enlace de recuperación. Si no lo ves en unos minutos, revisa la carpeta de spam o correo no deseado.
              </p>
              <Link href="/reset-password"
                className="mt-2 inline-block text-xs font-semibold underline"
                style={{ color: "#166534" }}>
                → Ya tengo el token, restablecer contraseña
              </Link>
            </div>

            <button onClick={() => { setSent(false); setCorreo(""); }}
              className="mt-2 text-sm font-medium"
              style={{ color: "#0b3d91", background: "none", border: "none", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>
              Enviar a otro correo
            </button>
          </motion.div>
        ) : (
          /* ── Formulario ── */
          <motion.form key="form" onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
                Correo electrónico <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <input type="email" value={correo} onChange={e => { setCorreo(e.target.value); setError(""); }}
                  placeholder="tu@correo.com" autoFocus
                  style={{ ...inputBase, paddingLeft: 38 }}
                  onFocus={e => Object.assign(e.currentTarget.style, FOCUS_STYLE)}
                  onBlur={e => Object.assign(e.currentTarget.style, { borderColor: "#e5e7eb", boxShadow: "none" })}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2 rounded-xl border px-4 py-3"
                  style={{ borderColor: "#fca5a5", backgroundColor: "#fef2f2" }}>
                  <p style={{ fontSize: 13, color: "#dc2626", fontFamily: "'Poppins', sans-serif", margin: 0 }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "12px",
                backgroundColor: loading ? "#3aad17" : "#49c21b",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#3aad17"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = "#49c21b"; }}>
              {loading
                ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Enviando...</>
                : <><SendHorizonal size={16} /> Enviar enlace de recuperación</>
              }
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Footer */}
      <p style={{ marginTop: "auto", paddingTop: 32, fontSize: 11, color: "#d1d5db", textAlign: "center", fontFamily: "'Poppins', sans-serif" }}>
        © {new Date().getFullYear()} CostuSoft — Todos los derechos reservados
      </p>
    </div>
  );
}
