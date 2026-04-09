import { apiFetch } from "@/app/lib/api";
import type {
  PrediccionResponse,
  MasivaResponse,
  EntrenamientoResponse,
} from "@/app/types/prediccion";

const BASE = "/api/prediccion";

export const prediccionService = {
  /** Verifica si el microservicio Python está disponible */
  async status(): Promise<boolean> {
    return apiFetch<boolean>(`${BASE}/status`);
  },

  /** Predicción de un único insumo */
  async predecir(insumoId: number): Promise<PrediccionResponse> {
    return apiFetch<PrediccionResponse>(`${BASE}/${insumoId}`);
  },

  /** Predicción masiva de todos los insumos */
  async predecirTodos(): Promise<MasivaResponse> {
    return apiFetch<MasivaResponse>(`${BASE}/todos`);
  },

  /** Reentrenar el modelo ML (solo ADMIN) */
  async entrenar(): Promise<EntrenamientoResponse> {
    return apiFetch<EntrenamientoResponse>(`${BASE}/entrenar`, {
      method: "POST",
    });
  },
};
