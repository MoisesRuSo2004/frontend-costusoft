"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ArrowDownToLine, ArrowUpFromLine, Search, RefreshCw,
  Package, AlertCircle, X, ChevronLeft, ChevronRight, SlidersHorizontal,
  Trash2, Edit3, CheckCircle2, PowerOff, Power,
} from "lucide-react";
import { useInsumos } from "@/app/hooks/useInsumos";
import type { InsumoResponse } from "@/app/types/insumo";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function estadoStock(insumo: InsumoResponse): "Disponible" | "Stock bajo" | "Sin stock" {
  if (insumo.stock <= 0) return "Sin stock";
  if (insumo.stock <= insumo.stockMinimo) return "Stock bajo";
  return "Disponible";
}

function getRiesgoColor(riesgo?: string): string {
  if (!riesgo) return "#9ca3af";
  const r = riesgo.toLowerCase();
  if (r === "alto" || r === "critical") return "#dc2626";
  if (r === "medio" || r === "warning") return "#f59e0b";
  return "#16a34a";
}

const ESTADO_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  "Disponible":  { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  "Stock bajo":  { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b" },
  "Sin stock":   { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
};

function StockBadge({ insumo }: { insumo: InsumoResponse }) {
  const estado = estadoStock(insumo);
  const st = ESTADO_STYLE[estado];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: st.bg, color: st.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
      {estado}
    </span>
  );
}

// ─── Modal Ajuste Stock ───────────────────────────────────────────────────────

function AjusteStockModal({ insumo, onClose, onConfirm, saving }: {
  insumo: InsumoResponse;
  onClose: () => void;
  onConfirm: (nuevoStock: number) => void;
  saving: boolean;
}) {
  const [valor, setValor] = useState(String(insumo.stock));
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm rounded-3xl border p-6"
        style={{ backgroundColor: "#fff", borderColor: "#eaecf0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
            Ajustar stock
          </h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl transition"
            style={{ color: "#9ca3af" }} onMouseEnter={e => (e.currentTarget.style.color = "#374151")} onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>
            <X size={16} />
          </button>
        </div>
        <p className="mb-1 text-sm font-medium" style={{ color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}>
          {insumo.nombre}
        </p>
        <p className="mb-4 text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
          Stock actual: <strong>{insumo.stock}</strong> {insumo.unidadMedida} · Mínimo: {insumo.stockMinimo}
        </p>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
          Nuevo stock ({insumo.unidadMedida})
        </label>
        <input ref={inputRef} type="number" min={0} value={valor} onChange={e => setValor(e.target.value)}
          className="mb-5 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
          style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }} />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border py-2.5 text-sm font-medium transition"
            style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}>
            Cancelar
          </button>
          <button onClick={() => onConfirm(Number(valor))} disabled={saving || valor === ""}
            className="flex-1 rounded-2xl py-2.5 text-sm font-semibold text-white transition"
            style={{ backgroundColor: saving ? "#3aad17" : "#49c21b", fontFamily: "var(--font-poppins), sans-serif", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Guardando..." : "Confirmar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Modal Eliminar ───────────────────────────────────────────────────────────

function EliminarModal({ nombre, onClose, onConfirm, saving }: {
  nombre: string; onClose: () => void; onConfirm: () => void; saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm rounded-3xl border p-6"
        style={{ backgroundColor: "#fff", borderColor: "#eaecf0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "#fef2f2" }}>
          <Trash2 size={20} style={{ color: "#dc2626" }} />
        </div>
        <h3 className="mb-2 text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
          Eliminar insumo
        </h3>
        <p className="mb-5 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
          ¿Seguro que quieres eliminar <strong>"{nombre}"</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border py-2.5 text-sm font-medium"
            style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={saving}
            className="flex-1 rounded-2xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#dc2626", fontFamily: "var(--font-poppins), sans-serif", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Modal Inhabilitar (cuando tiene movimientos) ─────────────────────────────

function InhabilitarModal({ nombre, onClose, onConfirm, saving }: {
  nombre: string; onClose: () => void; onConfirm: () => void; saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm rounded-3xl border p-6"
        style={{ backgroundColor: "#fff", borderColor: "#eaecf0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "#fff7ed" }}>
          <PowerOff size={20} style={{ color: "#ea580c" }} />
        </div>
        <h3 className="mb-1 text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
          No se puede eliminar
        </h3>
        <p className="mb-3 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
          <strong>"{nombre}"</strong> tiene movimientos registrados (entradas o salidas) y no puede eliminarse para preservar el historial.
        </p>
        <div className="mb-5 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: "#fed7aa", backgroundColor: "#fff7ed", color: "#9a3412", fontFamily: "var(--font-poppins), sans-serif" }}>
          ¿Deseas <strong>inhabilitarlo</strong> en su lugar? Quedará inactivo y no aparecerá en autocompletados ni alertas, pero el historial se conserva.
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border py-2.5 text-sm font-medium"
            style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={saving}
            className="flex-1 rounded-2xl py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: saving ? "#d97706" : "#ea580c", fontFamily: "var(--font-poppins), sans-serif", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Inhabilitando..." : "Inhabilitar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const UNIDADES = [
  "Unidades", "Metros", "Centímetros", "Kilogramos", "Gramos",
  "Litros", "Mililitros", "Metros cuadrados", "Rollos", "Cajas", "Conos",
];

const TIPOS = [
  "Tela", "Hilo", "Cierre", "Botón", "Forro", "Herraje", "Empaque",
  "Material", "Accesorio", "Insumo", "Otros",
];

// ─── Modal Editar Insumo ──────────────────────────────────────────────────────────────────────

function EditarInsumoModal({ insumo, onClose, onConfirm, saving }: {
  insumo: InsumoResponse;
  onClose: () => void;
  onConfirm: (data: { nombre: string; stock: number; unidadMedida: string; tipo: string; stockMinimo: number }) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    nombre: insumo.nombre,
    stock: String(insumo.stock),
    unidadMedida: insumo.unidadMedida || "Unidades",
    tipo: insumo.tipo || "Tela",
    stockMinimo: String(insumo.stockMinimo),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { firstInputRef.current?.focus(); }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = "Requerido";
    if (!form.tipo) errs.tipo = "Requerido";
    if (!form.unidadMedida) errs.unidadMedida = "Requerido";
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) errs.stock = "Inválido";
    if (isNaN(Number(form.stockMinimo)) || Number(form.stockMinimo) < 0) errs.stockMinimo = "Inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onConfirm({
      nombre: form.nombre.trim(),
      stock: Number(form.stock),
      unidadMedida: form.unidadMedida,
      tipo: form.tipo,
      stockMinimo: Number(form.stockMinimo),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-lg rounded-3xl border p-6"
        style={{ backgroundColor: "#fff", borderColor: "#eaecf0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Editar insumo
            </h3>
            <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
              ID: {insumo.id}
            </p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl transition"
            style={{ color: "#9ca3af" }} onMouseEnter={e => (e.currentTarget.style.color = "#374151")} onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Nombre <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input ref={firstInputRef} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition"
              style={{ borderColor: errors.nombre ? "#fca5a5" : "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = errors.nombre ? "#fca5a5" : "#d0d5dd"; e.currentTarget.style.boxShadow = "none"; }} />
            {errors.nombre && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "var(--font-poppins), sans-serif" }}>{errors.nombre}</p>}
          </div>

          {/* Tipo */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Tipo <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              className="w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition"
              style={{ borderColor: errors.tipo ? "#fca5a5" : "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.tipo && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "var(--font-poppins), sans-serif" }}>{errors.tipo}</p>}
          </div>

          {/* Unidad de Medida */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Unidad de medida <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select value={form.unidadMedida} onChange={e => setForm(f => ({ ...f, unidadMedida: e.target.value }))}
              className="w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition"
              style={{ borderColor: errors.unidadMedida ? "#fca5a5" : "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {errors.unidadMedida && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "var(--font-poppins), sans-serif" }}>{errors.unidadMedida}</p>}
          </div>

          {/* Stock */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Stock <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              className="w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition"
              style={{ borderColor: errors.stock ? "#fca5a5" : "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = errors.stock ? "#fca5a5" : "#d0d5dd"; e.currentTarget.style.boxShadow = "none"; }} />
            {errors.stock && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "var(--font-poppins), sans-serif" }}>{errors.stock}</p>}
          </div>

          {/* Stock Mínimo */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Stock mínimo <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input type="number" min={0} value={form.stockMinimo} onChange={e => setForm(f => ({ ...f, stockMinimo: e.target.value }))}
              className="w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition"
              style={{ borderColor: errors.stockMinimo ? "#fca5a5" : "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = errors.stockMinimo ? "#fca5a5" : "#d0d5dd"; e.currentTarget.style.boxShadow = "none"; }} />
            {errors.stockMinimo && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "var(--font-poppins), sans-serif" }}>{errors.stockMinimo}</p>}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border py-2.5 text-sm font-medium transition"
            style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 rounded-2xl py-2.5 text-sm font-semibold text-white transition"
            style={{ backgroundColor: saving ? "#3aad17" : "#0b3d91", fontFamily: "var(--font-poppins), sans-serif", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Paginación ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t px-2 pt-4" style={{ borderColor: "#f0f0f4" }}>
      <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
        Página {page + 1} de {totalPages}
      </span>
      <div className="flex gap-2">
        <button onClick={() => onChange(page - 1)} disabled={page === 0}
          className="flex h-8 w-8 items-center justify-center rounded-xl border transition disabled:opacity-40"
          style={{ borderColor: "#e5e7eb", color: "#374151" }}>
          <ChevronLeft size={15} />
        </button>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}
          className="flex h-8 w-8 items-center justify-center rounded-xl border transition disabled:opacity-40"
          style={{ borderColor: "#e5e7eb", color: "#374151" }}>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InventarioClient() {
  const { data, stockBajo, loading, saving, error, successMsg, page, setPage, search, buscar, reload, ajustarStock, actualizar, eliminar, inhabilitar, clearMessages } = useInsumos();
  const [searchInput, setSearchInput] = useState("");
  const [ajusteInsumo, setAjusteInsumo] = useState<InsumoResponse | null>(null);
  const [editarInsumo, setEditarInsumo] = useState<InsumoResponse | null>(null);
  const [deleteInsumo, setDeleteInsumo] = useState<InsumoResponse | null>(null);
  const [inhabilitarInsumo, setInhabilitarInsumo] = useState<InsumoResponse | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  const handleSearch = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => buscar(val), 400);
  };

  const insumos = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // KPIs
  const sinStock = insumos.filter(i => i.stock <= 0).length;
  const conStockBajo = stockBajo.length;

  return (
    <section className="flex flex-col gap-6 pb-10">

      {/* Header */}
      <div className="rounded-[28px] border px-6 py-5"
        style={{ borderColor: "#dbe4ff", background: "linear-gradient(135deg, rgba(11,61,145,0.07) 0%, rgba(73,194,27,0.07) 100%)" }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#0b3d91", fontFamily: "var(--font-poppins), sans-serif" }}>
              Gestión
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold" style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
              Inventario de Insumos
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
              Gestiona el stock, registra entradas y salidas del almacén.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/inventario/add" className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition"
              style={{ backgroundColor: "#0b3d91", fontFamily: "var(--font-poppins), sans-serif" }}>
              <Plus size={15} /> Nuevo Insumo
            </Link>
            <Link href="/entradas/add" className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition"
              style={{ borderColor: "#49c21b", color: "#49c21b", fontFamily: "var(--font-poppins), sans-serif" }}>
              <ArrowDownToLine size={15} /> Nueva Entrada
            </Link>
            <Link href="/salidas/add" className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition"
              style={{ borderColor: "#f59e0b", color: "#b45309", fontFamily: "var(--font-poppins), sans-serif" }}>
              <ArrowUpFromLine size={15} /> Nueva Salida
            </Link>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total insumos", value: totalElements, color: "#0b3d91", bg: "rgba(11,61,145,0.08)" },
          { label: "Disponibles", value: insumos.filter(i => estadoStock(i) === "Disponible").length, color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
          { label: "Stock bajo", value: conStockBajo, color: "#b45309", bg: "rgba(180,83,9,0.08)" },
          { label: "Sin stock", value: sinStock, color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-3xl border p-4" style={{ borderColor: "#eaecf0", backgroundColor: "#fff" }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: kpi.color, fontFamily: "var(--font-poppins), sans-serif" }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Mensajes */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}>
            <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
            <p className="flex-1 text-sm" style={{ color: "#15803d", fontFamily: "var(--font-poppins), sans-serif" }}>{successMsg}</p>
            <button onClick={clearMessages}><X size={14} style={{ color: "#86efac" }} /></button>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-4 py-3"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
            <AlertCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
            <p className="flex-1 text-sm" style={{ color: "#b42318", fontFamily: "var(--font-poppins), sans-serif" }}>{error}</p>
            <button onClick={clearMessages}><X size={14} style={{ color: "#fca5a5" }} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla */}
      <div className="rounded-3xl border" style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}>
        {/* Search bar */}
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "#f0f0f4" }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
            <input value={searchInput} onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar insumo por nombre..."
              className="w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm outline-none"
              style={{ borderColor: "#d0d5dd", color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }} />
          </div>
          <button onClick={reload} className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition"
            style={{ borderColor: "#e5e7eb", color: "#374151", fontFamily: "var(--font-poppins), sans-serif" }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>

        {/* Table */}
        {loading && !data ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl" style={{ backgroundColor: "#f3f4f6" }} />
            ))}
          </div>
        ) : insumos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package size={40} style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
              {search ? `Sin resultados para "${search}"` : "No hay insumos registrados"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f0f4" }}>
                  {["#", "Nombre", "Tipo", "Unidad", "Stock", "Mínimo", "Estado", "Acciones"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {insumos.map((insumo, idx) => {
                  const inactivo = insumo.activo === false;
                  return (
                  <tr key={insumo.id}
                    style={{ borderBottom: "1px solid #f9fafb", opacity: inactivo ? 0.55 : 1 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <td className="px-5 py-4 text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {page * 10 + idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0"
                          style={{ backgroundColor: inactivo ? "rgba(156,163,175,0.12)" : "rgba(11,61,145,0.08)" }}>
                          <Package size={14} style={{ color: inactivo ? "#9ca3af" : "#0b3d91" }} />
                        </div>
                        <div>
                          <span className="text-sm font-medium" style={{ color: inactivo ? "#9ca3af" : "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                            {insumo.nombre}
                          </span>
                          {inactivo && (
                            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>
                              INACTIVO
                            </span>
                          )}
                          {!inactivo && insumo.riesgo && (
                            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: getRiesgoColor(insumo.riesgo) + "20", color: getRiesgoColor(insumo.riesgo) }}>
                              {insumo.riesgo.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>{insumo.tipo || "—"}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#475467", fontFamily: "var(--font-poppins), sans-serif" }}>{insumo.unidadMedida}</td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: inactivo ? "#9ca3af" : insumo.stock <= 0 ? "#dc2626" : insumo.stock <= insumo.stockMinimo ? "#b45309" : "#101828", fontFamily: "var(--font-poppins), sans-serif" }}>
                      {insumo.stock}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>{insumo.stockMinimo}</td>
                    <td className="px-5 py-4">
                      {inactivo
                        ? <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#9ca3af" }} />Inactivo
                          </span>
                        : <StockBadge insumo={insumo} />
                      }
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditarInsumo(insumo)} title="Editar insumo"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border transition"
                          style={{ borderColor: "#e5e7eb", color: "#374151" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.color = "#0b3d91"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}>
                          <Edit3 size={13} />
                        </button>
                        {!inactivo && (
                          <button onClick={() => setAjusteInsumo(insumo)} title="Ajustar stock"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border transition"
                            style={{ borderColor: "#e5e7eb", color: "#374151" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#49c21b"; e.currentTarget.style.color = "#49c21b"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}>
                            <RefreshCw size={13} />
                          </button>
                        )}
                        {inactivo ? (
                          <button onClick={() => setInhabilitarInsumo(insumo)} title="Reactivar insumo"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border transition"
                            style={{ borderColor: "#e5e7eb", color: "#374151" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#bbf7d0"; e.currentTarget.style.color = "#16a34a"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}>
                            <Power size={13} />
                          </button>
                        ) : (
                          <button onClick={() => setDeleteInsumo(insumo)} title="Eliminar"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border transition"
                            style={{ borderColor: "#e5e7eb", color: "#374151" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#fecaca"; e.currentTarget.style.color = "#dc2626"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-5">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editarInsumo && (
          <EditarInsumoModal
            insumo={editarInsumo}
            saving={saving}
            onClose={() => setEditarInsumo(null)}
            onConfirm={async (data) => {
              await actualizar(editarInsumo.id, data);
              setEditarInsumo(null);
            }}
          />
        )}
        {ajusteInsumo && (
          <AjusteStockModal
            insumo={ajusteInsumo}
            saving={saving}
            onClose={() => setAjusteInsumo(null)}
            onConfirm={async (nuevoStock) => {
              await ajustarStock(ajusteInsumo.id, { nuevoStock });
              setAjusteInsumo(null);
            }}
          />
        )}
        {deleteInsumo && (
          <EliminarModal
            nombre={deleteInsumo.nombre}
            saving={saving}
            onClose={() => setDeleteInsumo(null)}
            onConfirm={async () => {
              const target = deleteInsumo;
              const result = await eliminar(target.id);
              if (result === "HAS_MOVEMENTS") {
                setDeleteInsumo(null);
                setInhabilitarInsumo(target);
              } else {
                setDeleteInsumo(null);
              }
            }}
          />
        )}
        {inhabilitarInsumo && (
          <InhabilitarModal
            nombre={inhabilitarInsumo.nombre}
            saving={saving}
            onClose={() => setInhabilitarInsumo(null)}
            onConfirm={async () => {
              await inhabilitar(inhabilitarInsumo.id);
              setInhabilitarInsumo(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
