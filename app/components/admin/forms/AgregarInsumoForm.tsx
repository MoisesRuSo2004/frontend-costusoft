"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, ArrowLeft, RotateCcw, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { insumoService } from "@/app/services/insumo.service";

const UNIDADES = [
  "Unidades", "Metros", "Centímetros", "Kilogramos", "Gramos",
  "Litros", "Mililitros", "Metros cuadrados", "Rollos", "Cajas", "Conos",
];

const TIPOS = [
  "Tela", "Hilo", "Cierre", "Botón", "Forro", "Herraje", "Empaque",
  "Material", "Accesorio", "Insumo", "Otros",
];

interface Form {
  nombre: string;
  stock: string;
  stockMinimo: string;
  unidadMedida: string;
  tipo: string;
}

const EMPTY: Form = { nombre: "", stock: "0", stockMinimo: "0", unidadMedida: "Metros", tipo: "Tela" };

const lbl: React.CSSProperties = { display: "block", marginBottom: 6, fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" };
function inp(err?: string): React.CSSProperties {
  return { width: "100%", padding: "11px 14px", border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`, borderRadius: 10, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: "#111827", outline: "none", backgroundColor: "#fff", boxSizing: "border-box", transition: "border-color 0.2s" };
}

export default function AgregarInsumoForm() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      await insumoService.crear({
        nombre: form.nombre.trim(),
        stock: Number(form.stock),
        unidadMedida: form.unidadMedida,
        tipo: form.tipo,
        stockMinimo: Number(form.stockMinimo),
      });
      setSuccess(true);
      setTimeout(() => router.push("/inventario"), 1800);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Error al guardar el insumo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/inventario" className="inline-flex items-center gap-1.5 text-sm font-medium transition"
          style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#0b3d91")} onMouseLeave={e => (e.currentTarget.style.color = "#667085")}>
          <ArrowLeft size={15} /> Inventario
        </Link>
        <span style={{ color: "#d0d5dd" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>Nuevo Insumo</span>
      </div>

      {/* Header */}
      <div className="rounded-[28px] border px-6 py-5"
        style={{ borderColor: "#dbe4ff", background: "linear-gradient(135deg, rgba(11,61,145,0.07) 0%, rgba(73,194,27,0.07) 100%)" }}>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(11,61,145,0.10)" }}>
            <Archive size={22} style={{ color: "#0b3d91" }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>Registrar nuevo insumo</h1>
            <p className="mt-0.5 text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>Define el nombre, unidad de medida y stock inicial.</p>
          </div>
        </div>
      </div>

      {/* Success */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" }}>
            <CheckCircle2 size={18} style={{ color: "#16a34a" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#15803d", fontFamily: "'Poppins', sans-serif" }}>¡Insumo guardado correctamente!</p>
              <p className="text-xs" style={{ color: "#86efac", fontFamily: "'Poppins', sans-serif" }}>Redirigiendo al inventario…</p>
            </div>
          </motion.div>
        )}
        {apiError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
            <AlertCircle size={18} style={{ color: "#dc2626" }} />
            <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{apiError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-3xl border p-6" style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 2px 20px rgba(15,23,42,0.05)" }}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label style={lbl}>Nombre del insumo <span style={{ color: "#ef4444" }}>*</span></label>
              <input value={form.nombre} onChange={set("nombre")} placeholder="Ej. Tela Popelina Azul" style={inp(errors.nombre)}
                onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.nombre ? "#fca5a5" : "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
              {errors.nombre && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>{errors.nombre}</p>}
            </div>

            {/* Tipo */}
            <div>
              <label style={lbl}>Tipo de insumo <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={form.tipo} onChange={set("tipo")} style={{ ...inp(errors.tipo), cursor: "pointer" }}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.tipo && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>{errors.tipo}</p>}
            </div>

            {/* Unidad de Medida */}
            <div>
              <label style={lbl}>Unidad de medida <span style={{ color: "#ef4444" }}>*</span></label>
              <select value={form.unidadMedida} onChange={set("unidadMedida")} style={{ ...inp(errors.unidadMedida), cursor: "pointer" }}>
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.unidadMedida && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>{errors.unidadMedida}</p>}
            </div>

            {/* Stock */}
            <div>
              <label style={lbl}>Stock inicial <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="number" min={0} value={form.stock} onChange={set("stock")} style={inp(errors.stock)}
                onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.stock ? "#fca5a5" : "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
              {errors.stock && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>{errors.stock}</p>}
            </div>

            {/* Stock Mínimo */}
            <div>
              <label style={lbl}>Stock mínimo <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="number" min={0} value={form.stockMinimo} onChange={set("stockMinimo")} style={inp(errors.stockMinimo)}
                onFocus={e => { e.currentTarget.style.borderColor = "#0b3d91"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,61,145,0.10)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.stockMinimo ? "#fca5a5" : "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }} />
              <p className="mt-1 text-xs" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>Cuando el stock baje de este valor, aparecerá una alerta.</p>
              {errors.stockMinimo && <p className="mt-1 text-xs" style={{ color: "#dc2626", fontFamily: "'Poppins', sans-serif" }}>{errors.stockMinimo}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3 border-t pt-5" style={{ borderColor: "#f0f0f4" }}>
            <button type="button" onClick={() => { setForm(EMPTY); setErrors({}); setApiError(""); }}
              className="inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium transition"
              style={{ borderColor: "#d0d5dd", color: "#374151", fontFamily: "'Poppins', sans-serif" }}>
              <RotateCcw size={14} /> Limpiar
            </button>
            <button type="submit" disabled={loading || success}
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold text-white transition"
              style={{ backgroundColor: loading ? "#3aad17" : "#49c21b", fontFamily: "'Poppins', sans-serif", cursor: loading ? "not-allowed" : "pointer", opacity: success ? 0.7 : 1 }}>
              <Save size={14} /> {loading ? "Guardando..." : "Guardar insumo"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
