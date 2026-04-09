/**
 * Types del módulo Uniforme.
 *
 * Un Uniforme representa un TIPO DE PRENDA asociado a un colegio
 * (ej. "Suéter Diario Hombre — Colegio Consolata").
 *
 * Los insumos requeridos se definen POR TALLA: la misma prenda puede
 * necesitar cantidades distintas de tela/botones según si es talla S o XL.
 */

// ── Request ──────────────────────────────────────────────────────────

export interface InsumoRequeridoRequest {
  /** ID del insumo a utilizar */
  insumoId: number;
  /** Cantidad base necesaria por unidad fabricada */
  cantidadBase: number;
  /** Unidad de medida (ej: "metros", "unidades", "docenas") */
  unidadMedida: string;
  /** Talla a la que aplica este insumo (ej: "S", "M", "L", "XL", "06-08") */
  talla: string;
}

export interface UniformeRequest {
  /** Nombre de la prenda (ej: "Suéter", "Camisa", "Pantalón") */
  prenda: string;
  /** Tipo de uniforme (ej: "Diario", "Educación Física") */
  tipo?: string;
  /** Género al que aplica (ej: "Hombre", "Mujer", "Unisex", null para Ed. Física) */
  genero?: string | null;
  /** ID del colegio al que pertenece */
  colegioId: number;
  /** Lista de insumos requeridos agrupados por talla */
  insumosRequeridos: InsumoRequeridoRequest[];
}

// ── Response ─────────────────────────────────────────────────────────

export interface InsumoRequeridoResponse {
  id: number;
  insumoId: number;
  nombreInsumo: string;
  cantidadBase: number;
  unidadMedida: string;
  talla: string;
}

export interface UniformeResponse {
  id: number;
  prenda: string;
  tipo: string;
  genero: string | null;
  colegioId: number;
  colegioNombre: string;
  /** Tallas disponibles extraídas de insumosRequeridos */
  tallas: string[];
  /** Lista completa de insumos requeridos con su talla */
  insumosRequeridos: InsumoRequeridoResponse[];
  createdAt: string;
  updatedAt: string;
}

// ── Tipos auxiliares para el formulario ─────────────────────────────

export interface InsumoPorTalla {
  id: string; // ID temporal para el formulario
  insumoId: number;
  nombreInsumo: string;
  cantidadBase: number;
  unidadMedida: string;
  talla: string;
}

export interface UniformeFormData {
  prenda: string;
  tipo: string;
  genero: string;
  colegioId: number | null;
  insumosPorTalla: InsumoPorTalla[];
}

// ── Filtros ───────────────────────────────────────────────────────────

export interface UniformeFiltros {
  colegioId?: number;
  prenda?: string;
  tipo?: string;
  genero?: string;
}
