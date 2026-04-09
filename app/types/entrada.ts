export type EstadoMovimiento = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA";

export interface EntradaDetalleResponse {
  id: number;
  insumoId: number;
  nombreInsumo: string;
  cantidad: number;
  unidadMedida: string;
}

export interface EntradaResponse {
  id: number;
  fecha: string;
  descripcion: string;
  proveedorId?: number;
  proveedorNombre?: string;
  estado: EstadoMovimiento;
  confirmadaPor?: string;
  motivoRechazo?: string;
  confirmadaAt?: string;
  createdAt?: string;
  detalles: EntradaDetalleResponse[];
}

export interface EntradaDetalleRequest {
  insumoId: number;
  cantidad: number;
}

export interface EntradaRequest {
  fecha: string;
  descripcion: string;
  proveedorId?: number;
  detalles: EntradaDetalleRequest[];
}

export interface RechazarRequest {
  motivo: string;
}
