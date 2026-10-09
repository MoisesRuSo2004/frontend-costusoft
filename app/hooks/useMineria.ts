import { useCallback, useEffect, useRef, useState } from "react";
import { mineriaService } from "@/app/services/mineria.service";
import { insumoService } from "@/app/services/insumo.service";
import { colegiosService } from "@/app/services/colegios.service";
import { uniformeService } from "@/app/services/uniforme.service";
import type { PronosticoRequest, PronosticoResponse } from "@/app/types/mineria";
import type { InsumoResponse } from "@/app/types/insumo";
import type { ColegioResponse } from "@/app/types/colegio";
import type { UniformeResponse } from "@/app/types/uniforme";

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

/** Calcula el pronóstico dinámico. Ignora respuestas viejas si se pide otro cálculo antes. */
export function usePronostico() {
  const [resultado, setResultado] = useState<PronosticoResponse | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ultimaSolicitud = useRef(0);

  const calcular = useCallback(async (solicitud: PronosticoRequest) => {
    const id = ++ultimaSolicitud.current;
    setCalculando(true);
    setError(null);
    try {
      const respuesta = await mineriaService.pronostico(solicitud);
      if (id === ultimaSolicitud.current) setResultado(respuesta);
    } catch (err) {
      if (id === ultimaSolicitud.current) setError(mensajeDeError(err, "No se pudo calcular el pronóstico."));
    } finally {
      if (id === ultimaSolicitud.current) setCalculando(false);
    }
  }, []);

  return { resultado, calculando, error, calcular };
}

/** Insumos y colegios para los selectores; los uniformes se cargan por colegio y se guardan. */
export function useCatalogoMineria() {
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [colegios, setColegios] = useState<ColegioResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const uniformesPorColegio = useRef(new Map<number, UniformeResponse[]>());

  useEffect(() => {
    let vigente = true;
    Promise.all([
      insumoService.listar({ page: 0, size: 500, sortBy: "nombre", sortDir: "asc" }),
      colegiosService.listar({ page: 0, size: 100, sortBy: "nombre", sortDir: "asc" }),
    ])
      .then(([paginaInsumos, paginaColegios]) => {
        if (!vigente) return;
        setInsumos(paginaInsumos.content.filter((i) => i.activo !== false));
        setColegios(paginaColegios.content);
      })
      .catch((err) => vigente && setError(mensajeDeError(err, "No se pudo cargar el catálogo.")))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, []);

  const uniformesDe = useCallback(async (colegioId: number): Promise<UniformeResponse[]> => {
    const guardados = uniformesPorColegio.current.get(colegioId);
    if (guardados) return guardados;
    const lista = await uniformeService.listarPorColegio(colegioId);
    uniformesPorColegio.current.set(colegioId, lista);
    return lista;
  }, []);

  return { insumos, colegios, cargando, error, uniformesDe };
}
