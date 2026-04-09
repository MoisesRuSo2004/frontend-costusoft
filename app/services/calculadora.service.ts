import { apiFetch } from "@/app/lib/api";
import type {
  CalculadoraVerificarRequest,
  CalculadoraVerificarResponse,
  CalculadoraPedidoRequest,
  CalculadoraPedidoResponse,
} from "@/app/types/calculadora";

const BASE = "/api/calculadora";

/**
 * Servicio del módulo Calculadora de Disponibilidad.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ENDPOINTS DEL BACKEND
 * ──────────────────────────────────────────────────────────────────────────
 *
 * 1. POST /api/calculadora/verificar
 *    → Verificar disponibilidad de UNA prenda en una talla específica.
 *    Body: { uniformeId: number, cantidad: number, talla: string }
 *
 * 2. GET /api/calculadora/verificar/{uniformeId}?cantidad=X&talla=Y
 *    → Igual que POST pero sin body. Útil para pruebas.
 *
 * 3. POST /api/calculadora/pedido
 *    → Calcular disponibilidad de un pedido con MÚLTIPLES prendas.
 *    Modo A: { colegioId: number, cantidad: number, talla: string }
 *    Modo B: { prendas: [{ uniformeId, cantidad, talla }, ...] }
 *
 * Todos los endpoints son SOLO LECTURA — no modifican el inventario.
 * ──────────────────────────────────────────────────────────────────────────
 */
export const calculadoraService = {
  // ── 1. Verificar disponibilidad de una sola prenda (POST) ─────────────

  /**
   * Verifica si se puede fabricar N unidades de una prenda en talla específica.
   *
   * Evalúa cada insumo requerido (tela, botones, cremallera, etc.) y retorna:
   * - disponible: true solo si TODOS los insumos cubren la cantidad solicitada
   * - cantidadMaximaFabricable: máximo fabricable con el stock actual
   * - detalles: estado por insumo (Disponible / Insuficiente / Sin stock)
   *
   * @param request Datos de la verificación (uniformeId, cantidad, talla)
   * @returns Response con disponibilidad y detalles por insumo
   */
  async verificar(
    request: CalculadoraVerificarRequest,
  ): Promise<CalculadoraVerificarResponse> {
    return apiFetch<CalculadoraVerificarResponse>(`${BASE}/verificar`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * Verifica disponibilidad vía GET (sin body).
   * Útil para pruebas rápidas desde navegador o Swagger.
   *
   * @param uniformeId ID del uniforme a verificar
   * @param cantidad Cantidad de unidades a fabricar
   * @param talla Talla a fabricar (ej: S, M, L, XL, 06-08)
   * @returns Response con disponibilidad y detalles por insumo
   */
  async verificarGet(
    uniformeId: number,
    cantidad: number,
    talla: string,
  ): Promise<CalculadoraVerificarResponse> {
    const params = new URLSearchParams({
      cantidad: String(cantidad),
      talla,
    });
    return apiFetch<CalculadoraVerificarResponse>(
      `${BASE}/verificar/${uniformeId}?${params.toString()}`,
    );
  },

  // ── 2. Calcular pedido completo (múltiples prendas + tallas) ───────────

  /**
   * Calcula si hay stock para completar un pedido con múltiples (prenda, talla).
   *
   * Consolida insumos compartidos entre prendas: si "Tela lacoste blanco"
   * la usan Suéter-M y Suéter-XL, se suma el total necesario y se compara
   * contra el stock real.
   *
   * Modo A — Todas las prendas de un colegio con la misma talla y cantidad:
   *   { colegioId: 1, cantidad: 50, talla: "M" }
   *
   * Modo B — Lista explícita con talla y cantidad individual por prenda:
   *   { prendas: [
   *       { uniformeId: 1, cantidad: 50, talla: "M" },
   *       { uniformeId: 2, cantidad: 50, talla: "06-08" }
   *   ]}
   *
   * @param request Datos del pedido (modo A o modo B)
   * @returns Response con disponibilidad completa, factor de cumplimiento,
   *          insumo limitante, y resumen consolidado de insumos
   */
  async calcularPedido(
    request: CalculadoraPedidoRequest,
  ): Promise<CalculadoraPedidoResponse> {
    return apiFetch<CalculadoraPedidoResponse>(`${BASE}/pedido`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
};

// Re-exportar tipos para conveniencia
export type {
  CalculadoraVerificarRequest,
  CalculadoraVerificarResponse,
  CalculadoraPedidoRequest,
  CalculadoraPedidoResponse,
};
