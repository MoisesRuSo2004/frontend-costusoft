"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  generarSolicitudDesdeCalculadora,
  getColegios,
  verificarCalculadora,
} from "@/app/services/calculadora.service";
import type {
  CalculadoraFormValues,
  CalculadoraResultado,
  ColegioOption,
  UniformOption,
} from "@/app/types/calculadora";

const INITIAL_VALUES: CalculadoraFormValues = {
  colegioId: "",
  uniformeId: "",
  cantidad: 1,
};

export function useCalculadora() {
  const [colegios, setColegios] = useState<ColegioOption[]>([]);
  const [formValues, setFormValues] = useState<CalculadoraFormValues>(INITIAL_VALUES);
  const [resultado, setResultado] = useState<CalculadoraResultado | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadColegios = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getColegios();
      setColegios(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar los colegios.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadColegios();
  }, [loadColegios]);

  const colegioSeleccionado = useMemo(
    () => colegios.find((colegio) => colegio.id === formValues.colegioId) ?? null,
    [colegios, formValues.colegioId],
  );

  const uniformes = useMemo<UniformOption[]>(
    () => colegioSeleccionado?.uniformes ?? [],
    [colegioSeleccionado],
  );

  const setColegio = useCallback((colegioId: string) => {
    setFormValues((current) => ({
      ...current,
      colegioId,
      uniformeId: "",
    }));
    setResultado(null);
    setError(null);
  }, []);

  const setUniforme = useCallback((uniformeId: string) => {
    setFormValues((current) => ({ ...current, uniformeId }));
    setResultado(null);
    setError(null);
  }, []);

  const setCantidad = useCallback((cantidad: number) => {
    setFormValues((current) => ({ ...current, cantidad }));
    setResultado(null);
    setError(null);
  }, []);

  const verify = useCallback(async () => {
    if (!formValues.colegioId || !formValues.uniformeId || formValues.cantidad <= 0) {
      setError("Selecciona colegio, uniforme y una cantidad valida.");
      return;
    }

    setVerifying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const data = await verificarCalculadora(formValues);
      setResultado(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible verificar los insumos.",
      );
    } finally {
      setVerifying(false);
    }
  }, [formValues]);

  const createRequest = useCallback(async () => {
    if (!resultado) {
      setError("Primero calcula los insumos requeridos.");
      return;
    }

    setCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await generarSolicitudDesdeCalculadora({
        colegioId: formValues.colegioId,
        uniformeId: formValues.uniformeId,
        cantidad: formValues.cantidad,
        items: resultado.items,
      });

      setSuccessMessage("Solicitud de salida generada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible generar la solicitud.",
      );
    } finally {
      setCreating(false);
    }
  }, [formValues, resultado]);

  return {
    colegios,
    uniformes,
    colegioSeleccionado,
    formValues,
    resultado,
    loading,
    verifying,
    creating,
    error,
    successMessage,
    clearMessages: () => {
      setError(null);
      setSuccessMessage(null);
    },
    reload: loadColegios,
    setColegio,
    setUniforme,
    setCantidad,
    verify,
    createRequest,
  };
}
