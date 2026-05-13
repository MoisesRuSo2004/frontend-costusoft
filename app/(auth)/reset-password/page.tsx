"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { seguridadService } from "@/app/services/seguridad.service";

// ─── Spinner para Suspense ────────────────────────────────────────────────────

function LoadingFallback() {
  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-8 py-12">
      <div className="flex items-center gap-2 text-gray-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#0b3d91]" />
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14 }}>Cargando...</span>
      </div>
    </div>
  );
}

// ─── Formulario real ──────────────────────────────────────────────────────────

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();

  // Token leído silenciosamente del URL — nunca se muestra al usuario
  const token = params.get("token") ?? "";

  const [passwordNueva, setPasswordNueva]       = useState("");
  const [passwordConfirm, setPasswordConfirm]   = useState("");
  const [showPass, setShowPass]                 = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");
  const [success, setSuccess]                   = useState(false);

  const FOCUS_STYLE = {
    borderColor: "#0b3d91",
    boxShadow: "0 0 0 3px rgba(11,61,145,0.1)",
  };

  const validate = (): string => {
    if (!passwordNueva) return "La nueva contraseña es obligatoria.";
    if (passwordNueva.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (passwordNueva !== passwordConfirm) return "Las contraseñas no coinciden.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError("");
    try {
      await seguridadService.resetearPassword({ token, passwordNueva, passwordConfirmacion: passwordConfirm });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token inválido o expirado. Solicita un nuevo enlace.");
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

  // ── Sin token en la URL — enlace inválido ─────────────────────────────────
  if (!token) {
    return (
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: "#fef2f2", border: "2px solid #fca5a5" }}>
            <AlertCircle size={40} style={{ color: "#dc2626" }} />
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
            Enlace inválido
          </h2>
          <p className="text-sm" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", lineHeight: 1.7 }}>
            Este enlace de recuperación no es válido o ya expiró.
            Solicita uno nuevo ingresando tu correo electrónico.
          </p>
          <Link href="/recuperar-password"
            className="mt-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#0b3d91", fontFamily: "'Poppins', sans-serif" }}>
            Solicitar nuevo enlace
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Éxito ─────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0" }}>
            <CheckCircle2 size={40} style={{ color: "#16a34a" }} />
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
            ¡Contraseña restablecida!
          </h2>
          <p className="text-sm" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", lineHeight: 1.7 }}>
            Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión con tus nuevas credenciales.
          </p>
          <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
            Redirigiendo al login en unos segundos...
          </p>
          <Link href="/login"
            className="mt-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#49c21b", fontFamily: "'Poppins', sans-serif" }}>
            Ir al login ahora
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-8 py-12">
      {/* Volver */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="mb-6">
        <Link href="/recuperar-password"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#0b3d91")}
          onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
          <ArrowLeft size={15} /> Solicitar nuevo enlace
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "#eff6ff", border: "1px solid #dbeafe" }}>
          <KeyRound size={22} style={{ color: "#0b3d91" }} />
        </div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
          Restablecer contraseña
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, fontFamily: "'Poppins', sans-serif", lineHeight: 1.6 }}>
          Define tu nueva contraseña. El enlace expira en 15 minutos.
        </p>
      </motion.div>

      <motion.form onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Nueva contraseña */}
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
            Nueva contraseña <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input type={showPass ? "text" : "password"} value={passwordNueva} onChange={e => setPasswordNueva(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              style={{ ...inputBase, paddingLeft: 38, paddingRight: 44 }}
              onFocus={e => Object.assign(e.currentTarget.style, FOCUS_STYLE)}
              onBlur={e => Object.assign(e.currentTarget.style, { borderColor: "#e5e7eb", boxShadow: "none" })}
            />
            <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}
              style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Barra de fortaleza */}
          {passwordNueva && (
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4].map(n => {
                const strength = passwordNueva.length >= 12 && /[A-Z]/.test(passwordNueva) && /[0-9]/.test(passwordNueva) && /[^a-zA-Z0-9]/.test(passwordNueva) ? 4
                  : passwordNueva.length >= 10 && /[A-Z]/.test(passwordNueva) ? 3
                  : passwordNueva.length >= 8 ? 2 : 1;
                const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
                return <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: n <= strength ? colors[strength - 1] : "#e5e7eb", transition: "background-color 0.2s" }} />;
              })}
            </div>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
            Confirmar contraseña <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input type={showConfirm ? "text" : "password"} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
              placeholder="Repite tu nueva contraseña"
              style={{
                ...inputBase, paddingLeft: 38, paddingRight: 44,
                borderColor: passwordConfirm && passwordNueva !== passwordConfirm ? "#fca5a5" : "#e5e7eb",
              }}
              onFocus={e => Object.assign(e.currentTarget.style, FOCUS_STYLE)}
              onBlur={e => Object.assign(e.currentTarget.style, { borderColor: passwordConfirm && passwordNueva !== passwordConfirm ? "#fca5a5" : "#e5e7eb", boxShadow: "none" })}
            />
            <button type="button" onClick={() => setShowConfirm(s => !s)} tabIndex={-1}
              style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordConfirm && passwordNueva !== passwordConfirm && (
            <p style={{ marginTop: 5, fontSize: 12, color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
              Las contraseñas no coinciden.
            </p>
          )}
        </div>

        {/* Error del servidor */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-xl border px-4 py-3"
              style={{ borderColor: "#fca5a5", backgroundColor: "#fef2f2" }}>
              <p style={{ fontSize: 13, color: "#dc2626", fontFamily: "'Poppins', sans-serif", margin: 0 }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón */}
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
            ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Restableciendo...</>
            : <><KeyRound size={16} /> Restablecer contraseña</>
          }
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
          ¿Recordaste tu contraseña?{" "}
          <Link href="/login" style={{ color: "#0b3d91", fontWeight: 600, textDecoration: "none" }}>
            Iniciar sesión
          </Link>
        </p>
      </motion.form>

      {/* Footer */}
      <p style={{ marginTop: "auto", paddingTop: 32, fontSize: 11, color: "#d1d5db", textAlign: "center", fontFamily: "'Poppins', sans-serif" }}>
        © {new Date().getFullYear()} CostuSoft — Todos los derechos reservados
      </p>
    </div>
  );
}

// ─── Export (con Suspense para useSearchParams) ───────────────────────────────

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
