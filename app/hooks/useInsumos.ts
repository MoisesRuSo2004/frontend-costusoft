import { useCallback, useEffect, useState } from "react";
import { insumoService } from "@/app/services/insumo.service";
import type { InsumoResponse, InsumoRequest, InsumoStockRequest } from "@/app/types/insumo";
import type { PageData } from "@/app/types/pagination";

const PAGE_SIZE = 10;

export function useInsumos() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<PageData<InsumoResponse> | null>(null);
  const [stockBajo, setStockBajo] = useState<InsumoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async (currentPage = page, query = search) => {
    setLoading(true);
    setError(null);
    try {
      let result: PageData<InsumoResponse>;
      if (query.trim()) {
        // Búsqueda server-side — el backend retorna lista, la envolvemos en PageData
        const items = await insumoService.buscar(query.trim());
        result = {
          content: items as InsumoResponse[],
          totalElements: items.length,
          totalPages: 1,
          number: 0,
          size: items.length,
          first: true,
          last: true,
        };
      } else {
        result = await insumoService.listar({ page: currentPage, size: PAGE_SIZE });
      }
      setData(result);

      // Alertas de stock
      const bajos = await insumoService.stockBajo();
      setStockBajo(bajos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar insumos.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(page, search); }, [page]); // eslint-disable-line

  // Ejecuta búsqueda reseteando a página 0
  const buscar = useCallback((q: string) => {
    setSearch(q);
    setPage(0);
    load(0, q);
  }, [load]);

  const crear = useCallback(async (body: InsumoRequest) => {
    setSaving(true);
    setError(null);
    try {
      await insumoService.crear(body);
      setSuccessMsg("Insumo creado correctamente.");
      await load(0, "");
      setSearch("");
      setPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear insumo.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [load]);

  const actualizar = useCallback(async (id: number, body: InsumoRequest) => {
    setSaving(true);
    setError(null);
    try {
      await insumoService.actualizar(id, body);
      setSuccessMsg("Insumo actualizado correctamente.");
      await load(page, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar insumo.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [load, page, search]);

  const ajustarStock = useCallback(async (id: number, body: InsumoStockRequest) => {
    setSaving(true);
    setError(null);
    try {
      await insumoService.ajustarStock(id, body);
      setSuccessMsg("Stock ajustado correctamente.");
      await load(page, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ajustar stock.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [load, page, search]);

  const eliminar = useCallback(async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      await insumoService.eliminar(id);
      setSuccessMsg("Insumo eliminado correctamente.");
      await load(page, search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar insumo.");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [load, page, search]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMsg(null);
  }, []);

  return {
    data,
    stockBajo,
    loading,
    saving,
    error,
    successMsg,
    page,
    setPage,
    search,
    buscar,
    reload: () => load(page, search),
    crear,
    actualizar,
    ajustarStock,
    eliminar,
    clearMessages,
  };
}
