import type { PageData } from "./pagination";

// ── Requests ─────────────────────────────────────────────────────────────

export interface ProveedorRequest {
  nombre: string;       // required, max 150
  nit: string;          // required, max 20
  telefono?: string;    // optional, max 20
  direccion?: string;   // optional, max 250
  correo?: string;      // optional, email, max 100
}

// ── Response ─────────────────────────────────────────────────────────────

export interface ProveedorResponse {
  id: number;
  nombre: string;
  nit: string;
  telefono: string | null;
  direccion: string | null;
  correo: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PageProveedores = PageData<ProveedorResponse>;
