import { DashboardData } from "@/app/types/dashboard";
import { getTokenFromCookie } from "@/app/lib/cookies";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const dashboardService = {
  /**
   * GET /api/dashboard/resumen
   * Retorna métricas completas del sistema para el panel principal.
   */
  async getResumen(): Promise<DashboardData> {
    const token = getTokenFromCookie();

    const res = await fetch(`${API_BASE}/api/dashboard/resumen`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(json?.message ?? "Error al cargar el dashboard.");
    }

    return json.data as DashboardData;
  },
};
