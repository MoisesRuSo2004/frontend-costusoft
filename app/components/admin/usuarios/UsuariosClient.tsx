"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Trash2,
  CheckCircle2,
  Shield,
  Users,
  UserCheck,
  UserX,
  Mail,
  Lock,
  User,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Pencil,
} from "lucide-react";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
type Rol = "ADMIN" | "OPERARIO" | "SUPERVISOR";
type Estado = "ACTIVO" | "INACTIVO";

interface Usuario {
  id: number;
  username: string;
  email: string;
  rol: Rol;
  estado: Estado;
  createdAt: string;
}

// ─────────────────────────────────────────────
// MOCK
// ─────────────────────────────────────────────
const MOCK: Usuario[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@costusoft.com",
    rol: "ADMIN",
    estado: "ACTIVO",
    createdAt: "2024-01-10T08:00:00",
  },
  {
    id: 2,
    username: "jlopez",
    email: "jlopez@costusoft.com",
    rol: "SUPERVISOR",
    estado: "ACTIVO",
    createdAt: "2024-02-14T09:30:00",
  },
  {
    id: 3,
    username: "mgarcia",
    email: "mgarcia@costusoft.com",
    rol: "OPERARIO",
    estado: "ACTIVO",
    createdAt: "2024-03-01T10:00:00",
  },
  {
    id: 4,
    username: "crodriguez",
    email: "crodriguez@costusoft.com",
    rol: "OPERARIO",
    estado: "INACTIVO",
    createdAt: "2024-03-15T11:00:00",
  },
  {
    id: 5,
    username: "lmartinez",
    email: "lmartinez@costusoft.com",
    rol: "SUPERVISOR",
    estado: "ACTIVO",
    createdAt: "2024-04-05T08:45:00",
  },
  {
    id: 6,
    username: "pharris",
    email: "pharris@costusoft.com",
    rol: "OPERARIO",
    estado: "ACTIVO",
    createdAt: "2024-05-20T14:00:00",
  },
  {
    id: 7,
    username: "kwilson",
    email: "kwilson@costusoft.com",
    rol: "OPERARIO",
    estado: "INACTIVO",
    createdAt: "2024-06-01T09:00:00",
  },
  {
    id: 8,
    username: "bthompson",
    email: "bthompson@costusoft.com",
    rol: "SUPERVISOR",
    estado: "ACTIVO",
    createdAt: "2024-06-10T10:30:00",
  },
];

// ─────────────────────────────────────────────
// PALETA
// ─────────────────────────────────────────────
const ROL_STYLE: Record<Rol, { bg: string; color: string; label: string }> = {
  ADMIN: { bg: "#0b3d9115", color: "#0b3d91", label: "Admin" },
  SUPERVISOR: { bg: "#8b5cf618", color: "#7c3aed", label: "Supervisor" },
  OPERARIO: { bg: "#49c21b18", color: "#2a9912", label: "Operario" },
};

const AVATAR_COLOR: Record<Rol, { bg: string; color: string }> = {
  ADMIN: { bg: "#0b3d91", color: "#fff" },
  SUPERVISOR: { bg: "#7c3aed", color: "#fff" },
  OPERARIO: { bg: "#49c21b", color: "#fff" },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────
// MODAL CREAR / EDITAR
// ─────────────────────────────────────────────
interface FormData {
  username: string;
  email: string;
  password: string;
  rol: Rol;
  estado: Estado;
}

function UsuarioModal({
  usuario,
  onClose,
  onSave,
}: {
  usuario: Usuario | null; // null = crear
  onClose: () => void;
  onSave: (data: FormData, id?: number) => Promise<void>;
}) {
  const isEdit = !!usuario;
  const [form, setForm] = useState<FormData>({
    username: usuario?.username ?? "",
    email: usuario?.email ?? "",
    password: "",
    rol: usuario?.rol ?? "OPERARIO",
    estado: usuario?.estado ?? "ACTIVO",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.username.trim()) e.username = "Requerido";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Correo inválido";
    if (!isEdit && !form.password.trim()) e.password = "Requerido";
    return e;
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    await onSave(form, usuario?.id);
    setLoading(false);
    onClose();
  };

  const inputStyle = (hasErr?: string) => ({
    width: "100%",
    padding: "10px 14px 10px 38px",
    border: `1.5px solid ${hasErr ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 10,
    fontSize: 13,
    fontFamily: "'Poppins', sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
    color: "#111827",
    backgroundColor: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  const focusStyle = {
    borderColor: "#0b3d91",
    boxShadow: "0 0 0 3px rgba(11,61,145,0.1)",
  };
  const blurStyle = (hasErr?: string) => ({
    borderColor: hasErr ? "#fca5a5" : "#e5e7eb",
    boxShadow: "none",
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 14 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full mx-4"
          style={{
            maxWidth: 480,
            backgroundColor: "#fff",
            borderRadius: 20,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, #0b3d91 0%, #072d6e 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "rgba(73,194,27,0.2)",
                }}
              >
                {isEdit ? (
                  <Pencil size={18} style={{ color: "#49c21b" }} />
                ) : (
                  <UserPlus size={18} style={{ color: "#49c21b" }} />
                )}
              </div>
              <div>
                <p
                  className="text-xs"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {isEdit
                    ? `Editando usuario #${usuario!.id}`
                    : "Nuevo usuario"}
                </p>
                <h3
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {isEdit ? usuario!.username : "Crear usuario"}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                padding: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
              }
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handle} className="px-6 py-5 flex flex-col gap-4">
            {/* Username */}
            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{
                  color: "#374151",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Usuario <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <User
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
                  type="text"
                  value={form.username}
                  placeholder="nombre.usuario"
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  style={inputStyle(errors.username)}
                  onFocus={(e) =>
                    Object.assign(e.currentTarget.style, focusStyle)
                  }
                  onBlur={(e) =>
                    Object.assign(
                      e.currentTarget.style,
                      blurStyle(errors.username),
                    )
                  }
                />
              </div>
              {errors.username && (
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{
                  color: "#374151",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Correo electrónico <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="relative">
                <Mail
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
                  type="email"
                  value={form.email}
                  placeholder="usuario@costusoft.com"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={inputStyle(errors.email)}
                  onFocus={(e) =>
                    Object.assign(e.currentTarget.style, focusStyle)
                  }
                  onBlur={(e) =>
                    Object.assign(
                      e.currentTarget.style,
                      blurStyle(errors.email),
                    )
                  }
                />
              </div>
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                className="text-xs font-medium mb-1.5 block"
                style={{
                  color: "#374151",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Contraseña{" "}
                {!isEdit && <span style={{ color: "#ef4444" }}>*</span>}
                {isEdit && (
                  <span
                    className="ml-1 text-[10px]"
                    style={{ color: "#9ca3af" }}
                  >
                    (dejar vacío para no cambiar)
                  </span>
                )}
              </label>
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
                  type="password"
                  value={form.password}
                  placeholder="••••••••"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  style={inputStyle(errors.password)}
                  onFocus={(e) =>
                    Object.assign(e.currentTarget.style, focusStyle)
                  }
                  onBlur={(e) =>
                    Object.assign(
                      e.currentTarget.style,
                      blurStyle(errors.password),
                    )
                  }
                />
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Rol + Estado en fila */}
            <div className="grid grid-cols-2 gap-3">
              {/* Rol */}
              <div>
                <label
                  className="text-xs font-medium mb-1.5 block"
                  style={{
                    color: "#374151",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Rol
                </label>
                <div className="relative">
                  <ShieldCheck
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
                  <select
                    value={form.rol}
                    onChange={(e) =>
                      setForm({ ...form, rol: e.target.value as Rol })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 34px",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: 10,
                      fontSize: 13,
                      fontFamily: "'Poppins', sans-serif",
                      color: "#374151",
                      outline: "none",
                      boxSizing: "border-box" as const,
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      appearance: "none" as const,
                    }}
                    onFocus={(e) =>
                      Object.assign(e.currentTarget.style, {
                        borderColor: "#0b3d91",
                        boxShadow: "0 0 0 3px rgba(11,61,145,0.1)",
                      })
                    }
                    onBlur={(e) =>
                      Object.assign(e.currentTarget.style, {
                        borderColor: "#e5e7eb",
                        boxShadow: "none",
                      })
                    }
                  >
                    <option value="OPERARIO">Operario</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label
                  className="text-xs font-medium mb-1.5 block"
                  style={{
                    color: "#374151",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Estado
                </label>
                <div className="flex gap-2 pt-1">
                  {(["ACTIVO", "INACTIVO"] as Estado[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, estado: s })}
                      className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all"
                      style={{
                        border: `1.5px solid ${form.estado === s ? (s === "ACTIVO" ? "#49c21b" : "#dc2626") : "#e5e7eb"}`,
                        backgroundColor:
                          form.estado === s
                            ? s === "ACTIVO"
                              ? "#49c21b18"
                              : "#dc262618"
                            : "transparent",
                        color:
                          form.estado === s
                            ? s === "ACTIVO"
                              ? "#2a9912"
                              : "#dc2626"
                            : "#9ca3af",
                        fontFamily: "'Poppins', sans-serif",
                        cursor: "pointer",
                      }}
                    >
                      {s === "ACTIVO" ? "Activo" : "Inactivo"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-sm rounded-xl transition-all"
                style={{
                  border: "1.5px solid #e5e7eb",
                  backgroundColor: "transparent",
                  color: "#6b7280",
                  fontFamily: "'Poppins', sans-serif",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#9ca3af")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#e5e7eb")
                }
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{
                  backgroundColor: "#0b3d91",
                  color: "#fff",
                  border: "none",
                  fontFamily: "'Poppins', sans-serif",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.8 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.backgroundColor = "#49c21b";
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    e.currentTarget.style.backgroundColor = "#0b3d91";
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
                    </svg>{" "}
                    Guardando...
                  </>
                ) : isEdit ? (
                  "Guardar cambios"
                ) : (
                  "Crear usuario"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// MODAL DETALLE
// ─────────────────────────────────────────────
function DetalleModal({
  usuario,
  onClose,
  onEdit,
}: {
  usuario: Usuario;
  onClose: () => void;
  onEdit: () => void;
}) {
  const av = AVATAR_COLOR[usuario.rol];
  const rs = ROL_STYLE[usuario.rol];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full mx-4"
          style={{
            maxWidth: 400,
            backgroundColor: "#fff",
            borderRadius: 20,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Avatar header */}
          <div
            className="flex flex-col items-center pt-8 pb-5 px-6"
            style={{
              background: "linear-gradient(180deg, #f8f9fc 0%, #fff 100%)",
              borderBottom: "1px solid #f0f0f4",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
              }}
            >
              <X size={18} />
            </button>
            <div
              className="flex items-center justify-center rounded-full text-lg font-bold mb-3"
              style={{
                width: 72,
                height: 72,
                backgroundColor: av.bg,
                color: av.color,
                fontFamily: "'Poppins', sans-serif",
                boxShadow: `0 4px 16px ${av.bg}55`,
              }}
            >
              {initials(usuario.username)}
            </div>
            <h3
              className="text-base font-semibold"
              style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
            >
              {usuario.username}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
              {usuario.email}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: rs.bg,
                  color: rs.color,
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {rs.label}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor:
                    usuario.estado === "ACTIVO" ? "#49c21b18" : "#dc262618",
                  color: usuario.estado === "ACTIVO" ? "#2a9912" : "#dc2626",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {usuario.estado === "ACTIVO" ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          <div className="px-6 py-4">
            <p
              className="text-xs text-center"
              style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
            >
              Miembro desde {fmtDate(usuario.createdAt)}
            </p>
          </div>

          <div className="px-6 pb-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm rounded-xl transition-all"
              style={{
                border: "1.5px solid #e5e7eb",
                backgroundColor: "transparent",
                color: "#6b7280",
                fontFamily: "'Poppins', sans-serif",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: "#0b3d91",
                color: "#fff",
                border: "none",
                fontFamily: "'Poppins', sans-serif",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#49c21b")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#0b3d91")
              }
            >
              <Pencil size={14} /> Editar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// MODAL ELIMINAR
// ─────────────────────────────────────────────
function ConfirmDeleteModal({
  usuario,
  onClose,
  onConfirm,
  loading,
}: {
  usuario: Usuario;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative w-full mx-4 text-center"
          style={{
            maxWidth: 360,
            backgroundColor: "#fff",
            borderRadius: 20,
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            padding: "32px 28px 28px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-center rounded-full mx-auto mb-4"
            style={{ width: 60, height: 60, backgroundColor: "#fee2e2" }}
          >
            <Trash2 size={26} style={{ color: "#dc2626" }} />
          </div>
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
          >
            ¿Eliminar usuario?
          </h3>
          <p
            className="text-sm mb-1"
            style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}
          >
            Estás a punto de eliminar a
          </p>
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
          >
            "{usuario.username}"
          </p>
          <p
            className="text-xs mb-6"
            style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
          >
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm rounded-xl"
              style={{
                border: "1.5px solid #e5e7eb",
                backgroundColor: "transparent",
                color: "#6b7280",
                fontFamily: "'Poppins', sans-serif",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#dc2626",
                color: "#fff",
                border: "none",
                fontFamily: "'Poppins', sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.8 : 1,
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
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Sí, eliminar
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
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
        {message}
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function UsuariosClient() {
  const [items, setItems] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Usuario | null>(null);
  const [detalleTarget, setDetalleTarget] = useState<Usuario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: reemplazar con → const data = await getUsuarios();
      await new Promise((r) => setTimeout(r, 500));
      setItems(MOCK);
    } catch {
      setError("No se pudo cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Filtrado ──
  const filtered = items.filter((u) => {
    const q = query.toLowerCase();
    const matchQ =
      u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchR = rolFilter ? u.rol === rolFilter : true;
    const matchE = estadoFilter ? u.estado === estadoFilter : true;
    return matchQ && matchR && matchE;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  // ── Stats ──
  const activos = items.filter((u) => u.estado === "ACTIVO").length;
  const inactivos = items.filter((u) => u.estado === "INACTIVO").length;

  // ── Save (crear/editar) ──
  const handleSave = async (data: FormData, id?: number) => {
    // TODO: if(id) await updateUsuario(id, data); else await createUsuario(data);
    await new Promise((r) => setTimeout(r, 700));
    if (id) {
      setItems((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data } : u)),
      );
      setToast(`Usuario "${data.username}" actualizado`);
    } else {
      const newUser: Usuario = {
        id: Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [newUser, ...prev]);
      setToast(`Usuario "${data.username}" creado`);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      // TODO: await deleteUsuario(deleteTarget.id);
      await new Promise((r) => setTimeout(r, 700));
      setItems((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setToast(`Usuario "${deleteTarget.username}" eliminado`);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // ── Toggle estado ──
  const toggleEstado = async (usuario: Usuario) => {
    // TODO: await toggleUsuarioEstado(usuario.id);
    const next: Estado = usuario.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    setItems((prev) =>
      prev.map((u) => (u.id === usuario.id ? { ...u, estado: next } : u)),
    );
    setToast(`${usuario.username} marcado como ${next.toLowerCase()}`);
  };

  const buildPages = (total: number, current: number) =>
    Array.from({ length: total }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === total || Math.abs(p - current) <= 1)
      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
        acc.push(p);
        return acc;
      }, []);

  const anyFilter = !!(query || rolFilter || estadoFilter);

  return (
    <>
      <div className="flex flex-col gap-6 pb-7">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
            >
              Usuarios
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
            >
              Administra los usuarios registrados en el sistema.
            </p>
          </div>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all"
            style={{
              backgroundColor: "#0b3d91",
              color: "#fff",
              border: "none",
              fontFamily: "'Poppins', sans-serif",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#49c21b")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#0b3d91")
            }
          >
            <UserPlus size={15} /> Nuevo Usuario
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total usuarios",
              value: items.length,
              color: "#0b3d91",
              icon: Users,
            },
            {
              label: "Administradores",
              value: items.filter((u) => u.rol === "ADMIN").length,
              color: "#0b3d91",
              icon: Shield,
            },
            {
              label: "Activos",
              value: activos,
              color: "#49c21b",
              icon: UserCheck,
            },
            {
              label: "Inactivos",
              value: inactivos,
              color: "#dc2626",
              icon: UserX,
            },
          ].map(({ label, value, color, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl px-4 py-4"
              style={{
                backgroundColor: "#fff",
                boxShadow: "0 1px 10px rgba(0,0,0,0.06)",
                borderLeft: `4px solid ${color}`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 40, height: 40, backgroundColor: color + "18" }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color, fontFamily: "'Poppins', sans-serif" }}
                >
                  {label}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: "#111827",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabla card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#fff",
            boxShadow: "0 1px 12px rgba(0,0,0,0.07)",
            border: "1px solid #f0f0f4",
          }}
        >
          {/* Toolbar */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
            style={{ borderBottom: "1px solid #f0f0f4" }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
            >
              Lista de Usuarios
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro rol */}
              <select
                value={rolFilter}
                onChange={(e) => {
                  setRolFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "7px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "'Poppins', sans-serif",
                  color: rolFilter ? "#374151" : "#9ca3af",
                  outline: "none",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0b3d91")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              >
                <option value="">Todos los roles</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="OPERARIO">Operario</option>
              </select>

              {/* Filtro estado */}
              <select
                value={estadoFilter}
                onChange={(e) => {
                  setEstadoFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "7px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "'Poppins', sans-serif",
                  color: estadoFilter ? "#374151" : "#9ca3af",
                  outline: "none",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0b3d91")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>

              {/* Limpiar */}
              {anyFilter && (
                <button
                  onClick={() => {
                    setQuery("");
                    setRolFilter("");
                    setEstadoFilter("");
                    setPage(1);
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
                  style={{
                    border: "1.5px solid #fca5a5",
                    backgroundColor: "#fee2e2",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <X size={11} /> Limpiar
                </button>
              )}

              {/* Search */}
              <div className="relative">
                <Search
                  size={13}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    paddingLeft: 32,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: "'Poppins', sans-serif",
                    outline: "none",
                    width: 190,
                    color: "#374151",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#0b3d91")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#e5e7eb")
                  }
                />
              </div>

              {/* Refresh */}
              <button
                onClick={load}
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 36,
                  height: 36,
                  border: "1.5px solid #e5e7eb",
                  backgroundColor: "transparent",
                  color: "#6b7280",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0b3d91";
                  e.currentTarget.style.color = "#0b3d91";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.color = "#6b7280";
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 700,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#fafafa" }}>
                  {[
                    "#",
                    "Usuario",
                    "Correo",
                    "Rol",
                    "Estado",
                    "Miembro desde",
                    "Acciones",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color: "#9ca3af",
                        fontFamily: "'Poppins', sans-serif",
                        borderBottom: "1px solid #f0f0f4",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f7f7f9" }}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div
                            className="animate-pulse rounded"
                            style={{
                              height: 13,
                              width: j === 1 ? 140 : j === 2 ? 160 : 70,
                              backgroundColor: "#f3f4f6",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center">
                      <div
                        className="flex items-center justify-center gap-2 text-sm"
                        style={{ color: "#dc2626" }}
                      >
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <Users
                        size={32}
                        style={{ color: "#d1d5db", margin: "0 auto 8px" }}
                      />
                      <p
                        className="text-sm"
                        style={{
                          color: "#9ca3af",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        {anyFilter
                          ? "Sin resultados para tu búsqueda"
                          : "Sin usuarios registrados"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paged.map((u, i) => {
                    const av = AVATAR_COLOR[u.rol];
                    const rs = ROL_STYLE[u.rol];
                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom:
                            i < paged.length - 1 ? "1px solid #f7f7f9" : "none",
                          transition: "background-color 0.12s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fafbff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        {/* # */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-xs font-mono"
                            style={{ color: "#9ca3af" }}
                          >
                            #{u.id}
                          </span>
                        </td>

                        {/* Usuario con avatar */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                              style={{
                                width: 36,
                                height: 36,
                                backgroundColor: av.bg,
                                color: av.color,
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              {initials(u.username)}
                            </div>
                            <span
                              className="text-sm font-medium"
                              style={{
                                color: "#111827",
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              {u.username}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-sm"
                            style={{
                              color: "#6b7280",
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            {u.email}
                          </span>
                        </td>

                        {/* Rol */}
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: rs.bg,
                              color: rs.color,
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            <Shield size={10} />
                            {rs.label}
                          </span>
                        </td>

                        {/* Estado + toggle */}
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => toggleEstado(u)}
                            className="flex items-center gap-1.5 transition-colors group"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                            }}
                            title="Cambiar estado"
                          >
                            {u.estado === "ACTIVO" ? (
                              <ToggleRight
                                size={20}
                                style={{ color: "#49c21b" }}
                              />
                            ) : (
                              <ToggleLeft
                                size={20}
                                style={{ color: "#d1d5db" }}
                              />
                            )}
                            <span
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  u.estado === "ACTIVO" ? "#2a9912" : "#9ca3af",
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              {u.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                            </span>
                          </button>
                        </td>

                        {/* Fecha */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-xs"
                            style={{ color: "#9ca3af" }}
                          >
                            {fmtDate(u.createdAt)}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setDetalleTarget(u)}
                              className="flex items-center gap-1 text-xs font-medium transition-colors"
                              style={{
                                color: "#0b3d91",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "'Poppins', sans-serif",
                                padding: 0,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#49c21b")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "#0b3d91")
                              }
                            >
                              <Eye size={13} /> Ver
                            </button>
                            <span style={{ color: "#e5e7eb" }}>|</span>
                            <button
                              onClick={() => setEditTarget(u)}
                              className="flex items-center gap-1 text-xs font-medium transition-colors"
                              style={{
                                color: "#6b7280",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "'Poppins', sans-serif",
                                padding: 0,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#0b3d91")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "#6b7280")
                              }
                            >
                              <Pencil size={13} /> Editar
                            </button>
                            <span style={{ color: "#e5e7eb" }}>|</span>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="flex items-center gap-1 text-xs font-medium transition-colors"
                              style={{
                                color: "#9ca3af",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "'Poppins', sans-serif",
                                padding: 0,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#dc2626")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "#9ca3af")
                              }
                            >
                              <Trash2 size={13} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && filtered.length > 0 && (
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              style={{ borderTop: "1px solid #f0f0f4" }}
            >
              <span
                className="text-xs"
                style={{
                  color: "#9ca3af",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Mostrando {start + 1}–
                {Math.min(start + perPage, filtered.length)} de{" "}
                {filtered.length} usuarios
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 32,
                    height: 32,
                    border: "1.5px solid #e5e7eb",
                    backgroundColor: "transparent",
                    color: page === 1 ? "#d1d5db" : "#374151",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                {buildPages(totalPages, page).map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`e${i}`}
                      className="px-1 text-xs"
                      style={{ color: "#9ca3af" }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className="flex items-center justify-center rounded-lg text-xs font-medium"
                      style={{
                        width: 32,
                        height: 32,
                        border: `1.5px solid ${page === p ? "#0b3d91" : "#e5e7eb"}`,
                        backgroundColor: page === p ? "#0b3d91" : "transparent",
                        color: page === p ? "#fff" : "#374151",
                        cursor: "pointer",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 32,
                    height: 32,
                    border: "1.5px solid #e5e7eb",
                    backgroundColor: "transparent",
                    color: page === totalPages ? "#d1d5db" : "#374151",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  padding: "4px 10px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: "'Poppins', sans-serif",
                  color: "#374151",
                  outline: "none",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                }}
              >
                {[5, 10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / pág
                  </option>
                ))}
              </select>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {(createModal || editTarget) && (
        <UsuarioModal
          usuario={editTarget}
          onClose={() => {
            setCreateModal(false);
            setEditTarget(null);
          }}
          onSave={handleSave}
        />
      )}
      {detalleTarget && (
        <DetalleModal
          usuario={detalleTarget}
          onClose={() => setDetalleTarget(null)}
          onEdit={() => setEditTarget(detalleTarget)}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          usuario={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast("")} />}
      </AnimatePresence>
    </>
  );
}
