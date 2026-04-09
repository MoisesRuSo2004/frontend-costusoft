export interface MovimientoReciente {
  tipo: "ENTRADA" | "SALIDA";
  descripcion: string;
  fecha: string;
  totalItems: number;
}

export interface AlertaStock {
  insumoId?: number;
  nombre?: string;
  stockActual?: number;
  stockMinimo?: number;
}

export interface DashboardData {
  totalInsumos: number;
  totalEntradas: number;
  totalSalidas: number;
  totalColegios: number;
  totalUniformes: number;
  totalProveedores: number;
  totalUsuarios: number;
  insumosConStockBajo: number;
  insumosConStockCero: number;
  alertasStock: AlertaStock[];
  entradasPorMes: Record<string, number>;
  salidasPorMes: Record<string, number>;
  ultimosMovimientos: MovimientoReciente[];
  uniformesPorColegio: Record<string, number>;
}
