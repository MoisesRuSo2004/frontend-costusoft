"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { pedidoService } from "@/app/services/pedido.service";
import { colegiosService } from "@/app/services/colegios.service";
import { uniformeService } from "@/app/services/uniforme.service";
import type {
  PedidoResponse,
  PedidoRequest,
  CancelarPedidoRequest,
  EstadoPedido,
  PedidoFiltros,
  PedidoFormData,
  DetallePedidoForm,
  HistorialPedidoResponse,
} from "@/app/types/pedido";
import type { ColegioResponse } from "@/app/types/colegio";
import type { UniformeResponse } from "@/app/types/uniforme";
import type { PageData } from "@/app/types/pagination";

const PAGE_SIZE = 10;

interface PedidosState {
  pedidos: PedidoResponse[];
  page: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para el módulo Pedidos.
 *
 * Gestiona:
 * - Listado paginado con filtros por estado y colegio
 * - CRUD de pedidos (crear, actualizar, eliminar)
 * - Flujo completo de estados (calcular, confirmar, producción, entrega, cancelar)
 * - Detalle de pedido con historial de auditoría
 * - Formulario con selección de colegio y prendas
 */
export function usePedidos() {
  // ── State de listado ───────────────────────────────────────────────────

  const [state, setState] = useState<PedidosState>({
    pedidos: [],
    page: 0,
    totalPages: 0,
    totalElements: 0,
    loading: true,
    error: null,
  });

  const [filtros, setFiltros] = useState<PedidoFiltros>({});

  // ── State de detalle ─────────────────────────────────────────────────

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoResponse | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [historial, setHistorial] = useState<HistorialPedidoResponse[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // ── State de modal y formulario ────────────────────────────────────────

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<PedidoFormData>({
    colegioId: null,
    nuevoColegio: null,
    fechaEstimadaEntrega: "",
    observaciones: "",
    detalles: [],
  });

  // ── State de datos auxiliares ─────────────────────────────────────────

  const [colegios, setColegios] = useState<ColegioResponse[]>([]);
  const [loadingColegios, setLoadingColegios] = useState(false);

  const [uniformes, setUniformes] = useState<UniformeResponse[]>([]);
  const [loadingUniformes, setLoadingUniformes] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── Cargar pedidos ─────────────────────────────────────────────────────

  const loadPedidos = useCallback(async (page = 0, currentFiltros = filtros) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      let response: PageData<PedidoResponse>;

      if (currentFiltros.estado) {
        response = await pedidoService.listarPorEstado(currentFiltros.estado, { page, size: PAGE_SIZE });
      } else if (currentFiltros.colegioId) {
        response = await pedidoService.listarPorColegio(currentFiltros.colegioId, { page, size: PAGE_SIZE });
      } else {
        response = await pedidoService.listar({ page, size: PAGE_SIZE });
      }

      setState({
        pedidos: response.content,
        page: response.number,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        loading: false,
        error: null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible cargar los pedidos.";
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, [filtros]);

  useEffect(() => {
    loadPedidos(0);
  }, [loadPedidos]);

  // ── Cargar colegios ────────────────────────────────────────────────────

  const loadColegios = useCallback(async () => {
    setLoadingColegios(true);
    try {
      const response = await colegiosService.listar({ size: 1000 });
      setColegios(response.content);
    } catch (err) {
      console.error("Error cargando colegios:", err);
    } finally {
      setLoadingColegios(false);
    }
  }, []);

  useEffect(() => {
    void loadColegios();
  }, [loadColegios]);

  // ── Cargar uniformes por colegio ─────────────────────────────────────

  const loadUniformesPorColegio = useCallback(async (colegioId: number) => {
    setLoadingUniformes(true);
    try {
      const data = await uniformeService.listarPorColegio(colegioId);
      setUniformes(data);
    } catch (err) {
      console.error("Error cargando uniformes:", err);
      setUniformes([]);
    } finally {
      setLoadingUniformes(false);
    }
  }, []);

  // ── Cargar detalle de pedido ───────────────────────────────────────────

  const loadPedidoDetalle = useCallback(async (id: number) => {
    setLoadingDetalle(true);
    try {
      const data = await pedidoService.obtenerPorId(id);
      setPedidoSeleccionado(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar el pedido.";
      setState((s) => ({ ...s, error: msg }));
      return null;
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  // ── Cargar historial ─────────────────────────────────────────────────

  const loadHistorial = useCallback(async (id: number) => {
    setLoadingHistorial(true);
    try {
      const data = await pedidoService.obtenerHistorial(id);
      setHistorial(data);
    } catch (err) {
      console.error("Error cargando historial:", err);
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  // ── Gestión de filtros ───────────────────────────────────────────────

  const setFiltroEstado = useCallback((estado: EstadoPedido | undefined) => {
    setFiltros((f) => ({ ...f, estado }));
    setState((s) => ({ ...s, page: 0 }));
    void loadPedidos(0, { ...filtros, estado });
  }, [filtros, loadPedidos]);

  const setFiltroColegio = useCallback((colegioId: number | undefined) => {
    setFiltros((f) => ({ ...f, colegioId }));
    setState((s) => ({ ...s, page: 0 }));
    void loadPedidos(0, { ...filtros, colegioId });
  }, [filtros, loadPedidos]);

  const clearFiltros = useCallback(() => {
    setFiltros({});
    setState((s) => ({ ...s, page: 0 }));
    void loadPedidos(0, {});
  }, [loadPedidos]);

  // ── Gestión del formulario ────────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setModalMode("create");
    setForm({
      colegioId: null,
      nuevoColegio: null,
      fechaEstimadaEntrega: "",
      observaciones: "",
      detalles: [],
    });
    setUniformes([]);
    setSuccessMessage(null);
    setState((s) => ({ ...s, error: null }));
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback(async (pedido: PedidoResponse) => {
    setModalMode("edit");
    setSuccessMessage(null);
    setState((s) => ({ ...s, error: null }));

    // Cargar el detalle completo
    const detalle = await loadPedidoDetalle(pedido.id);
    if (detalle) {
      setForm({
        colegioId: detalle.colegio.id,
        nuevoColegio: null,
        fechaEstimadaEntrega: detalle.fechaEstimadaEntrega ?? "",
        observaciones: detalle.observaciones ?? "",
        detalles: detalle.detalles.map((d) => ({
          id: `det-${d.id}`,
          uniformeId: d.uniformeId,
          nombreUniforme: d.nombreUniforme,
          talla: d.talla,
          cantidad: d.cantidad,
        })),
      });

      // Cargar uniformes del colegio
      void loadUniformesPorColegio(detalle.colegio.id);
      setModalOpen(true);
    }
  }, [loadPedidoDetalle, loadUniformesPorColegio]);

  const openViewModal = useCallback(async (pedido: PedidoResponse) => {
    setModalMode("view");
    setSuccessMessage(null);
    const detalle = await loadPedidoDetalle(pedido.id);
    if (detalle) {
      void loadHistorial(pedido.id);
      setModalOpen(true);
    }
  }, [loadPedidoDetalle, loadHistorial]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setPedidoSeleccionado(null);
    setHistorial([]);
    setUniformes([]);
  }, []);

  const setFormField = useCallback(
    <K extends keyof PedidoFormData>(field: K, value: PedidoFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setState((s) => ({ ...s, error: null }));
    },
    []
  );

  const setColegio = useCallback(
    (colegioId: number | null) => {
      setForm((prev) => ({
        ...prev,
        colegioId,
        detalles: [], // Limpiar detalles al cambiar colegio
      }));
      if (colegioId) {
        void loadUniformesPorColegio(colegioId);
      } else {
        setUniformes([]);
      }
    },
    [loadUniformesPorColegio]
  );

  // ── Gestión de detalles (prendas) ────────────────────────────────────

  const addDetalle = useCallback((detalle: DetallePedidoForm) => {
    setForm((prev) => ({
      ...prev,
      detalles: [...prev.detalles, detalle],
    }));
  }, []);

  const removeDetalle = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((d) => d.id !== id),
    }));
  }, []);

  const updateDetalleCantidad = useCallback((id: string, cantidad: number) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((d) => (d.id === id ? { ...d, cantidad } : d)),
    }));
  }, []);

  // ── Guardar (crear/actualizar) ───────────────────────────────────────

  const save = useCallback(async (): Promise<boolean> => {
    // Validaciones
    if (!form.colegioId) {
      setState((s) => ({ ...s, error: "Debes seleccionar un colegio." }));
      return false;
    }
    if (form.detalles.length === 0) {
      setState((s) => ({ ...s, error: "El pedido debe tener al menos una prenda." }));
      return false;
    }

    setSubmitting(true);
    setState((s) => ({ ...s, error: null }));

    try {
      const request: PedidoRequest = {
        colegioId: form.colegioId,
        fechaEstimadaEntrega: form.fechaEstimadaEntrega || undefined,
        observaciones: form.observaciones || undefined,
        detalles: form.detalles.map((d) => ({
          uniformeId: d.uniformeId,
          cantidad: d.cantidad,
          talla: d.talla,
        })),
      };

      if (modalMode === "create") {
        await pedidoService.crear(request);
        setSuccessMessage("Pedido creado exitosamente.");
      } else if (pedidoSeleccionado) {
        await pedidoService.actualizar(pedidoSeleccionado.id, request);
        setSuccessMessage("Pedido actualizado exitosamente.");
      }

      await loadPedidos(state.page);
      closeModal();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible guardar el pedido.";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [form, modalMode, pedidoSeleccionado, state.page, loadPedidos, closeModal]);

  // ── Eliminar ─────────────────────────────────────────────────────────

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setSubmitting(true);
    try {
      await pedidoService.eliminar(id);
      setSuccessMessage("Pedido eliminado exitosamente.");
      await loadPedidos(state.page);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible eliminar el pedido.";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [state.page, loadPedidos]);

  // ── Flujo de estados ─────────────────────────────────────────────────

  const calcular = useCallback(async (id: number): Promise<boolean> => {
    setSubmitting(true);
    try {
      await pedidoService.calcular(id);
      setSuccessMessage("Disponibilidad calculada exitosamente.");
      await loadPedidos(state.page);
      if (pedidoSeleccionado?.id === id) {
        await loadPedidoDetalle(id);
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al calcular disponibilidad.";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [state.page, loadPedidos, loadPedidoDetalle, pedidoSeleccionado?.id]);

  const confirmar = useCallback(async (id: number): Promise<boolean> => {
    setSubmitting(true);
    try {
      await pedidoService.confirmar(id);
      setSuccessMessage("Pedido confirmado exitosamente.");
      await loadPedidos(state.page);
      if (pedidoSeleccionado?.id === id) {
        await loadPedidoDetalle(id);
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al confirmar el pedido.";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [state.page, loadPedidos, loadPedidoDetalle, pedidoSeleccionado?.id]);

  const iniciarProduccion = useCallback(async (id: number): Promise<boolean> => {
    setSubmitting(true);
    try {
      await pedidoService.iniciarProduccion(id);
      setSuccessMessage("Producción iniciada exitosamente.");
      await loadPedidos(state.page);
      if (pedidoSeleccionado?.id === id) {
        await loadPedidoDetalle(id);
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar producción.";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [state.page, loadPedidos, loadPedidoDetalle, pedidoSeleccionado?.id]);

  const marcarListo = useCallback(async (id: number): Promise<boolean> => {
    setSubmitting(true);
    try {
      await pedidoService.marcarListo(id);
      setSuccessMessage("Pedido marcado como listo para entrega.");
      await loadPedidos(state.page);
      if (pedidoSeleccionado?.id === id) {
        await loadPedidoDetalle(id);
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al marcar como listo.";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [state.page, loadPedidos, loadPedidoDetalle, pedidoSeleccionado?.id]);

  const entregar = useCallback(async (id: number): Promise<boolean> => {
    setSubmitting(true);
    try {
      await pedidoService.entregar(id);
      setSuccessMessage("Pedido entregado exitosamente.");
      await loadPedidos(state.page);
      if (pedidoSeleccionado?.id === id) {
        await loadPedidoDetalle(id);
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al registrar la entrega.";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [state.page, loadPedidos, loadPedidoDetalle, pedidoSeleccionado?.id]);

  const cancelar = useCallback(async (id: number, motivo: string): Promise<boolean> => {
    setSubmitting(true);
    try {
      await pedidoService.cancelar(id, { motivo });
      setSuccessMessage("Pedido cancelado exitosamente.");
      await loadPedidos(state.page);
      if (pedidoSeleccionado?.id === id) {
        await loadPedidoDetalle(id);
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cancelar el pedido.";
      setState((s) => ({ ...s, error: msg }));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [state.page, loadPedidos, loadPedidoDetalle, pedidoSeleccionado?.id]);

  // ── Paginación ─────────────────────────────────────────────────────────

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 0 && page < state.totalPages) {
        void loadPedidos(page);
      }
    },
    [state.totalPages, loadPedidos]
  );

  const nextPage = useCallback(() => goToPage(state.page + 1), [goToPage, state.page]);
  const prevPage = useCallback(() => goToPage(state.page - 1), [goToPage, state.page]);

  // ── Clear messages ───────────────────────────────────────────────────

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setState((s) => ({ ...s, error: null }));
  }, []);

  // ── Datos computados ─────────────────────────────────────────────────

  const pedidosPorEstado = useMemo(() => {
    const grouped = new Map<string, PedidoResponse[]>();
    state.pedidos.forEach((p) => {
      const existentes = grouped.get(p.estado) || [];
      grouped.set(p.estado, [...existentes, p]);
    });
    return grouped;
  }, [state.pedidos]);

  const totalPrendas = useMemo(() => {
    return form.detalles.reduce((sum, d) => sum + d.cantidad, 0);
  }, [form.detalles]);

  // ── Return ─────────────────────────────────────────────────────────────

  return {
    // Datos
    pedidos: state.pedidos,
    pedidoSeleccionado,
    historial,
    colegios,
    uniformes,
    pedidosPorEstado,

    // Formulario
    form,
    totalPrendas,

    // Filtros
    filtros,

    // Estados
    loading: state.loading,
    loadingDetalle,
    loadingHistorial,
    loadingColegios,
    loadingUniformes,
    submitting,
    error: state.error,
    successMessage,

    // UI
    modalOpen,
    modalMode,

    // Paginación
    page: state.page,
    totalPages: state.totalPages,
    totalElements: state.totalElements,

    // Acciones
    loadPedidos,
    loadPedidoDetalle,
    setFiltroEstado,
    setFiltroColegio,
    clearFiltros,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    setFormField,
    setColegio,
    addDetalle,
    removeDetalle,
    updateDetalleCantidad,
    save,
    remove,
    calcular,
    confirmar,
    iniciarProduccion,
    marcarListo,
    entregar,
    cancelar,
    goToPage,
    nextPage,
    prevPage,
    clearMessages,
  };
}
