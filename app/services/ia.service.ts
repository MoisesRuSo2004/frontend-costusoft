import { apiFetch } from "@/app/lib/api";
import type {
  ConsultaRequest,
  ConsultaResponse,
  ChatRequest,
  ChatResponse,
  OrdenCompraRequest,
  OrdenCompraResponse,
  EstadoIA,
} from "@/app/types/ia";

const BASE = "/api/ia";

export const iaService = {
  /** POST /api/ia/consultar — análisis estructurado (9 tipos) */
  async consultar(request: ConsultaRequest): Promise<ConsultaResponse> {
    return apiFetch<ConsultaResponse>(`${BASE}/consultar`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /** POST /api/ia/chat — chat libre en lenguaje natural */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return apiFetch<ChatResponse>(`${BASE}/chat`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /** POST /api/ia/orden-compra — genera orden de compra (ADMIN + USER) */
  async ordenCompra(request: OrdenCompraRequest): Promise<OrdenCompraResponse> {
    return apiFetch<OrdenCompraResponse>(`${BASE}/orden-compra`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /** GET /api/ia/briefing — resumen ejecutivo del día */
  async briefing(): Promise<ConsultaResponse> {
    return apiFetch<ConsultaResponse>(`${BASE}/briefing`);
  },

  /** GET /api/ia/estado — verifica disponibilidad del servicio Groq */
  async estado(): Promise<EstadoIA> {
    return apiFetch<EstadoIA>(`${BASE}/estado`);
  },

  /** GET /api/ia/tipos — lista de tipos disponibles */
  async tipos(): Promise<string[]> {
    return apiFetch<string[]>(`${BASE}/tipos`);
  },
};
