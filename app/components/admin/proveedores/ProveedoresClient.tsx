"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Trash2,
  CheckCircle2,
  Pencil,
  Phone,
  MapPin,
  Hash,
  Building2,
  Mail,
  Globe,
  Package,
} from "lucide-react";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  nit: string;
  direccion: string;
  ciudad: string;
  email?: string;
  contacto?: string; // nombre del contacto principal
}

// ─────────────────────────────────────────────
// MOCK
// ─────────────────────────────────────────────
const MOCK: Proveedor[] = [
  {
    id: 1,
    nombre: "Textiles Andinos S.A.S",
    telefono: "601-234-5678",
    nit: "900.123.456-7",
    direccion: "Cra 15 #80-25",
    ciudad: "Bogotá",
    email: "ventas@textilsandinos.com",
    contacto: "Carlos Ruiz",
  },
  {
    id: 2,
    nombre: "Distribuidora Sur Ltda",
    telefono: "604-987-6543",
    nit: "800.987.654-3",
    direccion: "Cll 50 #42-10",
    ciudad: "Medellín",
    email: "info@distribuidorasur.com",
    contacto: "Ana Gómez",
  },
  {
    id: 3,
    nombre: "Mercería Central",
    telefono: "602-345-6789",
    nit: "700.345.678-9",
    direccion: "Av. 6 Norte #28-15",
    ciudad: "Cali",
    email: "pedidos@merceriacentral.co",
    contacto: "Pedro Silva",
  },
  {
    id: 4,
    nombre: "Insumos Industriales SAS",
    telefono: "607-654-3210",
    nit: "901.654.321-0",
    direccion: "Zona Industrial #5",
    ciudad: "Barranquilla",
    email: "ventas@insindustriales.com",
    contacto: "Laura Torres",
  },
  {
    id: 5,
    nombre: "Hilos y Telas del Norte",
    telefono: "607-111-2233",
    nit: "800.111.222-3",
    direccion: "Cra 45 #12-30",
    ciudad: "Bucaramanga",
    email: "contacto@hilosytelas.com",
    contacto: "Miguel Pérez",
  },
  {
    id: 6,
    nombre: "Accesorios Moda Plus",
    telefono: "601-555-7890",
    nit: "900.555.789-0",
    direccion: "Cll 90 #15-60",
    ciudad: "Bogotá",
    email: "ventas@modaplus.com.co",
    contacto: "Sandra López",
  },
  {
    id: 7,
    nombre: "Proveedora El Telar",
    telefono: "604-222-3344",
    nit: "700.222.334-4",
    direccion: "Av. El Poblado #10",
    ciudad: "Medellín",
    email: "elptelar@gmail.com",
    contacto: "Jorge Castro",
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Color deterministico por id para el avatar
const AVATAR_PALETTES = [
  { bg: "#0b3d91", color: "#fff" },
  { bg: "#49c21b", color: "#fff" },
  { bg: "#7c3aed", color: "#fff" },
  { bg: "#c2410c", color: "#fff" },
  { bg: "#0891b2", color: "#fff" },
  { bg: "#b45309", color: "#fff" },
  { bg: "#be185d", color: "#fff" },
];

function avatarPalette(id: number) {
  return AVATAR_PALETTES[id % AVATAR_PALETTES.length];
}

// ─────────────────────────────────────────────
// MODAL CREAR / EDITAR
// ─────────────────────────────────────────────
type FormData = Omit<Proveedor, "id">;

function ProveedorModal({
  proveedor,
  onClose,
  onSave,
}: {
  proveedor: Proveedor | null;
  onClose: () => void;
  onSave: (data: FormData, id?: number) => Promise<void>;
}) {
  const isEdit = !!proveedor;
  const [form, setForm] = useState<FormData>({
    nombre: proveedor?.nombre ?? "",
    telefono: proveedor?.telefono ?? "",
    nit: proveedor?.nit ?? "",
    direccion: proveedor?.direccion ?? "",
    ciudad: proveedor?.ciudad ?? "",
    email: proveedor?.email ?? "",
    contacto: proveedor?.contacto ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.nit.trim()) e.nit = "Requerido";
    if (!form.telefono.trim()) e.telefono = "Requerido";
    if (!form.ciudad.trim()) e.ciudad = "Requerido";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Correo inválido";
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
    await onSave(form, proveedor?.id);
    setLoading(false);
    onClose();
  };

  const field = (
    key: keyof FormData,
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    required = false,
    type = "text",
  ) => (
    <div>
      <label
        className="text-xs font-medium mb-1.5 block"
        style={{ color: "#374151", fontFamily: "'Poppins', sans-serif" }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <div className="relative">
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>
        <input
          type={type}
          value={(form as any)[key]}
          placeholder={placeholder}
          onChange={(e) => {
            setForm({ ...form, [key]: e.target.value });
            setErrors({ ...errors, [key]: undefined });
          }}
          style={{
            width: "100%",
            padding: "10px 14px 10px 38px",
            border: `1.5px solid ${errors[key] ? "#fca5a5" : "#e5e7eb"}`,
            borderRadius: 10,
            fontSize: 13,
            fontFamily: "'Poppins', sans-serif",
            outline: "none",
            boxSizing: "border-box" as const,
            color: "#111827",
            backgroundColor: "#fff",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0b3d91";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = errors[key]
              ? "#fca5a5"
              : "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
      {errors[key] && (
        <p className="text-xs mt-1" style={{ color: "#dc2626" }}>
          {errors[key]}
        </p>
      )}
    </div>
  );

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
          className="relative w-full mx-4 overflow-y-auto"
          style={{
            maxWidth: 520,
            maxHeight: "90vh",
            backgroundColor: "#fff",
            borderRadius: 20,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-5 flex items-center justify-between sticky top-0 z-10"
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
                  <Truck size={18} style={{ color: "#49c21b" }} />
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
                    ? `Editando proveedor #${proveedor!.id}`
                    : "Nuevo proveedor"}
                </p>
                <h3
                  className="text-sm font-semibold text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {isEdit ? proveedor!.nombre : "Crear proveedor"}
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
            {/* Nombre + NIT */}
            <div className="grid grid-cols-2 gap-3">
              {field(
                "nombre",
                "Nombre / Razón social",
                <Building2 size={14} />,
                "Textiles S.A.S",
                true,
              )}
              {field("nit", "NIT", <Hash size={14} />, "900.000.000-0", true)}
            </div>

            {/* Teléfono + Ciudad */}
            <div className="grid grid-cols-2 gap-3">
              {field(
                "telefono",
                "Teléfono",
                <Phone size={14} />,
                "601-000-0000",
                true,
              )}
              {field("ciudad", "Ciudad", <Globe size={14} />, "Bogotá", true)}
            </div>

            {/* Dirección */}
            {field(
              "direccion",
              "Dirección",
              <MapPin size={14} />,
              "Cra 1 #2-34, Bogotá",
            )}

            {/* Email + Contacto */}
            <div className="grid grid-cols-2 gap-3">
              {field(
                "email",
                "Correo electrónico",
                <Mail size={14} />,
                "ventas@empresa.com",
                false,
                "email",
              )}
              {field(
                "contacto",
                "Contacto principal",
                <Package size={14} />,
                "Nombre del contacto",
              )}
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
                    </svg>
                    Guardando...
                  </>
                ) : isEdit ? (
                  "Guardar cambios"
                ) : (
                  "Crear proveedor"
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
  proveedor,
  onClose,
  onEdit,
}: {
  proveedor: Proveedor;
  onClose: () => void;
  onEdit: () => void;
}) {
  const av = avatarPalette(proveedor.id);
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
            maxWidth: 420,
            backgroundColor: "#fff",
            borderRadius: 20,
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con avatar */}
          <div
            className="flex flex-col items-center pt-8 pb-5 px-6 relative"
            style={{
              background: "linear-gradient(180deg, #f8f9fc 0%, #fff 100%)",
              borderBottom: "1px solid #f0f0f4",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
              }}
            >
              <X size={17} />
            </button>
            {/* Avatar */}
            <div
              className="flex items-center justify-center rounded-2xl text-lg font-bold mb-3"
              style={{
                width: 72,
                height: 72,
                backgroundColor: av.bg,
                color: av.color,
                fontFamily: "'Poppins', sans-serif",
                boxShadow: `0 4px 20px ${av.bg}55`,
              }}
            >
              <Truck size={28} style={{ color: av.color, opacity: 0.9 }} />
            </div>
            <h3
              className="text-base font-semibold text-center"
              style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
            >
              {proveedor.nombre}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
              NIT: {proveedor.nit}
            </p>
          </div>

          {/* Datos */}
          <div className="px-6 py-4 flex flex-col gap-2.5">
            {[
              { icon: Phone, label: "Teléfono", value: proveedor.telefono },
              {
                icon: MapPin,
                label: "Dirección",
                value: `${proveedor.direccion}, ${proveedor.ciudad}`,
              },
              { icon: Mail, label: "Correo", value: proveedor.email ?? "—" },
              {
                icon: Package,
                label: "Contacto",
                value: proveedor.contacto ?? "—",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: "#f8f9fc" }}
              >
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: "#0b3d9110",
                  }}
                >
                  <Icon size={13} style={{ color: "#0b3d91" }} />
                </div>
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      color: "#9ca3af",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-sm font-medium mt-0.5"
                    style={{
                      color: "#374151",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex gap-3">
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
  proveedor,
  onClose,
  onConfirm,
  loading,
}: {
  proveedor: Proveedor;
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
            ¿Eliminar proveedor?
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
            "{proveedor.nombre}"
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
export default function ProveedoresClient() {
  const [items, setItems] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [ciudadFilter, setCiudadFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [createModal, setCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Proveedor | null>(null);
  const [detalleTarget, setDetalleTarget] = useState<Proveedor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Proveedor | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState("");

  // ── Load ──
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: reemplazar con → const data = await getProveedores();
      await new Promise((r) => setTimeout(r, 500));
      setItems(MOCK);
    } catch {
      setError("No se pudo cargar los proveedores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Ciudades únicas para filtro ──
  const ciudades = Array.from(new Set(items.map((p) => p.ciudad))).sort();

  // ── Filtrado ──
  const filtered = items.filter((p) => {
    const q = query.toLowerCase();
    const matchQ =
      p.nombre.toLowerCase().includes(q) ||
      p.nit.toLowerCase().includes(q) ||
      p.telefono.includes(q);
    const matchC = ciudadFilter ? p.ciudad === ciudadFilter : true;
    return matchQ && matchC;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  // ── Save ──
  const handleSave = async (data: FormData, id?: number) => {
    // TODO: if(id) await updateProveedor(id, data); else await createProveedor(data);
    await new Promise((r) => setTimeout(r, 700));
    if (id) {
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
      );
      setToast(`Proveedor "${(data as any).nombre}" actualizado`);
    } else {
      const nuevo: Proveedor = { id: Date.now(), ...(data as any) };
      setItems((prev) => [nuevo, ...prev]);
      setToast(`Proveedor "${(data as any).nombre}" creado`);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      // TODO: await deleteProveedor(deleteTarget.id);
      await new Promise((r) => setTimeout(r, 700));
      setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setToast(`Proveedor "${deleteTarget.nombre}" eliminado`);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const anyFilter = !!(query || ciudadFilter);

  const buildPages = (total: number, current: number) =>
    Array.from({ length: total }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === total || Math.abs(p - current) <= 1)
      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
        acc.push(p);
        return acc;
      }, []);

  return (
    <>
      <div className="flex flex-col gap-6 pb-7">
        {/* ── Heading ── */}
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
              Proveedores
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
            >
              Gestiona los proveedores de insumos registrados en el sistema.
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
            <Plus size={15} /> Nuevo Proveedor
          </button>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          {[
            {
              label: "Total proveedores",
              value: items.length,
              color: "#0b3d91",
              icon: Truck,
            },
            {
              label: "Ciudades",
              value: ciudades.length,
              color: "#7c3aed",
              icon: Globe,
            },
            {
              label: "Con contacto",
              value: items.filter((p) => p.contacto).length,
              color: "#49c21b",
              icon: Package,
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

        {/* ── Tabla card ── */}
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
              Lista de Proveedores
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro ciudad */}
              <select
                value={ciudadFilter}
                onChange={(e) => {
                  setCiudadFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: "7px 12px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "'Poppins', sans-serif",
                  color: ciudadFilter ? "#374151" : "#9ca3af",
                  outline: "none",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0b3d91")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              >
                <option value="">Todas las ciudades</option>
                {ciudades.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Limpiar */}
              {anyFilter && (
                <button
                  onClick={() => {
                    setQuery("");
                    setCiudadFilter("");
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

              {/* Buscador */}
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
                  placeholder="Buscar proveedor..."
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
                    "Proveedor",
                    "NIT",
                    "Teléfono",
                    "Ciudad",
                    "Dirección",
                    "Contacto",
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
                              width: j === 0 ? 160 : j === 4 ? 140 : 80,
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
                      <Truck
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
                          : "Sin proveedores registrados"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paged.map((p, i) => {
                    const av = avatarPalette(p.id);
                    return (
                      <tr
                        key={p.id}
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
                        {/* Proveedor */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex items-center justify-center rounded-xl flex-shrink-0"
                              style={{
                                width: 36,
                                height: 36,
                                backgroundColor: av.bg,
                                boxShadow: `0 2px 8px ${av.bg}44`,
                              }}
                            >
                              <Truck size={16} style={{ color: "#fff" }} />
                            </div>
                            <div>
                              <span
                                className="text-sm font-medium block"
                                style={{
                                  color: "#111827",
                                  fontFamily: "'Poppins', sans-serif",
                                }}
                              >
                                {p.nombre}
                              </span>
                              {p.email && (
                                <span
                                  className="text-xs"
                                  style={{ color: "#9ca3af" }}
                                >
                                  {p.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* NIT */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-xs font-mono px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: "#f5f6fa",
                              color: "#374151",
                            }}
                          >
                            {p.nit}
                          </span>
                        </td>

                        {/* Teléfono */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-sm"
                            style={{
                              color: "#374151",
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            {p.telefono}
                          </span>
                        </td>

                        {/* Ciudad */}
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: "#7c3aed18",
                              color: "#7c3aed",
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            <MapPin size={10} /> {p.ciudad}
                          </span>
                        </td>

                        {/* Dirección */}
                        <td className="px-5 py-3.5" style={{ maxWidth: 180 }}>
                          <span
                            className="text-sm truncate block"
                            title={p.direccion}
                            style={{
                              color: "#6b7280",
                              fontFamily: "'Poppins', sans-serif",
                              maxWidth: 180,
                            }}
                          >
                            {p.direccion}
                          </span>
                        </td>

                        {/* Contacto */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-sm"
                            style={{
                              color: "#6b7280",
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          >
                            {p.contacto ?? "—"}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setDetalleTarget(p)}
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
                              onClick={() => setEditTarget(p)}
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
                              onClick={() => setDeleteTarget(p)}
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
                {filtered.length} proveedores
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
                {[5, 10, 25].map((n) => (
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
        <ProveedorModal
          proveedor={editTarget}
          onClose={() => {
            setCreateModal(false);
            setEditTarget(null);
          }}
          onSave={handleSave}
        />
      )}
      {detalleTarget && (
        <DetalleModal
          proveedor={detalleTarget}
          onClose={() => setDetalleTarget(null)}
          onEdit={() => setEditTarget(detalleTarget)}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          proveedor={deleteTarget}
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
