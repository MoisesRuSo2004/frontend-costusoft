import { useCallback, useEffect, useRef, useState } from "react";
import { mineriaService } from "@/app/services/mineria.service";
import { insumoService } from "@/app/services/insumo.service";
import type { AnomaliasRequest, AnomaliasResponse } from "@/app/types/mineria";
import type { InsumoResponse } from "@/app/types/insumo";

/** Mensaje legible de un error de apiFetch (incluye los errores de validación por campo). */
function mensajeDeError(err: unknown, porDefecto: string): string {
  if (!(err instanceof Error)) return porDefecto;
  const campos = (err as Error & { body?: { data?: unknown } }).body?.data;
  if (campos && typeof campos === "object" && !Array.isArray(campos)) {
    const detalle = Object.values(campos as Record<string, unknown>).filter((v) => typeof v === "string");
    if (detalle.length) return detalle.join(" · ");
  }
  return err.message || porDefecto;
}

/** Detección de anomalías. Ignora respuestas viejas si se pide otro análisis antes. */
export function useAnomalias() {
  const [resultado, setResultado] = useState<AnomaliasResponse | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ultimaSolicitud = useRef(0);

  const analizar = useCallback(async (solicitud: AnomaliasRequest) => {
    const id = ++ultimaSolicitud.current;
    setAnalizando(true);
    setError(null);
    try {
      const respuesta = await mineriaService.anomalias(solicitud);
      if (id === ultimaSolicitud.current) setResultado(respuesta);
    } catch (err) {
      if (id === ultimaSolicitud.current) setError(mensajeDeError(err, "No se pudo analizar los movimientos."));
    } finally {
      if (id === ultimaSolicitud.current) setAnalizando(false);
    }
  }, []);

  return { resultado, analizando, error, analizar };
}

/** Insumos activos para el filtro de los análisis. */
export function useCatalogoMineria() {
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    insumoService.listar({ page: 0, size: 500, sortBy: "nombre", sortDir: "asc" })
      .then((pagina) => vigente && setInsumos(pagina.content.filter((i) => i.activo !== false)))
      .catch((err) => vigente && setError(mensajeDeError(err, "No se pudo cargar el catálogo.")))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, []);

  return { insumos, cargando, error };
}
