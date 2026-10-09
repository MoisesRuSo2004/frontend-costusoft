import { apiFetch } from "@/app/lib/api";
import type { AnomaliasRequest, AnomaliasResponse } from "@/app/types/mineria";

const BASE = "/api/mineria";

/**
 * Servicio del módulo Minería de datos (ADMIN y USER).
 * Los cálculos los hace el microservicio Python a través del backend.
 */
export const mineriaService = {
  /**
   * Movimientos que se alejan de lo habitual para su insumo, con estadística
   * robusta, Isolation Forest y LOF, más la validación del detector.
   *
   * POST /api/mineria/anomalias
   */
  async anomalias(solicitud: AnomaliasRequest): Promise<AnomaliasResponse> {
    return apiFetch<AnomaliasResponse>(`${BASE}/anomalias`, {
      method: "POST",
      body: JSON.stringify(solicitud),
    });
  },
};
