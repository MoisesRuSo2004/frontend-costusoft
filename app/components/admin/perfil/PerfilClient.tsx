"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  CalendarDays,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

// ─────────────────────────────────────────────
// MOCK — reemplazar con datos del token / session
// ─────────────────────────────────────────────
const MOCK_USUARIO = {
  username: "admin",
  email: "admin@costusoft.com",
  rol: "ADMIN",
  createdAt: "2024-01-10T08:00:00",
};

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERARIO: "Operario",
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const labelSt: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 500,
  color: "#374151",
  fontFamily: "'Poppins', sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

function ReadonlyField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelSt}>{label}</label>
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ backgroundColor: "#f8f9fc", border: "1.5px solid #f0f0f4" }}
      >
        <span style={{ color: "#9ca3af", flexShrink: 0 }}>{icon}</span>
        <span
          className="text-sm"
          style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  if (typeof window !== "undefined") setTimeout(onDone, 2800);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-2xl"
      style={{
        backgroundColor: "#111827",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        minWidth: 260,
      }}
    >
      <CheckCircle2 size={18} style={{ color: "#49c21b", flexShrink: 0 }} />
      <span
        className="text-sm text-white"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {msg}
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SECCIÓN CAMBIO DE CONTRASEÑA
// ─────────────────────────────────────────────
function CambiarPassword({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [show, setShow] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);

  const toggle = (k: keyof typeof show) => setShow({ ...show, [k]: !show[k] });

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.actual.trim()) e.actual = "Requerido";
    if (form.nueva.length < 6) e.nueva = "Mínimo 6 caracteres";
    if (form.nueva !== form.confirmar)
      e.confirmar = "Las contraseñas no coinciden";
    return e;
  };

  const handle = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      // TODO: await changePassword({ actual: form.actual, nueva: form.nueva });
      await new Promise((r) => setTimeout(r, 800));
      setForm({ actual: "", nueva: "", confirmar: "" });
      setErrors({});
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    k,
    placeholder,
  }: {
    k: keyof typeof form;
    placeholder: string;
  }) => (
    <div>
      <div className="relative">
        <Lock
          size={14}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            pointerEvents: "none",
          }}
        />
        <input
          type={show[k] ? "text" : "password"}
          value={form[k]}
          placeholder={placeholder}
          onChange={(e) => {
            setForm({ ...form, [k]: e.target.value });
            setErrors({ ...errors, [k]: undefined });
          }}
          style={{
            width: "100%",
            padding: "11px 40px 11px 36px",
            border: `1.5px solid ${errors[k] ? "#fca5a5" : "#e5e7eb"}`,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "'Poppins', sans-serif",
            color: "#111827",
            outline: "none",
            backgroundColor: "#fff",
            boxSizing: "border-box",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0b3d91";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors[k]
              ? "#fca5a5"
              : "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="button"
          onClick={() => toggle(k)}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#0b3d91")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
        >
          {show[k] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {errors[k] && (
        <p
          className="text-xs mt-1"
          style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}
        >
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handle} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label style={labelSt}>
            Contraseña actual <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <PasswordInput k="actual" placeholder="••••••••" />
        </div>
        <div>
          <label style={labelSt}>
            Nueva contraseña <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <PasswordInput k="nueva" placeholder="Mínimo 6 caracteres" />
        </div>
        <div>
          <label style={labelSt}>
            Confirmar contraseña <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <PasswordInput k="confirmar" placeholder="Repite la contraseña" />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all"
          style={{
            backgroundColor: "#0b3d91",
            color: "#fff",
            border: "none",
            fontFamily: "'Poppins', sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.8 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#49c21b";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#0b3d91";
          }}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <Save size={14} /> Actualizar contraseña
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function PerfilClient() {
  // TODO: reemplazar con datos reales de sesión
  const user = MOCK_USUARIO;
  const [toast, setToast] = useState("");
  const rolLabel = ROL_LABEL[user.rol] ?? user.rol;

  const ROL_COLOR: Record<string, { bg: string; color: string }> = {
    ADMIN: { bg: "#0b3d9115", color: "#0b3d91" },
    SUPERVISOR: { bg: "#8b5cf618", color: "#7c3aed" },
    OPERARIO: { bg: "#49c21b18", color: "#2a9912" },
  };
  const rc = ROL_COLOR[user.rol] ?? ROL_COLOR.OPERARIO;

  return (
    <>
      <div className="flex flex-col gap-6 pb-7">
        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1
            className="text-xl font-semibold"
            style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
          >
            Mi Perfil
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
          >
            Información de tu cuenta y configuración de seguridad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Card Avatar (izquierda) ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="lg:col-span-4"
          >
            <div
              className="rounded-2xl overflow-hidden text-center"
              style={{
                backgroundColor: "#fff",
                boxShadow: "0 1px 12px rgba(0,0,0,0.07)",
                border: "1px solid #f0f0f4",
              }}
            >
              {/* Banner degradado */}
              <div
                className="h-24 relative"
                style={{
                  background:
                    "linear-gradient(135deg, #0b3d91 0%, #041d47 100%)",
                }}
              >
                {/* Grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.07]">
                  <defs>
                    <pattern
                      id="pgrid"
                      width="24"
                      height="24"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 24 0 L 0 0 0 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.8"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#pgrid)" />
                </svg>
              </div>

              {/* Avatar */}
              <div
                className="relative flex justify-center"
                style={{ marginTop: -44 }}
              >
                <div
                  className="rounded-full overflow-hidden"
                  style={{
                    width: 88,
                    height: 88,
                    border: "4px solid #fff",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    backgroundColor: "#f0f5ff",
                  }}
                >
                  <Image
                    src="/img/undraw_profile.svg"
                    alt={user.username}
                    width={88}
                    height={88}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="px-6 pb-6 pt-3 flex flex-col items-center gap-2">
                <h3
                  className="text-lg font-semibold"
                  style={{
                    color: "#111827",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {user.username}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: "#9ca3af",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {user.email}
                </p>
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-semibold mt-1"
                  style={{
                    backgroundColor: rc.bg,
                    color: rc.color,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {rolLabel}
                </span>

                {/* Divider */}
                <div
                  className="w-full h-px my-2"
                  style={{ backgroundColor: "#f0f0f4" }}
                />

                {/* Dato miembro desde */}
                <div className="flex items-center gap-2">
                  <CalendarDays size={13} style={{ color: "#9ca3af" }} />
                  <span
                    className="text-xs"
                    style={{
                      color: "#9ca3af",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Miembro desde {fmtDate(user.createdAt)}
                  </span>
                </div>

                {/* Stats mini */}
                <div className="grid grid-cols-2 gap-3 w-full mt-3">
                  {[
                    { label: "Rol", value: rolLabel, color: rc.color },
                    { label: "Estado", value: "Activo", color: "#2a9912" },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center py-3 rounded-xl"
                      style={{ backgroundColor: "#f8f9fc" }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color, fontFamily: "'Poppins', sans-serif" }}
                      >
                        {value}
                      </span>
                      <span
                        className="text-[10px] mt-0.5"
                        style={{
                          color: "#9ca3af",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Columna derecha ── */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Card info personal */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14 }}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "#fff",
                boxShadow: "0 1px 12px rgba(0,0,0,0.07)",
                border: "1px solid #f0f0f4",
              }}
            >
              <div
                className="flex items-center gap-3 px-6 py-4"
                style={{ borderBottom: "1px solid #f0f0f4" }}
              >
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 34,
                    height: 34,
                    backgroundColor: "#0b3d9110",
                  }}
                >
                  <User size={16} style={{ color: "#0b3d91" }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "#111827",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Información personal
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "#9ca3af",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Datos de solo lectura — administrados por el sistema
                  </p>
                </div>
              </div>

              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <ReadonlyField
                  label="Usuario"
                  value={user.username}
                  icon={<User size={15} />}
                />
                <ReadonlyField
                  label="Correo"
                  value={user.email}
                  icon={<Mail size={15} />}
                />
                <ReadonlyField
                  label="Rol"
                  value={rolLabel}
                  icon={<Shield size={15} />}
                />
                <ReadonlyField
                  label="Miembro desde"
                  value={fmtDate(user.createdAt)}
                  icon={<CalendarDays size={15} />}
                />
              </div>
            </motion.div>

            {/* Card cambio de contraseña */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "#fff",
                boxShadow: "0 1px 12px rgba(0,0,0,0.07)",
                border: "1px solid #f0f0f4",
              }}
            >
              <div
                className="flex items-center gap-3 px-6 py-4"
                style={{ borderBottom: "1px solid #f0f0f4" }}
              >
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 34,
                    height: 34,
                    backgroundColor: "#49c21b18",
                  }}
                >
                  <KeyRound size={16} style={{ color: "#49c21b" }} />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "#111827",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Cambiar contraseña
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: "#9ca3af",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    Usa una contraseña segura de al menos 6 caracteres
                  </p>
                </div>
              </div>

              <div className="px-6 py-5">
                <CambiarPassword
                  onSuccess={() =>
                    setToast("Contraseña actualizada exitosamente")
                  }
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      </AnimatePresence>
    </>
  );
}
