"use client";

import { useMemo, useState } from "react";
import { CheckCheck, ClipboardList, PackageCheck, RefreshCw, ShieldAlert } from "lucide-react";
import WarehouseQueueTable from "@/app/components/bodega/requests/WarehouseQueueTable";
import WarehouseStatusBadge from "@/app/components/bodega/requests/WarehouseStatusBadge";
import { useWarehouseRequests } from "@/app/hooks/useWarehouseRequests";

function StatCard({
  title,
  value,
  subtitle,
  accent,
  icon: Icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  accent: string;
  icon: typeof ClipboardList;
}) {
  return (
    <div
      className="rounded-3xl border p-5"
      style={{
        borderColor: "#eaecf0",
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
            {title}
          </p>
          <p className="mt-3 text-3xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            {value}
          </p>
          <p className="mt-2 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            {subtitle}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accent}16`, color: accent }}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function BodegaDashboard() {
  const {
    requests,
    summary,
    currentOperator,
    loading,
    actionId,
    error,
    successMessage,
    clearSuccess,
    reload,
    confirm,
    reject,
  } = useWarehouseRequests();
  const [filter, setFilter] = useState<"TODAS" | "PENDIENTES" | "PROCESADAS">("PENDIENTES");
  const [search, setSearch] = useState("");

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesFilter =
        filter === "TODAS"
          ? true
          : filter === "PENDIENTES"
            ? request.status === "PENDIENTE"
            : request.status !== "PENDIENTE";

      const matchesSearch =
        !normalizedSearch ||
        request.code.toLowerCase().includes(normalizedSearch) ||
        request.requestedBy.name.toLowerCase().includes(normalizedSearch) ||
        request.lines.some((line) => line.itemName.toLowerCase().includes(normalizedSearch));

      return matchesFilter && matchesSearch;
    });
  }, [filter, requests, search]);

  const pendingRequests = requests.filter((request) => request.status === "PENDIENTE").slice(0, 4);

  return (
    <section className="flex flex-col gap-6 pb-8">
      <div
        className="rounded-[28px] border px-6 py-6"
        style={{
          borderColor: "#bbf7d0",
          background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(5,46,22,0.08) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "#15803d", fontFamily: "var(--font-poppins), sans-serif" }}>
              Rol BODEGA
            </p>
            <h1 className="mt-2 text-3xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Cola de validacion fisica de inventario
            </h1>
            <p className="mt-3 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
              {currentOperator ? `${currentOperator.name},` : ""} confirma o rechaza solicitudes pendientes. El stock solo debe cambiar despues de una confirmacion fisica desde bodega.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
            style={{ borderColor: "#bbf7d0", backgroundColor: "#ffffff", color: "#15803d", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            <RefreshCw size={16} />
            Actualizar cola
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Solicitudes visibles" value={summary.total} subtitle="Carga total gestionada en bodega" accent="#15803d" icon={ClipboardList} />
        <StatCard title="Pendientes" value={summary.pending} subtitle="Esperando validacion fisica" accent="#f59e0b" icon={PackageCheck} />
        <StatCard title="Confirmadas" value={summary.confirmed} subtitle="Aplicadas al flujo de stock" accent="#16a34a" icon={CheckCheck} />
        <StatCard title="Rechazadas" value={summary.rejected} subtitle="Incidencias registradas con motivo" accent="#dc2626" icon={ShieldAlert} />
      </div>

      {successMessage ? (
        <button
          type="button"
          onClick={clearSuccess}
          className="rounded-2xl border px-4 py-3 text-left text-sm"
          style={{ borderColor: "#abefc6", backgroundColor: "#ecfdf3", color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {successMessage}
        </button>
      ) : null}

      {error ? (
        <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div
          className="rounded-3xl border p-5"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                Cola de trabajo
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                Prioriza las solicitudes pendientes y documenta cualquier rechazo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value as "TODAS" | "PENDIENTES" | "PROCESADAS")}
                className="rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: "#d0d5dd", color: "#101828", backgroundColor: "#ffffff", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                <option value="PENDIENTES">Solo pendientes</option>
                <option value="PROCESADAS">Procesadas</option>
                <option value="TODAS">Todas</option>
              </select>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por codigo, solicitante o insumo"
                className="rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ minWidth: 280, borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-3xl border p-5"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            Prioridad inmediata
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            Pendientes mas recientes para revision rapida.
          </p>

          <div className="mt-5 space-y-3">
            {pendingRequests.length === 0 ? (
              <p className="text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                No hay pendientes en este momento.
              </p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border p-4" style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: request.type === "ENTRADA" ? "#175cd3" : "#c4320a", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {request.type}
                      </p>
                      <p className="mt-2 text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {request.code}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                        {request.requestedBy.name}
                      </p>
                    </div>
                    <WarehouseStatusBadge status={request.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-3xl" style={{ backgroundColor: "#e5e7eb" }} />
          ))}
        </div>
      ) : (
        <WarehouseQueueTable
          requests={filteredRequests}
          actionId={actionId}
          onConfirm={confirm}
          onReject={reject}
        />
      )}
    </section>
  );
}
