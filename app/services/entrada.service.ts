import { apiFetch, buildQuery } from "@/app/lib/api";
import type { EntradaResponse, EntradaRequest, RechazarRequest } from "@/app/types/entrada";
import type { EstadoMovimiento } from "@/app/types/entrada";
import type { PageData } from "@/app/types/pagination";

export const entradaService = {
  /** GET /api/entradas - lista paginada */
  async listar(params: { page?: number; size?: number } = {}): Promise<PageData<EntradaResponse>> {
    const q = buildQuery({ page: params.page ?? 0, size: params.size ?? 10 });
    return apiFetch<PageData<EntradaResponse>>(`/api/entradas${q}`);
  },

  /** GET /api/entradas/estado?estado=PENDIENTE */
  async listarPorEstado(estado: EstadoMovimiento, params: { page?: number; size?: number } = {}): Promise<PageData<EntradaResponse>> {
    const q = buildQuery({ estado, page: params.page ?? 0, size: params.size ?? 10 });
    return apiFetch<PageData<EntradaResponse>>(`/api/entradas/estado${q}`);
  },

  /** GET /api/entradas/:id */
  async obtenerPorId(id: number): Promise<EntradaResponse> {
    return apiFetch<EntradaResponse>(`/api/entradas/${id}`);
  },

  /** POST /api/entradas */
  async crear(body: EntradaRequest): Promise<EntradaResponse> {
    return apiFetch<EntradaResponse>("/api/entradas", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** PATCH /api/entradas/:id/confirmar */
  async confirmar(id: number): Promise<EntradaResponse> {
    return apiFetch<EntradaResponse>(`/api/entradas/${id}/confirmar`, { method: "PATCH" });
  },

  /** PATCH /api/entradas/:id/rechazar */
  async rechazar(id: number, body: RechazarRequest): Promise<EntradaResponse> {
    return apiFetch<EntradaResponse>(`/api/entradas/${id}/rechazar`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** PUT /api/entradas/:id */
  async actualizar(id: number, body: EntradaRequest): Promise<EntradaResponse> {
    return apiFetch<EntradaResponse>(`/api/entradas/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  /** DELETE /api/entradas/:id */
  async eliminar(id: number): Promise<void> {
    await apiFetch<void>(`/api/entradas/${id}`, { method: "DELETE" });
  },
};
