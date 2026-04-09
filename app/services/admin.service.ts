import type {
  GetRequestsResponse,
  RequestActionResponse,
  RequestItem,
} from "@/app/types/admin-request";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const MOCK_REQUESTS: RequestItem[] = [
  {
    id: "req-1001",
    code: "SOL-1001",
    title: "Reposicion de hilo blanco",
    description: "Solicitud para completar el lote de camisas de esta semana.",
    itemName: "Hilo 40/2 Blanco",
    quantity: 120,
    unit: "Conos",
    requestedBy: {
      id: "usr-01",
      name: "Laura Mendoza",
      email: "laura@costusoft.com",
      role: "USER",
    },
    status: "PENDIENTE",
    createdAt: "2026-03-24T08:15:00.000Z",
    updatedAt: "2026-03-24T08:15:00.000Z",
  },
  {
    id: "req-1002",
    code: "SOL-1002",
    title: "Tela popelina para orden especial",
    description: "Pedido requerido para la produccion del cliente AC-22.",
    itemName: "Tela Popelina Azul",
    quantity: 45,
    unit: "Metros",
    requestedBy: {
      id: "usr-02",
      name: "Carlos Perez",
      email: "carlos@costusoft.com",
      role: "USER",
    },
    status: "APROBADO",
    createdAt: "2026-03-23T14:10:00.000Z",
    updatedAt: "2026-03-23T15:42:00.000Z",
  },
  {
    id: "req-1003",
    code: "SOL-1003",
    title: "Botones para lote rechazado",
    description: "Reposicion del insumo por inconsistencia detectada en calidad.",
    itemName: "Botones 15mm Negros",
    quantity: 300,
    unit: "Unidades",
    requestedBy: {
      id: "usr-03",
      name: "Andrea Ruiz",
      email: "andrea@costusoft.com",
      role: "USER",
    },
    status: "RECHAZADO",
    createdAt: "2026-03-22T10:00:00.000Z",
    updatedAt: "2026-03-22T11:20:00.000Z",
  },
  {
    id: "req-1004",
    code: "SOL-1004",
    title: "Cierres para bodega",
    description: "Requerimiento de abastecimiento previo al despacho semanal.",
    itemName: "Cierre Invisible 60cm",
    quantity: 80,
    unit: "Unidades",
    requestedBy: {
      id: "usr-04",
      name: "Miguel Torres",
      email: "miguel@costusoft.com",
      role: "USER",
    },
    status: "PENDIENTE",
    createdAt: "2026-03-25T12:00:00.000Z",
    updatedAt: "2026-03-25T12:00:00.000Z",
  },
];

let mockRequests = [...MOCK_REQUESTS];

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.message || payload?.error || "Ocurrio un error al consultar la API.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

function buildSummary(data: RequestItem[]) {
  return {
    total: data.length,
    pending: data.filter((request) => request.status === "PENDIENTE").length,
    approved: data.filter((request) => request.status === "APROBADO").length,
    rejected: data.filter((request) => request.status === "RECHAZADO").length,
  };
}

function sortRequests(data: RequestItem[]) {
  return [...data].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

async function simulateNetwork<T>(result: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  return result;
}

export async function getRequests(): Promise<GetRequestsResponse> {
  if (!API_BASE_URL) {
    const data = sortRequests(mockRequests);
    return simulateNetwork({
      data,
      summary: buildSummary(data),
    });
  }

  const response = await fetch(`${API_BASE_URL}/admin/requests`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  return parseResponse<GetRequestsResponse>(response);
}

async function updateRequestStatus(
  id: string,
  action: "approve" | "reject",
): Promise<RequestActionResponse> {
  if (!API_BASE_URL) {
    const nextStatus = action === "approve" ? "APROBADO" : "RECHAZADO";
    const request = mockRequests.find((item) => item.id === id);

    if (!request) {
      throw new ApiError("No se encontro la solicitud seleccionada.", 404);
    }

    const updatedRequest: RequestItem = {
      ...request,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    mockRequests = mockRequests.map((item) =>
      item.id === id ? updatedRequest : item,
    );

    return simulateNetwork({
      data: updatedRequest,
      message:
        action === "approve"
          ? "Solicitud aprobada correctamente."
          : "Solicitud rechazada correctamente.",
    });
  }

  const response = await fetch(`${API_BASE_URL}/admin/requests/${id}/${action}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return parseResponse<RequestActionResponse>(response);
}

export async function approveRequest(id: string) {
  return updateRequestStatus(id, "approve");
}

export async function rejectRequest(id: string) {
  return updateRequestStatus(id, "reject");
}
