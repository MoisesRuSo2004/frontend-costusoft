import { apiFetch, buildQuery } from "@/app/lib/api";
import type {
  PedidoRequest,
  PedidoResponse,
  CancelarPedidoRequest,
  HistorialPedidoResponse,
  EstadoPedido,
  PedidoFiltros,
} from "@/app/types/pedido";
import type { PageData } from "@/app/types/pagination";

const BASE = "/api/pedidos";

/**
 * Servicio del módulo Pedido.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * FLUJO DE ESTADOS
 * ──────────────────────────────────────────────────────────────────────────
 *
 * BORRADOR → CALCULADO → CONFIRMADO → EN_PRODUCCION → LISTO_PARA_ENTREGA → ENTREGADO
 *                              ↓
 *                         CANCELADO (desde cualquier estado)
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ENDPOINTS
 * ──────────────────────────────────────────────────────────────────────────
 *
 * POST   /api/pedidos                    → Crear (BORRADOR)
 * GET    /api/pedidos                    → Listar paginados
 * GET    /api/pedidos/estado             → Listar por estado
 * GET    /api/pedidos/colegio/{id}       → Listar por colegio
 * GET    /api/pedidos/{id}               → Obtener por ID
 * PUT    /api/pedidos/{id}               → Actualizar (solo BORRADOR)
 * DELETE /api/pedidos/{id}               → Eliminar (solo ADMIN, solo BORRADOR)
 *
 * POST   /api/pedidos/{id}/calcular          → Verificar stock
 * POST   /api/pedidos/{id}/confirmar         → CALCULADO → CONFIRMADO
 * POST   /api/pedidos/{id}/iniciar-produccion → CONFIRMADO → EN_PRODUCCION
 * POST   /api/pedidos/{id}/marcar-listo      → EN_PRODUCCION → LISTO_PARA_ENTREGA
 * POST   /api/pedidos/{id}/entregar          → LISTO_PARA_ENTREGA → ENTREGADO
 * POST   /api/pedidos/{id}/cancelar          → Any → CANCELADO
 *
 * GET    /api/pedidos/{id}/historial     → Historial de auditoría
 * ──────────────────────────────────────────────────────────────────────────
 */
export const pedidoService = {
  // ── 1. CRUD Básico ─────────────────────────────────────────────────────

  /**
   * POST /api/pedidos
   * Crea un pedido en estado BORRADOR. No toca el inventario.
   */
  async crear(request: PedidoRequest): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(BASE, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * GET /api/pedidos
   * Lista pedidos paginados.
   */
  async listar(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<PageData<PedidoResponse>> {
    const q = buildQuery({
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sortBy: params?.sortBy ?? "createdAt",
      sortDir: params?.sortDir ?? "desc",
    });
    return apiFetch<PageData<PedidoResponse>>(`${BASE}${q}`);
  },

  /**
   * GET /api/pedidos/estado?estado=X
   * Lista pedidos filtrados por estado.
   */
  async listarPorEstado(
    estado: EstadoPedido,
    params?: { page?: number; size?: number }
  ): Promise<PageData<PedidoResponse>> {
    const q = buildQuery({
      estado,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    });
    return apiFetch<PageData<PedidoResponse>>(`${BASE}/estado${q}`);
  },

  /**
   * GET /api/pedidos/colegio/{colegioId}
   * Lista pedidos de un colegio específico.
   */
  async listarPorColegio(
    colegioId: number,
    params?: { page?: number; size?: number }
  ): Promise<PageData<PedidoResponse>> {
    const q = buildQuery({
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    });
    return apiFetch<PageData<PedidoResponse>>(`${BASE}/colegio/${colegioId}${q}`);
  },

  /**
   * GET /api/pedidos/{id}
   * Obtiene un pedido completo con detalles y resumen de insumos.
   */
  async obtenerPorId(id: number): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/${id}`);
  },

  /**
   * PUT /api/pedidos/{id}
   * Actualiza un pedido. Solo permitido en estado BORRADOR.
   * Reinicia los resultados de la calculadora.
   */
  async actualizar(id: number, request: PedidoRequest): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  /**
   * DELETE /api/pedidos/{id}
   * Elimina un pedido. Solo ADMIN y solo en estado BORRADOR.
   */
  async eliminar(id: number): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" });
  },

  // ── 2. Flujo de Estados ──────────────────────────────────────────────────

  /**
   * POST /api/pedidos/{id}/calcular
   * Ejecuta la calculadora sobre todas las prendas del pedido.
   * Consolidación de insumos compartidos, almacena factorCumplimiento.
   * Re-ejecutable en BORRADOR o CALCULADO.
   */
  async calcular(id: number): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/${id}/calcular`, {
      method: "POST",
    });
  },

  /**
   * POST /api/pedidos/{id}/confirmar
   * Transición: CALCULADO → CONFIRMADO.
   * El pedido ya no puede editarse.
   */
  async confirmar(id: number): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/${id}/confirmar`, {
      method: "POST",
    });
  },

  /**
   * POST /api/pedidos/{id}/iniciar-produccion
   * Transición: CONFIRMADO → EN_PRODUCCION.
   * Genera una Salida PENDIENTE con todos los insumos agregados.
   * BODEGA debe confirmar la Salida al retirar físicamente.
   */
  async iniciarProduccion(id: number): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/${id}/iniciar-produccion`, {
      method: "POST",
    });
  },

  /**
   * POST /api/pedidos/{id}/marcar-listo
   * Transición: EN_PRODUCCION → LISTO_PARA_ENTREGA.
   * Registra que la fabricación fue completada.
   */
  async marcarListo(id: number): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/${id}/marcar-listo`, {
      method: "POST",
    });
  },

  /**
   * POST /api/pedidos/{id}/entregar
   * Transición: LISTO_PARA_ENTREGA → ENTREGADO.
   * Confirma la entrega física y descuenta stock del inventario.
   */
  async entregar(id: number): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/${id}/entregar`, {
      method: "POST",
    });
  },

  /**
   * POST /api/pedidos/{id}/cancelar
   * Transición: Any → CANCELADO.
   * Cancela el pedido en cualquier estado no-final.
   * Rechaza la Salida PENDIENTE si existe, sin tocar stock.
   */
  async cancelar(id: number, request: CancelarPedidoRequest): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/${id}/cancelar`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * PATCH /api/pedidos/{id}/fecha-entrega
   * Actualiza solo la fecha estimada de entrega.
   * Válido en cualquier estado activo (no ENTREGADO, no CANCELADO).
   * @param fecha formato "yyyy-MM-dd" o null para borrar la fecha
   */
  async actualizarFechaEntrega(id: number, fecha: string | null): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/${id}/fecha-entrega`, {
      method: "PATCH",
      body: JSON.stringify({ fechaEstimadaEntrega: fecha }),
    });
  },

  // ── 3. Historial ───────────────────────────────────────────────────────

  /**
   * GET /api/pedidos/{id}/historial
   * Obtiene el historial de auditoría del pedido.
   */
  async obtenerHistorial(id: number): Promise<HistorialPedidoResponse[]> {
    return apiFetch<HistorialPedidoResponse[]>(`${BASE}/${id}/historial`);
  },
};

// Re-exportar tipos para conveniencia
export type {
  PedidoRequest,
  PedidoResponse,
  CancelarPedidoRequest,
  HistorialPedidoResponse,
  ResumenInsumoPedido,
  DetallePedidoResponse,
  ColegioPedidoInfo,
} from "@/app/types/pedido";
