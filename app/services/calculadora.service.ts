import type {
  CalculadoraFormValues,
  CalculadoraResultado,
  CalculadoraResultadoItem,
  ColegioOption,
  SolicitudSalidaPayload,
  UniformOption,
} from "@/app/types/calculadora";

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

function normalizeCollection(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const objectPayload = payload as Record<string, unknown>;

    if (Array.isArray(objectPayload.data)) {
      return objectPayload.data;
    }

    if (Array.isArray(objectPayload.items)) {
      return objectPayload.items;
    }
  }

  return [];
}

function normalizeUniforms(payload: unknown): UniformOption[] {
  return normalizeCollection(payload).map((item, index) => {
    const uniform = item as Record<string, unknown>;
    return {
      id: String(uniform.id ?? uniform.uniformeId ?? index),
      nombre: String(uniform.nombre ?? uniform.name ?? uniform.descripcion ?? `Uniforme ${index + 1}`),
    };
  });
}

function normalizeColegios(payload: unknown): ColegioOption[] {
  return normalizeCollection(payload).map((item, index) => {
    const colegio = item as Record<string, unknown>;

    return {
      id: String(colegio.id ?? colegio.colegioId ?? index),
      nombre: String(colegio.nombre ?? colegio.name ?? colegio.colegio ?? `Colegio ${index + 1}`),
      uniformes: normalizeUniforms(colegio.uniformes ?? colegio.uniforms ?? colegio.catalogoUniformes),
    };
  });
}

function normalizeResultadoItems(payload: unknown): CalculadoraResultadoItem[] {
  return normalizeCollection(payload).map((item, index) => {
    const insumo = item as Record<string, unknown>;
    const cantidadRequerida = Number(insumo.cantidadRequerida ?? insumo.cantidad ?? insumo.requiredQuantity ?? 0);
    const stockDisponible = Number(insumo.stockDisponible ?? insumo.stock ?? insumo.availableStock ?? 0);

    return {
      id: String(insumo.id ?? insumo.insumoId ?? index),
      nombre: String(insumo.nombre ?? insumo.name ?? insumo.insumo ?? `Insumo ${index + 1}`),
      unidad: String(insumo.unidad ?? insumo.unit ?? "und"),
      cantidadRequerida,
      stockDisponible,
      suficiente:
        typeof insumo.suficiente === "boolean"
          ? insumo.suficiente
          : stockDisponible >= cantidadRequerida,
    };
  });
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload as Record<string, unknown> | null)?.message ||
      (payload as Record<string, unknown> | null)?.error ||
      "No fue posible procesar la solicitud.";
    throw new ApiError(String(message), response.status);
  }

  return payload as T;
}

export async function getColegios(): Promise<ColegioOption[]> {
  const response = await fetch("/api/colegios", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const payload = await parseResponse<unknown>(response);
  return normalizeColegios(payload);
}

export async function verificarCalculadora(
  values: CalculadoraFormValues,
): Promise<CalculadoraResultado> {
  const response = await fetch("/api/calculadora/verificar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      colegioId: values.colegioId,
      uniformeId: values.uniformeId,
      cantidad: values.cantidad,
    }),
  });

  const payload = await parseResponse<unknown>(response);
  const payloadObject = (payload ?? {}) as Record<string, unknown>;
  const items = normalizeResultadoItems(
    payloadObject.items ?? payloadObject.insumos ?? payloadObject.resultado,
  );
  const suficiente =
    typeof payloadObject.suficiente === "boolean"
      ? payloadObject.suficiente
      : items.every((item) => item.suficiente);

  return {
    items,
    suficiente,
    mensaje:
      typeof payloadObject.mensaje === "string"
        ? payloadObject.mensaje
        : undefined,
    raw: payload,
  };
}

export async function generarSolicitudDesdeCalculadora(
  payload: SolicitudSalidaPayload,
) {
  const response = await fetch("/api/salidas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      colegioId: payload.colegioId,
      uniformeId: payload.uniformeId,
      cantidad: payload.cantidad,
      items: payload.items,
    }),
  });

  return parseResponse<unknown>(response);
}
