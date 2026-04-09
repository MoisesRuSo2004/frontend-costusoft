import { apiFetch, buildQuery } from "@/app/lib/api";
import type {
  ColegioRequest,
  ColegioResponse,
  ColegioConUniformes,
  PageColegios,
} from "@/app/types/colegio";

const BASE = "/api/colegios";

export const colegiosService = {
  /** Listar colegios paginados */
  async listar(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<PageColegios> {
    const q = buildQuery({
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sortBy: params?.sortBy ?? "nombre",
      sortDir: params?.sortDir ?? "asc",
    });
    return apiFetch<PageColegios>(`${BASE}${q}`);
  },

  /** Obtener colegio por ID con sus uniformes */
  async obtenerPorId(id: number): Promise<ColegioConUniformes> {
    return apiFetch<ColegioConUniformes>(`${BASE}/${id}`);
  },

  /** Crear nuevo colegio */
  async crear(data: ColegioRequest): Promise<ColegioResponse> {
    return apiFetch<ColegioResponse>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Actualizar colegio */
  async actualizar(id: number, data: ColegioRequest): Promise<ColegioResponse> {
    return apiFetch<ColegioResponse>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Eliminar colegio (solo ADMIN) */
  async eliminar(id: number): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" });
  },
};
