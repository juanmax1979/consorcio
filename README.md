# Consorcio - Administración de departamentos

Aplicación para administrar edificios, departamentos, expensas, alquileres, mantenimientos, notificaciones y mensajes. Incluye zona de **usuarios** (residentes) y zona de **administración**.

## Stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express, MySQL (mysql2)
- **Base de datos:** MySQL

## Estructura del proyecto

```
Consorcio/
├── database/           # Esquema SQL y documentación
│   ├── schema.sql      # Crear tablas
│   └── README.md       # Diagrama de relaciones
├── backend/            # API REST
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middlewares/auth.js
│   │   ├── routes/     # auth, edificios, departamentos, usuarios, expensas, alquileres, mantenimientos, notificaciones, mensajes
│   │   └── index.js
│   └── scripts/seed-admin.js   # Crear usuario admin
└── frontend/           # React
    └── src/
        ├── api/client.js
        ├── context/AuthContext.jsx
        ├── components/Layout.jsx
        └── pages/      # Login, residente (vencimientos, expensas, etc.) y admin (CRUD)
```

## Base de datos

1. Crear la base en MySQL:
   ```sql
   CREATE DATABASE consorcio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE consorcio;
   ```

2. Ejecutar el esquema:
   ```bash
   mysql -u usuario -p consorcio < database/schema.sql
   ```

3. Crear usuario administrador (desde la carpeta `backend`, con dependencias instaladas):
   ```bash
   cd backend
   npm install
   node scripts/seed-admin.js
   ```
   Credenciales: **admin@consorcio.local** / **admin123**

## Backend

1. Copiar variables de entorno:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Editar `.env` con los datos de MySQL y un `JWT_SECRET` seguro.

2. Instalar e iniciar:
   ```bash
   npm install
   npm run dev
   ```
   Por defecto corre en http://localhost:4000

## Frontend

1. Opcional: crear `.env` con `VITE_API_URL=http://localhost:4000/api` si la API está en otra URL.

2. Instalar e iniciar:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Por defecto corre en http://localhost:5173

## Uso

- **Residentes:** Iniciar sesión y ver vencimientos (expensas y alquileres), mis expensas, mis alquileres, mantenimientos del edificio, notificaciones y mensajes de la administración.
- **Administradores:** Además de lo anterior, acceden a **/admin** para gestionar edificios, departamentos, usuarios, expensas, alquileres, mantenimientos, notificaciones y envío de mensajes a residentes.

Colores y estilos del frontend son sobrios (grises y azul oscuro).
