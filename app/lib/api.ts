import { getTokenFromCookie } from "@/app/lib/cookies";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * Fetch autenticado al backend.
 * Lanza Error con el mensaje del backend si la respuesta no es 2xx.
 * Retorna `json.data` directamente.
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getTokenFromCookie();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? `Error ${res.status}: ${res.statusText}`);
  }

  return json.data as T;
}

/** Construye un query string a partir de un objeto (omite valores undefined/null) */
export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return q ? `?${q}` : "";
}
