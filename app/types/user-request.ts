export type UserRole = "USER";
export type RequestType = "ENTRADA" | "SALIDA";
export type RequestStatus = "PENDIENTE" | "CONFIRMADA" | "RECHAZADA";

export interface InventoryItemOption {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minimumStock: number;
}

export interface RequestLine {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  availableStock?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserInventoryRequest {
  id: string;
  code: string;
  type: RequestType;
  status: RequestStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  requestedBy: UserProfile;
  lines: RequestLine[];
  confirmedBy?: string | null;
  rejectionReason?: string | null;
}

export interface UserRequestSummary {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
}

export interface UserDashboardResponse {
  inventory: InventoryItemOption[];
  requests: UserInventoryRequest[];
  summary: UserRequestSummary;
  currentUser: UserProfile;
}

export interface CreateUserRequestPayload {
  type: RequestType;
  description: string;
  lines: Array<{
    itemId: string;
    quantity: number;
  }>;
}

export interface CreateUserRequestResponse {
  data: UserInventoryRequest;
  message: string;
}
