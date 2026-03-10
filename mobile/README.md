# Consorcio - App móvil (React Native + Expo)

App Android (y iOS) con las mismas funciones que el frontend web: login, zona residente y zona administración, usando la misma API del backend.

## Requisitos

- Node.js 18+
- Cuenta Expo (opcional, para Expo Go)
- Backend del proyecto Consorcio en ejecución

## Configuración

1. **URL de la API**  
   Edita `src/config.js` y define `API_BASE`:
   - **Emulador Android:** `http://10.0.2.2:4000/api` (localhost del host).
   - **Dispositivo físico:** `http://<IP_DE_TU_PC>:4000/api` (misma red WiFi).
   - **iOS simulador:** suele bastar `http://localhost:4000/api`.

2. **Instalar dependencias**
   ```bash
   cd mobile
   npm install
   ```

## Cómo ejecutar

```bash
cd mobile
npx expo start
```

- **Android:** Pulsa `a` en la terminal o escanea el QR con Expo Go (Android).
- **iOS:** Pulsa `i` (solo en Mac con Xcode) o escanea el QR con la cámara.
- **Web:** Pulsa `w` (vista web de la app).

Para abrir directo en emulador Android:

```bash
npx expo start --android
```

## Estructura

- `src/config.js` – URL base de la API.
- `src/api/client.js` – Cliente HTTP y token (AsyncStorage).
- `src/context/AuthContext.js` – Estado de login y usuario.
- `src/screens/` – Pantallas (Login, residente, admin).
- `src/navigation/` – Navegación (tabs residente, drawer admin).

## Funcionalidad

- **Login:** Mismo usuario/contraseña que en la web. Tras iniciar sesión se muestra la zona Resident o Admin según el rol.
- **Residente:** Tabs Vencimientos, Expensas, Alquileres y Más (Mantenimientos, Notificaciones, Mensajes). Cerrar sesión en Más.
- **Admin:** Menú lateral (drawer) con Inicio, Edificios, Departamentos, Usuarios, Expensas, Alquileres, Mantenimientos, Notificaciones, Mensajes. Cerrar sesión en el drawer.

Las pantallas de administración muestran listados (lectura). Para crear/editar/eliminar se puede usar la app web o ampliar la app móvil con formularios.
