export type TipoInforme = "GENERAL" | "ENTRADAS" | "SALIDAS" | "STOCK_BAJO" | "ROTACION" | "CONSUMO_PROMEDIO" | "PEDIDOS";

// ════════════════════════════════════════════════════════════════════════════
// REQUEST
// ════════════════════════════════════════════════════════════════════════════

export interface FiltroRequest {
  fechaInicio: string; // yyyy-MM-dd
  fechaFin: string; // yyyy-MM-dd
  tipoInforme: TipoInforme;
  proveedorId?: number;
  colegioId?: number;
  estadoPedido?: string; // BORRADOR | CALCULADO | CONFIRMADO | EN_PRODUCCION | LISTO_PARA_ENTREGA | ENTREGADO | CANCELADO
}

// ════════════════════════════════════════════════════════════════════════════
// ITEMS — Tipos de fila por informe
// ════════════════════════════════════════════════════════════════════════════

// ── GENERAL / ENTRADAS / SALIDAS / STOCK_BAJO ────────────────────────────

export interface ItemResponse {
  insumoId: number;
  nombreInsumo: string;
  unidadMedida: string;
  tipo: string;
  entradas: number;
  salidas: number;
  stockActual: number;
  stockMinimo: number;
  stockBajo: boolean;
  stockCero: boolean; // true si stockActual == 0
}

// ── ROTACION ─────────────────────────────────────────────────────────────

export interface RotacionItem {
  insumoId: number;
  nombreInsumo: string;
  unidadMedida: string;
  tipo: string;
  stockActual: number;
  totalSalidas: number;
  indiceRotacion: number; // unidades consumidas por mes
  diasCobertura: number | null; // días que dura el stock actual
  categoriaRotacion: "Alta rotación" | "Media rotación" | "Baja rotación" | "Sin movimiento";
  stockMuerto: boolean; // true si no tuvo salidas y tiene stock
}

// ── CONSUMO_PROMEDIO ─────────────────────────────────────────────────────

export interface ConsumoItem {
  insumoId: number;
  nombreInsumo: string;
  unidadMedida: string;
  tipo: string;
  stockActual: number;
  totalConsumo: number;
  consumoDiario: number;
  consumoSemanal: number;
  consumoMensual: number;
  tendencia: "Creciente" | "Decreciente" | "Estable" | "Sin datos";
  diasCoberturaEstimados: number | null;
}

// ── PEDIDOS ──────────────────────────────────────────────────────────────

export interface PedidoItem {
  pedidoId: number;
  numeroPedido: string;
  colegio: string;
  estado: string;
  estadoDescripcion: string;
  fechaPedido: string; // yyyy-MM-dd HH:mm:ss
  fechaEstimadaEntrega: string | null; // yyyy-MM-dd
  diasRestantes: number | null;
  semaforo: "VERDE" | "AMARILLO" | "ROJO" | "ENTREGADO" | "CANCELADO" | "SIN_FECHA";
  semaforoDescripcion: string;
  totalPrendas: number;
  porcentajeCumplimiento: number | null;
  creadoPor: string;
}

// ════════════════════════════════════════════════════════════════════════════
// RESUMEN
// ════════════════════════════════════════════════════════════════════════════

export interface ResumenResponse {
  tipoInforme: TipoInforme;
  fechaInicio: string;
  fechaFin: string;
  generadoEn: string;

  // Campos para GENERAL / ENTRADAS / SALIDAS / STOCK_BAJO
  totalInsumos?: number;
  totalEntradas?: number;
  totalSalidas?: number;
  insumosConStockBajo?: number;
  insumosConStockCero?: number;

  // Campos para ROTACION
  insumosAltaRotacion?: number;
  insumosStockMuerto?: number;

  // Campos para CONSUMO_PROMEDIO
  insumosTendenciaCreciente?: number;
  insumosTendenciaDecreciente?: number;

  // Campos para PEDIDOS
  totalPedidos?: number;
  pedidosVerdes?: number;
  pedidosAmarillos?: number;
  pedidosRojos?: number;
  pedidosEntregados?: number;
  pedidosCancelados?: number;
}

// ════════════════════════════════════════════════════════════════════════════
// RESPONSE COMPLETO
// ════════════════════════════════════════════════════════════════════════════

export interface ReporteResponse {
  items?: ItemResponse[];
  rotacion?: RotacionItem[];
  consumo?: ConsumoItem[];
  pedidos?: PedidoItem[];
  resumen: ResumenResponse;
}
