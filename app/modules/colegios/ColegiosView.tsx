"use client";

import { Building2, RefreshCw, School } from "lucide-react";
import ColegioForm from "@/app/components/colegios/ColegioForm";
import ColegiosTable from "@/app/components/colegios/ColegiosTable";
import { useColegios } from "@/app/hooks/useColegios";

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
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
  );
}

export default function ColegiosView() {
  const {
    colegios,
    summary,
    loading,
    creating,
    error,
    successMessage,
    clearMessages,
    reload,
    create,
  } = useColegios();

  return (
    <section className="flex flex-col gap-6 pb-8">
      <div
        className="rounded-[28px] border px-6 py-6"
        style={{
          borderColor: "#dbeafe",
          background:
            "linear-gradient(135deg, rgba(29,78,216,0.10) 0%, rgba(15,23,42,0.06) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p
              className="text-sm font-semibold uppercase tracking-[0.18em]"
              style={{
                color: "#1d4ed8",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Gestion
            </p>
            <h1
              className="mt-2 text-3xl font-semibold"
              style={{
                color: "#101828",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Colegios registrados en el sistema
            </h1>
            <p
              className="mt-3 text-sm"
              style={{
                color: "#475467",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              Deje este modulo funcionando con datos estaticos para avanzar en la
              UI. Luego solo reemplazamos el service por llamadas reales al
              backend.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
            style={{
              borderColor: "#bfdbfe",
              backgroundColor: "#ffffff",
              color: "#1d4ed8",
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            <RefreshCw size={16} />
            Recargar lista
          </button>
        </div>
      </div>

      {error ? (
        <button
          type="button"
          onClick={clearMessages}
          className="rounded-2xl border px-4 py-3 text-left text-sm"
          style={{
            borderColor: "#fecaca",
            backgroundColor: "#fef2f2",
            color: "#b42318",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {error}
        </button>
      ) : null}

      {successMessage ? (
        <button
          type="button"
          onClick={clearMessages}
          className="rounded-2xl border px-4 py-3 text-left text-sm"
          style={{
            borderColor: "#abefc6",
            backgroundColor: "#ecfdf3",
            color: "#027a48",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          {successMessage}
        </button>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total colegios"
          value={summary.total}
          subtitle="Clientes cargados en frontend"
        />
        <StatCard
          title="Activos"
          value={summary.activos}
          subtitle="Disponibles para operacion"
        />
        <StatCard
          title="Inactivos"
          value={summary.inactivos}
          subtitle="Pendientes de reactivacion"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div
            className="rounded-3xl border p-5"
            style={{
              borderColor: "#eaecf0",
              backgroundColor: "#ffffff",
              boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
              >
                <School size={18} />
              </div>
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{
                    color: "#101828",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  Resumen rapido
                </h2>
                <p
                  className="text-sm"
                  style={{
                    color: "#667085",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  Base provisional para el modulo de clientes.
                </p>
              </div>
            </div>
          </div>

          <ColegioForm creating={creating} onSubmit={create} />
        </div>

        <div
          className="rounded-3xl border p-5"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
            >
              <Building2 size={18} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{
                  color: "#101828",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Lista de colegios
              </h2>
              <p
                className="text-sm"
                style={{
                  color: "#667085",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Vista administrativa con datos mock, lista para integrar despues.
              </p>
            </div>
          </div>

          <ColegiosTable colegios={colegios} loading={loading} />
        </div>
      </div>
    </section>
  );
}
