// Resultado del modelo Prophet — campos en snake_case per @JsonProperty en Java
export interface ProphetResultado {
  dias_hasta_stock_minimo: number | null;
  dias_hasta_cero: number | null;
  consumo_diario_promedio: number | null;
  fecha_alerta_estimada: string | null;      // yyyy-MM-dd
  fecha_agotamiento_estimada: string | null; // yyyy-MM-dd
  confianza: number | null;                  // 0–1
  suficiente_historial: boolean | null;
  metodo: string | null;
}

// Resultado del modelo XGBoost — campos en snake_case
export interface XGBoostResultado {
  nivel_riesgo: string; // CRITICO | ALTO | MEDIO | BAJO | ESTABLE
  probabilidades: Record<string, number> | null;
  modelo_entrenado: boolean | null;
  metodo: string | null;
}

// Predicción individual de un insumo — campos en snake_case per @JsonProperty
export interface PrediccionResponse {
  insumo_id: number;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
  prophet: ProphetResultado | null;
  xgboost: XGBoostResultado | null;
  features: Record<string, unknown> | null;
  alerta: boolean;
  mensaje: string;
  recomendacion: string | null;
}

// Predicción masiva — en_riesgo viene en snake_case por @JsonProperty
export interface MasivaResponse {
  en_riesgo: number;
  total: number;
  predicciones: PrediccionResponse[];
}

// Respuesta de entrenamiento del modelo
export interface EntrenamientoResponse {
  exito: boolean;
  mensaje: string;
  registros: number | null;
}
