"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createColegio,
  getColegiosList,
} from "@/app/services/colegios.service";
import type { Colegio, CreateColegioPayload } from "@/app/types/colegio";

export function useColegios() {
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getColegiosList();
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
    void load();
  }, [load]);

  const create = useCallback(async (payload: CreateColegioPayload) => {
    setCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const created = await createColegio(payload);
      setColegios((current) => [created, ...current]);
      setSuccessMessage("Colegio creado correctamente.");
      return created;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible crear el colegio.",
      );
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const summary = useMemo(
    () => ({
      total: colegios.length,
      activos: colegios.filter((colegio) => colegio.estado === "ACTIVO").length,
      inactivos: colegios.filter((colegio) => colegio.estado === "INACTIVO").length,
    }),
    [colegios],
  );

  return {
    colegios,
    summary,
    loading,
    creating,
    error,
    successMessage,
    clearMessages: () => {
      setError(null);
      setSuccessMessage(null);
    },
    reload: load,
    create,
  };
}
