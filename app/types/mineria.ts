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

// ── Detección de anomalías ───────────────────────────────────────────────────

export type TipoMovimientoAnalisis = "salidas" | "entradas" | "ambos";
export type Sensibilidad = "baja" | "media" | "alta";
export type TipoAnomalia = "cantidad_alta" | "cantidad_baja" | "repetida" | "combinacion";
export type MetodoDeteccion = "estadistico" | "isolation_forest" | "lof";

export interface AnomaliasRequest {
  desde?: string | null;
  hasta?: string | null;
  insumoIds?: number[] | null;
  tipo: TipoMovimientoAnalisis;
  sensibilidad: Sensibilidad;
  limite?: number;
  validar?: boolean;
}

export interface AnomaliaMovimiento {
  movimiento: "SALIDA" | "ENTRADA";
  movimiento_id: number;
  /** Único: un movimiento puede tener varios renglones del mismo insumo. */
  renglon_id: number;
  fecha: string;
  insumo_id: number;
  insumo: string;
  unidad_medida: string;
  cantidad: number;
  mediana_habitual: number;
  rango_habitual: [number, number];
  veces_mediana: number;
  dias_desde_anterior: number | null;
  tercero: string | null;
  descripcion: string | null;
  nivel: "alta" | "media";
  tipo_anomalia: TipoAnomalia;
  razon: string;
  metodos: MetodoDeteccion[];
  puntaje: number;
}

export interface MetricaMetodo {
  metodo: MetodoDeteccion | "alertas";
  nombre: string;
  precision: number;
  recall: number;
  f1: number;
  falsas_alarmas: number;
  recall_por_tipo: Record<"alta" | "baja" | "rafaga", number>;
}

export interface AnomaliasResponse {
  desde: string;
  hasta: string;
  sensibilidad: Sensibilidad;
  resumen: {
    movimientos_analizados: number;
    alta: number;
    media: number;
    por_tipo: Partial<Record<TipoAnomalia, number>>;
  };
  anomalias: AnomaliaMovimiento[];
  validacion: {
    anomalias_inyectadas: number;
    movimientos_evaluados: number;
    metricas: MetricaMetodo[];
  } | null;
}

export const NOMBRE_TIPO_ANOMALIA: Record<TipoAnomalia, string> = {
  cantidad_alta: "Cantidad muy alta",
  cantidad_baja: "Cantidad muy baja",
  repetida: "Movimientos repetidos",
  combinacion: "Combinación inusual",
};

export const NOMBRE_METODO: Record<MetodoDeteccion, string> = {
  estadistico: "Estadístico",
  isolation_forest: "Isolation Forest",
  lof: "LOF",
};
