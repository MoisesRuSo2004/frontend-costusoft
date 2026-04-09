export type UserRole = "ADMIN" | "USER" | "BODEGA";

export interface UsuarioInfo {
  id: number;
  username: string;
  correo: string;
  rol: UserRole;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: UsuarioInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
