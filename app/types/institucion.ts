import type { PageData } from "./pagination";
import type { HistorialPedidoResponse, PedidoResponse } from "./pedido";

// ── Perfil ────────────────────────────────────────────────────────────────────

export interface InstitucionPerfilResponse {
  colegioId: number;
  nombreColegio: string;
  direccionColegio: string;
  username: string;
  correo: string;
  totalPedidos: number;
  pedidosActivos: number;
  totalUniformes: number;
  solicitudesPendientes: number;
}

// ── Pedido (institucional) ───────────────────────────────────────────────────

export interface InstitucionPedidoDetalleRequest {
  uniformeId: number;
  cantidad: number;
  talla: string;
}

export interface InstitucionPedidoRequest {
  fechaEstimadaEntrega?: string;  // ISO date "2026-06-15"
  observaciones?: string;
  detalles: InstitucionPedidoDetalleRequest[];
}

// Re-export existing pedido types para convenience
export type { PedidoResponse, HistorialPedidoResponse };
export type PagePedidos = PageData<PedidoResponse>;

// ── Catálogo ──────────────────────────────────────────────────────────────────

export interface InsumoInfo {
  insumoId: number;
  nombre: string;
  unidadMedida: string;
}

export interface CatalogoItem {
  uniformeId: number;
  nombre: string;
  tipo: string;
  genero: string;
  tallas: string[];
  insumos: InsumoInfo[];
}

// ── Solicitudes ───────────────────────────────────────────────────────────────

export type TipoSolicitud =
  | "AJUSTE_TALLA"
  | "PEDIDO_URGENTE"
  | "CAMBIO_FECHA_ENTREGA"
  | "CONSULTA_GENERAL"
  | "DEVOLUCION";

export type EstadoSolicitud =
  | "PENDIENTE"
  | "EN_REVISION"
  | "RESUELTA"
  | "RECHAZADA";

export interface SolicitudRequest {
  tipo: TipoSolicitud;
  asunto: string;
  descripcion: string;
}

export interface SolicitudResponse {
  id: number;
  tipo: string;
  estado: EstadoSolicitud;
  asunto: string;
  descripcion: string;
  respuesta: string | null;
  fechaRespuesta: string | null;
  createdAt: string;
}

export type PageSolicitudes = PageData<SolicitudResponse>;

// ── Pedido por grado & Seguimiento (nuevos) ─────────────────────────────────

export interface PedidoPorGradoRequest {
  grado: string;
  cantidadEstudiantes: number;
  tipoUniforme?: string;
  fechaEstimadaEntrega?: string;
  observaciones?: string;
}

export interface PedidoPorGradoItem {
  uniformeId: number;
  nombre: string;
  tipo: string;
  genero: string;
  cantidadSugerida: number;
  tallasDisponibles: string[];
}

export interface PedidoPorGradoResponse {
  colegioId: number;
  colegioNombre: string;
  grado: string;
  cantidadEstudiantes: number;
  items: PedidoPorGradoItem[];
  fechaEstimadaEntrega?: string | null;
  observaciones?: string | null;
}

export interface ResumenInsumo {
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

export interface SeguimientoResponse {
  pedidoId: number;
  numeroPedido: string;
  estado: string;
  estadoDescripcion?: string;
  fechaEstimadaEntrega?: string | null;
  salidaId?: number | null;
  resumenInsumos: ResumenInsumo[];
}

// ── IA ───────────────────────────────────────────────────────────────────────

export interface IaChatRequest {
  pregunta: string;
}

export interface IaChatResponse {
  respuesta: string;
  modelo: string;
  tokensUsados: number;
  tiempoMs: number;
}
