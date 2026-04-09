import type { EstadoMovimiento } from "./entrada";

export type { EstadoMovimiento };

export interface SalidaDetalleResponse {
  id: number;
  insumo: { id: number; nombre: string; unidad: string };
  cantidad: number;
}

export interface SalidaResponse {
  id: number;
  fecha: string;
  descripcion: string;
  colegioId?: number;
  colegioNombre?: string;
  estado: EstadoMovimiento;
  creadoPor: string;
  confirmadoPor?: string;
  motivoRechazo?: string;
  createdAt?: string;
  detalles: SalidaDetalleResponse[];
}

export interface SalidaDetalleRequest {
  insumoId: number;
  cantidad: number;
}

export interface SalidaRequest {
  fecha: string;
  descripcion: string;
  colegioId?: number;
  detalles: SalidaDetalleRequest[];
}

export interface RechazarSalidaRequest {
  motivo: string;
}
