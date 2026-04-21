import type { PageData } from "./pagination";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type TipoSolicitudEspecial =
  | "AJUSTE_TALLA"
  | "PEDIDO_URGENTE"
  | "CAMBIO_FECHA_ENTREGA"
  | "CONSULTA_GENERAL"
  | "DEVOLUCION";

export type EstadoSolicitudEspecial =
  | "PENDIENTE"
  | "EN_REVISION"
  | "RESUELTA"
  | "RECHAZADA";

// ── Admin response ────────────────────────────────────────────────────────────

export interface SolicitudEspecialAdminResponse {
  id: number;
  tipo: TipoSolicitudEspecial;
  estado: EstadoSolicitudEspecial;
  asunto: string;
  descripcion: string;
  respuesta: string | null;
  fechaRespuesta: string | null;
  /** Nombre del colegio que originó la solicitud */
  colegioNombre: string;
  /** Username del usuario institucional que la creó */
  username: string;
  createdAt: string;
  updatedAt: string;
}

// ── Request para gestionar (admin) ────────────────────────────────────────────

export interface SolicitudEspecialGestionRequest {
  estado: EstadoSolicitudEspecial;
  respuesta?: string;
}

// ── Paginación ────────────────────────────────────────────────────────────────

export type PageSolicitudesEspeciales = PageData<SolicitudEspecialAdminResponse>;
