import { AuthData, UsuarioInfo } from "@/app/types/auth";
import { getTokenFromCookie } from "@/app/lib/cookies";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const authService = {
  /**
   * POST /api/auth/login
   * Autentica al usuario y devuelve tokens + datos del usuario.
   */
  async login(credentials: { username: string; password: string }): Promise<AuthData> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.message ?? "Usuario o contraseña incorrectos.");
    }

    return json.data as AuthData;
  },

  /**
   * GET /api/auth/me
   * Retorna los datos del usuario autenticado usando el token activo.
   */
  async me(): Promise<UsuarioInfo> {
    const token = getTokenFromCookie();
    if (!token) throw new Error("Sin sesión activa.");

    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.message ?? "Sesión expirada.");
    }

    return json.data as UsuarioInfo;
  },

  /**
   * POST /api/auth/refresh
   * Renueva el access token usando el refresh token.
   */
  async refresh(refreshToken: string): Promise<AuthData> {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.message ?? "No se pudo renovar la sesión.");
    }

    return json.data as AuthData;
  },
};
