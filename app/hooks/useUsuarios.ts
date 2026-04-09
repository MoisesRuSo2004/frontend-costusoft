"use client";

import { useState, useEffect, useCallback } from "react";
import { usuarioService } from "@/app/services/usuario.service";
import type {
  UsuarioResponse,
  UsuarioCreateRequest,
  UsuarioUpdateRequest,
  ChangePasswordRequest,
} from "@/app/types/usuario";

export function useUsuarios(pageSize = 10) {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (p = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuarioService.listar({ page: p, size: pageSize });
      setUsuarios(data.content);
      setTotal(data.totalElements);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => { cargar(0); }, [cargar]);

  return { usuarios, total, totalPages, page, loading, error, recargar: cargar };
}

export function useUsuariosCrud() {
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const crear = async (data: UsuarioCreateRequest): Promise<UsuarioResponse> => {
    setSubmitting(true);
    try { return await usuarioService.crear(data); }
    finally { setSubmitting(false); }
  };

  const actualizar = async (id: number, data: UsuarioUpdateRequest): Promise<UsuarioResponse> => {
    setSubmitting(true);
    try { return await usuarioService.actualizar(id, data); }
    finally { setSubmitting(false); }
  };

  const eliminar = async (id: number): Promise<void> => {
    setSubmitting(true);
    try { await usuarioService.eliminar(id); }
    finally { setSubmitting(false); }
  };

  const toggleActivo = async (id: number): Promise<UsuarioResponse> => {
    setToggling(id);
    try { return await usuarioService.toggleActivo(id); }
    finally { setToggling(null); }
  };

  const cambiarPassword = async (data: ChangePasswordRequest): Promise<void> => {
    setSubmitting(true);
    try { await usuarioService.cambiarPassword(data); }
    finally { setSubmitting(false); }
  };

  return { submitting, toggling, crear, actualizar, eliminar, toggleActivo, cambiarPassword };
}
