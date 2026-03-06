-- ============================================
-- Consorcio - Esquema de Base de Datos MySQL
-- Administración de departamentos y edificios
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------
-- Edificios
-- --------------------------------------------
DROP TABLE IF EXISTS edificios;
CREATE TABLE edificios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(80) DEFAULT NULL,
  codigo_postal VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Departamentos (unidades por edificio)
-- --------------------------------------------
DROP TABLE IF EXISTS departamentos;
CREATE TABLE departamentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  edificio_id INT UNSIGNED NOT NULL,
  piso VARCHAR(20) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  metros_cuadrados DECIMAL(10,2) DEFAULT NULL,
  habitaciones INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_edificio_piso_numero (edificio_id, piso, numero),
  CONSTRAINT fk_departamentos_edificio FOREIGN KEY (edificio_id) REFERENCES edificios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Usuarios (administradores y residentes)
-- --------------------------------------------
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  apellido VARCHAR(120) DEFAULT NULL,
  rol ENUM('admin','residente') NOT NULL DEFAULT 'residente',
  departamento_id INT UNSIGNED DEFAULT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Conceptos de expensa (tipos)
-- --------------------------------------------
DROP TABLE IF EXISTS conceptos_expensa;
CREATE TABLE conceptos_expensa (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Expensas por departamento
-- --------------------------------------------
DROP TABLE IF EXISTS expensas;
CREATE TABLE expensas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  departamento_id INT UNSIGNED NOT NULL,
  concepto_id INT UNSIGNED DEFAULT NULL,
  periodo_mes TINYINT UNSIGNED NOT NULL,
  periodo_anio SMALLINT UNSIGNED NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  pagado TINYINT(1) NOT NULL DEFAULT 0,
  fecha_pago DATE DEFAULT NULL,
  observaciones VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expensas_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
  CONSTRAINT fk_expensas_concepto FOREIGN KEY (concepto_id) REFERENCES conceptos_expensa(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Alquileres por departamento
-- --------------------------------------------
DROP TABLE IF EXISTS alquileres;
CREATE TABLE alquileres (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  departamento_id INT UNSIGNED NOT NULL,
  periodo_mes TINYINT UNSIGNED NOT NULL,
  periodo_anio SMALLINT UNSIGNED NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  pagado TINYINT(1) NOT NULL DEFAULT 0,
  fecha_pago DATE DEFAULT NULL,
  observaciones VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alquileres_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Mantenimientos (edificio o departamento)
-- --------------------------------------------
DROP TABLE IF EXISTS mantenimientos;
CREATE TABLE mantenimientos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  edificio_id INT UNSIGNED NOT NULL,
  departamento_id INT UNSIGNED DEFAULT NULL,
  tipo ENUM('preventivo','correctivo','obra') NOT NULL DEFAULT 'correctivo',
  descripcion TEXT NOT NULL,
  estado ENUM('pendiente','en_curso','completado','cancelado') NOT NULL DEFAULT 'pendiente',
  fecha_solicitud DATE NOT NULL,
  fecha_prevista DATE DEFAULT NULL,
  fecha_realizacion DATE DEFAULT NULL,
  costo DECIMAL(12,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mantenimientos_edificio FOREIGN KEY (edificio_id) REFERENCES edificios(id) ON DELETE CASCADE,
  CONSTRAINT fk_mantenimientos_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Notificaciones a usuarios
-- --------------------------------------------
DROP TABLE IF EXISTS notificaciones;
CREATE TABLE notificaciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  tipo ENUM('vencimiento','aviso','mantenimiento','mensaje','alerta') NOT NULL DEFAULT 'aviso',
  titulo VARCHAR(180) NOT NULL,
  mensaje TEXT DEFAULT NULL,
  referencia_tipo VARCHAR(50) DEFAULT NULL,
  referencia_id INT UNSIGNED DEFAULT NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  leida_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Mensajes de administración a usuarios
-- --------------------------------------------
DROP TABLE IF EXISTS mensajes;
CREATE TABLE mensajes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  enviado_por INT UNSIGNED NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  cuerpo TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mensajes_enviado_por FOREIGN KEY (enviado_por) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Destinatarios de mensajes (N:N)
-- --------------------------------------------
DROP TABLE IF EXISTS mensaje_destinatarios;
CREATE TABLE mensaje_destinatarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mensaje_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  leido TINYINT(1) NOT NULL DEFAULT 0,
  leido_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_mensaje_usuario (mensaje_id, usuario_id),
  CONSTRAINT fk_md_mensaje FOREIGN KEY (mensaje_id) REFERENCES mensajes(id) ON DELETE CASCADE,
  CONSTRAINT fk_md_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- Índices para consultas frecuentes
-- --------------------------------------------
CREATE INDEX idx_expensas_departamento_periodo ON expensas(departamento_id, periodo_anio, periodo_mes);
CREATE INDEX idx_expensas_vencimiento ON expensas(fecha_vencimiento);
CREATE INDEX idx_alquileres_departamento_periodo ON alquileres(departamento_id, periodo_anio, periodo_mes);
CREATE INDEX idx_alquileres_vencimiento ON alquileres(fecha_vencimiento);
CREATE INDEX idx_notificaciones_usuario_leida ON notificaciones(usuario_id, leida);

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------
-- Datos iniciales
-- --------------------------------------------
INSERT INTO conceptos_expensa (nombre, descripcion) VALUES
('Expensa ordinaria', 'Gastos comunes mensuales'),
('Expensa extraordinaria', 'Gastos especiales'),
('Fondo de reserva', 'Aporte al fondo de reserva');
