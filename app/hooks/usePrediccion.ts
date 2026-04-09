import { useState, useEffect, useCallback } from "react";
import { prediccionService } from "@/app/services/prediccion.service";
import type {
  MasivaResponse,
  PrediccionResponse,
  EntrenamientoResponse,
} from "@/app/types/prediccion";

export function usePrediccionMasiva() {
  const [data, setData] = useState<MasivaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicioActivo, setServicioActivo] = useState<boolean | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const up = await prediccionService.status();
      setServicioActivo(up);
      return up;
    } catch {
      setServicioActivo(false);
      return false;
    }
  }, []);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // El status puede fallar si el servicio no está levantado; seguimos igual
      await checkStatus().catch(() => null);
      const resultado = await prediccionService.predecirTodos();
      setData(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar predicciones");
    } finally {
      setLoading(false);
    }
  }, [checkStatus]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { data, loading, error, servicioActivo, recargar: cargar };
}

export function usePrediccionIndividual() {
  const [prediccion, setPrediccion] = useState<PrediccionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predecir = useCallback(async (insumoId: number) => {
    setLoading(true);
    setError(null);
    setPrediccion(null);
    try {
      const res = await prediccionService.predecir(insumoId);
      setPrediccion(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener predicción");
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiar = () => {
    setPrediccion(null);
    setError(null);
  };

  return { prediccion, loading, error, predecir, limpiar };
}

export function useEntrenamiento() {
  const [resultado, setResultado] = useState<EntrenamientoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entrenar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await prediccionService.entrenar();
      setResultado(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error durante el entrenamiento");
    } finally {
      setLoading(false);
    }
  };

  return { resultado, loading, error, entrenar };
}
