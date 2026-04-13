// ── Tipos de análisis estructurado ───────────────────────────────────────────

export type TipoConsulta =
  | "STOCK_BAJO"
  | "RESUMEN_INVENTARIO"
  | "PEDIDOS_ACTIVOS"
  | "ENTRADAS_PENDIENTES"
  | "SALIDAS_PENDIENTES"
  | "ANALISIS_GENERAL"
  | "PREDICCION_RIESGO"
  | "ANALISIS_PROVEEDORES"
  | "ANOMALIAS_CONSUMO";

// ── Requests ──────────────────────────────────────────────────────────────────

export interface ConsultaRequest {
  tipo: TipoConsulta;
}

export interface ChatRequest {
  pregunta: string;
}

export interface OrdenCompraRequest {
  proveedorId?: number;
  nombreEmpresa?: string;
  observaciones?: string;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface ConsultaResponse {
  respuesta: string;
  tipo: string;
  modelo: string;
  tokensUsados: number;
  tiempoMs: number;
}

export interface ChatResponse {
  respuesta: string;
  modelo: string;
  tokensUsados: number;
  tiempoMs: number;
}

export interface OrdenCompraResponse {
  textoOrden: string;
  insumosIncluidos: number;
  modelo: string;
  tokensUsados: number;
  tiempoMs: number;
}

export interface EstadoIA {
  disponible: boolean;
  proveedor: string;
  status: string;
}

// ── Mensaje de chat (estado local UI) ────────────────────────────────────────

export type MsgRole = "user" | "ai" | "welcome";

export interface ChatMsg {
  id: string;
  role: MsgRole;
  content: string;
  tipo?: string;
  modelo?: string;
  tokensUsados?: number;
  tiempoMs?: number;
  ts: number;
  isOrdenCompra?: boolean;
  insumosIncluidos?: number;
}
