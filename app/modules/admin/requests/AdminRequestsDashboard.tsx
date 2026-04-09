"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Search, ClipboardList, Clock3, CheckCheck, XCircle } from "lucide-react";
import RequestsTable from "@/app/components/admin/requests/RequestsTable";
import { useAdminRequests } from "@/app/hooks/useAdminRequests";
import type { RequestItem } from "@/app/types/admin-request";

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
          <p
            className="text-sm font-medium"
            style={{
              color: "#475467",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            {title}
          </p>
          <p
            className="mt-3 text-3xl font-semibold"
            style={{
              color: "#101828",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            {value}
          </p>
          <p
            className="mt-2 text-xs"
            style={{
              color: "#667085",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            {subtitle}
          </p>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accent}16`, color: accent }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function filterRequests(requests: RequestItem[], query: string, status: string) {
  return requests.filter((request) => {
    const matchesQuery =
      !query ||
      request.title.toLowerCase().includes(query) ||
      request.itemName.toLowerCase().includes(query) ||
      request.requestedBy.name.toLowerCase().includes(query) ||
      request.code.toLowerCase().includes(query);

    const matchesStatus = !status || request.status === status;

    return matchesQuery && matchesStatus;
  });
}

export default function AdminRequestsDashboard() {
  const { requests, summary, loading, error, actionId, reload, approve, reject } =
    useAdminRequests();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredRequests = useMemo(
    () => filterRequests(requests, query.trim().toLowerCase(), statusFilter),
    [query, requests, statusFilter],
  );

  return (
    <section className="flex flex-col gap-6 pb-8">
      <div
        className="rounded-[28px] border px-6 py-6"
        style={{
          borderColor: "#dbe4ff",
          background:
            "linear-gradient(135deg, rgba(11,61,145,0.08) 0%, rgba(73,194,27,0.08) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p
              className="text-sm font-semibold uppercase tracking-[0.18em]"
              style={{
                color: "#0b3d91",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Panel Admin
            </p>
            <h1
              className="mt-2 text-3xl font-semibold"
              style={{
                color: "#101828",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Gestion de solicitudes con flujo hacia bodega
            </h1>
            <p
              className="mt-3 text-sm"
              style={{
                color: "#475467",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Revisa las solicitudes creadas por usuarios, apruebalas o rechaza
              las pendientes y deja el modulo listo para conectar con tus APIs
              reales.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
            style={{
              borderColor: "#c7d7fe",
              backgroundColor: "#ffffff",
              color: "#0b3d91",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total solicitudes"
          value={summary.total}
          subtitle="Volumen general gestionado por administracion"
          accent="#0b3d91"
          icon={ClipboardList}
        />
        <StatCard
          title="Pendientes"
          value={summary.pending}
          subtitle="Requieren decision del admin"
          accent="#f59e0b"
          icon={Clock3}
        />
        <StatCard
          title="Aprobadas"
          value={summary.approved}
          subtitle="Listas para continuar hacia bodega"
          accent="#16a34a"
          icon={CheckCheck}
        />
        <StatCard
          title="Rechazadas"
          value={summary.rejected}
          subtitle="Solicitudes detenidas en revision"
          accent="#dc2626"
          icon={XCircle}
        />
      </div>

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
            <h2
              className="text-lg font-semibold"
              style={{
                color: "#101828",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Cola de aprobacion
            </h2>
            <p
              className="mt-1 text-sm"
              style={{
                color: "#667085",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Filtra por texto o estado para revisar mas rapido las solicitudes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#98a2b3",
                }}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar solicitud o solicitante"
                className="rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none"
                style={{
                  width: 280,
                  borderColor: "#d0d5dd",
                  color: "#101828",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{
                borderColor: "#d0d5dd",
                color: "#101828",
                backgroundColor: "#ffffff",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{
            borderColor: "#fecaca",
            backgroundColor: "#fef2f2",
            color: "#b42318",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-3xl"
              style={{ backgroundColor: "#e5e7eb" }}
            />
          ))}
        </div>
      ) : (
        <RequestsTable
          requests={filteredRequests}
          actionId={actionId}
          onApprove={approve}
          onReject={reject}
        />
      )}
    </section>
  );
}
