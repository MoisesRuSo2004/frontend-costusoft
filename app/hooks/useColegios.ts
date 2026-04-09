"use client";

import { useState, useEffect, useCallback } from "react";
import { colegiosService } from "@/app/services/colegios.service";
import type { ColegioResponse, ColegioConUniformes, ColegioRequest } from "@/app/types/colegio";

interface State {
  colegios: ColegioResponse[];
  total: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: string | null;
}

export function useColegios(pageSize = 10) {
  const [state, setState] = useState<State>({
    colegios: [],
    total: 0,
    totalPages: 0,
    page: 0,
    loading: true,
    error: null,
  });

  const cargar = useCallback(async (page = 0) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await colegiosService.listar({ page, size: pageSize });
      setState({
        colegios: data.content,
        total: data.totalElements,
        totalPages: data.totalPages,
        page: data.number,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Error al cargar colegios",
      }));
    }
  }, [pageSize]);

  useEffect(() => { cargar(0); }, [cargar]);

  return {
    colegios: state.colegios,
    total: state.total,
    totalPages: state.totalPages,
    page: state.page,
    loading: state.loading,
    error: state.error,
    recargar: cargar,
  };
}

export function useColegiosCrud() {
  const [submitting, setSubmitting] = useState(false);
  const [detalle, setDetalle] = useState<ColegioConUniformes | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const crear = async (data: ColegioRequest): Promise<ColegioResponse> => {
    setSubmitting(true);
    try {
      return await colegiosService.crear(data);
    } finally {
      setSubmitting(false);
    }
  };

  const actualizar = async (id: number, data: ColegioRequest): Promise<ColegioResponse> => {
    setSubmitting(true);
    try {
      return await colegiosService.actualizar(id, data);
    } finally {
      setSubmitting(false);
    }
  };

  const eliminar = async (id: number): Promise<void> => {
    setSubmitting(true);
    try {
      await colegiosService.eliminar(id);
    } finally {
      setSubmitting(false);
    }
  };

  const cargarDetalle = async (id: number) => {
    setLoadingDetalle(true);
    try {
      const data = await colegiosService.obtenerPorId(id);
      setDetalle(data);
    } finally {
      setLoadingDetalle(false);
    }
  };

  return { submitting, detalle, loadingDetalle, crear, actualizar, eliminar, cargarDetalle, limpiarDetalle: () => setDetalle(null) };
}
