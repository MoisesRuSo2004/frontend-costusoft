"use client";

import { useCallback, useEffect, useState } from "react";
import { entradaService } from "@/app/services/entrada.service";
import { salidaService } from "@/app/services/salida.service";
import type { EntradaResponse } from "@/app/types/entrada";
import type { SalidaResponse } from "@/app/types/salida";
import type { PageData } from "@/app/types/pagination";

export type ColaTab = "entradas" | "salidas";

type ColaItem = EntradaResponse | SalidaResponse;

const PAGE_SIZE = 10;

interface TabState {
  items: ColaItem[];
  page: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
}

const EMPTY_TAB: TabState = {
  items: [],
  page: 0,
  totalPages: 0,
  totalElements: 0,
  loading: false,
};

export function useBodegaCola(initialTab: ColaTab = "entradas") {
  const [activeTab, setActiveTab] = useState<ColaTab>(initialTab);
  const [tabData, setTabData] = useState<Record<ColaTab, TabState>>({
    entradas: { ...EMPTY_TAB, loading: true },
    salidas:  { ...EMPTY_TAB },
  });
  const [error, setError]         = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);

  // Panel de detalle
  const [panelOpen, setPanelOpen]             = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<ColaItem | null>(null);
  const [loadingDetalle, setLoadingDetalle]   = useState(false);

  // Modal de rechazo
  const [rechazandoItem, setRechazandoItem] = useState<ColaItem | null>(null);

  // ── Cargar tab ──────────────────────────────────────────────────────────────
  const loadTab = useCallback(async (tab: ColaTab, page = 0) => {
    setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], loading: true } }));
    setError(null);
    try {
      let response: PageData<ColaItem>;
      if (tab === "entradas") {
        response = await entradaService.listarPorEstado("PENDIENTE", { page, size: PAGE_SIZE }) as PageData<ColaItem>;
      } else {
        response = await salidaService.listarPorEstado("PENDIENTE", { page, size: PAGE_SIZE }) as PageData<ColaItem>;
      }
      setTabData(prev => ({
        ...prev,
        [tab]: {
          items:         response.content,
          page:          response.number,
          totalPages:    response.totalPages,
          totalElements: response.totalElements,
          loading:       false,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos.");
      setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], loading: false } }));
    }
  }, []);

  useEffect(() => {
    void loadTab(activeTab, 0);
  }, [activeTab, loadTab]);

  const switchTab = useCallback((tab: ColaTab) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
  }, []);

  const goToPage = useCallback((page: number) => {
    void loadTab(activeTab, page);
  }, [activeTab, loadTab]);

  // ── Panel ────────────────────────────────────────────────────────────────────
  const openPanel = useCallback(async (item: ColaItem, tab: ColaTab) => {
    setPanelOpen(true);
    setLoadingDetalle(true);
    try {
      const detalle = tab === "entradas"
        ? await entradaService.obtenerPorId(item.id)
        : await salidaService.obtenerPorId(item.id);
      setItemSeleccionado(detalle as ColaItem);
    } catch {
      setPanelOpen(false);
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setItemSeleccionado(null);
  }, []);

  // ── Acciones ─────────────────────────────────────────────────────────────────
  const runAction = useCallback(async (
    id: number,
    key: string,
    action: () => Promise<ColaItem>,
    successText: string,
    tab: ColaTab,
  ) => {
    setActionKey(key);
    setError(null);
    try {
      await action();
      setSuccessMsg(successText);
      await loadTab(tab, tabData[tab].page);
      if (panelOpen && itemSeleccionado?.id === id) closePanel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la operación.");
    } finally {
      setActionKey(null);
    }
  }, [tabData, loadTab, panelOpen, itemSeleccionado, closePanel]);

  const confirmar = useCallback((item: ColaItem, tab: ColaTab) =>
    runAction(
      item.id,
      `confirmar-${item.id}`,
      () => tab === "entradas"
        ? entradaService.confirmar(item.id) as Promise<ColaItem>
        : salidaService.confirmar(item.id) as Promise<ColaItem>,
      tab === "entradas" ? `Entrada #${item.id} confirmada` : `Salida #${item.id} confirmada`,
      tab,
    ), [runAction]);

  const rechazar = useCallback((item: ColaItem, motivo: string, tab: ColaTab) =>
    runAction(
      item.id,
      `rechazar-${item.id}`,
      () => tab === "entradas"
        ? entradaService.rechazar(item.id, { motivo }) as Promise<ColaItem>
        : salidaService.rechazar(item.id, { motivo }) as Promise<ColaItem>,
      tab === "entradas" ? `Entrada #${item.id} rechazada` : `Salida #${item.id} rechazada`,
      tab,
    ), [runAction]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMsg(null);
  }, []);

  const recargar = useCallback(() =>
    loadTab(activeTab, tabData[activeTab].page),
  [activeTab, loadTab, tabData]);

  const current = tabData[activeTab];

  return {
    activeTab,
    switchTab,
    items:         current.items,
    page:          current.page,
    totalPages:    current.totalPages,
    totalElements: current.totalElements,
    loading:       current.loading,
    error,
    successMsg,
    actionKey,
    panelOpen,
    itemSeleccionado,
    loadingDetalle,
    rechazandoItem,
    setRechazandoItem,
    openPanel,
    closePanel,
    goToPage,
    recargar,
    confirmar,
    rechazar,
    clearMessages,
    entradasTotal: tabData.entradas.totalElements,
    salidasTotal:  tabData.salidas.totalElements,
  };
}
