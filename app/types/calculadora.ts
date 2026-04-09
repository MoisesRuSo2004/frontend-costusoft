/**
 * Types del módulo Calculadora de Disponibilidad.
 *
 * Dos modos de uso:
 *
 * 1. Verificación simple — POST /api/calculadora/verificar
 *    ¿Puedo fabricar N unidades de una prenda X en talla Y?
 *    Request: uniformeId + cantidad + talla
 *
 * 2. Cálculo de pedido — POST /api/calculadora/pedido
 *    ¿Puedo completar un pedido con MÚLTIPLES prendas y tallas?
 *    Modo A: colegioId + cantidad + talla (todas las prendas del colegio)
 *    Modo B: lista explícita de prendas con cantidad y talla individual
 *
 * IMPORTANTE: La talla es SIEMPRE obligatoria porque los insumos varían
 * por talla (UniformeInsumo tiene talla). Sin talla, no se puede calcular.
 */

// ═══════════════════════════════════════════════════════════════════════
// MODO 1 — Verificación simple (una prenda)
// ═══════════════════════════════════════════════════════════════════════

/** Request para verificar disponibilidad de una sola prenda */
export interface CalculadoraVerificarRequest {
  /** ID del uniforme a fabricar */
  uniformeId: number;
  /** Cantidad de unidades a fabricar (mínimo 1) */
  cantidad: number;
  /** Talla a fabricar. Ej: S, M, L, XL, 06-08, 10-12, 14-16 */
  talla: string;
}

/** Response de verificación de disponibilidad de una prenda */
export interface CalculadoraVerificarResponse {
  uniformeId: number;
  nombrePrenda: string;
  talla: string;
  tipo: string;
  /** Género de la prenda. Puede ser null para prendas de Educación Física (unisex) */
  genero: string | null;
  cantidadSolicitada: number;
  /** Máximo de unidades fabricables con el stock actual */
  cantidadMaximaFabricable: number;
  /** true solo si TODOS los insumos tienen stock suficiente */
  disponible: boolean;
  /** Detalle insumo por insumo para esta prenda/talla */
  detalles: DetalleInsumo[];
}

// ═══════════════════════════════════════════════════════════════════════
// MODO 2 — Cálculo de pedido (múltiples prendas)
// ═══════════════════════════════════════════════════════════════════════

/** Request para calcular un pedido completo */
export interface CalculadoraPedidoRequest {
  /**
   * Modo A: ID del colegio para calcular todas sus prendas.
   * Se ignora si se proporciona la lista 'prendas'.
   * Requiere también 'cantidad' y 'talla'.
   */
  colegioId?: number;
  /**
   * Cantidad de uniformes por prenda cuando se usa colegioId.
   * Requerido cuando se usa colegioId.
   */
  cantidad?: number;
  /**
   * Talla global cuando se usa colegioId + cantidad.
   * Se ignora si se proporciona la lista 'prendas'.
   */
  talla?: string;
  /**
   * Modo B: Lista explícita de prendas con cantidad y talla individual.
   * Si se proporciona, tiene precedencia sobre colegioId.
   */
  prendas?: PrendaPedidoRequest[];
}

/** Una prenda dentro del request de cálculo de pedido */
export interface PrendaPedidoRequest {
  uniformeId: number;
  cantidad: number;
  /** Talla solicitada para esta prenda. Ej: S, M, L, XL, 06-08 */
  talla: string;
}

/** Response de cálculo de pedido completo */
export interface CalculadoraPedidoResponse {
  /** true solo si el pedido COMPLETO puede fabricarse */
  disponibleCompleto: boolean;
  /** Factor de cumplimiento entre 0.0000 y 1.0000 (1.0 = 100% atendible) */
  factorCumplimiento: number;
  /** Porcentaje 0–100 listo para mostrar en UI */
  porcentajeCumplimiento: number;
  /** Nombre del insumo cuello de botella que limita la producción. null si todo OK */
  insumoLimitante: string | null;
  /** Resultado detallado por cada (prenda, talla) del pedido */
  prendas: ResultadoPrendaPedido[];
  /** Insumos consolidados de todo el pedido */
  resumenInsumos: ResumenInsumoPedido[];
}

/** Resultado por prenda dentro de un pedido */
export interface ResultadoPrendaPedido {
  uniformeId: number;
  prenda: string;
  talla: string;
  tipo: string;
  /** Género. Puede ser null para prendas de Educación Física (unisex) */
  genero: string | null;
  cantidadSolicitada: number;
  /** Máximo fabricable para esta prenda con el factor global del pedido */
  cantidadMaxima: number;
  /** ¿Esta prenda sola tiene stock suficiente? */
  disponibleIndividual: boolean;
  /** Detalle insumo a insumo de esta prenda */
  insumos: DetalleInsumo[];
}

/** Resumen de insumo consolidado del pedido */
export interface ResumenInsumoPedido {
  insumoId: number;
  nombreInsumo: string;
  unidadMedida: string;
  /** Stock actual en bodega al momento del cálculo */
  stockActual: number;
  /** Total necesario sumando todos los requerimientos del pedido */
  totalNecesario: number;
  /** Cuánto falta: max(totalNecesario - stockActual, 0) */
  faltante: number;
  /** true si stockActual >= totalNecesario */
  suficiente: boolean;
  /** "Disponible" | "Insuficiente" | "Sin stock" */
  estado: string;
}

// ═══════════════════════════════════════════════════════════════════════
// Detalle por insumo (compartido entre modo 1 y modo 2)
// ═══════════════════════════════════════════════════════════════════════

/** Detalle de un insumo específico en el cálculo */
export interface DetalleInsumo {
  insumoId: number;
  nombreInsumo: string;
  unidadMedida: string;
  /** cantidadBase × cantidad solicitada para esta prenda/talla */
  cantidadNecesaria: number;
  /** Stock actual en bodega (evaluación individual) */
  stockActual: number;
  /** Sobrante si SOLO se fabricara esta prenda: max(stockActual - cantidadNecesaria, 0) */
  stockRestante: number;
  /** true si stockActual >= cantidadNecesaria */
  suficiente: boolean;
  /** "Disponible" | "Insuficiente" | "Sin stock" */
  estado: string;
}

// ═══════════════════════════════════════════════════════════════════════
// Tipos legacy para compatibilidad (deprecated - usar los nuevos)
// ═══════════════════════════════════════════════════════════════════════

/** @deprecated Usar CalculadoraVerificarRequest */
export interface CalculadoraFormValues {
  colegioId: string;
  uniformeId: string;
  cantidad: number;
}

/** @deprecated Usar CalculadoraVerificarResponse */
export interface CalculadoraResultado {
  items: CalculadoraResultadoItem[];
  suficiente: boolean;
  mensaje?: string;
  raw: unknown;
}

/** @deprecated Usar DetalleInsumo */
export interface CalculadoraResultadoItem {
  id: string;
  nombre: string;
  unidad: string;
  cantidadRequerida: number;
  stockDisponible: number;
  suficiente: boolean;
}

/** @deprecated Usar PrendaPedidoRequest o datos del colegio */
export interface SolicitudSalidaPayload {
  colegioId: string;
  uniformeId: string;
  cantidad: number;
  items: CalculadoraResultadoItem[];
}

// ═══════════════════════════════════════════════════════════════════════
// Tipos auxiliares para selects
// ═══════════════════════════════════════════════════════════════════════

export interface ColegioOption {
  id: string;
  nombre: string;
}

export interface UniformeOption {
  id: number;
  prenda: string;
  talla: string;
  genero: string | null;
}

export interface TallaOption {
  talla: string;
  etiqueta: string;
}
