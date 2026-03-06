# Diseño de Base de Datos - Consorcio

## Diagrama de relaciones

```
edificios (1) ----< departamentos (N)
    |                       |
    |                       +----< expensas
    |                       +----< alquileres
    |                       +----< usuarios (residentes)
    +----< mantenimientos

usuarios (admin/residente)
    |---- departamento_id (nullable, solo residentes)
    +----< notificaciones
    +----< mensajes (enviado_por)
    +----< mensaje_destinatarios (mensaje_id, usuario_id)

conceptos_expensa (1) ----< expensas (N)
```

## Tablas

| Tabla | Descripción |
|-------|-------------|
| **edificios** | Edificios del consorcio (nombre, dirección, ciudad) |
| **departamentos** | Unidades por edificio (piso, número, m²) |
| **usuarios** | Admins y residentes; residentes vinculados a un departamento |
| **conceptos_expensa** | Tipos de expensa (ordinaria, extraordinaria, fondo) |
| **expensas** | Expensas por departamento y período (monto, vencimiento, pagado) |
| **alquileres** | Alquileres por departamento y período |
| **mantenimientos** | Órdenes de mantenimiento (edificio o departamento) |
| **notificaciones** | Alertas/avisos por usuario (vencimientos, mantenimientos, etc.) |
| **mensajes** | Mensajes enviados por administración |
| **mensaje_destinatarios** | Relación mensaje–usuario (a quién se envió y si leyó) |

## Cómo crear la base de datos

1. Crear la base en MySQL:
   ```sql
   CREATE DATABASE consorcio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE consorcio;
   ```

2. Ejecutar el esquema:
   ```bash
   mysql -u usuario -p consorcio < database/schema.sql
   ```
