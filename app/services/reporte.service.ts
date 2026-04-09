import { apiFetch } from "@/app/lib/api";
import { getTokenFromCookie } from "@/app/lib/cookies";
import type { FiltroRequest, ReporteResponse } from "@/app/types/reporte";

const BASE = "/api/reporte";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const reporteService = {
  /**
   * Genera el reporte en JSON para previsualizar.
   * apiFetch ya retorna json.data, no hacer doble .data.
   */
  async generarReporte(filtro: FiltroRequest): Promise<ReporteResponse> {
    return apiFetch<ReporteResponse>(BASE, {
      method: "POST",
      body: JSON.stringify(filtro),
    });
  },

  /** Descarga el reporte como PDF (retorna Blob). */
  async exportarPdf(filtro: FiltroRequest): Promise<Blob> {
    const token = getTokenFromCookie();
    const res = await fetch(`${API_BASE}${BASE}/exportar/pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(filtro),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => `Error ${res.status}`);
      throw new Error(msg);
    }

    return res.blob();
  },

  /** Descarga el reporte como Excel .xlsx (retorna Blob). */
  async exportarExcel(filtro: FiltroRequest): Promise<Blob> {
    const token = getTokenFromCookie();
    const res = await fetch(`${API_BASE}${BASE}/exportar/excel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(filtro),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => `Error ${res.status}`);
      throw new Error(msg);
    }

    return res.blob();
  },
};

/** Descarga un Blob como archivo en el navegador. */
export function descargarArchivo(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
