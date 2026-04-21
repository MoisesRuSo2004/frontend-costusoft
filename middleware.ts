import { NextRequest, NextResponse } from "next/server";

// Dashboard por rol
const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN: "/admin",
  USER: "/user",
  BODEGA: "/bodega",
  INSTITUCION: "/institucion/dashboard",
};

// Rutas que pertenecen al panel de ADMIN
// (Incluye paths sin prefijo /admin porque el route group (admin) los expone así)
const ADMIN_PATHS = [
  "/admin",
  "/inventario",
  "/entradas",
  "/salidas",
  "/perfil",
  "/prediccion",
  "/proveedores",
  "/reporte",
  "/usuarios",
  "/dashboard",
];

function matchesAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("cs_token")?.value;
  const role = request.cookies.get("cs_role")?.value;
  const isAuthenticated = !!token && !!role;

  const loginUrl = new URL("/login", request.url);

  const dashboardUrl = () =>
    new URL(ROLE_DASHBOARD[role ?? ""] ?? "/login", request.url);

  // ── Raíz: redirige según estado de sesión ──────────────────────────────
  if (pathname === "/") {
    return isAuthenticated
      ? NextResponse.redirect(dashboardUrl())
      : NextResponse.redirect(loginUrl);
  }

  // ── Login: si ya está autenticado, va al dashboard de su rol ──────────
  if (pathname === "/login") {
    if (isAuthenticated) return NextResponse.redirect(dashboardUrl());
    return NextResponse.next();
  }

  // ── Rutas de ADMIN ─────────────────────────────────────────────────────
  if (matchesAdminPath(pathname)) {
    if (!isAuthenticated) return NextResponse.redirect(loginUrl);
    if (role !== "ADMIN") return NextResponse.redirect(dashboardUrl());
    return NextResponse.next();
  }

  // ── Rutas de BODEGA ────────────────────────────────────────────────────
  if (pathname.startsWith("/bodega")) {
    if (!isAuthenticated) return NextResponse.redirect(loginUrl);
    if (role !== "BODEGA") return NextResponse.redirect(dashboardUrl());
    return NextResponse.next();
  }

  // ── Rutas de USER ──────────────────────────────────────────────────────
  if (pathname.startsWith("/user")) {
    if (!isAuthenticated) return NextResponse.redirect(loginUrl);
    if (role !== "USER") return NextResponse.redirect(dashboardUrl());
    return NextResponse.next();
  }

  // ── Rutas de INSTITUCION ───────────────────────────────────────────────
  if (pathname.startsWith("/institucion")) {
    if (!isAuthenticated) return NextResponse.redirect(loginUrl);
    if (role !== "INSTITUCION") return NextResponse.redirect(dashboardUrl());
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Excluye archivos estáticos, imágenes y recursos públicos
    "/((?!_next/static|_next/image|favicon\\.ico|img/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
