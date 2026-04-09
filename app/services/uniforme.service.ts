import { apiFetch } from "@/app/lib/api";
import type {
  UniformeRequest,
  UniformeResponse,
} from "@/app/types/uniforme";

const BASE = "/api/uniformes";

/**
 * Servicio del módulo Uniforme.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ENDPOINTS DEL BACKEND
 * ──────────────────────────────────────────────────────────────────────────
 *
 * 1. GET /api/uniformes/colegio/{colegioId}
 *    → Listar uniformes de un colegio con sus insumos requeridos
 *
 * 2. GET /api/uniformes/{id}
 *    → Obtener uniforme por ID con insumos requeridos
 *
 * 3. POST /api/uniformes
 *    → Crear uniforme e insumos requeridos en la misma operación
 *
 * 4. PUT /api/uniformes/{id}
 *    → Actualizar uniforme y reemplazar completamente los insumos
 *
 * 5. DELETE /api/uniformes/{id}
 *    → Eliminar uniforme (solo ADMIN)
 *
 * 6. GET /api/uniformes/{id}/tallas
 *    → Obtener tallas disponibles de una prenda
 * ──────────────────────────────────────────────────────────────────────────
 */
export const uniformeService = {
  // ── 1. Listar uniformes por colegio ───────────────────────────────────

  /**
   * Obtiene todos los uniformes de un colegio con sus insumos requeridos.
   *
   * @param colegioId ID del colegio
   * @returns Lista de uniformes con insumos agrupados por talla
   */
  async listarPorColegio(colegioId: number): Promise<UniformeResponse[]> {
    return apiFetch<UniformeResponse[]>(`${BASE}/colegio/${colegioId}`);
  },

  // ── 2. Obtener uniforme por ID ───────────────────────────────────────

  /**
   * Obtiene un uniforme específico con todos sus insumos requeridos.
   *
   * @param id ID del uniforme
   * @returns Uniforme con insumos detallados
   */
  async obtenerPorId(id: number): Promise<UniformeResponse> {
    return apiFetch<UniformeResponse>(`${BASE}/${id}`);
  },

  // ── 3. Crear uniforme ────────────────────────────────────────────────

  /**
   * Crea un nuevo uniforme con sus insumos requeridos.
   *
   * El request incluye:
   * - Datos básicos: prenda, tipo, genero, colegioId
   * - insumosRequeridos: lista de {insumoId, cantidadBase, unidadMedida, talla}
   *
   * @param request Datos del uniforme a crear
   * @returns Uniforme creado con sus insumos
   */
  async crear(request: UniformeRequest): Promise<UniformeResponse> {
    return apiFetch<UniformeResponse>(BASE, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // ── 4. Actualizar uniforme ─────────────────────────────────────────────

  /**
   * Actualiza un uniforme y reemplaza completamente la lista de insumos.
   *
   * IMPORTANTE: Se deben enviar TODOS los insumos requeridos, incluso
   * los que no cambiaron. Los insumos no incluidos se eliminarán.
   *
   * @param id ID del uniforme
   * @param request Datos actualizados del uniforme
   * @returns Uniforme actualizado
   */
  async actualizar(id: number, request: UniformeRequest): Promise<UniformeResponse> {
    return apiFetch<UniformeResponse>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  // ── 5. Eliminar uniforme ─────────────────────────────────────────────

  /**
   * Elimina un uniforme y todos sus insumos requeridos asociados.
   * Solo disponible para ADMIN.
   *
   * @param id ID del uniforme a eliminar
   */
  async eliminar(id: number): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" });
  },

  // ── 6. Obtener tallas disponibles ────────────────────────────────────

  /**
   * Obtiene las tallas configuradas para una prenda específica.
   *
   * Úsalo para poblar el dropdown de talla:
   * 1. Usuario selecciona el colegio → GET /api/uniformes/colegio/{id}
   * 2. Selecciona la prenda del listado
   * 3. Llama a este endpoint → muestra el dropdown de tallas
   * 4. Selecciona talla + ingresa cantidad → agrega al pedido
   *
   * @param id ID del uniforme
   * @returns Lista de tallas (ej: ["S", "M", "L", "XL"] o ["06-08", "10-12"])
   */
  async listarTallas(id: number): Promise<string[]> {
    return apiFetch<string[]>(`${BASE}/${id}/tallas`);
  },
};

// Re-exportar tipos para conveniencia
export type {
  UniformeRequest,
  UniformeResponse,
  InsumoRequeridoRequest,
  InsumoRequeridoResponse,
} from "@/app/types/uniforme";
