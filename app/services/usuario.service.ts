import { apiFetch, buildQuery } from "@/app/lib/api";
import { getTokenFromCookie } from "@/app/lib/cookies";
import type {
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  UsuarioResponse,
  ChangePasswordRequest,
  PageUsuarios,
} from "@/app/types/usuario";

const BASE = "/api/usuarios";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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

  /** Subir o reemplazar foto de perfil (multipart) */
  async subirFoto(file: File): Promise<UsuarioResponse> {
    const token = getTokenFromCookie();
    const form = new FormData();
    form.append("foto", file);

    const res = await fetch(`${API_BASE}${BASE}/mi-foto`, {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const err: Error & { status?: number } = new Error(json?.message ?? `Error ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return json.data as UsuarioResponse;
  },

  /** Eliminar foto de perfil */
  async eliminarFoto(): Promise<UsuarioResponse> {
    return apiFetch<UsuarioResponse>(`${BASE}/mi-foto`, { method: "DELETE" });
  },
};
