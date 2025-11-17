-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tablas de catálogo
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos JSONB,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipo_decision (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipo_alerta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    nivel_severidad INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipo_punto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    configuracion JSONB,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipo_evidencia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    configuracion JSONB,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS canal_notificacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    configuracion JSONB,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modelos_faciales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    version VARCHAR(20),
    descripcion TEXT,
    archivo_modelo TEXT,
    precision_entrenamiento REAL,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Tablas principales
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(20),
    rol_id INTEGER REFERENCES roles(id),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rostros (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    embedding BYTEA,
    calidad REAL,
    modelo_id INTEGER REFERENCES modelos_faciales(id),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zonas (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(255),
    nivel_seguridad INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS puntos_control (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    zona_id INTEGER REFERENCES zonas(id),
    tipo_id INTEGER REFERENCES tipo_punto(id),
    ubicacion VARCHAR(255),
    configuracion JSONB,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar datos iniciales
INSERT INTO roles (nombre, descripcion, permisos) VALUES 
('Administrador', 'Acceso completo al sistema', '{"all": true}'),
('Seguridad', 'Personal de seguridad', '{"access": true, "alerts": true}'),
('Empleado', 'Empleado regular', '{"access": true}')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipo_decision (nombre, descripcion) VALUES 
('Permitido', 'Acceso autorizado'),
('Denegado', 'Acceso denegado'),
('Pendiente', 'Requiere verificación manual')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipo_alerta (nombre, descripcion, nivel_severidad) VALUES 
('Acceso Denegado', 'Intento de acceso no autorizado', 2),
('Rostro No Reconocido', 'Rostro detectado pero no identificado', 1),
('Liveness Fallido', 'Falla en detección de vida', 3)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipo_punto (nombre, descripcion) VALUES 
('Entrada Principal', 'Punto de acceso principal'),
('Entrada Secundaria', 'Punto de acceso secundario'),
('Área Restringida', 'Acceso solo personal autorizado')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipo_evidencia (nombre, descripcion) VALUES 
('Foto Acceso', 'Fotografía tomada durante acceso'),
('Video Seguridad', 'Video de cámara de seguridad'),
('Log Sistema', 'Registro del sistema')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO canal_notificacion (nombre, descripcion) VALUES 
('Email', 'Notificación por correo electrónico'),
('Telegram', 'Notificación por Telegram'),
('Sistema', 'Notificación interna del sistema')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO modelos_faciales (nombre, version, descripcion) VALUES 
('FaceNet', '1.0', 'Modelo base de reconocimiento facial'),
('OpenCV Haar', '1.0', 'Detector de rostros OpenCV'),
('TensorFlow CNN', '1.0', 'Red neuronal convolucional')
ON CONFLICT (nombre) DO NOTHING;

-- Crear zona y punto de control de ejemplo
INSERT INTO zonas (nombre, descripcion, ubicacion, nivel_seguridad) VALUES 
('Oficina Principal', 'Área principal de oficinas', 'Planta Baja', 1)
ON CONFLICT DO NOTHING;

INSERT INTO puntos_control (nombre, descripcion, zona_id, tipo_id, ubicacion) VALUES 
('Entrada Principal', 'Control de acceso principal', 1, 1, 'Lobby Principal')
ON CONFLICT DO NOTHING;
