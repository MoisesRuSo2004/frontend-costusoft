"use client";

import { RefreshCw } from "lucide-react";
import AdminDashboard from "@/app/modules/admin/dashboard/AdminDashboard";
import { useDashboard } from "@/app/hooks/useDashboard";

function SkeletonGrid() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <div
        className="h-12 animate-pulse rounded-2xl"
        style={{ backgroundColor: "#e5e7eb" }}
      />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl border p-5"
            style={{ borderColor: "#eaecf0", backgroundColor: "#fff" }}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-3 flex-1">
                <div
                  className="h-2.5 w-20 rounded-full"
                  style={{ backgroundColor: "#e5e7eb" }}
                />
                <div
                  className="h-7 w-12 rounded-full"
                  style={{ backgroundColor: "#e5e7eb" }}
                />
                <div
                  className="h-2 w-28 rounded-full"
                  style={{ backgroundColor: "#e5e7eb" }}
                />
              </div>
              <div
                className="h-11 w-11 rounded-2xl"
                style={{ backgroundColor: "#e5e7eb" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div
          className="col-span-1 lg:col-span-3 h-64 animate-pulse rounded-3xl"
          style={{ backgroundColor: "#e5e7eb" }}
        />
        <div
          className="col-span-1 lg:col-span-2 h-64 animate-pulse rounded-3xl"
          style={{ backgroundColor: "#e5e7eb" }}
        />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, loading, error, reload, lastUpdated } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div
        className="rounded-[28px] border px-6 py-5"
        style={{
          borderColor: "#dbe4ff",
          background:
            "linear-gradient(135deg, rgba(11,61,145,0.07) 0%, rgba(73,194,27,0.07) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{
                color: "#0b3d91",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Panel Administrativo
            </p>
            <h1
              className="mt-1.5 text-2xl font-semibold"
              style={{
                color: "#101828",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Dashboard General
            </h1>
            <p
              className="mt-1 text-sm"
              style={{
                color: "#667085",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Resumen operativo del sistema — métricas, movimientos y alertas en
              tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {lastUpdated && (
              <p
                className="text-xs hidden sm:block"
                style={{
                  color: "#9ca3af",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Última actualización:{" "}
                <strong style={{ color: "#667085" }}>
                  {lastUpdated.toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </p>
            )}
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition"
              style={{
                borderColor: "#c7d7fe",
                backgroundColor: "#ffffff",
                color: "#0b3d91",
                fontFamily: "var(--font-poppins), sans-serif",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-2xl border px-5 py-4 text-sm"
          style={{
            borderColor: "#fecaca",
            backgroundColor: "#fef2f2",
            color: "#b42318",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {error}
        </div>
      )}

      {/* Contenido */}
      {loading && !data ? (
        <SkeletonGrid />
      ) : data ? (
        <AdminDashboard data={data} />
      ) : null}
    </div>
  );
}
