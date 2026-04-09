import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "@/app/services/dashboard.service";
import { DashboardData } from "@/app/types/dashboard";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getResumen();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, lastUpdated };
}
