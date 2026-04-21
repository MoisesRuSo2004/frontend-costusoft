import type { PageData } from "./pagination";

export type UserRol = "ADMIN" | "USER" | "BODEGA" | "INSTITUCION";

// ── Requests ─────────────────────────────────────────────────────────────

export interface UsuarioCreateRequest {
  username: string;       // 3-50 chars, solo letras/números/._-
  // password NO se incluye — el sistema envía email de activación al usuario
  correo: string;         // email válido, max 100
  rol: UserRol;
  activo?: boolean;       // default true
  /** Obligatorio cuando rol === "INSTITUCION" */
  colegioId?: number;
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
  /** true = el usuario ya activó su cuenta y puede iniciar sesión */
  cuentaActivada: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PageUsuarios = PageData<UsuarioResponse>;
