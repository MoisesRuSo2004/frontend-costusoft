"use client";

import { useCallback, useEffect, useState } from "react";
import { pedidoService } from "@/app/services/pedido.service";
import type { PedidoResponse, EstadoPedido, HistorialPedidoResponse } from "@/app/types/pedido";
import type { PageData } from "@/app/types/pagination";

export type BodegaTab = "CONFIRMADO" | "EN_PRODUCCION" | "LISTO_PARA_ENTREGA";

const PAGE_SIZE = 10;

interface TabState {
  pedidos: PedidoResponse[];
  page: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
}

const EMPTY_TAB: TabState = {
  pedidos: [],
  page: 0,
  totalPages: 0,
  totalElements: 0,
  loading: false,
};

export function useBodegaPedidos() {
  const [activeTab, setActiveTab] = useState<BodegaTab>("CONFIRMADO");
  const [tabData, setTabData] = useState<Record<BodegaTab, TabState>>({
    CONFIRMADO:          { ...EMPTY_TAB, loading: true },
    EN_PRODUCCION:       { ...EMPTY_TAB },
    LISTO_PARA_ENTREGA:  { ...EMPTY_TAB },
  });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);

  // ── Panel de detalle ────────────────────────────────────────────────────
  const [panelOpen, setPanelOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoResponse | null>(null);
  const [historial, setHistorial] = useState<HistorialPedidoResponse[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // ── Cargar tab ──────────────────────────────────────────────────────────
  const loadTab = useCallback(async (tab: BodegaTab, page = 0) => {
    setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], loading: true } }));
    setError(null);
    try {
      const response: PageData<PedidoResponse> = await pedidoService.listar({
        page,
        size: PAGE_SIZE,
        estado: tab as EstadoPedido,
      });
      setTabData(prev => ({
        ...prev,
        [tab]: {
          pedidos:       response.content,
          page:          response.number,
          totalPages:    response.totalPages,
          totalElements: response.totalElements,
          loading:       false,
        },
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar pedidos.";
      setError(msg);
      setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], loading: false } }));
    }
  }, []);

  // Carga inicial del tab activo
  useEffect(() => {
    void loadTab(activeTab, 0);
  }, [activeTab, loadTab]);

  const switchTab = useCallback((tab: BodegaTab) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
  }, []);

  const goToPage = useCallback((page: number) => {
    void loadTab(activeTab, page);
  }, [activeTab, loadTab]);

  // ── Detalle y historial ─────────────────────────────────────────────────
  const openPanel = useCallback(async (pedido: PedidoResponse) => {
    setPanelOpen(true);
    setLoadingDetalle(true);
    setHistorial([]);
    try {
      const detalle = await pedidoService.obtenerPorId(pedido.id);
      setPedidoSeleccionado(detalle);
      // cargar historial en paralelo
      setLoadingHistorial(true);
      pedidoService.obtenerHistorial(pedido.id)
        .then(h => setHistorial(h))
        .catch(() => setHistorial([]))
        .finally(() => setLoadingHistorial(false));
    } catch {
      setPanelOpen(false);
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setPedidoSeleccionado(null);
    setHistorial([]);
  }, []);

  // ── Acciones de estado ──────────────────────────────────────────────────
  const runAction = useCallback(async (
    id: number,
    key: string,
    action: () => Promise<PedidoResponse>,
    successText: string,
    fromTab: BodegaTab,
  ) => {
    setActionKey(key);
    setError(null);
    try {
      await action();
      setSuccessMsg(successText);
      // Refrescar el tab actual y el tab destino si difiere
      await loadTab(fromTab, tabData[fromTab].page);
      // También refrescar el panel si estaba abierto
      if (panelOpen && pedidoSeleccionado?.id === id) {
        const updated = await pedidoService.obtenerPorId(id);
        setPedidoSeleccionado(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la operación.");
    } finally {
      setActionKey(null);
    }
  }, [tabData, loadTab, panelOpen, pedidoSeleccionado]);

  const iniciarProduccion = useCallback((pedido: PedidoResponse) =>
    runAction(
      pedido.id, `iniciar-${pedido.id}`,
      () => pedidoService.iniciarProduccion(pedido.id),
      `Producción iniciada para ${pedido.numeroPedido}`,
      "CONFIRMADO",
    ), [runAction]);

  const marcarListo = useCallback((pedido: PedidoResponse) =>
    runAction(
      pedido.id, `listo-${pedido.id}`,
      () => pedidoService.marcarListo(pedido.id),
      `${pedido.numeroPedido} marcado como listo para entrega`,
      "EN_PRODUCCION",
    ), [runAction]);

  const entregar = useCallback((pedido: PedidoResponse) =>
    runAction(
      pedido.id, `entregar-${pedido.id}`,
      () => pedidoService.entregar(pedido.id),
      `${pedido.numeroPedido} entregado correctamente`,
      "LISTO_PARA_ENTREGA",
    ), [runAction]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMsg(null);
  }, []);

  const recargar = useCallback(() => loadTab(activeTab, tabData[activeTab].page), [activeTab, loadTab, tabData]);

  const current = tabData[activeTab];

  return {
    activeTab,
    switchTab,
    pedidos:       current.pedidos,
    page:          current.page,
    totalPages:    current.totalPages,
    totalElements: current.totalElements,
    loading:       current.loading,
    error,
    successMsg,
    actionKey,
    panelOpen,
    pedidoSeleccionado,
    historial,
    loadingDetalle,
    loadingHistorial,
    openPanel,
    closePanel,
    goToPage,
    recargar,
    iniciarProduccion,
    marcarListo,
    entregar,
    clearMessages,
    // Counts para tabs
    confirmadosTotal:    tabData.CONFIRMADO.totalElements,
    enProduccionTotal:   tabData.EN_PRODUCCION.totalElements,
    listosTotal:         tabData.LISTO_PARA_ENTREGA.totalElements,
  };
}
