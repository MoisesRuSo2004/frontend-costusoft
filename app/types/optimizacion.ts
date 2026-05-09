export interface RecursoInfo {
  usado: number;
  disponible: number;
  holgura: number;
  utilizacion_pct: number;
  unidad_medida?: string;
}

export interface DemandaInfo {
  solicitado: number;
  demanda_maxima: number;
}

export type EstadoOptimizacion = "OPTIMAL" | "INFEASIBLE" | "UNBOUNDED" | "ERROR";

export interface DetallePrenda {
  cantidad: number;
  max_producible: number;
  genero?: string;
  insumo_limitante_key?: string;
  insumo_limitante_nombre?: string;
  coef_insumo_limitante?: number;
  eficiencia_cop_por_unidad?: number;
  motivo: string;
}

export interface OptimizacionResponse {
  id?: number;
  colegio_id?: number;
  nombre_colegio?: string;
  estado: EstadoOptimizacion;
  utilidad_total: number;
  /** Plan dinámico: claves son los tipos de prenda del colegio (ej. "pantalon_diario") */
  plan: Record<string, number>;
  recursos: Record<string, RecursoInfo>;
  demanda: Record<string, DemandaInfo>;
  /** {ins_key: "Tela Lacoste Blanca"} — nombres reales de insumos para las etiquetas */
  insumo_labels?: Record<string, string>;
  /** Detalle por prenda: binding constraint y motivo cuando cantidad = 0 */
  detalle_plan?: Record<string, DetallePrenda>;
  mensaje: string;
  grafica_html?: string;
  grafica_region_html?: string;
  fecha_ejecucion?: string;
}

export interface HistorialItem {
  id: number;
  fecha_ejecucion: string;
  estado_solucion: string;
  utilidad_total?: number;
  colegio_id?: number;
  nombre_colegio?: string;
  /** Plan dinámico guardado como JSONB en DB */
  plan_produccion?: Record<string, number>;
  /** Columnas legacy — pueden estar vacías en nuevas ejecuciones */
  x1_pantalon_diario?: number;
  x2_camisa_diario?: number;
  x3_pantalon_ef?: number;
  x4_sueter_ef?: number;
  x5_sueter_diario?: number;
  mensaje?: string;
  created_at?: string;
}

export interface HistorialOptimizacion {
  total: number;
  items: HistorialItem[];
}
