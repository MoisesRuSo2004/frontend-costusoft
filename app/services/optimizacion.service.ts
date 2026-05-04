import { apiFetch } from "@/app/lib/api";
import { getTokenFromCookie } from "@/app/lib/cookies";
import type {
  OptimizacionResponse,
  HistorialOptimizacion,
} from "@/app/types/optimizacion";

const BASE = "/api/optimizacion";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const optimizacionService = {
  /** Verifica si el microservicio Python está disponible */
  async status(): Promise<boolean> {
    return apiFetch<boolean>(`${BASE}/status`);
  },

  /** Ejecuta el modelo ILP y retorna el plan óptimo */
  async optimizar(
    talla = "M",
    incluirDemanda = true
  ): Promise<OptimizacionResponse> {
    return apiFetch<OptimizacionResponse>(
      `${BASE}?talla=${talla}&incluirDemanda=${incluirDemanda}`,
      { method: "POST" }
    );
  },

  /** Historial de ejecuciones del optimizador */
  async historial(limit = 20): Promise<HistorialOptimizacion> {
    return apiFetch<HistorialOptimizacion>(
      `${BASE}/historial?limit=${limit}`
    );
  },

  /** Descarga el PDF de una ejecución y dispara el browser download */
  async downloadPdf(historialId: number): Promise<void> {
    const token = getTokenFromCookie();
    const res = await fetch(`${API_BASE}${BASE}/historial/${historialId}/pdf`, {
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    if (!res.ok) throw new Error("Error al generar el PDF");
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `optimizacion-${historialId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
