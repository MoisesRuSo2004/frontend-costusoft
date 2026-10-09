/**
 * Minería de datos — detección de anomalías.
 *
 * La solicitud va en camelCase (la valida el backend). La respuesta llega tal
 * cual la calcula el microservicio Python (snake_case, ver mineria/esquemas.py).
 */

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
