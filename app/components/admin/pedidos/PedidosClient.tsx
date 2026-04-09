"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Filter,
  History,
  Package,
  PackageCheck,
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
    goToPage,
    nextPage,
    prevPage,
    clearMessages,
    loadPedidos,
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
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#eaecf0" }}>
            <table className="w-full">
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
