"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, Search, Pencil, Trash2, X, Save, Loader2,
  AlertCircle, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight,
  Shield, ShieldCheck, User, Mail, Lock, Eye, EyeOff, RefreshCw,
  ToggleLeft, ToggleRight, KeyRound,
} from "lucide-react";
import { useUsuarios, useUsuariosCrud } from "@/app/hooks/useUsuarios";
import type { UsuarioResponse, UsuarioCreateRequest, UsuarioUpdateRequest, ChangePasswordRequest, UserRol } from "@/app/types/usuario";
import { useAuth } from "@/app/context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG DE ROLES
// ─────────────────────────────────────────────────────────────────────────────

const ROL_CONFIG: Record<UserRol, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ADMIN:   { label: "Administrador", color: "#7c3aed", bg: "#f5f3ff", icon: <ShieldCheck size={12} /> },
  USER:    { label: "Usuario",       color: "#0b3d91", bg: "#eff6ff", icon: <User size={12} />        },
  BODEGA:  { label: "Bodega",        color: "#ca8a04", bg: "#fefce8", icon: <Shield size={12} />      },
};

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

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function focusOn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#0b3d91";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.1)";
}
function focusOff(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, err?: boolean) {
  e.currentTarget.style.borderColor = err ? "#fca5a5" : "#e5e7eb";
  e.currentTarget.style.boxShadow = "none";
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#0b3d91", "#7c3aed", "#ca8a04", "#16a34a", "#c2410c", "#0891b2"];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLIENT
// ─────────────────────────────────────────────────────────────────────────────

export default function UsuariosClient() {
  const { user: me } = useAuth();
  const { usuarios, total, totalPages, page, loading, error, recargar } = useUsuarios(10);
  const crud = useUsuariosCrud();

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<UserRol | "TODOS">("TODOS");
  const [modalCrear, setModalCrear] = useState(false);
  const [editando, setEditando] = useState<UsuarioResponse | null>(null);
  const [eliminando, setEliminando] = useState<UsuarioResponse | null>(null);
  const [cambiandoPass, setCambiandoPass] = useState(false);
  const [toast, setToast] = useState<{ tipo: "ok" | "err"; msg: string } | null>(null);

  const showToast = (tipo: "ok" | "err", msg: string) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const filtrados = usuarios.filter(u => {
    const matchBusqueda = u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = filtroRol === "TODOS" || u.rol === filtroRol;
    return matchBusqueda && matchRol;
  });

  // KPIs
  const admins  = usuarios.filter(u => u.rol === "ADMIN").length;
  const users   = usuarios.filter(u => u.rol === "USER").length;
  const bodega  = usuarios.filter(u => u.rol === "BODEGA").length;
  const activos = usuarios.filter(u => u.activo).length;

  const handleCrear = async (data: UsuarioCreateRequest) => {
    try {
      await crud.crear(data);
      setModalCrear(false);
      showToast("ok", "Usuario creado correctamente");
      recargar(page);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Error al crear usuario");
    }
  };

  const handleEditar = async (data: UsuarioUpdateRequest) => {
    if (!editando) return;
    try {
      await crud.actualizar(editando.id, data);
      setEditando(null);
      showToast("ok", "Usuario actualizado correctamente");
      recargar(page);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Error al actualizar usuario");
    }
  };

  const handleEliminar = async () => {
    if (!eliminando) return;
    try {
      await crud.eliminar(eliminando.id);
      setEliminando(null);
      showToast("ok", "Usuario eliminado correctamente");
      recargar(page);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Error al eliminar usuario");
    }
  };

  const handleToggle = async (u: UsuarioResponse) => {
    try {
      await crud.toggleActivo(u.id);
      showToast("ok", `Usuario ${u.activo ? "desactivado" : "activado"} correctamente`);
      recargar(page);
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  const handleCambiarPassword = async (data: ChangePasswordRequest) => {
    try {
      await crud.cambiarPassword(data);
      setCambiandoPass(false);
      showToast("ok", "Contraseña actualizada correctamente");
    } catch (err) {
      showToast("err", err instanceof Error ? err.message : "Error al cambiar contraseña");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-5 right-5 z-[100] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-xl"
            style={{
              borderColor: toast.tipo === "ok" ? "#bbf7d0" : "#fecaca",
              backgroundColor: toast.tipo === "ok" ? "#f0fdf4" : "#fef2f2",
              minWidth: 300,
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
        style={{ borderColor: "#dbe4ff", background: "linear-gradient(135deg, rgba(11,61,145,0.07) 0%, rgba(124,58,237,0.07) 100%)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(124,58,237,0.10)" }}>
              <Users size={24} style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                Gestión de Usuarios
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
                {total} usuario{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""} · {activos} activo{activos !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCambiandoPass(true)}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all"
              style={{ borderColor: "#d0d5dd", backgroundColor: "#fff", color: "#374151", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#7c3aed"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d5dd"; e.currentTarget.style.color = "#374151"; }}>
              <KeyRound size={14} /> Mi Contraseña
            </button>
            <button onClick={() => recargar(page)} disabled={loading}
              className="flex items-center justify-center rounded-xl border w-10 h-10 transition-all"
              style={{ borderColor: "#d0d5dd", backgroundColor: "#fff", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#7c3aed"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#d0d5dd"}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} style={{ color: "#6b7280" }} />
            </button>
            <button onClick={() => setModalCrear(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: "#7c3aed", border: "none", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#6d28d9")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#7c3aed")}>
              <UserPlus size={16} /> Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total",         value: total,   color: "#7c3aed", bg: "#f5f3ff", icon: <Users size={18} />      },
          { label: "Administradores", value: admins, color: "#0b3d91", bg: "#eff6ff", icon: <ShieldCheck size={18} /> },
          { label: "Usuarios",      value: users,   color: "#ca8a04", bg: "#fefce8", icon: <User size={18} />        },
          { label: "Bodega",        value: bodega,  color: "#16a34a", bg: "#f0fdf4", icon: <Shield size={18} />      },
        ].map(({ label, value, color, bg, icon }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{ backgroundColor: "#fff", boxShadow: "0 1px 12px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}>
            <div className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 42, height: 42, backgroundColor: bg }}>
              <span style={{ color }}>{icon}</span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color, fontFamily: "'Poppins', sans-serif" }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{loading ? "—" : value}</p>
            </div>
          </motion.div>
        ))}
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

      {/* ── FILTROS ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por usuario o correo…"
            style={{ ...inp(), paddingLeft: 38, fontSize: 13 }}
            onFocus={focusOn} onBlur={focusOff} />
        </div>
        <div className="flex items-center gap-2">
          {(["TODOS", "ADMIN", "USER", "BODEGA"] as const).map(rol => {
            const cfg = rol !== "TODOS" ? ROL_CONFIG[rol] : null;
            const active = filtroRol === rol;
            return (
              <button key={rol} onClick={() => setFiltroRol(rol)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
                style={{
                  backgroundColor: active ? (cfg?.color ?? "#374151") : "#f3f4f6",
                  color: active ? "#fff" : "#6b7280",
                  border: "none", cursor: "pointer",
                }}>
                {cfg?.icon}
                {rol === "TODOS" ? "Todos" : cfg?.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TABLA ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader2 size={20} className="animate-spin" style={{ color: "#7c3aed" }} />
            <p className="text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>Cargando usuarios…</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Users size={36} style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              {busqueda || filtroRol !== "TODOS" ? "No se encontraron coincidencias." : "No hay usuarios registrados aún."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  {["Usuario", "Correo", "Rol", "Estado", "Creado", "Acciones"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase"
                      style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif", borderBottom: "1px solid #eaecf0", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u, i) => {
                  const cfg = ROL_CONFIG[u.rol];
                  const esSelf = u.username === me?.username;
                  return (
                    <motion.tr key={u.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: "1px solid #f3f4f6", opacity: u.activo ? 1 : 0.6 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>

                      {/* Usuario */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 text-xs font-bold text-white"
                            style={{ backgroundColor: avatarColor(u.id) }}>
                            {initials(u.username)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>
                              {u.username}
                              {esSelf && <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#ede9fe", color: "#7c3aed" }}>Tú</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Correo */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} style={{ color: "#9ca3af", flexShrink: 0 }} />
                          <span className="text-sm" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>{u.correo}</span>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: u.activo ? "#dcfce7" : "#f3f4f6",
                            color: u.activo ? "#166534" : "#6b7280",
                          }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.activo ? "#16a34a" : "#9ca3af" }} />
                          {u.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                          {fmtDate(u.createdAt)}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {/* Toggle activo */}
                          <button onClick={() => handleToggle(u)} disabled={esSelf || crud.toggling === u.id} title={u.activo ? "Desactivar" : "Activar"}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
                            style={{ backgroundColor: u.activo ? "#dcfce7" : "#f3f4f6", border: "none", cursor: esSelf ? "not-allowed" : "pointer", opacity: esSelf ? 0.4 : 1 }}
                            onMouseEnter={e => { if (!esSelf) e.currentTarget.style.backgroundColor = u.activo ? "#bbf7d0" : "#e5e7eb"; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = u.activo ? "#dcfce7" : "#f3f4f6"; }}>
                            {crud.toggling === u.id
                              ? <Loader2 size={13} className="animate-spin" style={{ color: "#6b7280" }} />
                              : u.activo
                                ? <ToggleRight size={13} style={{ color: "#16a34a" }} />
                                : <ToggleLeft size={13} style={{ color: "#9ca3af" }} />}
                          </button>

                          {/* Editar */}
                          <button onClick={() => setEditando(u)} title="Editar"
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
                            style={{ backgroundColor: "rgba(11,61,145,0.08)", border: "none", cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(11,61,145,0.16)")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(11,61,145,0.08)")}>
                            <Pencil size={13} style={{ color: "#0b3d91" }} />
                          </button>

                          {/* Eliminar */}
                          <button onClick={() => setEliminando(u)} disabled={esSelf} title="Eliminar"
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
                            style={{ backgroundColor: "#fef2f2", border: "none", cursor: esSelf ? "not-allowed" : "pointer", opacity: esSelf ? 0.4 : 1 }}
                            onMouseEnter={e => { if (!esSelf) e.currentTarget.style.backgroundColor = "#fecaca"; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#fef2f2"; }}>
                            <Trash2 size={13} style={{ color: "#dc2626" }} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
            <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
              Página {page + 1} de {totalPages} · {total} usuarios
            </p>
            <div className="flex items-center gap-1">
              <PagBtn onClick={() => recargar(page - 1)} disabled={page === 0}><ChevronLeft size={14} /></PagBtn>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i : (page < 4 ? i : page - 3 + i);
                if (p < 0 || p >= totalPages) return null;
                return <PagBtn key={p} onClick={() => recargar(p)} active={p === page}>{p + 1}</PagBtn>;
              })}
              <PagBtn onClick={() => recargar(page + 1)} disabled={page >= totalPages - 1}><ChevronRight size={14} /></PagBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALES ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalCrear && (
          <UsuarioFormModal key="crear" titulo="Nuevo Usuario" modo="crear" submitting={crud.submitting}
            onClose={() => setModalCrear(false)} onSubmit={data => handleCrear(data as UsuarioCreateRequest)} />
        )}
        {editando && (
          <UsuarioFormModal key="editar" titulo="Editar Usuario" modo="editar" inicial={editando} submitting={crud.submitting}
            onClose={() => setEditando(null)} onSubmit={data => handleEditar(data as UsuarioUpdateRequest)} />
        )}
        {eliminando && (
          <ConfirmModal key="eliminar" usuario={eliminando} submitting={crud.submitting}
            onConfirm={handleEliminar} onClose={() => setEliminando(null)} />
        )}
        {cambiandoPass && (
          <ChangePasswordModal key="password" submitting={crud.submitting}
            onClose={() => setCambiandoPass(false)} onSubmit={handleCambiarPassword} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINACIÓN
// ─────────────────────────────────────────────────────────────────────────────

function PagBtn({ onClick, disabled, active, children }: {
  onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: active ? 700 : 500, fontFamily: "'Poppins', sans-serif",
      backgroundColor: active ? "#7c3aed" : "transparent",
      color: active ? "#fff" : "#6b7280",
      border: active ? "none" : "1px solid #e5e7eb",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL CREAR / EDITAR
// ─────────────────────────────────────────────────────────────────────────────

type FormData = {
  username: string; password: string; correo: string;
  rol: UserRol; activo: boolean;
};

function UsuarioFormModal({ titulo, modo, inicial, submitting, onClose, onSubmit }: {
  titulo: string;
  modo: "crear" | "editar";
  inicial?: UsuarioResponse;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}) {
  const [form, setForm] = useState<FormData>({
    username: inicial?.username ?? "",
    password: "",
    correo: inicial?.correo ?? "",
    rol: inicial?.rol ?? "USER",
    activo: inicial?.activo ?? true,
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.username.trim()) e.username = "Requerido";
    else if (form.username.length < 3) e.username = "Mínimo 3 caracteres";
    else if (!/^[a-zA-Z0-9._-]+$/.test(form.username)) e.username = "Solo letras, números, puntos, guiones";
    if (modo === "crear" && !form.password) e.password = "Requerido";
    if (form.password && form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (!form.correo.trim()) e.correo = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = "Correo inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (modo === "editar" && !payload.password) delete (payload as any).password;
    await onSubmit(payload);
  };

  const field = (k: keyof FormData) => ({
    value: String(form[k]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [k]: e.target.value }));
      setErrors(ev => ({ ...ev, [k]: undefined }));
    },
  });

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader icon={<Users size={20} style={{ color: "#7c3aed" }} />} titulo={titulo} onClose={onClose} accentColor="#7c3aed" />
      <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

        {/* Username */}
        <div>
          <label style={lbl}>Usuario <span style={{ color: "#ef4444" }}>*</span></label>
          <div className="relative">
            <User size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
            <input {...field("username")} placeholder="ej. juan.garcia" maxLength={50}
              style={{ ...inp(!!errors.username), paddingLeft: 38 }}
              onFocus={focusOn} onBlur={e => focusOff(e, !!errors.username)} />
          </div>
          {errors.username && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.username}</p>}
        </div>

        {/* Correo */}
        <div>
          <label style={lbl}>Correo electrónico <span style={{ color: "#ef4444" }}>*</span></label>
          <div className="relative">
            <Mail size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
            <input type="email" {...field("correo")} placeholder="juan@empresa.com" maxLength={100}
              style={{ ...inp(!!errors.correo), paddingLeft: 38 }}
              onFocus={focusOn} onBlur={e => focusOff(e, !!errors.correo)} />
          </div>
          {errors.correo && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.correo}</p>}
        </div>

        {/* Password */}
        <div>
          <label style={lbl}>
            Contraseña {modo === "editar" && <span style={{ color: "#9ca3af", fontSize: 11, textTransform: "none", fontWeight: 400 }}>(vacío = sin cambios)</span>}
            {modo === "crear" && <span style={{ color: "#ef4444" }}>*</span>}
          </label>
          <div className="relative">
            <Lock size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
            <input type={showPass ? "text" : "password"} {...field("password")} placeholder="Mínimo 6 caracteres" maxLength={100}
              style={{ ...inp(!!errors.password), paddingLeft: 38, paddingRight: 40 }}
              onFocus={focusOn} onBlur={e => focusOff(e, !!errors.password)} />
            <button type="button" onClick={() => setShowPass(s => !s)} tabIndex={-1}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.password}</p>}
        </div>

        {/* Rol */}
        <div>
          <label style={lbl}>Rol <span style={{ color: "#ef4444" }}>*</span></label>
          <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value as UserRol }))}
            style={{ ...inp(), cursor: "pointer" }} onFocus={focusOn} onBlur={focusOff}>
            <option value="ADMIN">Administrador</option>
            <option value="USER">Usuario</option>
            <option value="BODEGA">Bodega</option>
          </select>
        </div>

        {/* Activo (solo en editar) */}
        {modo === "editar" && (
          <div>
            <label style={lbl}>Estado</label>
            <button type="button"
              onClick={() => setForm(f => ({ ...f, activo: !f.activo }))}
              className="flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left transition-all"
              style={{
                borderColor: form.activo ? "#bbf7d0" : "#e5e7eb",
                backgroundColor: form.activo ? "#f0fdf4" : "#fafafa",
                cursor: "pointer",
              }}>
              <span style={{ color: form.activo ? "#16a34a" : "#9ca3af" }}>
                {form.activo ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              </span>
              <span className="text-sm font-medium" style={{ color: form.activo ? "#166534" : "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
                {form.activo ? "Usuario activo" : "Usuario inactivo"}
              </span>
            </button>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={submitting}
            className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
            style={{ borderColor: "#d0d5dd", color: "#374151", backgroundColor: "#fff", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: submitting ? "#6d28d9" : "#7c3aed", border: "none", fontFamily: "'Poppins', sans-serif", cursor: submitting ? "not-allowed" : "pointer" }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = "#6d28d9"; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = "#7c3aed"; }}>
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

function ConfirmModal({ usuario, submitting, onConfirm, onClose }: {
  usuario: UsuarioResponse; submitting: boolean;
  onConfirm: () => Promise<void>; onClose: () => void;
}) {
  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader icon={<AlertTriangle size={20} style={{ color: "#dc2626" }} />} titulo="Eliminar Usuario" onClose={onClose} accentColor="#dc2626" danger />
      <div className="px-6 py-5 flex flex-col gap-5">
        <div className="flex items-center gap-3 rounded-2xl border px-4 py-4"
          style={{ borderColor: "#fde68a", backgroundColor: "#fefce8" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
            style={{ backgroundColor: avatarColor(usuario.id) }}>
            {initials(usuario.username)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}>{usuario.username}</p>
            <p className="text-xs" style={{ color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>{usuario.correo}</p>
          </div>
        </div>
        <p className="text-sm" style={{ color: "#374151", fontFamily: "'Poppins', sans-serif", lineHeight: 1.6 }}>
          Esta acción eliminará permanentemente la cuenta del usuario. No se puede deshacer.
        </p>
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
// MODAL CAMBIAR CONTRASEÑA PROPIA
// ─────────────────────────────────────────────────────────────────────────────

function ChangePasswordModal({ submitting, onClose, onSubmit }: {
  submitting: boolean; onClose: () => void;
  onSubmit: (data: ChangePasswordRequest) => Promise<void>;
}) {
  const [form, setForm] = useState({ passwordActual: "", passwordNueva: "", passwordConfirmacion: "" });
  const [show, setShow] = useState({ actual: false, nueva: false, confirm: false });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.passwordActual) e.passwordActual = "Requerida";
    if (!form.passwordNueva) e.passwordNueva = "Requerida";
    else if (form.passwordNueva.length < 6) e.passwordNueva = "Mínimo 6 caracteres";
    if (!form.passwordConfirmacion) e.passwordConfirmacion = "Requerida";
    else if (form.passwordNueva !== form.passwordConfirmacion) e.passwordConfirmacion = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  type PassField = "actual" | "nueva" | "confirm";
  const passField = (key: keyof typeof form, showKey: PassField, label: string, placeholder: string) => (
    <div>
      <label style={lbl}>{label} <span style={{ color: "#ef4444" }}>*</span></label>
      <div className="relative">
        <Lock size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
        <input type={show[showKey] ? "text" : "password"}
          value={form[key]} onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(ev => ({ ...ev, [key]: undefined })); }}
          placeholder={placeholder}
          style={{ ...inp(!!(errors as any)[key]), paddingLeft: 38, paddingRight: 40 }}
          onFocus={focusOn} onBlur={fE => focusOff(fE, !!(errors as any)[key])} />
        <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))} tabIndex={-1}
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
          {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {(errors as any)[key] && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{(errors as any)[key]}</p>}
    </div>
  );

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader icon={<KeyRound size={20} style={{ color: "#7c3aed" }} />} titulo="Cambiar Contraseña" onClose={onClose} accentColor="#7c3aed" />
      <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
        {passField("passwordActual", "actual", "Contraseña actual", "Tu contraseña actual")}
        {passField("passwordNueva", "nueva", "Nueva contraseña", "Mínimo 6 caracteres")}
        {passField("passwordConfirmacion", "confirm", "Confirmar nueva contraseña", "Repite la nueva contraseña")}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={submitting}
            className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
            style={{ borderColor: "#d0d5dd", color: "#374151", backgroundColor: "#fff", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#7c3aed", border: "none", fontFamily: "'Poppins', sans-serif", cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Actualizando…</> : <><Save size={14} /> Actualizar</>}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVOS MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ backgroundColor: "#fff", boxShadow: "0 25px 80px rgba(0,0,0,0.18)" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalHeader({ icon, titulo, onClose, accentColor, danger }: {
  icon: React.ReactNode; titulo: string; onClose: () => void;
  accentColor?: string; danger?: boolean;
}) {
  const bg = danger ? "#fef2f2" : `${accentColor ?? "#0b3d91"}09`;
  return (
    <div className="flex items-center justify-between px-6 py-5"
      style={{ background: `linear-gradient(135deg, ${bg} 0%, #fff 100%)`, borderBottom: "1px solid #f0f0f4" }}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl"
          style={{ backgroundColor: bg }}>
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
