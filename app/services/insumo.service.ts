import { apiFetch, buildQuery } from "@/app/lib/api";
import type { InsumoResponse, InsumoRequest, InsumoStockRequest, InsumoOption } from "@/app/types/insumo";
import type { PageData } from "@/app/types/pagination";

export const insumoService = {
  /** GET /api/insumos - lista paginada */
  async listar(params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  } = {}): Promise<PageData<InsumoResponse>> {
    const q = buildQuery({ page: params.page ?? 0, size: params.size ?? 10, sortBy: params.sortBy ?? "nombre", sortDir: params.sortDir ?? "asc" });
    return apiFetch<PageData<InsumoResponse>>(`/api/insumos${q}`);
  },

  /** GET /api/insumos/buscar?nombre=X - autocomplete */
  async buscar(nombre: string): Promise<InsumoOption[]> {
    const q = buildQuery({ nombre });
    return apiFetch<InsumoOption[]>(`/api/insumos/buscar${q}`);
  },

  /** GET /api/insumos/stock-bajo */
  async stockBajo(): Promise<InsumoResponse[]> {
    return apiFetch<InsumoResponse[]>("/api/insumos/stock-bajo");
  },

  /** GET /api/insumos/:id */
  async obtenerPorId(id: number): Promise<InsumoResponse> {
    return apiFetch<InsumoResponse>(`/api/insumos/${id}`);
  },

  /** POST /api/insumos */
  async crear(body: InsumoRequest): Promise<InsumoResponse> {
    return apiFetch<InsumoResponse>("/api/insumos", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** PUT /api/insumos/:id */
  async actualizar(id: number, body: InsumoRequest): Promise<InsumoResponse> {
    return apiFetch<InsumoResponse>(`/api/insumos/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  /** PATCH /api/insumos/:id/stock */
  async ajustarStock(id: number, body: InsumoStockRequest): Promise<InsumoResponse> {
    return apiFetch<InsumoResponse>(`/api/insumos/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** DELETE /api/insumos/:id */
  async eliminar(id: number): Promise<void> {
    await apiFetch<void>(`/api/insumos/${id}`, { method: "DELETE" });
  },

  /** PATCH /api/insumos/:id/inhabilitar — toggle activo */
  async inhabilitar(id: number): Promise<InsumoResponse> {
    return apiFetch<InsumoResponse>(`/api/insumos/${id}/inhabilitar`, { method: "PATCH" });
  },
};
