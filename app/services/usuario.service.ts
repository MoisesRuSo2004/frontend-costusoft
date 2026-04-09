import { apiFetch, buildQuery } from "@/app/lib/api";
import type {
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioResponse,
  ChangePasswordRequest,
  PageUsuarios,
} from "@/app/types/usuario";

const BASE = "/api/usuarios";

export const usuarioService = {
  /** Listar usuarios paginados (solo ADMIN) */
  async listar(params?: { page?: number; size?: number; sortBy?: string; sortDir?: "asc" | "desc" }): Promise<PageUsuarios> {
    const q = buildQuery({
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sortBy: params?.sortBy ?? "username",
      sortDir: params?.sortDir ?? "asc",
    });
    return apiFetch<PageUsuarios>(`${BASE}${q}`);
  },

  /** Obtener usuario por ID (solo ADMIN) */
  async obtenerPorId(id: number): Promise<UsuarioResponse> {
    return apiFetch<UsuarioResponse>(`${BASE}/${id}`);
  },

  /** Crear usuario (solo ADMIN) */
  async crear(data: UsuarioCreateRequest): Promise<UsuarioResponse> {
    return apiFetch<UsuarioResponse>(BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Actualizar usuario (solo ADMIN) */
  async actualizar(id: number, data: UsuarioUpdateRequest): Promise<UsuarioResponse> {
    return apiFetch<UsuarioResponse>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Eliminar usuario (solo ADMIN) */
  async eliminar(id: number): Promise<void> {
    return apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" });
  },

  /** Toggle activo/inactivo (solo ADMIN) */
  async toggleActivo(id: number): Promise<UsuarioResponse> {
    return apiFetch<UsuarioResponse>(`${BASE}/${id}/toggle`, { method: "PATCH" });
  },

  /** Cambiar mi propio password (ADMIN + USER) */
  async cambiarPassword(data: ChangePasswordRequest): Promise<void> {
    return apiFetch<void>(`${BASE}/mi-password`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
