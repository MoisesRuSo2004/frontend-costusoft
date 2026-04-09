"use client";

import { Building2, MapPin, Shirt, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useColegios } from "@/app/hooks/useColegios";

export default function ColegiosView() {
  const { colegios, total, loading, error, recargar, page } = useColegios(20);

  return (
    <section className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="rounded-[28px] border px-6 py-6"
        style={{ borderColor: "#dbeafe", background: "linear-gradient(135deg, rgba(29,78,216,0.10) 0%, rgba(15,23,42,0.06) 100%)" }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#1d4ed8", fontFamily: "'Poppins', sans-serif" }}>
              Gestión
            </p>
            <h1 className="mt-2 text-2xl font-semibold" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
              Colegios registrados
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#475467", fontFamily: "'Poppins', sans-serif" }}>
              {total} colegio{total !== 1 ? "s" : ""} en el sistema
            </p>
          </div>
          <button onClick={() => recargar(page)}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition"
            style={{ borderColor: "#bfdbfe", backgroundColor: "#fff", color: "#1d4ed8", fontFamily: "'Poppins', sans-serif", cursor: "pointer" }}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Recargar
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border px-5 py-4"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
          <AlertCircle size={16} style={{ color: "#dc2626" }} />
          <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader2 size={20} className="animate-spin" style={{ color: "#1d4ed8" }} />
          <p className="text-sm" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>Cargando colegios…</p>
        </div>
      )}

      {/* Grid de colegios */}
      {!loading && colegios.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Building2 size={40} style={{ color: "#d1d5db" }} />
          <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>No hay colegios registrados.</p>
        </div>
      )}

      {!loading && colegios.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {colegios.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: "#eaecf0", backgroundColor: "#fff", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: "#eff6ff" }}>
                  <Building2 size={18} style={{ color: "#1d4ed8" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}>
                    {c.nombre}
                  </p>
                  {c.direccion ? (
                    <div className="mt-1 flex items-center gap-1">
                      <MapPin size={11} style={{ color: "#9ca3af", flexShrink: 0 }} />
                      <p className="text-xs truncate" style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}>
                        {c.direccion}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs" style={{ color: "#d1d5db" }}>Sin dirección</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid #f3f4f6" }}>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: c.totalUniformes > 0 ? "#1d4ed8" : "#9ca3af" }}>
                  <Shirt size={12} />
                  {c.totalUniformes} uniforme{c.totalUniformes !== 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
