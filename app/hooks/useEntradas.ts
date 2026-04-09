import { useCallback, useEffect, useState } from "react";
import { entradaService } from "@/app/services/entrada.service";
import type { EntradaResponse, EntradaRequest, EstadoMovimiento } from "@/app/types/entrada";
import type { PageData } from "@/app/types/pagination";

const PAGE_SIZE = 10;

export function useEntradas() {
  const [page, setPage] = useState(0);
  const [estadoFilter, setEstadoFilter] = useState<EstadoMovimiento | "">("");
  const [data, setData] = useState<PageData<EntradaResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async (currentPage = page, estado = estadoFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = estado
        ? await entradaService.listarPorEstado(estado as EstadoMovimiento, { page: currentPage, size: PAGE_SIZE })
        : await entradaService.listar({ page: currentPage, size: PAGE_SIZE });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar entradas.");
    } finally {
      setLoading(false);
    }
  }, [page, estadoFilter]);

  useEffect(() => { load(page, estadoFilter); }, [page, estadoFilter]); // eslint-disable-line

  const filtrarEstado = useCallback((estado: EstadoMovimiento | "") => {
    setEstadoFilter(estado);
    setPage(0);
  }, []);

  const crear = useCallback(async (body: EntradaRequest): Promise<EntradaResponse> => {
    setSaving(true);
    setError(null);
    try {
      const result = await entradaService.crear(body);
      setSuccessMsg("Solicitud de entrada registrada.");
      await load(0, "");
      setPage(0);
      setEstadoFilter("");
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear entrada.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [load]);

  const eliminar = useCallback(async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      await entradaService.eliminar(id);
      setSuccessMsg("Entrada eliminada.");
      await load(page, estadoFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar entrada.");
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
