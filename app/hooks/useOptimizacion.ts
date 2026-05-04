"use client";

import { useCallback, useState } from "react";
import { optimizacionService } from "@/app/services/optimizacion.service";
import type {
  OptimizacionResponse,
  HistorialOptimizacion,
} from "@/app/types/optimizacion";

export function useOptimizacion() {
  const [resultado, setResultado] = useState<OptimizacionResponse | null>(null);
  const [historial, setHistorial] = useState<HistorialOptimizacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const up = await optimizacionService.status();
      setOnline(up);
    } catch {
      setOnline(false);
    }
  }, []);

  const ejecutar = useCallback(
    async (talla = "M", incluirDemanda = true) => {
      setLoading(true);
      setError(null);
      try {
        const data = await optimizacionService.optimizar(talla, incluirDemanda);
        setResultado(data);
        return data;
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Error al ejecutar la optimización";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cargarHistorial = useCallback(async (limit = 20) => {
    setLoadingHistorial(true);
    try {
      const data = await optimizacionService.historial(limit);
      setHistorial(data);
    } catch {
      setHistorial(null);
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  return {
    resultado,
    historial,
    loading,
    loadingHistorial,
    error,
    online,
    ejecutar,
    cargarHistorial,
    checkStatus,
  };
}
