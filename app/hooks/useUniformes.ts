"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { uniformeService } from "@/app/services/uniforme.service";
import { colegiosService } from "@/app/services/colegios.service";
import { insumoService } from "@/app/services/insumo.service";
import type { UniformeResponse, InsumoPorTalla, UniformeFormData } from "@/app/types/uniforme";
import type { ColegioResponse } from "@/app/types/colegio";
import type { InsumoResponse } from "@/app/types/insumo";

/**
 * Hook para el módulo Uniformes.
 *
 * Gestiona:
 * - Listado de uniformes por colegio
 * - CRUD de uniformes con insumos por talla
 * - Gestión de insumos agrupados por talla en el formulario
 */
export function useUniformes() {
  // ── State ────────────────────────────────────────────────────────────

  const [uniformes, setUniformes] = useState<UniformeResponse[]>([]);
  const [colegios, setColegios] = useState<ColegioResponse[]>([]);
  const [insumos, setInsumos] = useState<InsumoResponse[]>([]);
  const [colegioSeleccionado, setColegioSeleccionado] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingColegios, setLoadingColegios] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Formulario de uniforme
  const [form, setForm] = useState<UniformeFormData>({
    prenda: "",
    tipo: "Diario",
    genero: "",
    colegioId: null,
    insumosPorTalla: [],
  });

  // ── Cargar colegios ─────────────────────────────────────────────────

  const loadColegios = useCallback(async () => {
    setLoadingColegios(true);
    try {
      const response = await colegiosService.listar({ size: 1000 });
      setColegios(response.content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible cargar los colegios.";
      setError(msg);
    } finally {
      setLoadingColegios(false);
    }
  }, []);

  useEffect(() => {
    void loadColegios();
  }, [loadColegios]);

  // ── Cargar insumos ───────────────────────────────────────────────────

  const loadInsumos = useCallback(async () => {
    try {
      const response = await insumoService.listar({ size: 1000 });
      setInsumos(response.content);
    } catch (err) {
      console.error("Error cargando insumos:", err);
    }
  }, []);

  useEffect(() => {
    void loadInsumos();
  }, [loadInsumos]);

  // ── Cargar uniformes por colegio ────────────────────────────────────

  const loadUniformes = useCallback(async (colegioId: number) => {
    setLoading(true);
    setError(null);

    try {
      const data = await uniformeService.listarPorColegio(colegioId);
      setUniformes(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible cargar los uniformes.";
      setError(msg);
      setUniformes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const seleccionarColegio = useCallback(
    (colegioId: number | null) => {
      setColegioSeleccionado(colegioId);
      setUniformes([]);
      if (colegioId) {
        void loadUniformes(colegioId);
      } else {
        setLoading(false);
      }
    },
    [loadUniformes]
  );

  // ── Gestión del formulario ──────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setForm({
      prenda: "",
      tipo: "Diario",
      genero: "",
      colegioId: colegioSeleccionado,
      insumosPorTalla: [],
    });
    setError(null);
    setSuccessMessage(null);
    setModalOpen(true);
  }, [colegioSeleccionado]);

  const openEditModal = useCallback((uniforme: UniformeResponse) => {
    setEditingId(uniforme.id);
    setForm({
      prenda: uniforme.prenda,
      tipo: uniforme.tipo || "Diario",
      genero: uniforme.genero || "",
      colegioId: uniforme.colegioId,
      insumosPorTalla: uniforme.insumosRequeridos.map((i) => ({
        id: `existing-${i.id}`,
        insumoId: i.insumoId,
        nombreInsumo: i.nombreInsumo,
        cantidadBase: i.cantidadBase,
        unidadMedida: i.unidadMedida,
        talla: i.talla,
      })),
    });
    setError(null);
    setSuccessMessage(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setError(null);
  }, []);

  const setFormField = useCallback(
    <K extends keyof UniformeFormData>(field: K, value: UniformeFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setError(null);
    },
    []
  );

  // ── Gestión de insumos por talla ────────────────────────────────────

  const addInsumoPorTalla = useCallback(
    (insumoId: number, nombreInsumo: string, unidadMedida: string, talla: string, cantidadBase: number) => {
      const newInsumo: InsumoPorTalla = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        insumoId,
        nombreInsumo,
        cantidadBase,
        unidadMedida,
        talla,
      };
      setForm((prev) => ({
        ...prev,
        insumosPorTalla: [...prev.insumosPorTalla, newInsumo],
      }));
    },
    []
  );

  const removeInsumoPorTalla = useCallback((id: string) => {
    setForm((prev) => ({
      ...prev,
      insumosPorTalla: prev.insumosPorTalla.filter((i) => i.id !== id),
    }));
  }, []);

  const updateInsumoCantidad = useCallback((id: string, cantidadBase: number) => {
    setForm((prev) => ({
      ...prev,
      insumosPorTalla: prev.insumosPorTalla.map((i) =>
        i.id === id ? { ...i, cantidadBase } : i
      ),
    }));
  }, []);

  // ── Guardar (crear/actualizar) ───────────────────────────────────────

  const save = useCallback(async (): Promise<boolean> => {
    // Validaciones
    if (!form.tipo) {
      setError("El tipo de uniforme es obligatorio.");
      return false;
    }
    if (!form.genero) {
      setError("El género es obligatorio.");
      return false;
    }
    if (!form.prenda.trim()) {
      setError("El nombre de la prenda es obligatorio.");
      return false;
    }
    if (!form.colegioId) {
      setError("Debes seleccionar un colegio.");
      return false;
    }
    if (form.insumosPorTalla.length === 0) {
      setError("Debes agregar al menos un insumo con su talla.");
      return false;
    }

    setSubmitting(true);
    setError(null);

    try {
      const request = {
        prenda: form.prenda.trim(),
        tipo: form.tipo || undefined,
        genero: form.genero || undefined,
        colegioId: form.colegioId,
        insumosRequeridos: form.insumosPorTalla.map((i) => ({
          insumoId: i.insumoId,
          cantidadBase: i.cantidadBase,
          unidadMedida: i.unidadMedida,
          talla: i.talla,
        })),
      };

      if (editingId) {
        await uniformeService.actualizar(editingId, request);
        if (form.colegioId) await loadUniformes(form.colegioId);
        setSuccessMessage("Uniforme actualizado exitosamente.");
        closeModal();
      } else {
        await uniformeService.crear(request);
        if (form.colegioId) await loadUniformes(form.colegioId);
        // No cerrar el modal: resetear form para seguir creando en el mismo colegio
        const colegioActual = form.colegioId;
        const tipoActual = form.tipo;
        setForm({
          prenda: "",
          tipo: tipoActual,
          genero: "",
          colegioId: colegioActual,
          insumosPorTalla: [],
        });
        setSuccessMessage("✓ Uniforme creado. Puedes seguir agregando más.");
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible guardar el uniforme.";
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [form, editingId, loadUniformes, closeModal]);

  // ── Eliminar ─────────────────────────────────────────────────────────

  const remove = useCallback(async (id: number): Promise<boolean> => {
    setSubmitting(true);
    setError(null);

    try {
      await uniformeService.eliminar(id);
      setSuccessMessage("Uniforme eliminado exitosamente.");

      // Recargar
      if (colegioSeleccionado) {
        await loadUniformes(colegioSeleccionado);
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible eliminar el uniforme.";
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [colegioSeleccionado, loadUniformes]);

  // ── Clear messages ───────────────────────────────────────────────────

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // ── Datos computados ──────────────────────────────────────────────────

  const tallasUnicas = useMemo(() => {
    const tallas = new Set<string>();
    form.insumosPorTalla.forEach((i) => tallas.add(i.talla));
    return Array.from(tallas).sort();
  }, [form.insumosPorTalla]);

  const insumosPorTallaAgrupados = useMemo(() => {
    const grupos = new Map<string, InsumoPorTalla[]>();
    form.insumosPorTalla.forEach((insumo) => {
      const existentes = grupos.get(insumo.talla) || [];
      grupos.set(insumo.talla, [...existentes, insumo]);
    });
    return grupos;
  }, [form.insumosPorTalla]);

  // ── Return ────────────────────────────────────────────────────────────

  return {
    // Datos
    uniformes,
    colegios,
    insumos,
    colegioSeleccionado,

    // Formulario
    form,
    editingId,
    tallasUnicas,
    insumosPorTallaAgrupados,

    // Estados
    loading,
    loadingColegios,
    submitting,
    modalOpen,
    error,
    successMessage,

    // Acciones
    seleccionarColegio,
    openCreateModal,
    openEditModal,
    closeModal,
    setFormField,
    addInsumoPorTalla,
    removeInsumoPorTalla,
    updateInsumoCantidad,
    save,
    remove,
    clearMessages,
    reload: () => colegioSeleccionado && loadUniformes(colegioSeleccionado),
  };
}
