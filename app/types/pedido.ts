/**
 * Types del módulo Pedido.
 *
 * Representa el flujo completo de pedidos de uniformes desde cotización
 * hasta entrega, con estados y transiciones controladas.
 *
 * FLUJO DE ESTADOS:
 * BORRADOR → CALCULADO → CONFIRMADO → EN_PRODUCCION → LISTO_PARA_ENTREGA → ENTREGADO
 *                              ↓
 *                         CANCELADO (desde cualquier estado no-final)
 */

import type { PageData } from "./pagination";

// ═══════════════════════════════════════════════════════════════════════════
// ESTADOS DEL PEDIDO
// ═══════════════════════════════════════════════════════════════════════════

export type EstadoPedido =
  | "BORRADOR"
  | "CALCULADO"
  | "CONFIRMADO"
  | "EN_PRODUCCION"
  | "LISTO_PARA_ENTREGA"
  | "ENTREGADO"
  | "CANCELADO";

export const ESTADOS_PEDIDO: { value: EstadoPedido; label: string; color: string; description: string }[] = [
  { value: "BORRADOR", label: "Borrador", color: "#6b7280", description: "Pedido en creación, editable" },
  { value: "CALCULADO", label: "Calculado", color: "#3b82f6", description: "Disponibilidad verificada" },
  { value: "CONFIRMADO", label: "Confirmado", color: "#8b5cf6", description: "Listo para producción" },
  { value: "EN_PRODUCCION", label: "En Producción", color: "#f59e0b", description: "Fabricación en curso" },
  { value: "LISTO_PARA_ENTREGA", label: "Listo", color: "#10b981", description: "Esperando entrega" },
  { value: "ENTREGADO", label: "Entregado", color: "#059669", description: "Entrega completada" },
  { value: "CANCELADO", label: "Cancelado", color: "#dc2626", description: "Pedido cancelado" },
];

export function getEstadoInfo(estado: EstadoPedido) {
  return ESTADOS_PEDIDO.find((e) => e.value === estado) ?? ESTADOS_PEDIDO[0];
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUESTS
// ═══════════════════════════════════════════════════════════════════════════

/** Datos para crear un colegio inline desde el flujo del pedido */
export interface NuevoColegioRequest {
  nombre: string;
  direccion?: string;
}

/** Una prenda dentro del pedido */
export interface DetallePedidoRequest {
  uniformeId: number;
  cantidad: number;
  /** Talla solicitada: "S", "M", "L", "XL", "06-08", "10-12", etc. */
  talla: string;
}

/** Request para crear/actualizar pedido */
export interface PedidoRequest {
  /** ID de colegio existente (mutuamente excluyente con nuevoColegio) */
  colegioId?: number;
  /** Crear colegio al vuelo (solo si colegioId es null) */
  nuevoColegio?: NuevoColegioRequest;
  /** Fecha estimada de entrega (yyyy-MM-dd) */
  fechaEstimadaEntrega?: string;
  observaciones?: string;
  detalles: DetallePedidoRequest[];
}

/** Request para cancelar pedido */
export interface CancelarPedidoRequest {
  motivo: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSES
// ═══════════════════════════════════════════════════════════════════════════

/** Resumen consolidado de insumos (post-cálculo) */
export interface ResumenInsumoPedido {
  insumoId: number;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  totalNecesario: number;
  faltante: number;
  suficiente: boolean;
  estado: "Disponible" | "Insuficiente" | "Sin stock";
  alertaStockMinimo: boolean;
}

/** Detalle de una prenda dentro del pedido */
export interface DetallePedidoResponse {
  id: number;
  uniformeId: number;
  nombreUniforme: string;
  tipo: string;
  talla: string;
  genero: string | null;
  cantidad: number;
  cantidadMaximaFabricable: number | null;
  disponibleIndividual: boolean | null;
}

/** Info compacta del colegio */
export interface ColegioPedidoInfo {
  id: number;
  nombre: string;
  direccion: string | null;
}

/** Pedido completo */
export interface PedidoResponse {
  id: number;
  numeroPedido: string;
  estado: EstadoPedido;
  estadoDescripcion: string;
  fechaCreacion: string;
  fechaEstimadaEntrega: string | null;
  observaciones: string | null;

  // Resultado de calculadora
  disponibleCompleto: boolean | null;
  factorCumplimiento: number | null;
  porcentajeCumplimiento: number | null;
  insumoLimitante: string | null;

  // Relaciones
  colegio: ColegioPedidoInfo;
  creadoPor: string;
  salidaId: number | null;
  detalles: DetallePedidoResponse[];
  resumenInsumos: ResumenInsumoPedido[] | null;

  updatedAt: string;
}

export type PagePedidos = PageData<PedidoResponse>;

/** Historial de auditoría */
export interface HistorialPedidoResponse {
  id: number;
  estadoAnterior: string;
  estadoNuevo: string;
  accion: string;
  observacion: string | null;
  realizadoPor: string;
  fechaAccion: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTROS Y PARÁMETROS
// ═══════════════════════════════════════════════════════════════════════════

export interface PedidoFiltros {
  estado?: EstadoPedido;
  colegioId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUXILIARES PARA UI
// ═══════════════════════════════════════════════════════════════════════════

/** Transiciones de estado permitidas */
export const TRANSICIONES_ESTADO: Record<EstadoPedido, { action: string; next: EstadoPedido; label: string; icon: string }[]> = {
  BORRADOR: [
    { action: "calcular", next: "CALCULADO", label: "Calcular Disponibilidad", icon: "Calculator" },
    { action: "cancelar", next: "CANCELADO", label: "Cancelar Pedido", icon: "XCircle" },
  ],
  CALCULADO: [
    { action: "confirmar", next: "CONFIRMADO", label: "Confirmar Pedido", icon: "CheckCircle" },
    { action: "cancelar", next: "CANCELADO", label: "Cancelar Pedido", icon: "XCircle" },
  ],
  CONFIRMADO: [
    { action: "iniciar-produccion", next: "EN_PRODUCCION", label: "Iniciar Producción", icon: "Play" },
    { action: "cancelar", next: "CANCELADO", label: "Cancelar Pedido", icon: "XCircle" },
  ],
  EN_PRODUCCION: [
    { action: "marcar-listo", next: "LISTO_PARA_ENTREGA", label: "Marcar como Listo", icon: "PackageCheck" },
    { action: "cancelar", next: "CANCELADO", label: "Cancelar Pedido", icon: "XCircle" },
  ],
  LISTO_PARA_ENTREGA: [
    { action: "entregar", next: "ENTREGADO", label: "Registrar Entrega", icon: "Truck" },
    { action: "cancelar", next: "CANCELADO", label: "Cancelar Pedido", icon: "XCircle" },
  ],
  ENTREGADO: [], // Estado final
  CANCELADO: [], // Estado final
};

/** Indica si un pedido es editable (solo BORRADOR) */
export function isPedidoEditable(estado: EstadoPedido): boolean {
  return estado === "BORRADOR";
}

/** Indica si un pedido puede cancelarse */
export function canCancelPedido(estado: EstadoPedido): boolean {
  return !["ENTREGADO", "CANCELADO"].includes(estado);
}

/** Indica si el pedido está en estado final */
export function isPedidoFinal(estado: EstadoPedido): boolean {
  return ["ENTREGADO", "CANCELADO"].includes(estado);
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMULARIO
// ═══════════════════════════════════════════════════════════════════════════

export interface PedidoFormData {
  colegioId: number | null;
  nuevoColegio: {
    nombre: string;
    direccion: string;
  } | null;
  fechaEstimadaEntrega: string;
  observaciones: string;
  detalles: DetallePedidoForm[];
}

export interface DetallePedidoForm {
  id: string; // temporal para UI
  uniformeId: number;
  nombreUniforme: string;
  talla: string;
  cantidad: number;
}

export const INITIAL_PEDIDO_FORM: PedidoFormData = {
  colegioId: null,
  nuevoColegio: null,
  fechaEstimadaEntrega: "",
  observaciones: "",
  detalles: [],
};
