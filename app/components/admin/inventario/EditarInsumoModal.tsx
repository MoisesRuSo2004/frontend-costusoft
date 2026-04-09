"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertCircle } from "lucide-react";
import { insumoService } from "@/app/services/insumo.service";
import type { InsumoResponse } from "@/app/types/insumo";

const UNIDADES = [
  "Unidades", "Metros", "Centímetros", "Kilogramos", "Gramos",
  "Litros", "Mililitros", "Metros cuadrados", "Rollos", "Cajas", "Conos",
];

const TIPOS = [
  "Tela", "Hilo", "Cierre", "Botón", "Forro", "Herraje", "Empaque",
  "Material", "Accesorio", "Insumo", "Otros",
];

interface EditarInsumoModalProps {
  isOpen: boolean;
  insumo: InsumoResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface Form {
  nombre: string;
  stock: string;
  stockMinimo: string;
  unidadMedida: string;
  tipo: string;
}

const lbl: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 500,
  color: "#374151",
  fontFamily: "'Poppins', sans-serif",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

function inp(err?: string): React.CSSProperties {
  return {
    width: "100%",
    padding: "11px 14px",
    border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'Poppins', sans-serif",
    color: "#111827",
    outline: "none",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
}

export function EditarInsumoModal({
  isOpen,
  insumo,
  onClose,
  onSuccess,
}: EditarInsumoModalProps) {
  const [form, setForm] = useState<Form>({
    nombre: insumo?.nombre || "",
    stock: String(insumo?.stock || 0),
    stockMinimo: String(insumo?.stockMinimo || 0),
    unidadMedida: insumo?.unidadMedida || "Metros",
    tipo: insumo?.tipo || "Tela",
  });
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function validate(): boolean {
    const errs: Partial<Form> = {};
    if (!form.nombre.trim()) errs.nombre = "Requerido";
    if (!form.tipo) errs.tipo = "Requerido";
    if (!form.unidadMedida) errs.unidadMedida = "Requerido";
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) errs.stock = "Valor inválido";
    if (isNaN(Number(form.stockMinimo)) || Number(form.stockMinimo) < 0) errs.stockMinimo = "Valor inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !insumo) return;
    setLoading(true);
    setApiError("");
    try {
      await insumoService.actualizar(insumo.id, {
        nombre: form.nombre.trim(),
        stock: Number(form.stock),
        unidadMedida: form.unidadMedida,
        tipo: form.tipo,
        stockMinimo: Number(form.stockMinimo),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Error al actualizar el insumo.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !insumo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="rounded-3xl border bg-white p-6 shadow-xl"
          style={{ borderColor: "#eaecf0", maxWidth: 500, width: "100%" }}
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
              Editar insumo
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition"
              style={{ backgroundColor: "rgba(107, 114, 128, 0.10)" }}
            >
              <X size={18} style={{ color: "#6b7280" }} />
            </button>
          </div>

          {/* Error */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3"
              style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
            >
              <AlertCircle size={16} style={{ color: "#dc2626" }} />
              <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>
                {apiError}
              </p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Nombre */}
            <div>
              <label style={lbl}>
                Nombre del insumo <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                value={form.nombre}
                onChange={set("nombre")}
                placeholder="Ej. Tela Popelina Azul"
                style={inp(errors.nombre)}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "#0b3d91";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.nombre ? "#fca5a5" : "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              {errors.nombre && (
                <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label style={lbl}>
                Tipo de insumo <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={form.tipo}
                onChange={set("tipo")}
                style={{ ...inp(errors.tipo), cursor: "pointer" }}
              >
                {TIPOS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
                  {errors.tipo}
                </p>
              )}
            </div>

            {/* Unidad */}
            <div>
              <label style={lbl}>
                Unidad de medida <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={form.unidadMedida}
                onChange={set("unidadMedida")}
                style={{ ...inp(errors.unidadMedida), cursor: "pointer" }}
              >
                {UNIDADES.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {errors.unidadMedida && (
                <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
                  {errors.unidadMedida}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label style={lbl}>
                Stock <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={set("stock")}
                style={inp(errors.stock)}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "#0b3d91";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.stock ? "#fca5a5" : "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              {errors.stock && (
                <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
                  {errors.stock}
                </p>
              )}
            </div>

            {/* Stock Mínimo */}
            <div>
              <label style={lbl}>
                Stock mínimo <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.stockMinimo}
                onChange={set("stockMinimo")}
                style={inp(errors.stockMinimo)}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "#0b3d91";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.stockMinimo ? "#fca5a5" : "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <p className="mt-1 text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
                Cuando el stock baje de este valor, aparecerá una alerta.
              </p>
              {errors.stockMinimo && (
                <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>
                  {errors.stockMinimo}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-2 flex justify-end gap-3 border-t pt-4" style={{ borderColor: "#f0f0f4" }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl border px-5 py-2 text-sm font-medium transition"
                style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: "'Poppins', sans-serif" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-sm font-semibold text-white transition"
                style={{
                  backgroundColor: loading ? "#3aad17" : "#0b3d91",
                  fontFamily: "'Poppins', sans-serif",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <Save size={14} /> {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
