import type {
  WarehouseActionResponse,
  WarehouseDashboardResponse,
  WarehouseOperator,
  WarehouseRequest,
  WarehouseSummary,
} from "@/app/types/bodega-request";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const CURRENT_OPERATOR: WarehouseOperator = {
  id: "bod-01",
  name: "Jorge Medina",
  email: "jorge.bodega@costusoft.com",
  role: "BODEGA",
};

const REQUESTS_MOCK: WarehouseRequest[] = [
  {
    id: "bod-req-2001",
    code: "REQ-1001",
    type: "ENTRADA",
    status: "PENDIENTE",
    description: "Recepcion pendiente por llegada parcial del proveedor principal.",
    createdAt: "2026-03-25T09:15:00.000Z",
    updatedAt: "2026-03-25T09:15:00.000Z",
    requestedBy: {
      id: "user-01",
      name: "Daniela Rojas",
      email: "daniela@costusoft.com",
      role: "USER",
    },
    lines: [
      { itemId: "ins-01", itemName: "Hilo 40/2 Blanco", quantity: 40, unit: "Conos", availableStock: 120 },
    ],
    confirmedBy: null,
    rejectionReason: null,
  },
  {
    id: "bod-req-2002",
    code: "REQ-1041",
    type: "SALIDA",
    status: "PENDIENTE",
    description: "Despacho requerido para orden de produccion OP-81.",
    createdAt: "2026-03-25T11:05:00.000Z",
    updatedAt: "2026-03-25T11:05:00.000Z",
    requestedBy: {
      id: "user-02",
      name: "Carolina Pardo",
      email: "carolina@costusoft.com",
      role: "USER",
    },
    lines: [
      { itemId: "ins-02", itemName: "Tela Popelina Azul", quantity: 20, unit: "Metros", availableStock: 45 },
      { itemId: "ins-05", itemName: "Elastico 2cm Natural", quantity: 8, unit: "Metros", availableStock: 95 },
    ],
    confirmedBy: null,
    rejectionReason: null,
  },
  {
    id: "bod-req-2003",
    code: "REQ-1038",
    type: "SALIDA",
    status: "CONFIRMADA",
    description: "Entrega realizada para muestra del area comercial.",
    createdAt: "2026-03-24T10:00:00.000Z",
    updatedAt: "2026-03-24T13:00:00.000Z",
    requestedBy: {
      id: "adm-01",
      name: "Admin General",
      email: "admin@costusoft.com",
      role: "ADMIN",
    },
    lines: [{ itemId: "ins-04", itemName: "Cierre Invisible 60cm", quantity: 10, unit: "Unidades", availableStock: 18 }],
    confirmedBy: "Jorge Medina",
    rejectionReason: null,
  },
  {
    id: "bod-req-2004",
    code: "REQ-1033",
    type: "ENTRADA",
    status: "RECHAZADA",
    description: "Ingreso con diferencias entre factura y conteo fisico.",
    createdAt: "2026-03-23T08:30:00.000Z",
    updatedAt: "2026-03-23T09:40:00.000Z",
    requestedBy: {
      id: "user-03",
      name: "Paola Diaz",
      email: "paola@costusoft.com",
      role: "USER",
    },
    lines: [{ itemId: "ins-03", itemName: "Botones 15mm Negros", quantity: 250, unit: "Unidades", availableStock: 620 }],
    confirmedBy: null,
    rejectionReason: "Llegaron menos unidades de las solicitadas.",
  },
];

let requestsStore = [...REQUESTS_MOCK];

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

function buildSummary(requests: WarehouseRequest[]): WarehouseSummary {
  return {
    total: requests.length,
    pending: requests.filter((request) => request.status === "PENDIENTE").length,
    confirmed: requests.filter((request) => request.status === "CONFIRMADA").length,
    rejected: requests.filter((request) => request.status === "RECHAZADA").length,
  };
}

function sortRequests(requests: WarehouseRequest[]) {
  return [...requests].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || payload?.error || "No fue posible actualizar la solicitud.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

async function simulateNetwork<T>(data: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return data;
}

export async function getWarehouseDashboard(): Promise<WarehouseDashboardResponse> {
  if (!API_BASE_URL) {
    const requests = sortRequests(requestsStore);

    return simulateNetwork({
      currentOperator: CURRENT_OPERATOR,
      requests,
      summary: buildSummary(requests),
    });
  }

  const response = await fetch(`${API_BASE_URL}/bodega/requests`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  return parseResponse<WarehouseDashboardResponse>(response);
}

async function updateRequest(
  id: string,
  action: "confirm" | "reject",
  reason?: string,
): Promise<WarehouseActionResponse> {
  if (!API_BASE_URL) {
    const request = requestsStore.find((item) => item.id === id);

    if (!request) {
      throw new ApiError("No se encontro la solicitud seleccionada.", 404);
    }

    if (request.status !== "PENDIENTE") {
      throw new ApiError("La solicitud ya fue procesada por bodega.", 409);
    }

    if (action === "reject" && !reason?.trim()) {
      throw new ApiError("Debes indicar un motivo de rechazo.", 422);
    }

    const updatedRequest: WarehouseRequest = {
      ...request,
      status: action === "confirm" ? "CONFIRMADA" : "RECHAZADA",
      updatedAt: new Date().toISOString(),
      confirmedBy: action === "confirm" ? CURRENT_OPERATOR.name : null,
      rejectionReason: action === "reject" ? reason!.trim() : null,
    };

    requestsStore = requestsStore.map((item) => (item.id === id ? updatedRequest : item));

    return simulateNetwork({
      data: updatedRequest,
      message:
        action === "confirm"
          ? "Solicitud confirmada y lista para impactar stock."
          : "Solicitud rechazada correctamente.",
    });
  }

  const response = await fetch(`${API_BASE_URL}/requests/${id}/${action}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: action === "reject" ? JSON.stringify({ reason }) : undefined,
  });

  return parseResponse<WarehouseActionResponse>(response);
}

export async function confirmWarehouseRequest(id: string) {
  return updateRequest(id, "confirm");
}

export async function rejectWarehouseRequest(id: string, reason: string) {
  return updateRequest(id, "reject", reason);
}
