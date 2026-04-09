import { apiFetch, buildQuery } from "@/app/lib/api";
import type {
  ProveedorRequest,
  ProveedorResponse,
  PageProveedores,
} from "@/app/types/proveedor";

const BASE = "/api/proveedores";

export const proveedorService = {
  /** Listar proveedores paginados (solo ADMIN) */
  async listar(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }): Promise<PageProveedores> {
    const q = buildQuery({
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sortBy: params?.sortBy ?? "nombre",
      sortDir: params?.sortDir ?? "asc",
    });
    return apiFetch<PageProveedores>(`${BASE}${q}`);
  },

  /** Obtener proveedor por ID (solo ADMIN) */
  async obtenerPorId(id: number): Promise<ProveedorResponse> {
    return apiFetch<ProveedorResponse>(`${BASE}/${id}`);
  },

  /** Crear proveedor (solo ADMIN) */
  async crear(data: ProveedorRequest): Promise<ProveedorResponse> {
    return apiFetch<ProveedorResponse>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Actualizar proveedor (solo ADMIN) */
  async actualizar(id: number, data: ProveedorRequest): Promise<ProveedorResponse> {
    return apiFetch<ProveedorResponse>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Eliminar proveedor (solo ADMIN) */
  async eliminar(id: number): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" });
  },
};
