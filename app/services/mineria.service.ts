import { apiFetch } from "@/app/lib/api";
import type { PronosticoRequest, PronosticoResponse } from "@/app/types/mineria";

const BASE = "/api/mineria";

/**
 * Servicio del módulo Minería de datos (ADMIN y USER).
 * Los cálculos los hace el microservicio Python a través del backend.
 */
export const mineriaService = {
  /**
   * Pronóstico dinámico de 1 a 5 insumos con horizonte, agrupación y un
   * escenario "¿y si?" opcional. Cada insumo usa el modelo que mejor
   * resultó en el backtesting.
   *
   * POST /api/mineria/pronostico
   */
  async pronostico(solicitud: PronosticoRequest): Promise<PronosticoResponse> {
    return apiFetch<PronosticoResponse>(`${BASE}/pronostico`, {
      method: "POST",
      body: JSON.stringify(solicitud),
    });
  },
};
