"use client";

import { useCallback, useEffect, useState } from "react";
import {
  confirmWarehouseRequest,
  getWarehouseDashboard,
  rejectWarehouseRequest,
} from "@/app/services/bodega.service";
import type {
  WarehouseDashboardResponse,
  WarehouseRequest,
  WarehouseSummary,
} from "@/app/types/bodega-request";

const EMPTY_SUMMARY: WarehouseSummary = {
  total: 0,
  pending: 0,
  confirmed: 0,
  rejected: 0,
};

function buildSummary(requests: WarehouseRequest[]): WarehouseSummary {
  return {
    total: requests.length,
    pending: requests.filter((request) => request.status === "PENDIENTE").length,
    confirmed: requests.filter((request) => request.status === "CONFIRMADA").length,
    rejected: requests.filter((request) => request.status === "RECHAZADA").length,
  };
}

export function useWarehouseRequests() {
  const [dashboard, setDashboard] = useState<WarehouseDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const syncDashboard = useCallback((payload: WarehouseDashboardResponse) => {
    setDashboard(payload);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await getWarehouseDashboard();
      syncDashboard(payload);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la cola de bodega.",
      );
    } finally {
      setLoading(false);
    }
  }, [syncDashboard]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateRequest = useCallback((updated: WarehouseRequest) => {
    setDashboard((current) => {
      if (!current) {
        return current;
      }

      const nextRequests = current.requests.map((request) =>
        request.id === updated.id ? updated : request,
      );

      return {
        ...current,
        requests: nextRequests,
        summary: buildSummary(nextRequests),
      };
    });
  }, []);

  const confirm = useCallback(
    async (id: string) => {
      setActionId(id);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await confirmWarehouseRequest(id);
        updateRequest(response.data);
        setSuccessMessage(response.message);
        return response.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo confirmar la solicitud.",
        );
        throw err;
      } finally {
        setActionId(null);
      }
    },
    [updateRequest],
  );

  const reject = useCallback(
    async (id: string, reason: string) => {
      setActionId(id);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await rejectWarehouseRequest(id, reason);
        updateRequest(response.data);
        setSuccessMessage(response.message);
        return response.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo rechazar la solicitud.",
        );
        throw err;
      } finally {
        setActionId(null);
      }
    },
    [updateRequest],
  );

  return {
    requests: dashboard?.requests ?? [],
    summary: dashboard?.summary ?? EMPTY_SUMMARY,
    currentOperator: dashboard?.currentOperator ?? null,
    loading,
    actionId,
    error,
    successMessage,
    clearSuccess: () => setSuccessMessage(null),
    reload: load,
    confirm,
    reject,
  };
}
