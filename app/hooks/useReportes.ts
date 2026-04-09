import { useState } from "react";
import { reporteService, descargarArchivo } from "@/app/services/reporte.service";
import type { FiltroRequest, ReporteResponse, TipoInforme } from "@/app/types/reporte";

export interface UseReportesState {
  reporte: ReporteResponse | null;
  loading: boolean;
  exporting: boolean;
  error: string | null;
  tipoInformeActual: TipoInforme | null;
}

export interface UseReportesActions {
  generarReporte: (filtro: FiltroRequest) => Promise<void>;
  exportarPdf: (filtro: FiltroRequest) => Promise<void>;
  exportarExcel: (filtro: FiltroRequest) => Promise<void>;
  limpiar: () => void;
}

export function useReportes(): UseReportesState & UseReportesActions {
  const [reporte, setReporte] = useState<ReporteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipoInformeActual, setTipoInformeActual] = useState<TipoInforme | null>(null);

  const generarReporte = async (filtro: FiltroRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reporteService.generarReporte(filtro);
      setReporte(data);
      setTipoInformeActual(filtro.tipoInforme);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al generar reporte";
      setError(mensaje);
      setReporte(null);
    } finally {
      setLoading(false);
    }
  };

  const exportarPdf = async (filtro: FiltroRequest) => {
    setExporting(true);
    setError(null);
    try {
      const blob = await reporteService.exportarPdf(filtro);
      const fecha = new Date().toISOString().split("T")[0];
      descargarArchivo(blob, `reporte-inventario-${fecha}.pdf`);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al exportar PDF";
      setError(mensaje);
    } finally {
      setExporting(false);
    }
  };

  const exportarExcel = async (filtro: FiltroRequest) => {
    setExporting(true);
    setError(null);
    try {
      const blob = await reporteService.exportarExcel(filtro);
      const fecha = new Date().toISOString().split("T")[0];
      descargarArchivo(blob, `reporte-inventario-${fecha}.xlsx`);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error al exportar Excel";
      setError(mensaje);
    } finally {
      setExporting(false);
    }
  };

  const limpiar = () => {
    setReporte(null);
    setError(null);
    setTipoInformeActual(null);
  };

  return {
    reporte,
    loading,
    exporting,
    error,
    tipoInformeActual,
    generarReporte,
    exportarPdf,
    exportarExcel,
    limpiar,
  };
}
