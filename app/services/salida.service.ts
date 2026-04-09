import { apiFetch, buildQuery } from "@/app/lib/api";
import type { SalidaResponse, SalidaRequest, RechazarSalidaRequest } from "@/app/types/salida";
import type { EstadoMovimiento } from "@/app/types/entrada";
import type { PageData } from "@/app/types/pagination";

export const salidaService = {
  /** GET /api/salidas - lista paginada */
  async listar(params: { page?: number; size?: number } = {}): Promise<PageData<SalidaResponse>> {
    const q = buildQuery({ page: params.page ?? 0, size: params.size ?? 10 });
    return apiFetch<PageData<SalidaResponse>>(`/api/salidas${q}`);
  },

  /** GET /api/salidas/estado?estado=PENDIENTE */
  async listarPorEstado(estado: EstadoMovimiento, params: { page?: number; size?: number } = {}): Promise<PageData<SalidaResponse>> {
    const q = buildQuery({ estado, page: params.page ?? 0, size: params.size ?? 10 });
    return apiFetch<PageData<SalidaResponse>>(`/api/salidas/estado${q}`);
  },

  /** GET /api/salidas/:id */
  async obtenerPorId(id: number): Promise<SalidaResponse> {
    return apiFetch<SalidaResponse>(`/api/salidas/${id}`);
  },

  /** POST /api/salidas */
  async crear(body: SalidaRequest): Promise<SalidaResponse> {
    return apiFetch<SalidaResponse>("/api/salidas", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** PATCH /api/salidas/:id/confirmar */
  async confirmar(id: number): Promise<SalidaResponse> {
    return apiFetch<SalidaResponse>(`/api/salidas/${id}/confirmar`, { method: "PATCH" });
  },

  /** PATCH /api/salidas/:id/rechazar */
  async rechazar(id: number, body: RechazarSalidaRequest): Promise<SalidaResponse> {
    return apiFetch<SalidaResponse>(`/api/salidas/${id}/rechazar`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** PUT /api/salidas/:id */
  async actualizar(id: number, body: SalidaRequest): Promise<SalidaResponse> {
    return apiFetch<SalidaResponse>(`/api/salidas/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  /** DELETE /api/salidas/:id */
  async eliminar(id: number): Promise<void> {
    await apiFetch<void>(`/api/salidas/${id}`, { method: "DELETE" });
  },
};
