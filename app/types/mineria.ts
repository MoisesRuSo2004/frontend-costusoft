/**
 * Minería de datos — pronóstico dinámico.
 *
 * La solicitud va en camelCase (la valida el backend). La respuesta llega tal
 * cual la calcula el microservicio Python (snake_case, ver mineria/esquemas.py).
 */

export type Agrupacion = "dia" | "semana" | "mes";

export interface PrendaEscenarioRequest {
  uniformeId: number;
  talla: string | null;
  cantidad: number;
}

export interface PronosticoRequest {
  insumoIds: number[];
  horizonteDias: number;
  agrupacion: Agrupacion;
  plazoProveedorDias: number;
  escenario?: {
    prendas: PrendaEscenarioRequest[];
    fecha?: string | null;
  } | null;
}

export interface PuntoSerie {
  fecha: string;
  valor: number;
  minimo?: number | null;
  maximo?: number | null;
}

export type ModeloPronostico = "prophet" | "promedio_12m" | "estacional";

export interface ComparacionModelo {
  modelo: ModeloPronostico;
  descripcion: string;
  mae: number;
  wape: number | null;
  error_total: number | null;
}

export interface PrecisionModelo {
  meses_evaluados: number;
  modelo_elegido: ModeloPronostico;
  mae: number;
  wape: number | null;
  error_total: number | null;
  interpretacion: string;
  comparacion: ComparacionModelo[];
}

export interface CompraSugerida {
  cantidad: number;
  fecha_limite: string | null;
  motivo: string;
}

export interface PronosticoInsumo {
  insumo_id: number;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  historial: PuntoSerie[];
  pronostico: PuntoSerie[];
  stock_proyectado: PuntoSerie[];
  stock_proyectado_escenario: PuntoSerie[] | null;
  consumo_pronosticado: number;
  consumo_escenario: number;
  fecha_alerta: string | null;
  fecha_agotamiento: string | null;
  fecha_alerta_escenario: string | null;
  fecha_agotamiento_escenario: string | null;
  compra_sugerida: CompraSugerida;
  precision: PrecisionModelo | null;
  metodo: ModeloPronostico;
}

export interface PronosticoResponse {
  fecha_corte: string;
  datos_desactualizados: boolean;
  horizonte_dias: number;
  agrupacion: Agrupacion;
  insumos: PronosticoInsumo[];
  no_encontrados: number[];
}

/** Nombre legible de cada modelo candidato. */
export const NOMBRE_MODELO: Record<ModeloPronostico, string> = {
  prophet: "Prophet",
  promedio_12m: "Promedio 12 meses",
  estacional: "Estacional",
};
