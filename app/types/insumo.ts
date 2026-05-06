export interface InsumoResponse {
  id: number;
  nombre: string;
  stock: number;
  unidadMedida: string;
  tipo: string;
  stockMinimo: number;
  activo?: boolean;
  riesgo?: string;
  stockBajo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** true = no tiene movimientos y puede eliminarse físicamente */
  puedeEliminar?: boolean;
}

export interface InsumoRequest {
  nombre: string;
  stock: number;
  unidadMedida: string;
  tipo: string;
  stockMinimo: number;
}

export interface InsumoStockRequest {
  nuevoStock: number;
  observacion?: string;
}

/** Versión reducida para autocomplete en formularios */
export interface InsumoOption {
  id: number;
  nombre: string;
  stock: number;
  unidadMedida: string;
  tipo?: string;
}
