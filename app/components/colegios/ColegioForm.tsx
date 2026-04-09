"use client";

import { useState } from "react";
import type { CreateColegioPayload } from "@/app/types/colegio";

const INITIAL_VALUES: CreateColegioPayload = {
  nombre: "",
  ciudad: "",
  departamento: "",
  contacto: "",
  telefono: "",
};

export default function ColegioForm({
  creating,
  onSubmit,
}: {
  creating: boolean;
  onSubmit: (payload: CreateColegioPayload) => Promise<unknown>;
}) {
  const [values, setValues] = useState<CreateColegioPayload>(INITIAL_VALUES);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof CreateColegioPayload>(
    key: K,
    value: CreateColegioPayload[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !values.nombre.trim() ||
      !values.ciudad.trim() ||
      !values.departamento.trim() ||
      !values.contacto.trim() ||
      !values.telefono.trim()
    ) {
      setError("Completa todos los campos del colegio.");
      return;
    }

    await onSubmit({
      nombre: values.nombre.trim(),
      ciudad: values.ciudad.trim(),
      departamento: values.departamento.trim(),
      contacto: values.contacto.trim(),
      telefono: values.telefono.trim(),
    });

    setValues(INITIAL_VALUES);
    setError(null);
  }

  return (
    <div
      className="rounded-3xl border p-5"
      style={{
        borderColor: "#eaecf0",
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div>
        <h2
          className="text-lg font-semibold"
          style={{
            color: "#101828",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Crear colegio
        </h2>
        <p
          className="mt-1 text-sm"
          style={{
            color: "#667085",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Prepara el registro del cliente con sus datos principales.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          {
            key: "nombre",
            label: "Nombre del colegio",
            placeholder: "Ejemplo: Colegio San Jose",
          },
          {
            key: "ciudad",
            label: "Ciudad",
            placeholder: "Ejemplo: Bogota",
          },
          {
            key: "departamento",
            label: "Departamento",
            placeholder: "Ejemplo: Cundinamarca",
          },
          {
            key: "contacto",
            label: "Contacto",
            placeholder: "Ejemplo: Maria Torres",
          },
          {
            key: "telefono",
            label: "Telefono",
            placeholder: "Ejemplo: 3001234567",
          },
        ].map((field) => (
          <div
            key={field.key}
            className={field.key === "telefono" ? "md:col-span-2" : undefined}
          >
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
              style={{
                color: "#475467",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              {field.label}
            </label>
            <input
              value={values[field.key as keyof CreateColegioPayload]}
              onChange={(event) =>
                updateField(
                  field.key as keyof CreateColegioPayload,
                  event.target.value,
                )
              }
              placeholder={field.placeholder}
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{
                borderColor: "#d0d5dd",
                color: "#101828",
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            />
          </div>
        ))}

        {error ? (
          <div
            className="rounded-2xl border px-4 py-3 text-sm md:col-span-2"
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

        <div className="flex justify-end md:col-span-2">
          <button
            type="submit"
            disabled={creating}
            className="rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
            style={{
              backgroundColor: "#1d4ed8",
              opacity: creating ? 0.75 : 1,
              fontFamily: "var(--font-poppins), sans-serif",
            }}
          >
            {creating ? "Guardando..." : "Guardar colegio"}
          </button>
        </div>
      </form>
    </div>
  );
}
