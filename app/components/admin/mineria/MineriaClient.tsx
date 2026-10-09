"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, ChartLine, Radar, ShieldAlert } from "lucide-react";
import AnomaliasMovimientos from "./AnomaliasMovimientos";
import PronosticoDinamico from "./PronosticoDinamico";
import PrediccionClient from "@/app/components/admin/prediccion/PrediccionClient";

const FUENTE = "'Poppins', sans-serif";

type Pestana = "pronostico" | "anomalias" | "riesgo";

const PESTANAS: { id: Pestana; etiqueta: string; detalle: string; icono: React.ReactNode }[] = [
  { id: "pronostico", etiqueta: "Pronóstico dinámico", detalle: "Elige qué predecir y simula pedidos", icono: <ChartLine size={16} /> },
  { id: "anomalias", etiqueta: "Anomalías", detalle: "Movimientos fuera de lo habitual", icono: <Radar size={16} /> },
  { id: "riesgo", etiqueta: "Riesgo de agotamiento", detalle: "Todos los insumos · Prophet + XGBoost", icono: <ShieldAlert size={16} /> },
];

/**
 * Minería de datos: el análisis de consumo de insumos con modelos de
 * aprendizaje automático, calculado por el microservicio Python.
 */
export default function MineriaClient() {
  const [pestana, setPestana] = useState<Pestana>("pronostico");
  // Cada pestaña se monta al visitarla por primera vez y luego solo se oculta:
  // se conserva lo que el usuario eligió y la tabla de riesgo (pesada) no se
  // carga hasta que alguien la abre.
  const [visitadas, setVisitadas] = useState<Set<Pestana>>(() => new Set(["pronostico"]));

  const abrir = (id: Pestana) => {
    setPestana(id);
    setVisitadas((v) => (v.has(id) ? v : new Set(v).add(id)));
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <header className="rounded-[28px] border px-6 py-5"
        style={{ borderColor: "#e4dcff", background: "linear-gradient(135deg, rgba(11,61,145,0.06) 0%, rgba(124,58,237,0.09) 100%)" }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(124,58,237,0.12)" }}>
            <Brain size={24} style={{ color: "#7c3aed" }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#101828", fontFamily: FUENTE }}>Minería de datos</h1>
            <p className="mt-0.5 text-sm" style={{ color: "#667085", fontFamily: FUENTE }}>
              Pronóstico, anomalías y riesgo de agotamiento a partir del historial de movimientos
            </p>
          </div>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Secciones de minería de datos">
          {PESTANAS.map((p) => {
            const activa = pestana === p.id;
            return (
              <button key={p.id} type="button" role="tab" aria-selected={activa} onClick={() => abrir(p.id)}
                className="relative flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-left transition-colors"
                style={{ fontFamily: FUENTE, color: activa ? "#5b21b6" : "#475467" }}>
                {activa && (
                  <motion.span layoutId="pestana-mineria" className="absolute inset-0 rounded-2xl"
                    style={{ backgroundColor: "#fff", boxShadow: "0 2px 10px rgba(91,33,182,0.12)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative" style={{ color: activa ? "#7c3aed" : "#98a2b3" }}>{p.icono}</span>
                <span className="relative">
                  <span className="block text-[13.5px] font-semibold leading-tight">{p.etiqueta}</span>
                  <span className="block text-[11px] leading-tight" style={{ color: "#98a2b3" }}>{p.detalle}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {PESTANAS.filter((p) => visitadas.has(p.id)).map((p) => (
        <motion.div key={p.id} role="tabpanel" hidden={pestana !== p.id}
          initial={false} animate={pestana === p.id ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}>
          {p.id === "pronostico" && <PronosticoDinamico />}
          {p.id === "anomalias" && <AnomaliasMovimientos />}
          {p.id === "riesgo" && <PrediccionClient embebido />}
        </motion.div>
      ))}
    </div>
  );
}
