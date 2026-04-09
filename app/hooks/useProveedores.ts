"use client";

import { useState, useEffect, useCallback } from "react";
import { proveedorService } from "@/app/services/proveedor.service";
import type {
  ProveedorResponse,
  ProveedorRequest,
} from "@/app/types/proveedor";

export function useProveedores(pageSize = 10) {
  const [proveedores, setProveedores] = useState<ProveedorResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (p = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await proveedorService.listar({ page: p, size: pageSize });
      setProveedores(data.content);
      setTotal(data.totalElements);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => { cargar(0); }, [cargar]);

  return { proveedores, total, totalPages, page, loading, error, recargar: cargar };
}

export function useProveedoresCrud() {
  const [submitting, setSubmitting] = useState(false);

  const crear = async (data: ProveedorRequest): Promise<ProveedorResponse> => {
    setSubmitting(true);
    try { return await proveedorService.crear(data); }
    finally { setSubmitting(false); }
  };

  const actualizar = async (id: number, data: ProveedorRequest): Promise<ProveedorResponse> => {
    setSubmitting(true);
    try { return await proveedorService.actualizar(id, data); }
    finally { setSubmitting(false); }
  };

  const eliminar = async (id: number): Promise<void> => {
    setSubmitting(true);
    try { await proveedorService.eliminar(id); }
    finally { setSubmitting(false); }
  };

  return { submitting, crear, actualizar, eliminar };
}
