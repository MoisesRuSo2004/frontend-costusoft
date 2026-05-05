"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Eye,
  ExternalLink,
  FileText,
  Filter,
  History,
  Package,
  PackageCheck,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  School2,
  Search,
  Shirt,
  Trash2,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePedidos } from "@/app/hooks/usePedidos";
import {
  ESTADOS_PEDIDO,
  getEstadoInfo,
  isPedidoEditable,
  canCancelPedido,
  type PedidoResponse,
  type EstadoPedido,
} from "@/app/types/pedido";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES Y UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

const VIEW_MODES = [
  { id: "list", label: "Lista", icon: FileText },
  { id: "kanban", label: "Kanban", icon: ClipboardList },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTES REUTILIZABLES
// ═══════════════════════════════════════════════════════════════════════════

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const info = getEstadoInfo(estado);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        backgroundColor: `${info.color}15`,
        color: info.color,
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: info.color }}
      />
      {info.label}
    </span>
  );
}

function Badge({
  children,
  color = "blue",
  size = "sm",
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "purple" | "gray" | "orange" | "red";
  size?: "sm" | "md";
}) {
  const colors = {
    blue: { bg: "#eff6ff", text: "#1d4ed8" },
    green: { bg: "#ecfdf3", text: "#027a48" },
    purple: { bg: "#f5f3ff", text: "#7c3aed" },
    gray: { bg: "#f8fafc", text: "#475467" },
    orange: { bg: "#fff7ed", text: "#c2410c" },
    red: { bg: "#fef2f2", text: "#dc2626" },
  };

  return (
    <span
      className={`inline-flex rounded-full font-medium ${size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"}`}
      style={{
        backgroundColor: colors[color].bg,
        color: colors[color].text,
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
  icon: Icon,
  loading,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  icon?: React.ElementType;
  loading?: boolean;
}) {
  const variants = {
    primary: {
      bg: "#0b3d91",
      color: "#fff",
      hover: "#072d6e",
      border: "#0b3d91",
    },
    secondary: {
      bg: "#fff",
      color: "#344054",
      hover: "#f9fafb",
      border: "#d0d5dd",
    },
    ghost: {
      bg: "transparent",
      color: "#475467",
      hover: "#f9fafb",
      border: "transparent",
    },
    danger: {
      bg: "#dc2626",
      color: "#fff",
      hover: "#b91c1c",
      border: "#dc2626",
    },
  };

  const sizes = {
    sm: { padding: "6px 12px", fontSize: "12px" },
    md: { padding: "10px 16px", fontSize: "14px" },
    lg: { padding: "12px 20px", fontSize: "14px" },
  };

  const style = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontFamily: "var(--font-poppins), sans-serif",
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = style.hover;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = style.bg;
      }}
    >
      {loading ? (
        <RefreshCw size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE: Card de Pedido (Kanban)
// ═══════════════════════════════════════════════════════════════════════════

function PedidoKanbanCard({
  pedido,
  onView,
  onEdit,
  onCalcular,
  onConfirmar,
  onIniciar,
  onListo,
  onEntregar,
  onCancelar,
  submitting,
}: {
  pedido: PedidoResponse;
  onView: () => void;
  onEdit: () => void;
  onCalcular: () => void;
  onConfirmar: () => void;
  onIniciar: () => void;
  onListo: () => void;
  onEntregar: () => void;
  onCancelar: () => void;
  submitting: boolean;
}) {
  const totalPrendas = pedido.detalles.reduce((sum, d) => sum + d.cantidad, 0);
  const disponible = pedido.disponibleCompleto;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
      style={{ borderColor: "#eaecf0" }}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}
          >
            {pedido.numeroPedido}
          </p>
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: "#667085", fontFamily: "var(--font-poppins)" }}
          >
            {pedido.colegio.nombre}
          </p>
        </div>
        {disponible === true && (
          <CheckCircle size={16} style={{ color: "#10b981" }} />
        )}
        {disponible === false && (
          <AlertCircle size={16} style={{ color: "#dc2626" }} />
        )}
      </div>

      {/* Info */}
      <div className="mt-3 flex items-center gap-3 text-xs" style={{ color: "#667085" }}>
        <span className="flex items-center gap-1">
          <Shirt size={12} />
          {totalPrendas} prendas
        </span>
        <span>•</span>
        <span>{pedido.detalles.length} tipos</span>
      </div>

      {/* Fecha */}
      {pedido.fechaEstimadaEntrega && (
        <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "#6b7280" }}>
          <Clock size={12} />
          Entrega: {new Date(pedido.fechaEstimadaEntrega).toLocaleDateString("es-CO")}
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="mt-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
        {pedido.estado === "BORRADOR" && (
          <>
            <button
              onClick={onCalcular}
              disabled={submitting}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Calcular disponibilidad"
            >
              <Calculator size={14} style={{ color: "#3b82f6" }} />
            </button>
            <button
              onClick={onEdit}
              disabled={submitting}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Editar"
            >
              <FileText size={14} style={{ color: "#6b7280" }} />
            </button>
          </>
        )}
        {pedido.estado === "CALCULADO" && (
          <button
            onClick={onConfirmar}
            disabled={submitting}
            className="px-2 py-1 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: "#8b5cf6" }}
          >
            Confirmar
          </button>
        )}
        {pedido.estado === "CONFIRMADO" && (
          <button
            onClick={onIniciar}
            disabled={submitting}
            className="px-2 py-1 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: "#f59e0b" }}
          >
            Iniciar Prod.
          </button>
        )}
        {pedido.estado === "EN_PRODUCCION" && (
          <button
            onClick={onListo}
            disabled={submitting}
            className="px-2 py-1 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: "#10b981" }}
          >
            Marcar Listo
          </button>
        )}
        {pedido.estado === "LISTO_PARA_ENTREGA" && (
          <button
            onClick={onEntregar}
            disabled={submitting}
            className="px-2 py-1 rounded-lg text-xs font-medium text-white"
            style={{ backgroundColor: "#059669" }}
          >
            Entregar
          </button>
        )}
        {canCancelPedido(pedido.estado) && (
          <button
            onClick={onCancelar}
            disabled={submitting}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Cancelar"
          >
            <XCircle size={14} style={{ color: "#dc2626" }} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE: Fila de Pedido (Lista)
// ═══════════════════════════════════════════════════════════════════════════

function PedidoListRow({
  pedido,
  onView,
  onEdit,
  onCalcular,
  onConfirmar,
  onIniciar,
  onListo,
  onEntregar,
  onCancelar,
  submitting,
}: {
  pedido: PedidoResponse;
  onView: () => void;
  onEdit: () => void;
  onCalcular: () => void;
  onConfirmar: () => void;
  onIniciar: () => void;
  onListo: () => void;
  onEntregar: () => void;
  onCancelar: () => void;
  submitting: boolean;
}) {
  const totalPrendas = pedido.detalles.reduce((sum, d) => sum + d.cantidad, 0);

  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onView}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#eff6ff" }}
          >
            <Package size={16} style={{ color: "#1d4ed8" }} />
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}
            >
              {pedido.numeroPedido}
            </p>
            <p className="text-xs" style={{ color: "#667085" }}>
              {new Date(pedido.fechaCreacion).toLocaleDateString("es-CO")}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <School2 size={14} style={{ color: "#6b7280" }} />
          <span
            className="text-sm truncate max-w-[200px]"
            style={{ color: "#344054", fontFamily: "var(--font-poppins)" }}
          >
            {pedido.colegio.nombre}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <BadgeEstado estado={pedido.estado} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm" style={{ color: "#344054" }}>
          <Shirt size={14} style={{ color: "#6b7280" }} />
          {totalPrendas} unidades
          <span className="text-gray-400">({pedido.detalles.length} tipos)</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {pedido.porcentajeCumplimiento !== null && pedido.porcentajeCumplimiento !== undefined ? (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pedido.porcentajeCumplimiento}%`,
                  backgroundColor: pedido.disponibleCompleto ? "#10b981" : "#f59e0b",
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: "#667085" }}>
              {pedido.porcentajeCumplimiento}%
            </span>
          </div>
        ) : (
          <span className="text-xs" style={{ color: "#9ca3af" }}>Sin calcular</span>
        )}
      </td>
      <td className="px-4 py-3">
        {pedido.fechaEstimadaEntrega ? (
          <span className="text-sm" style={{ color: "#344054" }}>
            {new Date(pedido.fechaEstimadaEntrega).toLocaleDateString("es-CO")}
          </span>
        ) : (
          <span className="text-xs" style={{ color: "#9ca3af" }}>No definida</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onView}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Ver detalle"
          >
            <Eye size={16} style={{ color: "#6b7280" }} />
          </button>

          {isPedidoEditable(pedido.estado) && (
            <>
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                title="Editar"
              >
                <FileText size={16} style={{ color: "#3b82f6" }} />
              </button>
              <button
                onClick={onCalcular}
                disabled={submitting}
                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                title="Calcular"
              >
                <Calculator size={16} style={{ color: "#3b82f6" }} />
              </button>
            </>
          )}

          {pedido.estado === "CALCULADO" && (
            <button
              onClick={onConfirmar}
              disabled={submitting}
              className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
              title="Confirmar"
            >
              <CheckCircle size={16} style={{ color: "#8b5cf6" }} />
            </button>
          )}

          {pedido.estado === "CONFIRMADO" && (
            <button
              onClick={onIniciar}
              disabled={submitting}
              className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
              title="Iniciar producción"
            >
              <Play size={16} style={{ color: "#f59e0b" }} />
            </button>
          )}

          {pedido.estado === "EN_PRODUCCION" && (
            <button
              onClick={onListo}
              disabled={submitting}
              className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
              title="Marcar listo"
            >
              <PackageCheck size={16} style={{ color: "#10b981" }} />
            </button>
          )}

          {pedido.estado === "LISTO_PARA_ENTREGA" && (
            <button
              onClick={onEntregar}
              disabled={submitting}
              className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
              title="Entregar"
            >
              <Truck size={16} style={{ color: "#059669" }} />
            </button>
          )}

          {canCancelPedido(pedido.estado) && (
            <button
              onClick={onCancelar}
              disabled={submitting}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Cancelar"
            >
              <XCircle size={16} style={{ color: "#dc2626" }} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export default function PedidosClient() {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState("");
  const [pedidoToCancel, setPedidoToCancel] = useState<PedidoResponse | null>(null);

  // Estado para el selector de nueva prenda en modal crear/editar
  const [newUniformeId, setNewUniformeId] = useState<number | null>(null);
  const [newTalla, setNewTalla] = useState("");
  const [newCantidad, setNewCantidad] = useState(1);

  // Editor inline de fecha de entrega (panel de detalle)
  const [editingFecha, setEditingFecha] = useState(false);
  const [fechaInput, setFechaInput] = useState("");

  const {
    pedidos,
    pedidosPorEstado,
    pedidoSeleccionado,
    historial,
    colegios,
    uniformes,
    form,
    totalPrendas,
    filtros,
    loading,
    loadingDetalle,
    loadingHistorial,
    loadingColegios,
    loadingUniformes,
    submitting,
    error,
    successMessage,
    modalOpen,
    modalMode,
    page,
    totalPages,
    totalElements,
    setFiltroEstado,
    setFiltroColegio,
    clearFiltros,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    setFormField,
    setColegio,
    addDetalle,
    removeDetalle,
    updateDetalleCantidad,
    save,
    remove,
    calcular,
    confirmar,
    iniciarProduccion,
    marcarListo,
    entregar,
    cancelar,
    actualizarFecha,
    goToPage,
    nextPage,
    prevPage,
    clearMessages,
    loadPedidos,
    loadPedidoDetalle,
    loadHistorial,
  } = usePedidos();

  // ── Handlers de acciones ───────────────────────────────────────────────

  const handleCalcular = async (pedido: PedidoResponse) => {
    await calcular(pedido.id);
  };

  const handleConfirmar = async (pedido: PedidoResponse) => {
    await confirmar(pedido.id);
  };

  const handleIniciar = async (pedido: PedidoResponse) => {
    await iniciarProduccion(pedido.id);
  };

  const handleListo = async (pedido: PedidoResponse) => {
    await marcarListo(pedido.id);
  };

  const handleEntregar = async (pedido: PedidoResponse) => {
    await entregar(pedido.id);
  };

  const handleCancelClick = (pedido: PedidoResponse) => {
    setPedidoToCancel(pedido);
    setCancelMotivo("");
    setCancelModalOpen(true);
    setEditingFecha(false);
  };

  const handleConfirmCancel = async () => {
    if (pedidoToCancel && cancelMotivo.trim()) {
      const success = await cancelar(pedidoToCancel.id, cancelMotivo.trim());
      if (success) {
        setCancelModalOpen(false);
        setPedidoToCancel(null);
        setCancelMotivo("");
      }
    }
  };

  const handleAddPrenda = () => {
    const uniforme = uniformes.find((u) => u.id === newUniformeId);
    if (!uniforme || !newTalla || newCantidad < 1) return;
    addDetalle({
      id: `prenda-${Date.now()}-${Math.random()}`,
      uniformeId: uniforme.id,
      nombreUniforme: `${uniforme.prenda}${uniforme.tipo ? ` · ${uniforme.tipo}` : ""}${uniforme.genero ? ` (${uniforme.genero})` : ""}`,
      talla: newTalla,
      cantidad: newCantidad,
    });
    setNewUniformeId(null);
    setNewTalla("");
    setNewCantidad(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <section className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div
        className="rounded-[28px] border px-6 py-6"
        style={{
          borderColor: "#dbeafe",
          background: "linear-gradient(135deg, rgba(29,78,216,0.10) 0%, rgba(15,23,42,0.06) 100%)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#1d4ed8", fontFamily: "var(--font-poppins)" }}
            >
              Gestión
            </p>
            <h1
              className="mt-2 text-2xl font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}
            >
              Pedidos de Uniformes
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "#475467", fontFamily: "var(--font-poppins)" }}
            >
              {totalElements} pedido{totalElements !== 1 ? "s" : ""} en el sistema
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle View */}
            <div
              className="flex items-center rounded-xl border p-1"
              style={{ borderColor: "#d0d5dd", backgroundColor: "#fff" }}
            >
              {VIEW_MODES.map((mode) => {
                const Icon = mode.icon;
                const active = viewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      active ? "text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={{
                      backgroundColor: active ? "#0b3d91" : "transparent",
                      fontFamily: "var(--font-poppins)",
                    }}
                  >
                    <Icon size={14} />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <Button onClick={() => { clearMessages(); openCreateModal(); }} icon={Plus}>
              Nuevo Pedido
            </Button>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
          >
            <AlertCircle size={18} style={{ color: "#dc2626" }} />
            <p className="text-sm flex-1" style={{ color: "#b42318" }}>
              {error}
            </p>
            <button onClick={clearMessages} className="p-1 hover:bg-red-100 rounded">
              <X size={16} style={{ color: "#dc2626" }} />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}
          >
            <CheckCircle size={18} style={{ color: "#10b981" }} />
            <p className="text-sm flex-1" style={{ color: "#047857" }}>
              {successMessage}
            </p>
            <button onClick={clearMessages} className="p-1 hover:bg-emerald-100 rounded">
              <X size={16} style={{ color: "#10b981" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: "#6b7280" }} />
          <span className="text-sm font-medium" style={{ color: "#344054" }}>Filtrar:</span>
        </div>

        {/* Filtro Estado */}
        <select
          value={filtros.estado || ""}
          onChange={(e) => setFiltroEstado((e.target.value as EstadoPedido) || undefined)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{
            borderColor: "#d0d5dd",
            backgroundColor: "#fff",
            color: "#344054",
            fontFamily: "var(--font-poppins)",
          }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PEDIDO.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>

        {/* Filtro Colegio */}
        <select
          value={filtros.colegioId || ""}
          onChange={(e) => setFiltroColegio(e.target.value ? Number(e.target.value) : undefined)}
          className="rounded-lg border px-3 py-2 text-sm"
          style={{
            borderColor: "#d0d5dd",
            backgroundColor: "#fff",
            color: "#344054",
            fontFamily: "var(--font-poppins)",
          }}
        >
          <option value="">Todos los colegios</option>
          {colegios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        {(filtros.estado || filtros.colegioId) && (
          <button
            onClick={clearFiltros}
            className="text-sm font-medium hover:underline"
            style={{ color: "#dc2626" }}
          >
            Limpiar filtros
          </button>
        )}

        <div className="flex-1" />

        <button
          onClick={() => loadPedidos(page)}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
          style={{ borderColor: "#d0d5dd", color: "#344054" }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Recargar
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16">
          <RefreshCw size={24} className="animate-spin" style={{ color: "#1d4ed8" }} />
          <p className="text-sm" style={{ color: "#667085" }}>
            Cargando pedidos...
          </p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#f3f4f6" }}
          >
            <Package size={32} style={{ color: "#9ca3af" }} />
          </div>
          <p className="text-lg font-medium" style={{ color: "#374151" }}>
            No hay pedidos registrados
          </p>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Crea tu primer pedido haciendo clic en "Nuevo Pedido"
          </p>
        </div>
      ) : viewMode === "list" ? (
        <>
          {/* Vista Lista */}
          <div className="rounded-xl border overflow-x-auto overflow-hidden" style={{ borderColor: "#eaecf0" }}>
            <table className="w-full min-w-[640px]">
              <thead style={{ backgroundColor: "#f9fafb" }}>
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#667085" }}
                  >
                    Pedido
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#667085" }}
                  >
                    Colegio
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#667085" }}
                  >
                    Estado
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#667085" }}
                  >
                    Prendas
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#667085" }}
                  >
                    Disponibilidad
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#667085" }}
                  >
                    Entrega Est.
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#667085" }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#eaecf0" }}>
                {pedidos.map((pedido) => (
                  <PedidoListRow
                    key={pedido.id}
                    pedido={pedido}
                    onView={() => openViewModal(pedido)}
                    onEdit={() => openEditModal(pedido)}
                    onCalcular={() => handleCalcular(pedido)}
                    onConfirmar={() => handleConfirmar(pedido)}
                    onIniciar={() => handleIniciar(pedido)}
                    onListo={() => handleListo(pedido)}
                    onEntregar={() => handleEntregar(pedido)}
                    onCancelar={() => handleCancelClick(pedido)}
                    submitting={submitting}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={prevPage}
                disabled={page === 0}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"
                style={{ borderColor: "#d0d5dd", color: "#344054" }}
              >
                <ArrowLeft size={14} />
                Anterior
              </button>

              <span className="text-sm" style={{ color: "#667085" }}>
                Página {page + 1} de {totalPages}
              </span>

              <button
                onClick={nextPage}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50"
                style={{ borderColor: "#d0d5dd", color: "#344054" }}
              >
                Siguiente
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Vista Kanban */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ESTADOS_PEDIDO.filter((e) => e.value !== "CANCELADO").map((estadoInfo) => {
              const pedidosEstado = pedidosPorEstado.get(estadoInfo.value) || [];
              return (
                <div key={estadoInfo.value} className="flex flex-col gap-3">
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{
                      backgroundColor: `${estadoInfo.color}10`,
                      borderLeft: `3px solid ${estadoInfo.color}`,
                    }}
                  >
                    <span
                      className="font-semibold text-sm"
                      style={{ color: estadoInfo.color, fontFamily: "var(--font-poppins)" }}
                    >
                      {estadoInfo.label}
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${estadoInfo.color}20`, color: estadoInfo.color }}
                    >
                      {pedidosEstado.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <AnimatePresence>
                      {pedidosEstado.map((pedido) => (
                        <PedidoKanbanCard
                          key={pedido.id}
                          pedido={pedido}
                          onView={() => openViewModal(pedido)}
                          onEdit={() => openEditModal(pedido)}
                          onCalcular={() => handleCalcular(pedido)}
                          onConfirmar={() => handleConfirmar(pedido)}
                          onIniciar={() => handleIniciar(pedido)}
                          onListo={() => handleListo(pedido)}
                          onEntregar={() => handleEntregar(pedido)}
                          onCancelar={() => handleCancelClick(pedido)}
                          submitting={submitting}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sección Cancelados */}
          {(pedidosPorEstado.get("CANCELADO") || []).length > 0 && (
            <div className="mt-8">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "#dc2626", fontFamily: "var(--font-poppins)" }}
              >
                Pedidos Cancelados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-60">
                {(pedidosPorEstado.get("CANCELADO") || []).map((pedido) => (
                  <PedidoKanbanCard
                    key={pedido.id}
                    pedido={pedido}
                    onView={() => openViewModal(pedido)}
                    onEdit={() => {}}
                    onCalcular={() => {}}
                    onConfirmar={() => {}}
                    onIniciar={() => {}}
                    onListo={() => {}}
                    onEntregar={() => {}}
                    onCancelar={() => {}}
                    submitting={submitting}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modal: Ver Detalle de Pedido (panel deslizante) ─────────────── */}
      <AnimatePresence>
        {modalOpen && modalMode === "view" && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={closeModal}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white"
              style={{ width: "min(720px, 100vw)", boxShadow: "-4px 0 40px rgba(0,0,0,0.16)" }}
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#eaecf0" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "#eff6ff" }}>
                    <ClipboardList size={18} style={{ color: "#1d4ed8" }} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold truncate" style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}>
                      {loadingDetalle ? "Cargando..." : (pedidoSeleccionado?.numeroPedido ?? "Detalle del Pedido")}
                    </h2>
                    {pedidoSeleccionado && (
                      <p className="text-xs truncate" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins)" }}>
                        {pedidoSeleccionado.colegio.nombre} · por {pedidoSeleccionado.creadoPor}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {pedidoSeleccionado && (
                    <button
                      onClick={() => { void loadPedidoDetalle(pedidoSeleccionado.id); void loadHistorial(pedidoSeleccionado.id); }}
                      disabled={loadingDetalle || loadingHistorial}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-gray-50"
                      style={{ borderColor: "#e5e7eb" }} title="Actualizar"
                    >
                      <RefreshCw size={13} className={(loadingDetalle || loadingHistorial) ? "animate-spin" : ""} style={{ color: "#6b7280" }} />
                    </button>
                  )}
                  <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-gray-50" style={{ borderColor: "#e5e7eb" }}>
                    <X size={16} style={{ color: "#6b7280" }} />
                  </button>
                </div>
              </div>

              {/* Contenido */}
              {loadingDetalle ? (
                <div className="flex flex-1 items-center justify-center gap-3">
                  <RefreshCw size={24} className="animate-spin" style={{ color: "#1d4ed8" }} />
                  <p className="text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins)" }}>Cargando pedido...</p>
                </div>
              ) : pedidoSeleccionado ? (
                <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "#f3f4f6" }}>

                  {/* Estado + stepper */}
                  <div className="px-6 py-4" style={{ backgroundColor: "#fafafa" }}>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <BadgeEstado estado={pedidoSeleccionado.estado} />

                      {/* ── Fecha de entrega editable ── */}
                      {!["ENTREGADO","CANCELADO"].includes(pedidoSeleccionado.estado) && (
                        editingFecha ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="date"
                              value={fechaInput}
                              onChange={(e) => setFechaInput(e.target.value)}
                              className="rounded-lg border px-2 py-1 text-xs outline-none"
                              style={{ borderColor: "#bfdbfe", fontFamily: "var(--font-poppins)", color: "#344054" }}
                              autoFocus
                            />
                            <button
                              disabled={submitting}
                              onClick={async () => {
                                const ok = await actualizarFecha(pedidoSeleccionado.id, fechaInput || null);
                                if (ok) setEditingFecha(false);
                              }}
                              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white transition disabled:opacity-60"
                              style={{ backgroundColor: "#1d4ed8" }}
                            >
                              {submitting ? "…" : "Guardar"}
                            </button>
                            <button
                              onClick={() => setEditingFecha(false)}
                              className="rounded-lg border px-2 py-1 text-xs transition hover:bg-gray-50"
                              style={{ borderColor: "#d0d5dd", color: "#6b7280" }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setFechaInput(pedidoSeleccionado.fechaEstimadaEntrega ?? "");
                              setEditingFecha(true);
                            }}
                            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:border-blue-300 hover:bg-blue-50"
                            style={{ borderColor: pedidoSeleccionado.fechaEstimadaEntrega ? "#bfdbfe" : "#d0d5dd", color: pedidoSeleccionado.fechaEstimadaEntrega ? "#1d4ed8" : "#6b7280", fontFamily: "var(--font-poppins)" }}
                            title="Editar fecha estimada de entrega"
                          >
                            <Clock size={11} />
                            {pedidoSeleccionado.fechaEstimadaEntrega
                              ? `Entrega: ${new Date(pedidoSeleccionado.fechaEstimadaEntrega).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}`
                              : "Fijar fecha de entrega"}
                            <Pencil size={10} style={{ opacity: 0.6 }} />
                          </button>
                        )
                      )}
                      {["ENTREGADO","CANCELADO"].includes(pedidoSeleccionado.estado) && pedidoSeleccionado.fechaEstimadaEntrega && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins)" }}>
                          <Clock size={11} />
                          Entrega: {new Date(pedidoSeleccionado.fechaEstimadaEntrega).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      )}

                      <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins)" }}>
                        Creado: {new Date(pedidoSeleccionado.fechaCreacion).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {pedidoSeleccionado.estado !== "CANCELADO" ? (
                      <div className="flex items-center gap-0.5 flex-wrap">
                        {(["BORRADOR","CALCULADO","CONFIRMADO","EN_PRODUCCION","LISTO_PARA_ENTREGA","ENTREGADO"] as EstadoPedido[]).map((step, idx, arr) => {
                          const info = getEstadoInfo(step);
                          const curIdx = arr.indexOf(pedidoSeleccionado.estado as EstadoPedido);
                          const done = idx < curIdx;
                          const active = idx === curIdx;
                          return (
                            <div key={step} className="flex items-center">
                              <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                style={{
                                  backgroundColor: active ? `${info.color}18` : done ? "#f0fdf4" : "#f3f4f6",
                                  color: active ? info.color : done ? "#16a34a" : "#9ca3af",
                                  border: `1.5px solid ${active ? info.color + "50" : done ? "#bbf7d0" : "#e5e7eb"}`,
                                  fontFamily: "var(--font-poppins)",
                                }}
                              >
                                {done && <CheckCircle size={10} />}
                                {info.label}
                              </div>
                              {idx < arr.length - 1 && <ChevronRight size={11} style={{ color: "#d1d5db", margin: "0 1px", flexShrink: 0 }} />}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border px-4 py-2" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
                        <XCircle size={15} style={{ color: "#dc2626" }} />
                        <span className="text-sm font-semibold" style={{ color: "#dc2626", fontFamily: "var(--font-poppins)" }}>Pedido cancelado</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones de transición */}
                  {!["ENTREGADO","CANCELADO"].includes(pedidoSeleccionado.estado) && (
                    <div className="px-6 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins)" }}>
                        Acciones disponibles
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pedidoSeleccionado.estado === "BORRADOR" && (
                          <>
                            <Button variant="primary" size="sm" icon={Calculator} loading={submitting}
                              onClick={() => calcular(pedidoSeleccionado.id)}>
                              Calcular Disponibilidad
                            </Button>
                            <Button variant="secondary" size="sm" icon={FileText}
                              onClick={() => { closeModal(); setTimeout(() => openEditModal(pedidoSeleccionado), 150); }}>
                              Editar
                            </Button>
                          </>
                        )}
                        {pedidoSeleccionado.estado === "CALCULADO" && (
                          <Button variant="primary" size="sm" icon={CheckCircle} loading={submitting}
                            onClick={() => confirmar(pedidoSeleccionado.id)}>
                            Confirmar Pedido
                          </Button>
                        )}
                        {pedidoSeleccionado.estado === "CONFIRMADO" && (
                          <Button variant="primary" size="sm" icon={Play} loading={submitting}
                            onClick={() => iniciarProduccion(pedidoSeleccionado.id)}>
                            Iniciar Producción
                          </Button>
                        )}
                        {pedidoSeleccionado.estado === "EN_PRODUCCION" && (
                          <Button variant="primary" size="sm" icon={PackageCheck} loading={submitting}
                            onClick={() => marcarListo(pedidoSeleccionado.id)}>
                            Marcar como Listo
                          </Button>
                        )}
                        {pedidoSeleccionado.estado === "LISTO_PARA_ENTREGA" && (
                          <Button variant="primary" size="sm" icon={Truck} loading={submitting}
                            onClick={() => entregar(pedidoSeleccionado.id)}>
                            Registrar Entrega
                          </Button>
                        )}
                        {canCancelPedido(pedidoSeleccionado.estado) && (
                          <Button variant="danger" size="sm" icon={XCircle}
                            onClick={() => { closeModal(); setTimeout(() => handleCancelClick(pedidoSeleccionado), 150); }}>
                            Cancelar Pedido
                          </Button>
                        )}
                      </div>
                      {/* Resultado calculadora inline */}
                      {pedidoSeleccionado.porcentajeCumplimiento !== null && (
                        <div className="mt-3 flex items-center gap-3 rounded-xl border px-4 py-3"
                          style={{
                            borderColor: pedidoSeleccionado.disponibleCompleto ? "#bbf7d0" : "#fde68a",
                            backgroundColor: pedidoSeleccionado.disponibleCompleto ? "#f0fdf4" : "#fffbeb",
                          }}
                        >
                          <div className="flex-1">
                            <p className="text-xs font-semibold" style={{ color: pedidoSeleccionado.disponibleCompleto ? "#16a34a" : "#d97706", fontFamily: "var(--font-poppins)" }}>
                              {pedidoSeleccionado.disponibleCompleto
                                ? "✓ Stock suficiente para todo el pedido"
                                : `⚠ Stock parcial — ${pedidoSeleccionado.porcentajeCumplimiento}% disponible`}
                              {pedidoSeleccionado.insumoLimitante && (
                                <span className="font-normal"> · Limitante: {pedidoSeleccionado.insumoLimitante}</span>
                              )}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#e5e7eb" }}>
                                <div className="h-full rounded-full" style={{
                                  width: `${pedidoSeleccionado.porcentajeCumplimiento}%`,
                                  backgroundColor: pedidoSeleccionado.disponibleCompleto ? "#10b981" : "#f59e0b",
                                }} />
                              </div>
                              <span className="text-xs font-bold flex-shrink-0" style={{ color: pedidoSeleccionado.disponibleCompleto ? "#16a34a" : "#d97706" }}>
                                {pedidoSeleccionado.porcentajeCumplimiento}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resumen insumos post-cálculo */}
                  {pedidoSeleccionado.resumenInsumos && pedidoSeleccionado.resumenInsumos.length > 0 && (
                    <div className="px-6 py-4">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}>
                        <Package size={14} style={{ color: "#1d4ed8" }} /> Insumos requeridos
                      </p>
                      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#e5e7eb" }}>
                        <table className="w-full text-sm">
                          <thead style={{ backgroundColor: "#f9fafb" }}>
                            <tr>
                              {["Insumo","Necesario","Stock actual","Estado"].map(h => (
                                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins)" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y" style={{ borderColor: "#f3f4f6" }}>
                            {pedidoSeleccionado.resumenInsumos.map(ins => (
                              <tr key={ins.insumoId} className="hover:bg-gray-50">
                                <td className="px-3 py-2.5 font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}>{ins.nombre}</td>
                                <td className="px-3 py-2.5 text-sm" style={{ color: "#374151", fontFamily: "var(--font-poppins)" }}>{ins.totalNecesario} {ins.unidadMedida}</td>
                                <td className="px-3 py-2.5 text-sm" style={{ color: "#374151", fontFamily: "var(--font-poppins)" }}>{ins.stockActual}</td>
                                <td className="px-3 py-2.5">
                                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                                    style={{ backgroundColor: ins.suficiente ? "#f0fdf4" : "#fef2f2", color: ins.suficiente ? "#16a34a" : "#dc2626", fontFamily: "var(--font-poppins)" }}>
                                    {ins.estado}
                                  </span>
                                  {ins.alertaStockMinimo && <span className="ml-1 text-[10px]" style={{ color: "#d97706" }}>⚠</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Prendas */}
                  <div className="px-6 py-4">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}>
                      <Shirt size={14} style={{ color: "#1d4ed8" }} />
                      Prendas
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}>
                        {pedidoSeleccionado.detalles.reduce((s,d)=>s+d.cantidad,0)} unidades · {pedidoSeleccionado.detalles.length} tipos
                      </span>
                    </p>
                    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#e5e7eb" }}>
                      <table className="w-full text-sm">
                        <thead style={{ backgroundColor: "#f9fafb" }}>
                          <tr>
                            {["Prenda","Tipo","Género","Talla","Cant.","Disponible"].map(h => (
                              <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins)" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "#f3f4f6" }}>
                          {pedidoSeleccionado.detalles.map(d => (
                            <tr key={d.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}>{d.nombreUniforme}</td>
                              <td className="px-3 py-2.5 text-xs" style={{ color: "#374151", fontFamily: "var(--font-poppins)" }}>{d.tipo}</td>
                              <td className="px-3 py-2.5 text-xs" style={{ color: "#374151", fontFamily: "var(--font-poppins)" }}>{d.genero ?? "—"}</td>
                              <td className="px-3 py-2.5">
                                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>{d.talla}</span>
                              </td>
                              <td className="px-3 py-2.5 font-bold" style={{ color: "#101828" }}>{d.cantidad}</td>
                              <td className="px-3 py-2.5">
                                {d.disponibleIndividual === null ? (
                                  <span className="text-xs" style={{ color: "#9ca3af" }}>—</span>
                                ) : d.disponibleIndividual ? (
                                  <CheckCircle size={14} style={{ color: "#10b981" }} />
                                ) : (
                                  <AlertCircle size={14} style={{ color: "#dc2626" }} />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Historial */}
                  <div className="px-6 py-5">
                    <p className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}>
                      <History size={14} style={{ color: "#1d4ed8" }} />
                      Historial de cambios
                      {loadingHistorial && <RefreshCw size={11} className="animate-spin ml-1" style={{ color: "#6b7280" }} />}
                    </p>
                    {!loadingHistorial && historial.length === 0 ? (
                      <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins)" }}>Sin historial registrado aún.</p>
                    ) : (
                      <div className="flex flex-col">
                        {historial.map((item, idx) => {
                          const isLast = idx === historial.length - 1;
                          const info = getEstadoInfo(item.estadoNuevo as EstadoPedido);
                          return (
                            <div key={item.id} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                                  style={{ backgroundColor: `${info.color}18`, border: `2px solid ${info.color}40` }}>
                                  <CheckCircle size={12} style={{ color: info.color }} />
                                </div>
                                {!isLast && <div className="mt-1 w-0.5 flex-1" style={{ backgroundColor: "#e5e7eb", minHeight: 20 }} />}
                              </div>
                              <div className={`flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold" style={{ color: info.color, fontFamily: "var(--font-poppins)" }}>{item.accion}</p>
                                    {item.observacion && <p className="text-xs mt-0.5" style={{ color: "#6b7280", fontFamily: "var(--font-poppins)" }}>{item.observacion}</p>}
                                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins)" }}>por {item.realizadoPor}</p>
                                  </div>
                                  <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins)" }}>{item.fechaAccion}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm" style={{ color: "#9ca3af" }}>No se pudo cargar el pedido.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modal: Crear / Editar Pedido ─────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (modalMode === "create" || modalMode === "edit") && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#eaecf0" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#eff6ff" }}>
                      {modalMode === "create" ? <Plus size={16} style={{ color: "#1d4ed8" }} /> : <FileText size={16} style={{ color: "#1d4ed8" }} />}
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}>
                      {modalMode === "create" ? "Nuevo Pedido" : `Editar ${pedidoSeleccionado?.numeroPedido ?? "Pedido"}`}
                    </h2>
                  </div>
                  <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-lg border transition hover:bg-gray-50" style={{ borderColor: "#e5e7eb" }}>
                    <X size={16} style={{ color: "#6b7280" }} />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                  {loadingDetalle && modalMode === "edit" ? (
                    <div className="flex items-center justify-center py-8 gap-3">
                      <RefreshCw size={20} className="animate-spin" style={{ color: "#1d4ed8" }} />
                      <span className="text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins)" }}>Cargando pedido...</span>
                    </div>
                  ) : (
                    <>
                      {/* Colegio */}
                      <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151", fontFamily: "var(--font-poppins)" }}>
                          Colegio <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        {modalMode === "edit" ? (
                          <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: "#e5e7eb", backgroundColor: "#f9fafb" }}>
                            <School2 size={14} style={{ color: "#6b7280" }} />
                            <span className="text-sm" style={{ color: "#344054", fontFamily: "var(--font-poppins)" }}>
                              {colegios.find(c => c.id === form.colegioId)?.nombre ?? pedidoSeleccionado?.colegio.nombre ?? "Colegio seleccionado"}
                            </span>
                          </div>
                        ) : loadingColegios ? (
                          <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
                            <RefreshCw size={14} className="animate-spin" /> Cargando colegios...
                          </div>
                        ) : colegios.length === 0 ? (
                          <div className="flex items-start gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "#fde68a", backgroundColor: "#fffbeb" }}>
                            <AlertCircle size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold" style={{ color: "#92400e", fontFamily: "var(--font-poppins)" }}>
                                No hay colegios registrados
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: "#b45309", fontFamily: "var(--font-poppins)" }}>
                                Para crear un pedido necesitas tener al menos un colegio (cliente) creado en el sistema.
                              </p>
                            </div>
                            <Link
                              href="/colegios"
                              onClick={closeModal}
                              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition"
                              style={{ backgroundColor: "#d97706", fontFamily: "var(--font-poppins)" }}
                            >
                              <ExternalLink size={12} /> Ir a Clientes
                            </Link>
                          </div>
                        ) : (
                          <select
                            value={form.colegioId ?? ""}
                            onChange={(e) => { setColegio(e.target.value ? Number(e.target.value) : null); setNewUniformeId(null); setNewTalla(""); }}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                            style={{ borderColor: "#d0d5dd", fontFamily: "var(--font-poppins)", color: "#344054" }}
                          >
                            <option value="">Selecciona un colegio...</option>
                            {colegios.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                          </select>
                        )}
                      </div>

                      {/* Fecha + Observaciones */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151", fontFamily: "var(--font-poppins)" }}>
                            Fecha estimada de entrega
                          </label>
                          <input
                            type="date"
                            value={form.fechaEstimadaEntrega}
                            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                            onChange={(e) => setFormField("fechaEstimadaEntrega", e.target.value)}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                            style={{ borderColor: "#d0d5dd", fontFamily: "var(--font-poppins)", color: "#344054" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151", fontFamily: "var(--font-poppins)" }}>
                            Observaciones
                          </label>
                          <input
                            type="text"
                            value={form.observaciones}
                            onChange={(e) => setFormField("observaciones", e.target.value)}
                            placeholder="Notas adicionales..."
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                            style={{ borderColor: "#d0d5dd", fontFamily: "var(--font-poppins)", color: "#344054" }}
                          />
                        </div>
                      </div>

                      {/* Agregar prenda */}
                      {form.colegioId && (
                        <div className="rounded-2xl border p-4" style={{ borderColor: "#dbeafe", backgroundColor: "#f8fbff" }}>
                          <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#1d4ed8", fontFamily: "var(--font-poppins)" }}>
                            <Plus size={14} /> Agregar prenda
                          </p>
                          {loadingUniformes ? (
                            <div className="flex items-center gap-2 text-sm" style={{ color: "#6b7280" }}>
                              <RefreshCw size={14} className="animate-spin" /> Cargando uniformes...
                            </div>
                          ) : uniformes.length === 0 ? (
                            <div className="flex items-start gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "#fde68a", backgroundColor: "#fffbeb" }}>
                              <AlertCircle size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold" style={{ color: "#92400e", fontFamily: "var(--font-poppins)" }}>
                                  Sin uniformes configurados
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "#b45309", fontFamily: "var(--font-poppins)" }}>
                                  Este colegio no tiene uniformes asociados aún. Debes configurarlos antes de poder agregar prendas al pedido.
                                </p>
                              </div>
                              <Link
                                href="/uniformes"
                                onClick={closeModal}
                                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition"
                                style={{ backgroundColor: "#d97706", fontFamily: "var(--font-poppins)" }}
                              >
                                <ExternalLink size={12} /> Ir a Uniformes
                              </Link>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-end gap-3">
                              <div className="flex-1 min-w-[160px]">
                                <p className="text-xs font-medium mb-1" style={{ color: "#374151" }}>Prenda</p>
                                <select
                                  value={newUniformeId ?? ""}
                                  onChange={(e) => { setNewUniformeId(e.target.value ? Number(e.target.value) : null); setNewTalla(""); }}
                                  className="w-full rounded-lg border px-2.5 py-2 text-sm outline-none"
                                  style={{ borderColor: "#d0d5dd", fontFamily: "var(--font-poppins)", color: "#344054" }}
                                >
                                  <option value="">Seleccionar...</option>
                                  {uniformes.map(u => (
                                    <option key={u.id} value={u.id}>
                                      {u.prenda}{u.tipo ? ` · ${u.tipo}` : ""}{u.genero ? ` (${u.genero})` : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ width: 90 }}>
                                <p className="text-xs font-medium mb-1" style={{ color: "#374151" }}>Talla</p>
                                <select
                                  value={newTalla}
                                  onChange={(e) => setNewTalla(e.target.value)}
                                  disabled={!newUniformeId}
                                  className="w-full rounded-lg border px-2.5 py-2 text-sm outline-none"
                                  style={{ borderColor: "#d0d5dd", fontFamily: "var(--font-poppins)", color: "#344054", backgroundColor: !newUniformeId ? "#f9fafb" : "#fff" }}
                                >
                                  <option value="">—</option>
                                  {newUniformeId && uniformes.find(u => u.id === newUniformeId)?.tallas.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ width: 80 }}>
                                <p className="text-xs font-medium mb-1" style={{ color: "#374151" }}>Cantidad</p>
                                <input
                                  type="number" min={1} value={newCantidad}
                                  onChange={(e) => setNewCantidad(Math.max(1, Number(e.target.value)))}
                                  className="w-full rounded-lg border px-2.5 py-2 text-sm outline-none"
                                  style={{ borderColor: "#d0d5dd", fontFamily: "var(--font-poppins)", color: "#344054" }}
                                />
                              </div>
                              <button
                                onClick={handleAddPrenda}
                                disabled={!newUniformeId || !newTalla || newCantidad < 1}
                                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "#0b3d91", fontFamily: "var(--font-poppins)" }}
                              >
                                <Plus size={14} /> Agregar
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Lista de prendas */}
                      {form.detalles.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "#374151", fontFamily: "var(--font-poppins)" }}>
                            <Shirt size={14} style={{ color: "#1d4ed8" }} />
                            Prendas ({form.detalles.length} tipo{form.detalles.length !== 1 ? "s" : ""} · {totalPrendas} unidades)
                          </p>
                          <div className="flex flex-col gap-2">
                            {form.detalles.map(d => (
                              <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "#e5e7eb" }}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <Shirt size={13} style={{ color: "#6366f1", flexShrink: 0 }} />
                                  <span className="text-sm font-medium truncate" style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}>{d.nombreUniforme}</span>
                                  <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>{d.talla}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                                    <button onClick={() => updateDetalleCantidad(d.id, Math.max(1, d.cantidad - 1))}
                                      className="flex h-7 w-7 items-center justify-center text-sm hover:bg-gray-50 transition" style={{ color: "#374151" }}>−</button>
                                    <span className="px-2 text-sm font-bold border-x" style={{ color: "#101828", borderColor: "#e5e7eb", fontFamily: "var(--font-poppins)" }}>{d.cantidad}</span>
                                    <button onClick={() => updateDetalleCantidad(d.id, d.cantidad + 1)}
                                      className="flex h-7 w-7 items-center justify-center text-sm hover:bg-gray-50 transition" style={{ color: "#374151" }}>+</button>
                                  </div>
                                  <button onClick={() => removeDetalle(d.id)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-red-50">
                                    <Trash2 size={13} style={{ color: "#dc2626" }} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "#eaecf0" }}>
                  <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins)" }}>
                    {form.detalles.length === 0
                      ? "Agrega al menos una prenda para continuar"
                      : `${form.detalles.length} tipo${form.detalles.length !== 1 ? "s" : ""} · ${totalPrendas} unidades`}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
                    <Button
                      variant="primary" loading={submitting}
                      disabled={!form.colegioId || form.detalles.length === 0 || (modalMode === "create" && colegios.length === 0)}
                      onClick={save}
                    >
                      {modalMode === "create" ? "Crear Pedido" : "Guardar Cambios"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Cancelar */}
      <AnimatePresence>
        {cancelModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setCancelModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#fef2f2" }}
                  >
                    <XCircle size={20} style={{ color: "#dc2626" }} />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "#101828", fontFamily: "var(--font-poppins)" }}
                    >
                      Cancelar Pedido
                    </h3>
                    <p className="text-sm" style={{ color: "#667085" }}>
                      {pedidoToCancel?.numeroPedido}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                    Motivo de cancelación *
                  </label>
                  <textarea
                    value={cancelMotivo}
                    onChange={(e) => setCancelMotivo(e.target.value)}
                    placeholder="Ingresa el motivo por el cual se cancela este pedido..."
                    className="w-full rounded-xl border px-3 py-2 text-sm resize-none"
                    style={{
                      borderColor: "#d0d5dd",
                      minHeight: "100px",
                      fontFamily: "var(--font-poppins)",
                    }}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleConfirmCancel}
                    loading={submitting}
                    disabled={!cancelMotivo.trim()}
                  >
                    Confirmar Cancelación
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
