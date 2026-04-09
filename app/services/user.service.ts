import type {
  CreateUserRequestPayload,
  CreateUserRequestResponse,
  InventoryItemOption,
  RequestType,
  UserDashboardResponse,
  UserInventoryRequest,
  UserProfile,
  UserRequestSummary,
} from "@/app/types/user-request";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const CURRENT_USER: UserProfile = {
  id: "user-01",
  name: "Daniela Rojas",
  email: "daniela@costusoft.com",
  role: "USER",
};

const INVENTORY_MOCK: InventoryItemOption[] = [
  {
    id: "ins-01",
    name: "Hilo 40/2 Blanco",
    unit: "Conos",
    stock: 120,
    minimumStock: 50,
  },
  {
    id: "ins-02",
    name: "Tela Popelina Azul",
    unit: "Metros",
    stock: 45,
    minimumStock: 40,
  },
  {
    id: "ins-03",
    name: "Botones 15mm Negros",
    unit: "Unidades",
    stock: 620,
    minimumStock: 200,
  },
  {
    id: "ins-04",
    name: "Cierre Invisible 60cm",
    unit: "Unidades",
    stock: 18,
    minimumStock: 30,
  },
  {
    id: "ins-05",
    name: "Elastico 2cm Natural",
    unit: "Metros",
    stock: 95,
    minimumStock: 60,
  },
];

const REQUESTS_MOCK: UserInventoryRequest[] = [
  {
    id: "usr-req-1001",
    code: "REQ-1001",
    type: "ENTRADA",
    status: "PENDIENTE",
    description:
      "Solicitud de ingreso para reposicion del proveedor principal.",
    createdAt: "2026-03-25T09:15:00.000Z",
    updatedAt: "2026-03-25T09:15:00.000Z",
    requestedBy: CURRENT_USER,
    lines: [
      {
        itemId: "ins-01",
        itemName: "Hilo 40/2 Blanco",
        quantity: 40,
        unit: "Conos",
        availableStock: 120,
      },
    ],
    confirmedBy: null,
    rejectionReason: null,
  },
  {
    id: "usr-req-1002",
    code: "REQ-1002",
    type: "SALIDA",
    status: "CONFIRMADA",
    description: "Despacho solicitado para orden de produccion OP-77.",
    createdAt: "2026-03-24T14:30:00.000Z",
    updatedAt: "2026-03-24T16:00:00.000Z",
    requestedBy: CURRENT_USER,
    lines: [
      {
        itemId: "ins-02",
        itemName: "Tela Popelina Azul",
        quantity: 12,
        unit: "Metros",
        availableStock: 45,
      },
    ],
    confirmedBy: "Bodega Principal",
    rejectionReason: null,
  },
  {
    id: "usr-req-1003",
    code: "REQ-1003",
    type: "SALIDA",
    status: "RECHAZADA",
    description: "Solicitud para muestra rapida del area comercial.",
    createdAt: "2026-03-23T11:10:00.000Z",
    updatedAt: "2026-03-23T13:20:00.000Z",
    requestedBy: CURRENT_USER,
    lines: [
      {
        itemId: "ins-04",
        itemName: "Cierre Invisible 60cm",
        quantity: 25,
        unit: "Unidades",
        availableStock: 18,
      },
    ],
    confirmedBy: null,
    rejectionReason: "Cantidad no disponible fisicamente en bodega.",
  },
];

let requestsStore = [...REQUESTS_MOCK];

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildSummary(requests: UserInventoryRequest[]): UserRequestSummary {
  return {
    total: requests.length,
    pending: requests.filter((request) => request.status === "PENDIENTE")
      .length,
    confirmed: requests.filter((request) => request.status === "CONFIRMADA")
      .length,
    rejected: requests.filter((request) => request.status === "RECHAZADA")
      .length,
  };
}

function sortRequests(requests: UserInventoryRequest[]) {
  return [...requests].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      "No fue posible procesar la solicitud.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

async function simulateNetwork<T>(data: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return data;
}

function hydrateLine(
  payload: CreateUserRequestPayload,
  inventory: InventoryItemOption[],
) {
  return payload.lines.map((line) => {
    const item = inventory.find(
      (inventoryItem) => inventoryItem.id === line.itemId,
    );

    if (!item) {
      throw new ApiError(
        "No se encontro uno de los insumos seleccionados.",
        404,
      );
    }

    if (payload.type === "SALIDA" && line.quantity > item.stock) {
      throw new ApiError(
        `La cantidad solicitada supera el stock visible de ${item.name}.`,
        422,
      );
    }

    return {
      itemId: item.id,
      itemName: item.name,
      quantity: line.quantity,
      unit: item.unit,
      availableStock: item.stock,
    };
  });
}

function buildCreateMessage(type: RequestType) {
  return type === "ENTRADA"
    ? "Solicitud de entrada creada correctamente."
    : "Solicitud de salida creada correctamente.";
}

export async function getUserDashboard(): Promise<UserDashboardResponse> {
  if (!API_BASE_URL) {
    const requests = sortRequests(requestsStore);
    return simulateNetwork({
      inventory: INVENTORY_MOCK,
      requests,
      summary: buildSummary(requests),
      currentUser: CURRENT_USER,
    });
  }

  const response = await fetch(`${API_BASE_URL}/user/dashboard`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  return parseResponse<UserDashboardResponse>(response);
}

export async function createUserRequest(
  payload: CreateUserRequestPayload,
): Promise<CreateUserRequestResponse> {
  if (!API_BASE_URL) {
    const nextIndex = requestsStore.length + 1001;
    const nextRequest: UserInventoryRequest = {
      id: `usr-req-${nextIndex}`,
      code: `REQ-${nextIndex}`,
      type: payload.type,
      status: "PENDIENTE",
      description: payload.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestedBy: CURRENT_USER,
      lines: hydrateLine(payload, INVENTORY_MOCK),
      confirmedBy: null,
      rejectionReason: null,
    };

    requestsStore = [nextRequest, ...requestsStore];

    return simulateNetwork({
      data: nextRequest,
      message: buildCreateMessage(payload.type),
    });
  }

  const response = await fetch(`${API_BASE_URL}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse<CreateUserRequestResponse>(response);
}
