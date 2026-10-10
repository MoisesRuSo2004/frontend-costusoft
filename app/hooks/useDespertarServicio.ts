"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Despierta un microservicio alojado en Render (plan gratuito).
 *
 * Tras unos minutos sin uso, Render duerme el servicio y el primer pedido
 * tarda 30–60 s en arrancarlo; a veces responde con error mientras arranca.
 * Este hook consulta el estado (vía backend) y, si no está activo, reintenta
 * cada pocos segundos hasta `limiteSegundos`, contando el tiempo transcurrido.
 * Arranca solo al montar el componente; `reintentar()` vuelve a empezar.
 *
 * Solo se reintenta lo que se arregla esperando (red caída, 5xx mientras el
 * servidor arranca). Un 401/403 no es un servicio dormido: se detiene y se
 * informa (estado "error" con su mensaje).
 */

export type EstadoServicio = "verificando" | "despertando" | "activo" | "inactivo" | "error";

/** Errores que no se arreglan esperando: la sesión o los permisos. */
function mensajeSinReintento(err: unknown): string | null {
  const status = (err as { status?: number } | null)?.status;
  if (status === 401) return "Tu sesión expiró. Vuelve a iniciar sesión.";
  if (status === 403) return "Tu usuario no tiene permiso para usar este módulo.";
  return null;
}

const PAUSA_MS = 4_000;

export function useDespertarServicio(
  consultarEstado: () => Promise<boolean>,
  { limiteSegundos = 150, alActivarse }: { limiteSegundos?: number; alActivarse?: () => void } = {},
) {
  const [estado, setEstado] = useState<EstadoServicio>("verificando");
  const [segundos, setSegundos] = useState(0);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const intento = useRef(0); // cada llamada a despertar() invalida las anteriores
  const desmontado = useRef(false);
  // Referencias a la última versión de las funciones, sin reiniciar el ciclo.
  const consultar = useRef(consultarEstado);
  const avisar = useRef(alActivarse);
  useEffect(() => {
    consultar.current = consultarEstado;
    avisar.current = alActivarse;
  });

  const despertar = useCallback(async () => {
    const mio = ++intento.current;
    const vigente = () => !desmontado.current && intento.current === mio;
    const inicio = Date.now();
    const reloj = setInterval(() => vigente() && setSegundos(Math.round((Date.now() - inicio) / 1000)), 1000);
    let primera = true;

    try {
      while (vigente()) {
        let activo = false;
        try {
          activo = await consultar.current();
        } catch (err) {
          const motivo = mensajeSinReintento(err);
          if (motivo) {
            if (vigente()) {
              setMensaje(motivo);
              setEstado("error");
            }
            return;
          }
        }
        if (!vigente()) return;
        if (activo) {
          setEstado("activo");
          // Solo hace falta recargar si antes no estaba disponible.
          if (!primera) avisar.current?.();
          return;
        }
        primera = false;
        if (Date.now() - inicio >= limiteSegundos * 1000) {
          setEstado("inactivo");
          return;
        }
        setEstado("despertando");
        await new Promise((r) => setTimeout(r, PAUSA_MS));
      }
    } finally {
      clearInterval(reloj);
    }
  }, [limiteSegundos]);

  /** Reintento manual: reinicia el contador y vuelve a despertar. */
  const reintentar = useCallback(() => {
    setSegundos(0);
    setMensaje(null);
    setEstado("despertando");
    void despertar();
  }, [despertar]);

  useEffect(() => {
    desmontado.current = false;
    void despertar();
    return () => {
      desmontado.current = true;
    };
  }, [despertar]);

  return { estado, segundos, mensaje, reintentar };
}
