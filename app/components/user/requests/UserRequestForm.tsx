"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Plus, Search, Trash2 } from "lucide-react";
import type {
  CreateUserRequestPayload,
  InventoryItemOption,
  RequestType,
  RequestLine,
} from "@/app/types/user-request";

interface UserRequestFormProps {
  inventory: InventoryItemOption[];
  creating: boolean;
  onSubmit: (payload: CreateUserRequestPayload) => Promise<unknown>;
}

const TAB_OPTIONS: Array<{ value: RequestType; label: string; accent: string }> = [
  { value: "ENTRADA", label: "Solicitud de entrada", accent: "#175cd3" },
  { value: "SALIDA", label: "Solicitud de salida", accent: "#c4320a" },
];

export default function UserRequestForm({
  inventory,
  creating,
  onSubmit,
}: UserRequestFormProps) {
  const [type, setType] = useState<RequestType>("ENTRADA");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItemOption | null>(null);
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<RequestLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const accent = type === "ENTRADA" ? "#175cd3" : "#c4320a";

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return inventory.slice(0, 5);
    }

    return inventory.filter((item) => item.name.toLowerCase().includes(normalizedQuery)).slice(0, 6);
  }, [inventory, query]);

  function resetForm(keepType = true) {
    setQuery("");
    setSelectedItem(null);
    setQuantity("");
    setDescription("");
    setLines([]);
    setError(null);
    setShowSuggestions(false);
    if (!keepType) {
      setType("ENTRADA");
    }
  }

  function addLine() {
    if (!selectedItem) {
      setError("Selecciona un insumo de la lista.");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (!quantity || Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError("Ingresa una cantidad valida.");
      return;
    }

    if (type === "SALIDA" && parsedQuantity > selectedItem.stock) {
      setError(`La cantidad solicitada supera el stock visible de ${selectedItem.name}.`);
      return;
    }

    const existingLine = lines.find((line) => line.itemId === selectedItem.id);

    if (existingLine) {
      const nextQuantity = existingLine.quantity + parsedQuantity;

      if (type === "SALIDA" && nextQuantity > selectedItem.stock) {
        setError(`La suma de cantidades supera el stock visible de ${selectedItem.name}.`);
        return;
      }

      setLines((current) =>
        current.map((line) =>
          line.itemId === selectedItem.id ? { ...line, quantity: nextQuantity } : line,
        ),
      );
    } else {
      setLines((current) => [
        ...current,
        {
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          quantity: parsedQuantity,
          unit: selectedItem.unit,
          availableStock: selectedItem.stock,
        },
      ]);
    }

    setQuery("");
    setSelectedItem(null);
    setQuantity("");
    setError(null);
    setShowSuggestions(false);
  }

  function removeLine(itemId: string) {
    setLines((current) => current.filter((line) => line.itemId !== itemId));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lines.length === 0) {
      setError("Agrega al menos un insumo a la solicitud.");
      return;
    }

    if (!description.trim()) {
      setError("Describe brevemente el motivo de la solicitud.");
      return;
    }

    setError(null);

    await onSubmit({
      type,
      description: description.trim(),
      lines: lines.map((line) => ({ itemId: line.itemId, quantity: line.quantity })),
    });

    resetForm();
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            Crear solicitud
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
            Registra entradas o salidas para que bodega las valide fisicamente.
          </p>
        </div>

        <div className="flex rounded-2xl border p-1" style={{ borderColor: "#d0d5dd", backgroundColor: "#f8fafc" }}>
          {TAB_OPTIONS.map((option) => {
            const active = option.value === type;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setType(option.value);
                  setError(null);
                }}
                className="rounded-2xl px-4 py-2 text-sm font-semibold transition"
                style={{
                  backgroundColor: active ? "#ffffff" : "transparent",
                  color: active ? option.accent : "#667085",
                  boxShadow: active ? "0 6px 16px rgba(15, 23, 42, 0.08)" : "none",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_120px]">
          <div ref={searchRef} className="relative">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
              Insumo
            </label>
            <div className="relative">
              <Search
                size={15}
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#98a2b3" }}
              />
              <input
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedItem(null);
                  setShowSuggestions(true);
                }}
                placeholder="Busca un insumo"
                className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none"
                style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              />
            </div>

            {showSuggestions && suggestions.length > 0 ? (
              <div
                className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border"
                style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff", boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)" }}
              >
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedItem(item);
                      setQuery(item.name);
                      setShowSuggestions(false);
                      setError(null);
                    }}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition"
                    style={{ backgroundColor: selectedItem?.id === item.id ? "#eff8ff" : "#ffffff" }}
                  >
                    <span className="text-sm font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {item.name}
                    </span>
                    <span className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {item.stock} {item.unit}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="0"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            />
          </div>

          <button
            type="button"
            onClick={addLine}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition"
            style={{ backgroundColor: accent, fontFamily: "var(--font-poppins), sans-serif" }}
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>

        <div className="rounded-2xl border" style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}>
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "#eaecf0" }}>
            <div className="flex items-center gap-2">
              {type === "ENTRADA" ? <ArrowDownToLine size={16} style={{ color: accent }} /> : <ArrowUpFromLine size={16} style={{ color: accent }} />}
              <p className="text-sm font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                Lineas de la solicitud
              </p>
            </div>
            <span className="text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              {lines.length} agregada{lines.length === 1 ? "" : "s"}
            </span>
          </div>

          {lines.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                Agrega uno o mas insumos para armar la solicitud.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#eaecf0" }}>
              {lines.map((line) => (
                <div key={line.itemId} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {line.itemName}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {line.quantity} {line.unit}
                      {typeof line.availableStock === "number" ? ` · Stock visible ${line.availableStock}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.itemId)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition"
                    style={{ borderColor: "#fecaca", backgroundColor: "#fff5f5", color: "#b42318" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>
            Motivo
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={type === "ENTRADA" ? "Ejemplo: ingreso pendiente por recepcion del proveedor" : "Ejemplo: salida requerida para orden de produccion"}
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "#d0d5dd", color: "#101828", resize: "none", fontFamily: "var(--font-poppins), sans-serif" }}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => resetForm()}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold transition"
            style={{ borderColor: "#d0d5dd", color: "#475467", backgroundColor: "#ffffff", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={creating}
            className="rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
            style={{ backgroundColor: accent, opacity: creating ? 0.75 : 1, fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {creating ? "Creando solicitud..." : type === "ENTRADA" ? "Crear solicitud de entrada" : "Crear solicitud de salida"}
          </button>
        </div>
      </form>
    </div>
  );
}
