export interface PlanProduccion {
  pantalon_diario: number;
  camisa_diario: number;
  pantalon_ef: number;
  sueter_ef: number;
}

export interface RecursoInfo {
  usado: number;
  disponible: number;
  holgura: number;
  utilizacion_pct: number;
}

export interface DemandaInfo {
  solicitado: number;
  demanda_maxima: number;
}

export type EstadoOptimizacion = "OPTIMAL" | "INFEASIBLE" | "UNBOUNDED" | "ERROR";

export interface OptimizacionResponse {
  id?: number;
  estado: EstadoOptimizacion;
  utilidad_total: number;
  plan: PlanProduccion;
  recursos: Record<string, RecursoInfo>;
  demanda: Record<string, DemandaInfo>;
  talla: string;
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
  talla: string;
  x1_pantalon_diario?: number;
  x2_camisa_diario?: number;
  x3_pantalon_ef?: number;
  x4_sueter_ef?: number;
  mensaje?: string;
  created_at?: string;
}

export interface HistorialOptimizacion {
  total: number;
  items: HistorialItem[];
}
