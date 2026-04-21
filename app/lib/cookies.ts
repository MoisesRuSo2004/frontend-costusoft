// Nombres de las cookies de sesión
const TOKEN_KEY = "cs_token";
const REFRESH_KEY = "cs_refresh";
const ROLE_KEY = "cs_role";
const REMEMBER_ME_KEY = "cs_remember_username";
const SESSION_TIMEOUT_KEY = "cs_session_timeout";

/**
 * Guarda los tokens y el rol en cookies del navegador.
 * El middleware de Next.js puede leer estas cookies para proteger rutas.
 */
export function setAuthCookies(params: {
  accessToken: string;
  refreshToken: string;
  rol: string;
  expiresIn: number; // milisegundos
  rememberMe?: boolean;
  username?: string;
}) {
  const accessExpires = new Date(Date.now() + params.expiresIn);
  const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
  const secure = location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(params.accessToken)}; expires=${accessExpires.toUTCString()}; path=/; SameSite=Strict${secure}`;
  document.cookie = `${REFRESH_KEY}=${encodeURIComponent(params.refreshToken)}; expires=${refreshExpires.toUTCString()}; path=/; SameSite=Strict${secure}`;
  document.cookie = `${ROLE_KEY}=${params.rol}; expires=${accessExpires.toUTCString()}; path=/; SameSite=Strict${secure}`;

  // Guardar "Recuérdame" en localStorage
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    if (params.rememberMe && params.username) {
      localStorage.setItem(REMEMBER_ME_KEY, params.username);
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
    // Guardar tiempo de expiración de sesión para timeout
    const expiresAt = Date.now() + params.expiresIn;
    localStorage.setItem(SESSION_TIMEOUT_KEY, String(expiresAt));
  }
}

/** Elimina todas las cookies de sesión (logout). */
export function clearAuthCookies() {
  const past = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = `${TOKEN_KEY}=; ${past}`;
  document.cookie = `${REFRESH_KEY}=; ${past}`;
  document.cookie = `${ROLE_KEY}=; ${past}`;

  // Limpiar localStorage de sesión
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.removeItem(SESSION_TIMEOUT_KEY);
  }
}

/** Lee el access token desde las cookies del navegador. */
export function getTokenFromCookie(): string | null {
  return readCookie(TOKEN_KEY);
}

/** Lee el refresh token desde las cookies del navegador. */
export function getRefreshTokenFromCookie(): string | null {
  return readCookie(REFRESH_KEY);
}

/** Lee el rol del usuario desde las cookies del navegador. */
export function getRoleFromCookie(): string | null {
  return readCookie(ROLE_KEY);
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Obtiene el username guardado en "Recuérdame". */
export function getRememberedUsername(): string | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  return localStorage.getItem(REMEMBER_ME_KEY);
}

/** Obtiene el tiempo de expiración de sesión desde localStorage. */
export function getSessionExpiresAt(): number | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  const expiresAt = localStorage.getItem(SESSION_TIMEOUT_KEY);
  return expiresAt ? parseInt(expiresAt, 10) : null;
}

/** Verifica si la sesión ha expirado. */
export function isSessionExpired(): boolean {
  const expiresAt = getSessionExpiresAt();
  if (!expiresAt) return false;
  return Date.now() > expiresAt;
}
