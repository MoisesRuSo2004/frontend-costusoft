import { apiFetch, buildQuery } from "@/app/lib/api";
import type {
  InstitucionPerfilResponse,
  InstitucionPedidoRequest,
  CatalogoItem,
  SolicitudRequest,
  SolicitudResponse,
  EstadoSolicitud,
  IaChatRequest,
  IaChatResponse,
  PagePedidos,
  PageSolicitudes,
  HistorialPedidoResponse,
  PedidoPorGradoRequest,
  PedidoPorGradoResponse,
  SeguimientoResponse,
} from "@/app/types/institucion";
import type { PedidoResponse } from "@/app/types/pedido";

const BASE = "/api/institucion";

/**
 * Servicio del Portal Institucional.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ENDPOINTS
 * ──────────────────────────────────────────────────────────────────────────
 *
 * GET  /api/institucion/perfil              → Dashboard/perfil del coordinador
 * GET  /api/institucion/pedidos             → Lista pedidos del colegio (paginado)
 * POST /api/institucion/pedidos             → Crear pedido
 * GET  /api/institucion/pedidos/{id}        → Detalle de un pedido
 * GET  /api/institucion/pedidos/{id}/historial → Historial/timeline del pedido
 * GET  /api/institucion/catalogo            → Catálogo de prendas del colegio
 * GET  /api/institucion/solicitudes         → Lista solicitudes (paginado, filtrable)
 * POST /api/institucion/solicitudes         → Crear solicitud especial
 * POST /api/institucion/ia/chat             → Chat con asistente IA
 * ──────────────────────────────────────────────────────────────────────────
 *
 * El colegioId se inyecta automáticamente desde el JWT.
 * El frontend nunca envía colegioId en estos endpoints.
 */
export const institucionService = {
  // ── 1. Perfil ─────────────────────────────────────────────────────────

  /**
   * GET /api/institucion/perfil
   * Retorna datos del colegio + contadores resumen para el dashboard.
   */
  async getPerfil(): Promise<InstitucionPerfilResponse> {
    return apiFetch<InstitucionPerfilResponse>(`${BASE}/perfil`);
  },

  // ── 2. Pedidos ───────────────────────────────────────────────────────

  /**
   * GET /api/institucion/pedidos
   * Lista paginada de pedidos del colegio del coordinador.
   */
  async listarPedidos(params?: {
    page?: number;
    size?: number;
  }): Promise<PagePedidos> {
    const q = buildQuery({
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    });
    return apiFetch<PagePedidos>(`${BASE}/pedidos${q}`);
  },

  /**
   * POST /api/institucion/pedidos
   * Crea un nuevo pedido en estado BORRADOR.
   * Los uniformes deben pertenecer al catálogo del propio colegio.
   */
  async crearPedido(request: InstitucionPedidoRequest): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/pedidos`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * GET /api/institucion/pedidos/{id}
   * Detalle completo de un pedido. Solo accesible si pertenece al propio colegio.
   */
  async obtenerPedido(id: number): Promise<PedidoResponse> {
    return apiFetch<PedidoResponse>(`${BASE}/pedidos/${id}`);
  },

  /**
   * GET /api/institucion/pedidos/{id}/historial
   * Línea de tiempo con todas las transiciones de estado del pedido.
   */
  async obtenerHistorial(id: number): Promise<HistorialPedidoResponse[]> {
    return apiFetch<HistorialPedidoResponse[]>(`${BASE}/pedidos/${id}/historial`);
  },

  // ── 3. Catálogo ───────────────────────────────────────────────────────

  /**
   * GET /api/institucion/catalogo
   * Lista de prendas configuradas para el colegio del coordinador,
   * con tallas disponibles e insumos requeridos.
   */
  async getCatalogo(): Promise<CatalogoItem[]> {
    return apiFetch<CatalogoItem[]>(`${BASE}/catalogo`);
  },

  // ── 4. Solicitudes ────────────────────────────────────────────────────

  /**
   * GET /api/institucion/solicitudes
   * Lista paginada de solicitudes. Se puede filtrar por estado.
   */
  async listarSolicitudes(params?: {
    estado?: EstadoSolicitud | "";
    page?: number;
    size?: number;
  }): Promise<PageSolicitudes> {
    const q = buildQuery({
      estado: params?.estado || undefined,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
    });
    return apiFetch<PageSolicitudes>(`${BASE}/solicitudes${q}`);
  },

  /**
   * POST /api/institucion/solicitudes
   * Envía una nueva solicitud especial al equipo Costusoft.
   */
  async crearSolicitud(request: SolicitudRequest): Promise<SolicitudResponse> {
    return apiFetch<SolicitudResponse>(`${BASE}/solicitudes`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // ── 5. IA ─────────────────────────────────────────────────────────────

  /**
   * POST /api/institucion/ia/chat
   * Envía una pregunta al asistente IA contextualizado con los datos del colegio.
   */
  async chatIa(request: IaChatRequest): Promise<IaChatResponse> {
    return apiFetch<IaChatResponse>(`${BASE}/ia/chat`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // ── 6. Pedidos por grado (nuevo) ─────────────────────────────────────

  /**
   * POST /api/institucion/pedidos/por-grado
   * Genera una plantilla de pedido por grado; el backend infiere colegioId del token.
   */
  async crearPedidoPorGrado(request: PedidoPorGradoRequest): Promise<PedidoPorGradoResponse> {
    return apiFetch<PedidoPorGradoResponse>(`${BASE}/pedidos/por-grado`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /**
   * GET /api/institucion/pedidos/{id}/seguimiento
   * Obtiene el seguimiento detallado de un pedido (resumen de insumos y estado).
   */
  async obtenerSeguimiento(id: number): Promise<SeguimientoResponse> {
    return apiFetch<SeguimientoResponse>(`${BASE}/pedidos/${id}/seguimiento`);
  },
};
