"use client";

import { useMemo, useState } from "react";
import { CheckCheck, Clock3, PackageOpen, RefreshCw, ShieldAlert } from "lucide-react";
import UserInventoryPanel from "@/app/components/user/inventory/UserInventoryPanel";
import UserRequestForm from "@/app/components/user/requests/UserRequestForm";
import UserRequestsTable from "@/app/components/user/requests/UserRequestsTable";
import UserRequestStatusBadge from "@/app/components/user/requests/UserRequestStatusBadge";
import { useUserRequests } from "@/app/hooks/useUserRequests";

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
  icon: typeof PackageOpen;
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

export default function UserDashboard() {
  const {
    requests,
    recentRequests,
    inventory,
    currentUser,
    summary,
    loading,
    creating,
    error,
    successMessage,
    clearSuccess,
    reload,
    createRequest,
  } = useUserRequests();
  const [search, setSearch] = useState("");

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return requests;
    }

    return requests.filter(
      (request) =>
        request.code.toLowerCase().includes(normalizedSearch) ||
        request.description.toLowerCase().includes(normalizedSearch) ||
        request.lines.some((line) => line.itemName.toLowerCase().includes(normalizedSearch)),
    );
  }, [requests, search]);

  return (
    <section className="flex flex-col gap-6 pb-8">
      <div
        className="rounded-[28px] border px-6 py-6"
        style={{
          borderColor: "#dbeafe",
          background: "linear-gradient(135deg, rgba(29,78,216,0.10) 0%, rgba(15,23,42,0.06) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "#1d4ed8", fontFamily: "var(--font-poppins), sans-serif" }}>
              Rol USER
            </p>
            <h1 className="mt-2 text-3xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Solicitudes administrativas listas para validacion fisica
            </h1>
            <p className="mt-3 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
              {currentUser ? `${currentUser.name},` : ""} aqui puedes consultar insumos y crear solicitudes de entrada o salida. El stock solo cambia cuando bodega confirme el movimiento.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
            style={{ borderColor: "#bfdbfe", backgroundColor: "#ffffff", color: "#1d4ed8", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            <RefreshCw size={16} />
            Actualizar panel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Solicitudes creadas" value={summary.total} subtitle="Historial total generado por este usuario" accent="#1d4ed8" icon={PackageOpen} />
        <StatCard title="Pendientes" value={summary.pending} subtitle="Esperando confirmacion de bodega" accent="#f59e0b" icon={Clock3} />
        <StatCard title="Confirmadas" value={summary.confirmed} subtitle="Movimientos aplicados al stock" accent="#16a34a" icon={CheckCheck} />
        <StatCard title="Rechazadas" value={summary.rejected} subtitle="Requieren nueva solicitud o correccion" accent="#dc2626" icon={ShieldAlert} />
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

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="h-[420px] animate-pulse rounded-3xl" style={{ backgroundColor: "#e5e7eb" }} />
          <div className="h-[420px] animate-pulse rounded-3xl" style={{ backgroundColor: "#e5e7eb" }} />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <UserRequestForm inventory={inventory} creating={creating} onSubmit={createRequest} />
          <UserInventoryPanel inventory={inventory} />
        </div>
      )}

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
              Resumen reciente
            </h2>
            <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Ultimas solicitudes creadas por este usuario.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {recentRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border p-4" style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: request.type === "ENTRADA" ? "#175cd3" : "#c4320a", fontFamily: "var(--font-poppins), sans-serif" }}>
                  {request.type}
                </p>
                <p className="mt-2 text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                  {request.code}
                </p>
                <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                  {request.lines[0]?.itemName}
                </p>
                <div className="mt-3">
                  <UserRequestStatusBadge status={request.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Mis solicitudes
            </h2>
            <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Consulta el historial y revisa si bodega confirmo o rechazo cada movimiento.
            </p>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por codigo, descripcion o insumo"
            className="rounded-2xl border px-4 py-3 text-sm outline-none"
            style={{ minWidth: 280, borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
          />
        </div>

        <UserRequestsTable requests={filteredRequests} />
      </div>
    </section>
  );
}
