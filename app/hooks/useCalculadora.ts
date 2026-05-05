"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { calculadoraService } from "@/app/services/calculadora.service";
import { colegiosService } from "@/app/services/colegios.service";
import { uniformeService } from "@/app/services/uniforme.service";
import type {
  ColegioOption,
  CalculadoraPedidoResponse,
  UniformeOption,
} from "@/app/types/calculadora";
import type { ColegioResponse, UniformeResumen } from "@/app/types/colegio";

export interface LineaPedido {
  key: string;
  uniformeId: number;
  prenda: string;
  genero: string | null;
  talla: string;
  cantidad: number;
}

interface FormState {
  colegioId: number | null;
  uniformeId: number | null;
  cantidad: number;
  talla: string;
}

const INITIAL_FORM: FormState = { colegioId: null, uniformeId: null, cantidad: 1, talla: "" };

export function useCalculadora() {
  const [colegios, setColegios] = useState<ColegioOption[]>([]);
  const [uniformes, setUniformes] = useState<UniformeOption[]>([]);
  const [tallasDisponibles, setTallasDisponibles] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [lineas, setLineas] = useState<LineaPedido[]>([]);
  const [resultado, setResultado] = useState<CalculadoraPedidoResponse | null>(null);
  const [loadingColegios, setLoadingColegios] = useState(true);
  const [loadingUniformes, setLoadingUniformes] = useState(false);
  const [loadingTallas, setLoadingTallas] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agregarError, setAgregarError] = useState<string | null>(null);

  const loadColegios = useCallback(async () => {
    setLoadingColegios(true);
    setError(null);
    try {
      const response = await colegiosService.listar({ size: 1000 });
      setColegios(response.content.map((c: ColegioResponse) => ({ id: String(c.id), nombre: c.nombre })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar los colegios.");
    } finally {
      setLoadingColegios(false);
    }
  }, []);

  useEffect(() => { void loadColegios(); }, [loadColegios]);

  const loadUniformes = useCallback(async (colegioId: number) => {
    setLoadingUniformes(true);
    try {
      const colegio = await colegiosService.obtenerPorId(colegioId);
      setUniformes(colegio.uniformes.map((u: UniformeResumen) => ({ id: u.id, prenda: u.prenda, talla: u.talla, genero: u.genero })));
    } catch { setUniformes([]); }
    finally { setLoadingUniformes(false); }
  }, []);

  const loadTallas = useCallback(async (uniformeId: number) => {
    setLoadingTallas(true);
    try {
      setTallasDisponibles(await uniformeService.listarTallas(uniformeId));
    } catch { setTallasDisponibles([]); }
    finally { setLoadingTallas(false); }
  }, []);

  const setColegio = useCallback((v: string) => {
    const id = v ? Number(v) : null;
    setForm({ ...INITIAL_FORM, colegioId: id });
    setUniformes([]); setTallasDisponibles([]);
    setResultado(null); setAgregarError(null); setError(null);
    if (id) void loadUniformes(id);
  }, [loadUniformes]);

  const setUniforme = useCallback((v: string) => {
    const id = v ? Number(v) : null;
    setForm(prev => ({ ...prev, uniformeId: id, talla: "" }));
    setTallasDisponibles([]); setAgregarError(null);
    if (id) void loadTallas(id);
  }, [loadTallas]);

  const setTalla = useCallback((talla: string) => {
    setForm(prev => ({ ...prev, talla })); setAgregarError(null);
  }, []);

  const setCantidad = useCallback((cantidad: number) => {
    setForm(prev => ({ ...prev, cantidad: Math.max(1, cantidad) })); setAgregarError(null);
  }, []);

  const agregarLinea = useCallback(() => {
    if (!form.uniformeId) { setAgregarError("Selecciona un uniforme."); return; }
    if (!form.talla) { setAgregarError("Selecciona una talla."); return; }
    if (form.cantidad < 1) { setAgregarError("La cantidad debe ser al menos 1."); return; }
    const key = `${form.uniformeId}-${form.talla}`;
    if (lineas.some(l => l.key === key)) { setAgregarError("Ya agregaste esta prenda con esta talla."); return; }
    const uniforme = uniformes.find(u => u.id === form.uniformeId);
    if (!uniforme) { setAgregarError("Uniforme no encontrado."); return; }
    setLineas(prev => [...prev, { key, uniformeId: form.uniformeId!, prenda: uniforme.prenda, genero: uniforme.genero, talla: form.talla, cantidad: form.cantidad }]);
    setForm(prev => ({ ...prev, uniformeId: null, talla: "", cantidad: 1 }));
    setUniformes([]); setTallasDisponibles([]);
    setAgregarError(null); setResultado(null);
    if (form.colegioId) void loadUniformes(form.colegioId);
  }, [form, lineas, uniformes, loadUniformes]);

  const quitarLinea = useCallback((key: string) => {
    setLineas(prev => prev.filter(l => l.key !== key)); setResultado(null);
  }, []);

  const calcularPedido = useCallback(async () => {
    if (lineas.length === 0) { setError("Agrega al menos una prenda para calcular."); return; }
    setCalculando(true); setError(null);
    try {
      const data = await calculadoraService.calcularPedido({
        prendas: lineas.map(l => ({ uniformeId: l.uniformeId, cantidad: l.cantidad, talla: l.talla })),
      });
      setResultado(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible calcular el pedido.");
    } finally { setCalculando(false); }
  }, [lineas]);

  const limpiar = useCallback(() => {
    setLineas([]); setResultado(null); setForm(INITIAL_FORM);
    setUniformes([]); setTallasDisponibles([]); setError(null); setAgregarError(null);
  }, []);

  const colegioSeleccionado = useMemo(() => colegios.find(c => Number(c.id) === form.colegioId) ?? null, [colegios, form.colegioId]);
  const uniformesUnicos = useMemo(() => { const m = new Map<number, UniformeOption>(); uniformes.forEach(u => { if (!m.has(u.id)) m.set(u.id, u); }); return Array.from(m.values()); }, [uniformes]);
  const isLineaValida = useMemo(() => form.colegioId !== null && form.uniformeId !== null && form.talla !== "" && form.cantidad >= 1, [form]);

  return {
    colegios, uniformes: uniformesUnicos, tallasDisponibles, colegioSeleccionado,
    formValues: { colegioId: form.colegioId ? String(form.colegioId) : "", uniformeId: form.uniformeId ? String(form.uniformeId) : "", cantidad: form.cantidad, talla: form.talla },
    lineas, resultado,
    loading: loadingColegios, loadingUniformes, loadingTallas, calculando,
    error, agregarError, isLineaValida,
    setColegio, setUniforme, setTalla, setCantidad,
    agregarLinea, quitarLinea, calcularPedido, limpiar,
    reload: loadColegios, clearError: () => setError(null),
  };
}
