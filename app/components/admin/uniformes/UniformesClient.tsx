"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit2,
  Package,
  Plus,
  RefreshCw,
  Ruler,
  Save,
  School2,
  Search,
  Shirt,
  Trash2,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUniformes } from "@/app/hooks/useUniformes";
import type { UniformeResponse } from "@/app/types/uniforme";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const TALLAS_PREDEFINIDAS = ["S", "M", "L", "XL", "XXL", "UNICA"];
const TALLAS_NUMERICAS = ["04", "06-08", "10-12", "14-16", "18-20"];

const TIPOS_UNIFORME = ["Diario", "Educación Física", "Especial"];
const GENEROS = ["Hombre", "Mujer", "Unisex"];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE: Badge de Rol/Estado
// ═══════════════════════════════════════════════════════════════════════════

function Badge({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "purple" | "gray";
}) {
  const colors = {
    blue: { bg: "#eff6ff", text: "#1d4ed8" },
    green: { bg: "#ecfdf3", text: "#027a48" },
    purple: { bg: "#f5f3ff", text: "#7c3aed" },
    gray: { bg: "#f8fafc", text: "#475467" },
  };

  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        backgroundColor: colors[color].bg,
        color: colors[color].text,
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE: Card de Insumo por Talla
// ═══════════════════════════════════════════════════════════════════════════

function InsumoCard({
  nombre,
  cantidad,
  unidad,
  onRemove,
}: {
  nombre: string;
  cantidad: number;
  unidad: string;
  onRemove?: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border px-3 py-2"
      style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}
    >
      <div>
        <p
          className="text-sm font-medium"
          style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {nombre}
        </p>
        <p
          className="text-xs"
          style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {cantidad} {unidad}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-1.5 transition hover:bg-red-50"
        >
          <X size={14} style={{ color: "#dc2626" }} />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE: Fila Expandible de Uniforme
// ═══════════════════════════════════════════════════════════════════════════

function UniformeRow({
  uniforme,
  onEdit,
  onDelete,
}: {
  uniforme: UniformeResponse;
  onEdit: (u: UniformeResponse) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Agrupar insumos por talla
  const insumosPorTalla = new Map<string, typeof uniforme.insumosRequeridos>();
  uniforme.insumosRequeridos.forEach((insumo) => {
    const existentes = insumosPorTalla.get(insumo.talla) || [];
    insumosPorTalla.set(insumo.talla, [...existentes, insumo]);
  });

  return (
    <>
      <tr className="border-t transition-colors hover:bg-[#f8fafc]" style={{ borderColor: "#f2f4f7" }}>
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex h-6 w-6 items-center justify-center rounded-lg transition hover:bg-[#eaecf0]"
            >
              {expanded ? (
                <ChevronDown size={16} style={{ color: "#667085" }} />
              ) : (
                <ChevronRight size={16} style={{ color: "#667085" }} />
              )}
            </button>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
            >
              <Shirt size={18} />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                {uniforme.prenda}
              </p>
              <p
                className="text-xs"
                style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                ID: {uniforme.id}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <Badge color={uniforme.tipo === "Diario" ? "blue" : "purple"}>{uniforme.tipo || "Diario"}</Badge>
        </td>
        <td className="px-4 py-4">
          <span
            className="text-sm"
            style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {uniforme.genero || "—"}
          </span>
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-wrap gap-1">
            {uniforme.tallas.slice(0, 3).map((talla) => (
              <span
                key={talla}
                className="rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {talla}
              </span>
            ))}
            {uniforme.tallas.length > 3 && (
              <span
                className="rounded-md px-2 py-0.5 text-xs"
                style={{ color: "#6b7280", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                +{uniforme.tallas.length - 3}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-4">
          <span
            className="text-sm"
            style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {uniforme.insumosRequeridos.length} insumo(s)
          </span>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(uniforme)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[#eff6ff]"
              style={{ color: "#1d4ed8" }}
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(uniforme.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-red-50"
              style={{ color: "#dc2626" }}
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      {/* Fila expandible con detalles */}
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t"
            style={{ borderColor: "#f2f4f7", backgroundColor: "#fcfcfd" }}
          >
            <td colSpan={6} className="px-4 py-4">
              <div className="space-y-4">
                <h4
                  className="text-sm font-semibold"
                  style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Insumos requeridos por talla
                </h4>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from(insumosPorTalla.entries()).map(([talla, insumos]) => (
                    <div
                      key={talla}
                      className="rounded-2xl border p-4"
                      style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff" }}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <Ruler size={14} style={{ color: "#1d4ed8" }} />
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                        >
                          Talla {talla}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {insumos.map((insumo) => (
                          <InsumoCard
                            key={insumo.id}
                            nombre={insumo.nombreInsumo}
                            cantidad={insumo.cantidadBase}
                            unidad={insumo.unidadMedida}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE: Modal de Formulario
// ═══════════════════════════════════════════════════════════════════════════

function UniformeModal({
  isOpen,
  onClose,
  editingId,
  form,
  colegios,
  insumos,
  tallasUnicas,
  insumosPorTallaAgrupados,
  submitting,
  error,
  onSetField,
  onAddInsumo,
  onRemoveInsumo,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingId: number | null;
  form: ReturnType<typeof useUniformes>["form"];
  colegios: ReturnType<typeof useUniformes>["colegios"];
  insumos: ReturnType<typeof useUniformes>["insumos"];
  tallasUnicas: string[];
  insumosPorTallaAgrupados: Map<string, ReturnType<typeof useUniformes>["form"]["insumosPorTalla"]>;
  submitting: boolean;
  error: string | null;
  onSetField: (field: keyof typeof form, value: (typeof form)[keyof typeof form]) => void;
  onAddInsumo: (insumoId: number, nombre: string, unidad: string, talla: string, cantidad: number) => void;
  onRemoveInsumo: (id: string) => void;
  onSave: () => void;
}) {
  const [nuevaTalla, setNuevaTalla] = useState("");
  const [tallaPersonalizada, setTallaPersonalizada] = useState("");
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<number | "">("");
  const [tallaParaInsumo, setTallaParaInsumo] = useState("");
  const [cantidadInsumo, setCantidadInsumo] = useState(1);

  if (!isOpen) return null;

  const agregarInsumo = () => {
    if (!insumoSeleccionado || !tallaParaInsumo || cantidadInsumo <= 0) return;

    const insumo = insumos.find((i) => i.id === insumoSeleccionado);
    if (!insumo) return;

    onAddInsumo(insumo.id, insumo.nombre, insumo.unidadMedida, tallaParaInsumo, cantidadInsumo);

    // Reset
    setInsumoSeleccionado("");
    setCantidadInsumo(1);
  };

  const agregarTalla = () => {
    const talla = tallaPersonalizada.trim() || nuevaTalla;
    if (!talla) return;

    // Agregar insumo con talla vacía para que aparezca la sección
    setTallaParaInsumo(talla);
    setTallaPersonalizada("");
    setNuevaTalla("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border bg-white p-6"
        style={{ borderColor: "#eaecf0" }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {editingId ? "Editar Uniforme" : "Nuevo Uniforme"}
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {editingId
                ? "Modifica los datos y los insumos requeridos"
                : "Define la prenda y sus insumos por talla"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-[#f8fafc]"
          >
            <X size={20} style={{ color: "#667085" }} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
          >
            <TriangleAlert size={18} style={{ color: "#dc2626" }} />
            <p
              className="text-sm"
              style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Formulario */}
        <div className="space-y-6">
          {/* Datos básicos */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Prenda *
              </label>
              <input
                type="text"
                value={form.prenda}
                onChange={(e) => onSetField("prenda", e.target.value)}
                placeholder="Ej: Suéter, Camisa, Pantalón"
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-[#1d4ed8] focus:shadow-[0_0_0_3px_rgba(29,78,216,0.1)]"
                style={{
                  borderColor: "#d0d5dd",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Colegio *
              </label>
              <select
                value={form.colegioId || ""}
                onChange={(e) => onSetField("colegioId", Number(e.target.value) || null)}
                disabled={!!editingId}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
                style={{
                  borderColor: "#d0d5dd",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                <option value="">Selecciona un colegio</option>
                {colegios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Tipo
              </label>
              <select
                value={form.tipo}
                onChange={(e) => onSetField("tipo", e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{
                  borderColor: "#d0d5dd",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                {TIPOS_UNIFORME.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Género
              </label>
              <select
                value={form.genero}
                onChange={(e) => onSetField("genero", e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{
                  borderColor: "#d0d5dd",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                <option value="">Selecciona...</option>
                {GENEROS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección de tallas e insumos */}
          <div className="rounded-2xl border p-4" style={{ borderColor: "#eaecf0" }}>
            <h3
              className="mb-4 text-sm font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Insumos requeridos por talla
            </h3>

            {/* Agregar nueva talla */}
            <div className="mb-4 flex gap-2">
              <select
                value={nuevaTalla}
                onChange={(e) => setNuevaTalla(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "#d0d5dd" }}
              >
                <option value="">Talla predefinida...</option>
                {TALLAS_PREDEFINIDAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                {TALLAS_NUMERICAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={tallaPersonalizada}
                onChange={(e) => setTallaPersonalizada(e.target.value)}
                placeholder="O personalizada..."
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
                style={{ borderColor: "#d0d5dd" }}
              />
              <button
                type="button"
                onClick={agregarTalla}
                disabled={!nuevaTalla && !tallaPersonalizada.trim()}
                className="flex items-center gap-2 rounded-xl bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <Plus size={14} /> Agregar talla
              </button>
            </div>

            {/* Agregar insumo a talla */}
            {tallasUnicas.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2 rounded-xl border p-3" style={{ borderColor: "#f2f4f7" }}>
                <select
                  value={tallaParaInsumo}
                  onChange={(e) => setTallaParaInsumo(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "#d0d5dd" }}
                >
                  <option value="">Talla...</option>
                  {tallasUnicas.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <select
                  value={insumoSeleccionado}
                  onChange={(e) => setInsumoSeleccionado(Number(e.target.value) || "")}
                  className="min-w-[150px] rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "#d0d5dd" }}
                >
                  <option value="">Insumo...</option>
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre} ({i.unidadMedida})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  value={cantidadInsumo}
                  onChange={(e) => setCantidadInsumo(Number(e.target.value) || 0)}
                  placeholder="Cantidad"
                  min="0.01"
                  step="0.01"
                  className="w-24 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "#d0d5dd" }}
                />

                <button
                  type="button"
                  onClick={agregarInsumo}
                  disabled={!insumoSeleccionado || !tallaParaInsumo || cantidadInsumo <= 0}
                  className="flex items-center gap-2 rounded-lg bg-[#027a48] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  <Plus size={14} /> Agregar
                </button>
              </div>
            )}

            {/* Lista de insumos agrupados por talla */}
            <div className="space-y-4">
              {tallasUnicas.length === 0 ? (
                <p
                  className="text-center text-sm italic"
                  style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Agrega una talla y luego los insumos necesarios para fabricar la prenda.
                </p>
              ) : (
                tallasUnicas.map((talla) => (
                  <div
                    key={talla}
                    className="rounded-xl border p-3"
                    style={{ borderColor: "#f2f4f7", backgroundColor: "#f8fafc" }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Ruler size={14} style={{ color: "#1d4ed8" }} />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                      >
                        Talla {talla}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(insumosPorTallaAgrupados.get(talla) || []).map((insumo) => (
                        <div
                          key={insumo.id}
                          className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5"
                          style={{ borderColor: "#eaecf0" }}
                        >
                          <span className="text-sm">{insumo.nombreInsumo}</span>
                          <span className="text-xs text-gray-500">
                            {insumo.cantidadBase} {insumo.unidadMedida}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveInsumo(insumo.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:bg-[#f8fafc]"
            style={{ borderColor: "#d0d5dd", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={submitting}
            className="flex items-center gap-2 rounded-2xl bg-[#1d4ed8] px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-70"
            style={{ fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={16} /> {editingId ? "Guardar cambios" : "Crear uniforme"}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export default function UniformesClient() {
  const {
    uniformes,
    colegios,
    insumos,
    colegioSeleccionado,
    form,
    editingId,
    tallasUnicas,
    insumosPorTallaAgrupados,
    loading,
    loadingColegios,
    submitting,
    modalOpen,
    error,
    successMessage,
    seleccionarColegio,
    openCreateModal,
    openEditModal,
    closeModal,
    setFormField,
    addInsumoPorTalla,
    removeInsumoPorTalla,
    save,
    remove,
    clearMessages,
    reload,
  } = useUniformes();

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Filtrar uniformes
  const uniformesFiltrados = uniformes.filter((u) =>
    u.prenda.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    const success = await remove(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  return (
    <section className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div
        className="rounded-[28px] border px-6 py-6"
        style={{
          borderColor: "#dbeafe",
          background: "linear-gradient(135deg, rgba(29,78,216,0.10) 0%, rgba(15,23,42,0.06) 100%)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p
              className="text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: "#1d4ed8", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Catálogo de Uniformes
            </p>
            <h1
              className="mt-2 text-3xl font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Gestión de uniformes escolares
            </h1>
            <p
              className="mt-3 text-sm"
              style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Administra las prendas de cada colegio con sus insumos requeridos por talla.
              Selecciona un colegio para ver sus uniformes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading || !colegioSeleccionado}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: "#bfdbfe", backgroundColor: "#ffffff", color: "#1d4ed8" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Recargar
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
          >
            <TriangleAlert size={18} style={{ color: "#dc2626" }} />
            <p
              className="text-sm flex-1"
              style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {error}
            </p>
            <button onClick={clearMessages}>
              <X size={16} style={{ color: "#dc2626" }} />
            </button>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{ borderColor: "#abefc6", backgroundColor: "#ecfdf3" }}
          >
            <CheckCircle2 size={18} style={{ color: "#027a48" }} />
            <p
              className="text-sm flex-1"
              style={{ color: "#027a48", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              {successMessage}
            </p>
            <button onClick={clearMessages}>
              <X size={16} style={{ color: "#027a48" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector de colegio */}
      <div
        className="rounded-3xl border p-5"
        style={{
          borderColor: "#eaecf0",
          backgroundColor: "#ffffff",
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Seleccionar colegio
            </label>
            <div className="relative">
              <School2
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "#667085" }}
              />
              <select
                value={colegioSeleccionado || ""}
                onChange={(e) => seleccionarColegio(Number(e.target.value) || null)}
                disabled={loadingColegios}
                className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f8fafc]"
                style={{
                  borderColor: "#d0d5dd",
                  backgroundColor: "#ffffff",
                  color: "#101828",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                <option value="">
                  {loadingColegios ? "Cargando colegios..." : "Selecciona un colegio"}
                </option>
                {colegios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {colegioSeleccionado && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#1d4ed8", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              <Plus size={16} />
              Nuevo uniforme
            </button>
          )}
        </div>
      </div>

      {/* Tabla de uniformes */}
      {colegioSeleccionado ? (
        <div
          className="rounded-3xl border"
          style={{
            borderColor: "#eaecf0",
            backgroundColor: "#ffffff",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
          }}
        >
          {/* Toolbar */}
          <div
            className="flex flex-col gap-4 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: "#eaecf0" }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Uniformes del colegio
            </h2>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "#667085" }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full rounded-2xl border py-2.5 pl-11 pr-4 text-sm outline-none transition sm:w-64"
                style={{
                  borderColor: "#d0d5dd",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              />
            </div>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="animate-spin" style={{ color: "#1d4ed8" }} />
            </div>
          ) : uniformesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <Shirt size={28} style={{ color: "#9ca3af" }} />
              </div>
              <h3
                className="mt-4 text-lg font-semibold"
                style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                {searchTerm ? "No se encontraron resultados" : "No hay uniformes registrados"}
              </h3>
              <p
                className="mt-2 max-w-md text-sm"
                style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                {searchTerm
                  ? "Intenta con otro término de búsqueda"
                  : "Este colegio aún no tiene uniformes. Crea el primero haciendo clic en 'Nuevo uniforme'."}
              </p>
              {!searchTerm && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#1d4ed8] px-5 py-3 text-sm font-semibold text-white"
                >
                  <Plus size={16} /> Crear primer uniforme
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead style={{ backgroundColor: "#f8fafc" }}>
                  <tr>
                    {["Prenda", "Tipo", "Género", "Tallas", "Insumos", "Acciones"].map((label) => (
                      <th
                        key={label}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em]"
                        style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniformesFiltrados.map((uniforme) => (
                    <UniformeRow
                      key={uniforme.id}
                      uniforme={uniforme}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-16 text-center"
          style={{ borderColor: "#d0d5dd" }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <School2 size={28} style={{ color: "#9ca3af" }} />
          </div>
          <h3
            className="mt-4 text-lg font-semibold"
            style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Selecciona un colegio
          </h3>
          <p
            className="mt-2 max-w-md text-sm"
            style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Selecciona un colegio desde el selector de arriba para ver y gestionar sus uniformes.
          </p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <UniformeModal
            isOpen={modalOpen}
            onClose={closeModal}
            editingId={editingId}
            form={form}
            colegios={colegios}
            insumos={insumos}
            tallasUnicas={tallasUnicas}
            insumosPorTallaAgrupados={insumosPorTallaAgrupados}
            submitting={submitting}
            error={error}
            onSetField={setFormField}
            onAddInsumo={addInsumoPorTalla}
            onRemoveInsumo={removeInsumoPorTalla}
            onSave={save}
          />
        )}
      </AnimatePresence>

      {/* Confirmación de eliminación */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md rounded-2xl border bg-white p-6"
              style={{ borderColor: "#eaecf0" }}
            >
              <h3
                className="text-lg font-semibold"
                style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                ¿Eliminar uniforme?
              </h3>
              <p
                className="mt-2 text-sm"
                style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
              >
                Esta acción no se puede deshacer. El uniforme y todos sus insumos asociados se eliminarán permanentemente.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium"
                  style={{ borderColor: "#d0d5dd" }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
