"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveRequest,
  getRequests,
  rejectRequest,
} from "@/app/services/admin.service";
import type {
  GetRequestsResponse,
  RequestItem,
  RequestsSummary,
} from "@/app/types/admin-request";

const EMPTY_SUMMARY: RequestsSummary = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

function buildSummary(data: RequestItem[]): RequestsSummary {
  return {
    total: data.length,
    pending: data.filter((request) => request.status === "PENDIENTE").length,
    approved: data.filter((request) => request.status === "APROBADO").length,
    rejected: data.filter((request) => request.status === "RECHAZADO").length,
  };
}

export function useAdminRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [summary, setSummary] = useState<RequestsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const syncState = useCallback((payload: GetRequestsResponse) => {
    setRequests(payload.data);
    setSummary(payload.summary);
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await getRequests();
      syncState(payload);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las solicitudes.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [syncState]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const updateLocally = useCallback(
    (updatedRequest: RequestItem) => {
      setRequests((current) => {
        const next = current.map((request) =>
          request.id === updatedRequest.id ? updatedRequest : request,
        );
        setSummary(buildSummary(next));
        return next;
      });
    },
    [],
  );

  const runAction = useCallback(
    async (id: string, action: "approve" | "reject") => {
      setActionId(id);
      setError(null);

      try {
        const response =
          action === "approve"
            ? await approveRequest(id)
            : await rejectRequest(id);

        updateLocally(response.data);
        return response.message;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo actualizar la solicitud.";
        setError(message);
        throw err;
      } finally {
        setActionId(null);
      }
    },
    [updateLocally],
  );

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "PENDIENTE"),
    [requests],
  );

  return {
    requests,
    pendingRequests,
    summary,
    loading,
    error,
    actionId,
    reload: loadRequests,
    approve: (id: string) => runAction(id, "approve"),
    reject: (id: string) => runAction(id, "reject"),
  };
}
