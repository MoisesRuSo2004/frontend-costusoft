"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { calculadoraService } from "@/app/services/calculadora.service";
import { colegiosService } from "@/app/services/colegios.service";
import { uniformeService } from "@/app/services/uniforme.service";
import type {
  ColegioOption,
  CalculadoraVerificarRequest,
  CalculadoraVerificarResponse,
  UniformeOption,
} from "@/app/types/calculadora";
import type { ColegioResponse, UniformeResumen } from "@/app/types/colegio";

interface CalculadoraFormState {
  colegioId: number | null;
  uniformeId: number | null;
  cantidad: number;
  talla: string;
}

const INITIAL_FORM: CalculadoraFormState = {
  colegioId: null,
  uniformeId: null,
  cantidad: 1,
  talla: "",
};

/**
 * Hook para el módulo Calculadora de Disponibilidad.
 *
 * Permite verificar si hay stock suficiente para fabricar unidades de
 * uniformes en tallas específicas. La talla es OBLIGATORIA porque los
 * insumos varían por talla (UniformeInsumo).
 */
export function useCalculadora() {
  // ── State ─────────────────────────────────────────────────────────────

  const [colegios, setColegios] = useState<ColegioOption[]>([]);
  const [uniformes, setUniformes] = useState<UniformeOption[]>([]);
  const [tallasDisponibles, setTallasDisponibles] = useState<string[]>([]);
  const [form, setForm] = useState<CalculadoraFormState>(INITIAL_FORM);
  const [resultado, setResultado] = useState<CalculadoraVerificarResponse | null>(null);

  const [loadingColegios, setLoadingColegios] = useState(true);
  const [loadingUniformes, setLoadingUniformes] = useState(false);
  const [loadingTallas, setLoadingTallas] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── Cargar colegios ─────────────────────────────────────────────────

  const loadColegios = useCallback(async () => {
    setLoadingColegios(true);
    setError(null);

    try {
      const response = await colegiosService.listar({ size: 1000 });
      const options: ColegioOption[] = response.content.map((c: ColegioResponse) => ({
        id: String(c.id),
        nombre: c.nombre,
      }));
      setColegios(options);
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

  // ── Cargar uniformes cuando cambia el colegio ────────────────────────

  const loadUniformes = useCallback(async (colegioId: number) => {
    setLoadingUniformes(true);
    setError(null);

    try {
      const colegio = await colegiosService.obtenerPorId(colegioId);
      const options: UniformeOption[] = colegio.uniformes.map((u: UniformeResumen) => ({
        id: u.id,
        prenda: u.prenda,
        talla: u.talla,
        genero: u.genero,
      }));
      setUniformes(options);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible cargar los uniformes.";
      setError(msg);
      setUniformes([]);
    } finally {
      setLoadingUniformes(false);
    }
  }, []);

  // ── Cargar tallas cuando se selecciona un uniforme ───────────────────

  const loadTallas = useCallback(async (uniformeId: number) => {
    setLoadingTallas(true);
    setError(null);

    try {
      const tallas = await uniformeService.listarTallas(uniformeId);
      setTallasDisponibles(tallas);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible cargar las tallas.";
      setError(msg);
      setTallasDisponibles([]);
    } finally {
      setLoadingTallas(false);
    }
  }, []);

  // ── Handlers de formulario ──────────────────────────────────────────

  const setColegio = useCallback((colegioIdStr: string) => {
    const colegioId = colegioIdStr ? Number(colegioIdStr) : null;

    setForm((prev) => ({
      ...prev,
      colegioId,
      uniformeId: null,
      talla: "",
    }));
    setResultado(null);
    setError(null);
    setSuccessMessage(null);
    setUniformes([]);
    setTallasDisponibles([]);
    setLoadingTallas(false);

    if (colegioId) {
      void loadUniformes(colegioId);
    }
  }, [loadUniformes]);

  const setUniforme = useCallback((uniformeIdStr: string) => {
    const uniformeId = uniformeIdStr ? Number(uniformeIdStr) : null;

    setForm((prev) => ({
      ...prev,
      uniformeId,
      talla: "",
    }));
    setResultado(null);
    setError(null);
    setTallasDisponibles([]);

    if (uniformeId) {
      void loadTallas(uniformeId);
    }
  }, [loadTallas]);

  const setTalla = useCallback((talla: string) => {
    setForm((prev) => ({ ...prev, talla }));
    setResultado(null);
    setError(null);
  }, []);

  const setCantidad = useCallback((cantidad: number) => {
    setForm((prev) => ({ ...prev, cantidad: Math.max(1, cantidad) }));
    setResultado(null);
    setError(null);
  }, []);

  // ── Verificar disponibilidad ─────────────────────────────────────────

  const verify = useCallback(async () => {
    // Validaciones
    if (!form.colegioId) {
      setError("Selecciona un colegio.");
      return;
    }
    if (!form.uniformeId) {
      setError("Selecciona un uniforme.");
      return;
    }
    if (!form.talla) {
      setError("Selecciona una talla.");
      return;
    }
    if (!form.cantidad || form.cantidad < 1) {
      setError("La cantidad debe ser al menos 1.");
      return;
    }

    setVerifying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const request: CalculadoraVerificarRequest = {
        uniformeId: form.uniformeId,
        cantidad: form.cantidad,
        talla: form.talla,
      };

      const data = await calculadoraService.verificar(request);
      setResultado(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No fue posible verificar los insumos.";
      setError(msg);
    } finally {
      setVerifying(false);
    }
  }, [form]);

  // ── Clear messages ─────────────────────────────────────────────────

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // ── Datos computados para la UI ──────────────────────────────────────

  const colegioSeleccionado = useMemo(
    () => colegios.find((c) => Number(c.id) === form.colegioId) ?? null,
    [colegios, form.colegioId]
  );

  const uniformeSeleccionado = useMemo(
    () => uniformes.find((u) => u.id === form.uniformeId) ?? null,
    [uniformes, form.uniformeId]

  );

  const uniformesUnicos = useMemo(() => {
    const map = new Map<number, UniformeOption>();
    uniformes.forEach((u) => {
      if (!map.has(u.id)) {
        map.set(u.id, u);
      }
    });
    return Array.from(map.values());
  }, [uniformes]);

  const isFormValid = useMemo(
    () => form.colegioId !== null && form.uniformeId !== null && form.talla !== "" && form.cantidad >= 1,
    [form]
  );

  const loading = loadingColegios || loadingTallas;

  // ── Return ───────────────────────────────────────────────────────────

  return {
    // Datos
    colegios,
    uniformes: uniformesUnicos,
    tallasDisponibles,
    colegioSeleccionado,
    uniformeSeleccionado,
    formValues: {
      colegioId: form.colegioId ? String(form.colegioId) : "",
      uniformeId: form.uniformeId ? String(form.uniformeId) : "",
      cantidad: form.cantidad,
      talla: form.talla,
    },
    resultado,

    // Estados
    loading,
    loadingUniformes,
    loadingTallas,
    verifying,
    error,
    successMessage,
    isFormValid,

    // Acciones
    setColegio,
    setUniforme,
    setTalla,
    setCantidad,
    verify,
    clearMessages,
    reload: loadColegios,
  };
}
