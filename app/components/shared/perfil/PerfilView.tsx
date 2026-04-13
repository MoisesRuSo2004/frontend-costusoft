"use client";

import { useState } from "react";
import UserAvatar from "@/app/components/shared/ui/UserAvatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Shield, Lock,
  Eye, EyeOff, Save, CheckCircle2,
  KeyRound, RefreshCw, TriangleAlert,
} from "lucide-react";
import { usePerfil } from "@/app/hooks/usePerfil";

// ─── Config por rol ───────────────────────────────────────────────────────────

const ROL_LABEL: Record<string, string> = {
  ADMIN:  "Administrador",
  USER:   "Secretaria",
  BODEGA: "Operario de Bodega",
};

const ROL_COLOR: Record<string, { bg: string; color: string }> = {
  ADMIN:  { bg: "#0b3d9115", color: "#0b3d91" },
  USER:   { bg: "#1d4ed815", color: "#1d4ed8" },
  BODEGA: { bg: "#15803d15", color: "#15803d" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}
void fmtDate; // reservado para campo de fecha si se agrega

// ─── ReadonlyField ────────────────────────────────────────────────────────────

function ReadonlyField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em]"
        style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border px-4 py-3"
        style={{ borderColor: "#eaecf0", backgroundColor: "#f8fafc" }}>
        <span style={{ color: "#667085" }}>{icon}</span>
        <span className="text-sm" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onDone }: { msg: string; type: "success" | "error"; onDone: () => void }) {
  const [progress, setProgress] = useState(100);
  if (typeof window !== "undefined") {
    setTimeout(() => setProgress(0), 50);
    setTimeout(onDone, 3000);
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 20 }}
      className="fixed bottom-6 right-6 z-[60] min-w-[320px] overflow-hidden rounded-2xl border shadow-lg"
      style={{
        borderColor: type === "success" ? "#abefc6" : "#fecaca",
        backgroundColor: type === "success" ? "#ecfdf3" : "#fef2f2",
      }}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        {type === "success"
          ? <CheckCircle2 size={20} style={{ color: "#027a48", flexShrink: 0 }} />
          : <TriangleAlert size={20} style={{ color: "#dc2626", flexShrink: 0 }} />}
        <span className="text-sm font-medium"
          style={{ color: type === "success" ? "#027a48" : "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
          {msg}
        </span>
      </div>
      <div className="h-1 transition-all duration-[3000ms] ease-linear"
        style={{ width: `${progress}%`, backgroundColor: type === "success" ? "#027a48" : "#dc2626" }} />
    </motion.div>
  );
}

// ─── Cambiar contraseña ───────────────────────────────────────────────────────

function CambiarPassword({
  formPassword, changingPassword, accentColor, onChange, onSubmit,
}: {
  formPassword: { actual: string; nueva: string; confirmar: string };
  changingPassword: boolean;
  accentColor: string;
  onChange: (f: "actual" | "nueva" | "confirmar", v: string) => void;
  onSubmit: () => void;
}) {
  const [show, setShow] = useState({ actual: false, nueva: false, confirmar: false });
  const toggle = (k: keyof typeof show) => setShow(p => ({ ...p, [k]: !p[k] }));

  const PasswordInput = ({ k, placeholder, label }: { k: keyof typeof show; placeholder: string; label: string }) => (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
        style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
        {label}<span className="ml-1" style={{ color: "#dc2626" }}>*</span>
      </label>
      <div className="relative">
        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#667085" }} />
        <input
          type={show[k] ? "text" : "password"}
          value={formPassword[k]}
          placeholder={placeholder}
          onChange={e => onChange(k, e.target.value)}
          disabled={changingPassword}
          className="w-full rounded-2xl border py-3 pl-11 pr-11 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
          style={{ borderColor: "#d0d5dd", backgroundColor: "#ffffff", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
          onFocus={e => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}1a`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = "#d0d5dd";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button type="button" onClick={() => toggle(k)} disabled={changingPassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 transition disabled:opacity-50"
          style={{ color: "#667085" }}>
          {show[k] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <PasswordInput k="actual"   placeholder="••••••••"           label="Contraseña actual" />
        <PasswordInput k="nueva"    placeholder="Mínimo 6 caracteres" label="Nueva contraseña" />
        <PasswordInput k="confirmar" placeholder="Repite la contraseña" label="Confirmar contraseña" />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={changingPassword}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed"
          style={{ backgroundColor: accentColor, opacity: changingPassword ? 0.75 : 1, fontFamily: "var(--font-poppins), sans-serif" }}>
          {changingPassword
            ? <><RefreshCw size={16} className="animate-spin" />Guardando...</>
            : <><Save size={16} />Actualizar contraseña</>}
        </button>
      </div>
    </form>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PerfilSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-7">
      <div className="h-8 w-48 animate-pulse rounded-xl" style={{ backgroundColor: "#e5e7eb" }} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="h-[400px] animate-pulse rounded-3xl" style={{ backgroundColor: "#e5e7eb" }} />
        </div>
        <div className="lg:col-span-8 flex flex-col gap-5">
          <div className="h-[200px] animate-pulse rounded-3xl" style={{ backgroundColor: "#e5e7eb" }} />
          <div className="h-[230px] animate-pulse rounded-3xl" style={{ backgroundColor: "#e5e7eb" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PerfilViewProps {
  accentColor: string;
  accentSoft: string;
  gradient: string;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PerfilView({ accentColor, accentSoft, gradient }: PerfilViewProps) {
  const {
    usuario, loading, formPassword, changingPassword,
    error, successMessage, setPasswordField, changePassword, clearMessages, loadUser,
  } = usePerfil();

  const passwordForm = {
    actual:    formPassword.passwordActual,
    nueva:     formPassword.passwordNueva,
    confirmar: formPassword.passwordConfirmacion,
  };

  const handleChange = (field: keyof typeof passwordForm, value: string) => {
    const map = { actual: "passwordActual", nueva: "passwordNueva", confirmar: "passwordConfirmacion" } as const;
    setPasswordField(map[field], value);
  };

  if (loading) return <PerfilSkeleton />;

  if (!usuario) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: "#fef2f2" }}>
          <TriangleAlert size={32} style={{ color: "#dc2626" }} />
        </div>
        <h2 className="mt-4 text-xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
          No se pudieron cargar los datos
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
          {error || "Ha ocurrido un error al obtener tu perfil."}
        </p>
        <button type="button" onClick={() => void loadUser()}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: accentColor, fontFamily: "var(--font-poppins), sans-serif" }}>
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  const rolLabel = ROL_LABEL[usuario.rol] ?? usuario.rol;
  const rc = ROL_COLOR[usuario.rol] ?? { bg: `${accentColor}15`, color: accentColor };

  return (
    <>
      <div className="flex flex-col gap-6 pb-7">
        {/* Header */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            Mi Perfil
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            Información de tu cuenta y configuración de seguridad
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* ── Card Avatar ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }} className="lg:col-span-4">
            <div className="rounded-3xl border p-6 text-center"
              style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}>
              {/* Banner */}
              <div className="relative -mx-6 -mt-6 mb-8 h-28 rounded-t-3xl" style={{ background: gradient }}>
                <svg className="absolute inset-0 h-full w-full opacity-[0.1]">
                  <defs>
                    <pattern id="pgrid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#pgrid)" />
                </svg>
              </div>

              {/* Avatar */}
              <div className="relative -mt-16 flex justify-center">
                <UserAvatar
                  name={usuario.username}
                  size={96}
                  accentColor={accentColor}
                  borderWidth={4}
                  borderColor="#ffffff"
                  shadow="0 4px 24px rgba(0,0,0,0.18)"
                />
              </div>

              {/* Info */}
              <div className="mt-4 flex flex-col items-center gap-2">
                <h3 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                  {usuario.username}
                </h3>
                <p className="text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                  {usuario.correo}
                </p>
                <span className="mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: rc.bg, color: rc.color, fontFamily: "var(--font-poppins), sans-serif" }}>
                  {rolLabel}
                </span>

                {/* Stats */}
                <div className="mt-4 grid w-full grid-cols-2 gap-3">
                  <div className="flex flex-col items-center rounded-2xl py-3" style={{ backgroundColor: "#f8fafc" }}>
                    <span className="text-lg font-bold" style={{ color: rc.color, fontFamily: "var(--font-poppins), sans-serif" }}>
                      {usuario.rol}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>Rol</span>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl py-3" style={{ backgroundColor: "#f8fafc" }}>
                    <span className="text-lg font-bold" style={{ color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}>
                      Activo
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>Estado</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Columna derecha ── */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Info personal */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14 }}
              className="rounded-3xl border"
              style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}>
              <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "#eaecf0" }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: accentSoft, color: accentColor }}>
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Información personal
                  </p>
                  <p className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Datos de solo lectura — administrados por el sistema
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                <ReadonlyField label="Usuario"      value={usuario.username} icon={<User size={16} />} />
                <ReadonlyField label="Correo"       value={usuario.correo}   icon={<Mail size={16} />} />
                <ReadonlyField label="Rol"          value={rolLabel}         icon={<Shield size={16} />} />
                <ReadonlyField label="ID de usuario" value={String(usuario.id)} icon={<User size={16} />} />
              </div>
            </motion.div>

            {/* Cambio de contraseña */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="rounded-3xl border"
              style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 18px 50px rgba(15,23,42,0.05)" }}>
              <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: "#eaecf0" }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "#ecfdf3", color: "#027a48" }}>
                  <KeyRound size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Cambiar contraseña
                  </p>
                  <p className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Usa una contraseña segura de al menos 6 caracteres
                  </p>
                </div>
              </div>
              <div className="p-6">
                <CambiarPassword
                  formPassword={passwordForm}
                  changingPassword={changingPassword}
                  accentColor={accentColor}
                  onChange={handleChange}
                  onSubmit={() => void changePassword()}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <AnimatePresence>
        {successMessage && <Toast msg={successMessage} type="success" onDone={clearMessages} />}
        {error && <Toast msg={error} type="error" onDone={clearMessages} />}
      </AnimatePresence>
    </>
  );
}
