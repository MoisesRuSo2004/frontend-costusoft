import { useCallback, useEffect, useState } from "react";
import { salidaService } from "@/app/services/salida.service";
import type { SalidaResponse, SalidaRequest } from "@/app/types/salida";
import type { EstadoMovimiento } from "@/app/types/entrada";
import type { PageData } from "@/app/types/pagination";

const PAGE_SIZE = 10;

export function useSalidas() {
  const [page, setPage] = useState(0);
  const [estadoFilter, setEstadoFilter] = useState<EstadoMovimiento | "">("");
  const [data, setData] = useState<PageData<SalidaResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async (currentPage = page, estado = estadoFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = estado
        ? await salidaService.listarPorEstado(estado as EstadoMovimiento, { page: currentPage, size: PAGE_SIZE })
        : await salidaService.listar({ page: currentPage, size: PAGE_SIZE });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar salidas.");
    } finally {
      setLoading(false);
    }
  }, [page, estadoFilter]);

  useEffect(() => { load(page, estadoFilter); }, [page, estadoFilter]); // eslint-disable-line

  const filtrarEstado = useCallback((estado: EstadoMovimiento | "") => {
    setEstadoFilter(estado);
    setPage(0);
  }, []);

  const crear = useCallback(async (body: SalidaRequest): Promise<SalidaResponse> => {
    setSaving(true);
    setError(null);
    try {
      const result = await salidaService.crear(body);
      setSuccessMsg("Solicitud de salida registrada.");
      await load(0, "");
      setPage(0);
      setEstadoFilter("");
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear salida.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [load]);

  const eliminar = useCallback(async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      await salidaService.eliminar(id);
      setSuccessMsg("Salida eliminada.");
      await load(page, estadoFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar salida.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [load, page, estadoFilter]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMsg(null);
  }, []);

  return {
    data,
    loading,
    saving,
    error,
    successMsg,
    page,
    setPage,
    estadoFilter,
    filtrarEstado,
    reload: () => load(page, estadoFilter),
    crear,
    eliminar,
    clearMessages,
  };
}
