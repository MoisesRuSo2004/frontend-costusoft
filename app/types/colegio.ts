import type { PageData } from "./pagination";

// ── Request ───────────────────────────────────────────────────────────────
export interface ColegioRequest {
  nombre: string;          // requerido, max 150
  direccion?: string;      // opcional, max 250
}

// ── Response básico (listado) ─────────────────────────────────────────────
export interface ColegioResponse {
  id: number;
  nombre: string;
  direccion: string | null;
  totalUniformes: number;
  createdAt: string;
  updatedAt: string;
}

// ── Resumen de uniforme dentro del colegio ────────────────────────────────
export interface UniformeResumen {
  id: number;
  prenda: string;
  talla: string;
  genero: string;
}

// ── Response con uniformes incluidos ─────────────────────────────────────
export interface ColegioConUniformes {
  id: number;
  nombre: string;
  direccion: string | null;
  uniformes: UniformeResumen[];
  createdAt: string;
}

// Re-export para compatibilidad con hooks existentes
export type Colegio = ColegioResponse;

export type PageColegios = PageData<ColegioResponse>;
