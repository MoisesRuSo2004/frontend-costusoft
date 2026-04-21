# Sistema de Autenticación y Sesión - CostuSoft

## 🔐 Implementación Completa de "Recuérdame" y Timeout de Sesión

### 1. Funcionalidad "Recuérdame"

#### ¿Qué hace?
- **Con "Recuérdame" ✅**: 
  - Sesión de **7 días**
  - Username guardado en localStorage para siguiente login
  - Autorellena automáticamente el campo de usuario
  
- **Sin "Recuérdame"**: 
  - Sesión de **8 horas** (más segura)
  - NO guarda username
  - Limpieza de cookies al cerrar navegador

#### Ubicaciones de código
- `app/lib/cookies.ts` - Manejo de localStorage
- `app/context/AuthContext.tsx` - Lógica de sesión
- `app/components/auth/LoginForm.tsx` - Pre-relleno de username

---

### 2. Timeout de Sesión por Inactividad

#### ¿Qué pasa?
- **30 minutos sin actividad** → Aviso visual
- **5 minutos más** (35 min total) → Logout automático + redirect a login
- El sistema rastrea: clics, teclado, scroll, toques

#### Notificación
Muestra un banner profesional en la parte superior:
- ⏱️ Cuenta regresiva de 5 minutos
- 🎨 Diseño amarillo/ámbar profesional
- 💡 Instrucción clara para continuar sesión

#### Ubicaciones de código
- `app/hooks/useSessionTimeout.ts` - Lógica de timeout
- `app/components/auth/SessionTimeoutManager.tsx` - UI de notificación
- `app/layout.tsx` - Activación global

---

### 3. Tiempos Configurables

```typescript
// Editar en useSessionTimeout.ts:
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;      // 30 minutos inactividad
const WARNING_BEFORE_LOGOUT = 5 * 60 * 1000;    // 5 min antes del logout

// Editar en AuthContext.tsx, función login():
const expiresIn = rememberMe
  ? 7 * 24 * 60 * 60 * 1000   // 7 días con Recuérdame
  : 8 * 60 * 60 * 1000;       // 8 horas sin Recuérdame
```

---

### 4. Flujo Completo

#### Login
1. Usuario marca "Recuérdame" (opcional)
2. Hace login
3. Si marcó "Recuérdame":
   - Username guardado en localStorage
   - Sesión = 7 días
   - Username pre-rellena en siguiente visita
4. Si NO marcó:
   - Sesión = 8 horas
   - Username NO guardado

#### Durante la sesión
1. Usuario interactúa con la app
2. Si 30 min sin interacción:
   - Banner de advertencia aparece
   - Contador: "5:00 minutos restantes"
3. Si usuario mueve ratón/teclado:
   - Contador se reinicia
   - Banner desaparece
4. Si llega a 0:
   - Logout automático
   - Redirect a `/login`
   - Mensaje: "Debes iniciar sesión nuevamente"

---

### 5. Verificación al Cargar App

Cuando el usuario abre la app:
1. Se verifica si hay sesión activa
2. Se comprueba el timestamp de expiración
3. Si expiró:
   - Limpia cookies
   - Mantiene username recordado (si lo marcó)
   - Redirige a login
4. Si aún válida:
   - Restaura sesión automáticamente

---

### 6. Seguridad

✅ **Tokens en cookies** (HttpOnly cuando sea posible vía backend)
✅ **Username en localStorage** (solo si usuario lo permite)
✅ **Logout automático** por inactividad
✅ **Verificación de expiración** en cada carga
✅ **Mismo para todos los roles**: ADMIN, USER, BODEGA, INSTITUCION

---

### 7. Esto aplica a:

- ✅ Página de login (pre-relleno)
- ✅ Todos los dashboards (ADMIN, USER, BODEGA, INSTITUCION)
- ✅ Todas las páginas protegidas
- ✅ Transición entre módulos

---

### 8. Testing

Para probar:
1. **Con "Recuérdame"**:
   - Login con checkbox marcado
   - Cerrar navegador
   - Reabre → username pre-relleno
   
2. **Sin "Recuérdame"**:
   - Login sin checkbox
   - Cerrar navegador
   - Reabre → campo vacío
   
3. **Timeout por inactividad**:
   - Login normalmente
   - Espera 30+ minutos sin tocar nada
   - Debería ver banner de advertencia
   - Espera 5 minutos más
   - Debería logout automático

---

### 9. Cómo personalizar tiempos

Edita `app/hooks/useSessionTimeout.ts`:
```typescript
// Cambiar 30 minutos a 15:
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

// Cambiar advertencia de 5 a 3 minutos:
const WARNING_BEFORE_LOGOUT = 3 * 60 * 1000;
```

Edita `app/context/AuthContext.tsx`, línea ~82:
```typescript
const expiresIn = rememberMe
  ? 3 * 24 * 60 * 60 * 1000   // Cambiar 7 a 3 días
  : 4 * 60 * 60 * 1000;       // Cambiar 8 a 4 horas
```
