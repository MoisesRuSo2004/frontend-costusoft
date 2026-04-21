import { apiFetch, buildQuery } from "@/app/lib/api";
import type {
  SolicitudEspecialAdminResponse,
  SolicitudEspecialGestionRequest,
  EstadoSolicitudEspecial,
} from "@/app/types/solicitudEspecial";
import type { PageData } from "@/app/types/pagination";

const BASE = "/api/solicitudes-especiales";

/**
 * Servicio admin para Solicitudes Especiales de instituciones.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ENDPOINTS
 * ──────────────────────────────────────────────────────────────────────────
 *
 * GET  /api/solicitudes-especiales                  → Listar todas (paginado)
 * GET  /api/solicitudes-especiales?estado=PENDIENTE → Filtrar por estado
 * GET  /api/solicitudes-especiales/{id}             → Obtener por ID
 * PUT  /api/solicitudes-especiales/{id}/gestionar   → Gestionar (cambiar estado + respuesta)
 * ──────────────────────────────────────────────────────────────────────────
 */
export const solicitudEspecialService = {
  /**
   * Listar todas las solicitudes especiales con paginación y filtro opcional de estado.
   */
  listar(params?: {
    estado?: EstadoSolicitudEspecial;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageData<SolicitudEspecialAdminResponse>> {
    const qs = buildQuery(params ?? {});
    return apiFetch<PageData<SolicitudEspecialAdminResponse>>(`${BASE}${qs}`);
  },

  /**
   * Listar solo por estado — usado por NotificacionesContext para polling.
   */
  listarPorEstado(
    estado: EstadoSolicitudEspecial,
    params?: { page?: number; size?: number }
  ): Promise<PageData<SolicitudEspecialAdminResponse>> {
    const qs = buildQuery({ estado, ...(params ?? {}) });
    return apiFetch<PageData<SolicitudEspecialAdminResponse>>(`${BASE}${qs}`);
  },

  /**
   * Obtener una solicitud por su ID.
   */
  obtener(id: number): Promise<SolicitudEspecialAdminResponse> {
    return apiFetch<SolicitudEspecialAdminResponse>(`${BASE}/${id}`);
  },

  /**
   * Gestionar la solicitud: cambiar estado y añadir respuesta opcional.
   */
  gestionar(
    id: number,
    body: SolicitudEspecialGestionRequest
  ): Promise<SolicitudEspecialAdminResponse> {
    return apiFetch<SolicitudEspecialAdminResponse>(`${BASE}/${id}/gestionar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
};
