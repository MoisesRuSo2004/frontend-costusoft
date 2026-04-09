"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createUserRequest,
  getUserDashboard,
} from "@/app/services/user.service";
import type {
  CreateUserRequestPayload,
  UserDashboardResponse,
  UserInventoryRequest,
  UserRequestSummary,
} from "@/app/types/user-request";

const EMPTY_SUMMARY: UserRequestSummary = {
  total: 0,
  pending: 0,
  confirmed: 0,
  rejected: 0,
};

function buildSummary(requests: UserInventoryRequest[]): UserRequestSummary {
  return {
    total: requests.length,
    pending: requests.filter((request) => request.status === "PENDIENTE").length,
    confirmed: requests.filter((request) => request.status === "CONFIRMADA").length,
    rejected: requests.filter((request) => request.status === "RECHAZADA").length,
  };
}

export function useUserRequests() {
  const [dashboard, setDashboard] = useState<UserDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const syncDashboard = useCallback((payload: UserDashboardResponse) => {
    setDashboard(payload);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await getUserDashboard();
      syncDashboard(payload);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el panel del usuario.",
      );
    } finally {
      setLoading(false);
    }
  }, [syncDashboard]);

  useEffect(() => {
    void load();
  }, [load]);

  const createRequest = useCallback(
    async (payload: CreateUserRequestPayload) => {
      setCreating(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const response = await createUserRequest(payload);

        setDashboard((current) => {
          if (!current) {
            return current;
          }

          const nextRequests = [response.data, ...current.requests];

          return {
            ...current,
            requests: nextRequests,
            summary: buildSummary(nextRequests),
          };
        });

        setSuccessMessage(response.message);
        return response.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No fue posible crear la solicitud.",
        );
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  const requests = dashboard?.requests ?? [];
  const inventory = dashboard?.inventory ?? [];
  const currentUser = dashboard?.currentUser ?? null;
  const summary = dashboard?.summary ?? EMPTY_SUMMARY;

  const recentRequests = requests.slice(0, 6);

  return {
    requests,
    recentRequests,
    inventory,
    currentUser,
    summary,
    loading,
    creating,
    error,
    successMessage,
    clearSuccess: () => setSuccessMessage(null),
    reload: load,
    createRequest,
  };
}
