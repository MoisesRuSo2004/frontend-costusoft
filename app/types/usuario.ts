import type { PageData } from "./pagination";

export type UserRol = "ADMIN" | "USER" | "BODEGA";

// ── Requests ─────────────────────────────────────────────────────────────

export interface UsuarioCreateRequest {
  username: string;       // 3-50 chars, solo letras/números/._-
  password: string;       // 6-100 chars
  correo: string;         // email válido, max 100
  rol: UserRol;
  activo?: boolean;       // default true
}

export interface UsuarioUpdateRequest {
  username: string;
  password?: string;      // opcional — si no se envía se mantiene el actual
  correo: string;
  rol: UserRol;
  activo: boolean;
}

export interface ChangePasswordRequest {
  passwordActual: string;
  passwordNueva: string;
  passwordConfirmacion: string;
}

// ── Response ─────────────────────────────────────────────────────────────

export interface UsuarioResponse {
  id: number;
  username: string;
  correo: string;
  rol: UserRol;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PageUsuarios = PageData<UsuarioResponse>;
