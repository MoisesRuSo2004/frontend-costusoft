<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
<img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />

<h1>CostuSoft Control</h1>

<p align="center">
  <b>Sistema Integral de Gestión de Inventario y Uniformes Escolares</b>
</p>

<p align="center">
  <a href="#caracteristicas">Características</a> •
  <a href="#arquitectura">Arquitectura</a> •
  <a href="#instalacion">Instalación</a> •
  <a href="#modulos">Módulos</a> •
  <a href="#api">API</a>
</p>

</div>

---

## Descripción

**CostuSoft Control** es una aplicación web moderna y robusta diseñada para la gestión integral de inventarios, uniformes escolares y operaciones logísticas. Desarrollada con las últimas tecnologías de React y Next.js, ofrece una experiencia de usuario fluida con autenticación segura, paneles de control interactivos y capacidades de predicción impulsadas por inteligencia artificial.

El sistema está diseñado con una arquitectura multi-rol que permite a administradores, usuarios de colegios y personal de bodega operar de manera eficiente dentro de sus respectivas responsabilidades.

---

## Características

| Característica | Descripción |
|---------------|-------------|
| **Autenticación JWT** | Sistema seguro de login con tokens y manejo de sesiones |
| **Multi-Rol** | Tres niveles de acceso: Admin, Usuario (Colegio) y Bodega |
| **Dashboard en Tiempo Real** | Estadísticas dinámicas de inventario, entradas y salidas |
| **Gestión de Inventario** | Control completo de insumos con stock y alertas |
| **Reportes Avanzados** | 7 tipos de informes exportables a PDF y Excel |
| **Predicción con IA** | Análisis predictivo de demanda de uniformes |
| **Calculadora de Uniformes** | Herramienta para estimar necesidades por colegio |
| **Responsive Design** | Interfaz adaptativa para escritorio y móvil |
| **Animaciones Fluidas** | Transiciones suaves con Framer Motion |

---

## Arquitectura

```
CostuSoft Control
├── 📁 app/
│   ├── 📁 (auth)/           # Grupo de rutas de autenticación
│   │   └── 📁 login/         # Página de inicio de sesión
│   ├── 📁 (admin)/          # Panel de administración
│   │   ├── 📁 inventario/    # Gestión de insumos
│   │   ├── 📁 entradas/      # Registro de entradas
│   │   ├── 📁 salidas/       # Registro de salidas
│   │   ├── 📁 proveedores/   # Gestión de proveedores
│   │   ├── 📁 usuarios/      # Gestión de usuarios
│   │   ├── 📁 colegios/      # Gestión de colegios
│   │   ├── 📁 reporte/       # Generación de reportes
│   │   ├── 📁 prediccion/    # Módulo de IA
│   │   ├── 📁 uniformes/     # Catálogo de uniformes
│   │   └── 📁 calculadora/   # Calculadora de necesidades
│   ├── 📁 (user)/           # Panel de usuario (colegios)
│   ├── 📁 (bodega)/          # Panel de bodega
│   ├── 📁 components/         # Componentes reutilizables
│   ├── 📁 context/           # Contextos de React (Auth, Sidebar)
│   ├── 📁 hooks/             # Custom Hooks
│   ├── 📁 services/          # Servicios de API
│   ├── 📁 types/             # Definiciones de TypeScript
│   └── 📁 lib/               # Utilidades y helpers
├── 📁 public/               # Assets estáticos
└── 📄 next.config.ts        # Configuración de Next.js
```

---

## Tecnologías

<div align="center">

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-16-black) |
| **UI Library** | ![React](https://img.shields.io/badge/React-19-61DAFB) |
| **Lenguaje** | ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) |
| **Estilos** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC) |
| **Animaciones** | ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-EF44A5) |
| **Iconos** | ![Lucide](https://img.shields.io/badge/Lucide%20React-latest-F56565) |
| **Linting** | ![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3) |

</div>

---

## Instalación

### Requisitos Previos

- Node.js 20.x o superior
- npm, yarn, pnpm o bun
- Backend API corriendo (puerto 8080 por defecto)

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/frontend-costusoft.git
cd frontend-costusoft

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env.local con:
NEXT_PUBLIC_API_URL=http://localhost:8080

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run start    # Inicia el servidor de producción
npm run lint     # Ejecuta ESLint
```

---

## Módulos

### Panel de Administración

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Vista general con estadísticas clave y KPIs |
| **Inventario** | Gestión de insumos: CRUD, edición masiva, stock |
| **Entradas** | Registro de ingresos de mercancía por proveedor |
| **Salidas** | Control de egresos y asignaciones |
| **Proveedores** | Directorio y gestión de proveedores |
| **Usuarios** | Administración de usuarios y permisos |
| **Colegios** | Gestión de instituciones educativas |
| **Reportes** | Generación de 7 tipos de informes analíticos |
| **Predicción** | Análisis de IA para predecir demanda |
| **Uniformes** | Catálogo de uniformes escolares |
| **Calculadora** | Herramienta de estimación de necesidades |

### Panel de Usuario (Colegio)

- Solicitud de uniformes
- Historial de pedidos
- Calculadora de estimaciones
- Gestión de colegios asignados

### Panel de Bodega

- Cola de solicitudes pendientes
- Gestión de aprobaciones
- Control de inventario físico

---

## API

El frontend se comunica con el backend mediante una API RESTful.

```typescript
// Configuración base
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Ejemplo de llamada autenticada
import { apiFetch } from "@/app/lib/api";

const data = await apiFetch<Insumo[]>('/api/insumos', {
  method: 'GET'
});
```

### Endpoints Principales

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/auth/login` | Autenticación de usuarios |
| `GET /api/insumos` | Listado de insumos |
| `POST /api/entradas` | Crear entrada de inventario |
| `POST /api/salidas` | Crear salida de inventario |
| `GET /api/reportes` | Generar reportes |
| `GET /api/prediccion` | Obtener predicciones de IA |

---

## Estructura de Carpetas

```
app/
├── components/           # Componentes reutilizables
│   ├── admin/             # Componentes del panel admin
│   ├── user/              # Componentes del panel usuario
│   ├── bodega/            # Componentes del panel bodega
│   └── auth/              # Componentes de autenticación
├── context/              # Contextos globales
│   ├── AuthContext.tsx    # Gestión de autenticación
│   └── SidebarContext.tsx # Estado del sidebar
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   ├── useInsumos.ts
│   ├── useDashboard.ts
│   └── ...
├── services/             # Lógica de comunicación con API
│   ├── auth.service.ts
│   ├── insumo.service.ts
│   └── ...
├── types/                # Interfaces TypeScript
│   ├── auth.ts
│   ├── insumo.ts
│   └── ...
└── lib/                  # Utilidades
    ├── api.ts             # Cliente API
    └── cookies.ts         # Manejo de cookies
```

---

## Capturas de Pantalla

<div align="center">

| Dashboard | Inventario | Reportes |
|:---------:|:----------:|:--------:|
| 📊 Estadísticas en tiempo real | 📦 Gestión de insumos | 📈 Visualizaciones analíticas |

| Predicción IA | Calculadora | Login |
|:-------------:|:-----------:|:-----:|
| 🤖 Análisis predictivo | 🧮 Estimaciones rápidas | 🔐 Acceso seguro |

</div>

---

## Seguridad

- Autenticación JWT con tokens Bearer
- Middleware de protección de rutas
- Validación de roles en cliente y servidor
- Sanitización de inputs
- Cookies seguras (httpOnly en producción)

---

## Roadmap

- [x] Sistema de autenticación multi-rol
- [x] Dashboard administrativo
- [x] Gestión de inventario completa
- [x] Módulo de reportes con exportación
- [x] Integración con IA para predicciones
- [x] Calculadora de uniformes
- [ ] Notificaciones en tiempo real
- [ ] PWA para acceso móvil
- [ ] Dark mode
- [ ] Internacionalización (i18n)

---

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Desarrollado con ❤️ para la gestión educativa**

<p>
  <sub>CostuSoft Control &copy; 2025</sub>
</p>

</div>
