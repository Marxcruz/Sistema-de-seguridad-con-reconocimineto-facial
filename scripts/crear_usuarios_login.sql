-- ============================================
-- CREAR USUARIOS PARA LOGIN
-- Sistema de Reconocimiento Facial
-- ============================================

-- Este script crea los usuarios necesarios para el login
-- sin borrar los datos existentes

-- ============================================
-- 1. VERIFICAR ROLES EXISTENTES
-- ============================================

-- Si no existen los roles, crearlos
INSERT INTO public.roles (nombre)
SELECT 'Administrador'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE nombre = 'Administrador');

INSERT INTO public.roles (nombre)
SELECT 'Empleado'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE nombre = 'Empleado');

INSERT INTO public.roles (nombre)
SELECT 'Visitante'
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE nombre = 'Visitante');

-- ============================================
-- 2. CREAR USUARIOS DE LOGIN
-- ============================================

-- Obtener IDs de roles
DO $$
DECLARE
    rol_admin_id INTEGER;
    rol_empleado_id INTEGER;
    rol_visitante_id INTEGER;
BEGIN
    -- Obtener IDs de roles
    SELECT id INTO rol_admin_id FROM public.roles WHERE nombre = 'Administrador' LIMIT 1;
    SELECT id INTO rol_empleado_id FROM public.roles WHERE nombre = 'Empleado' LIMIT 1;
    SELECT id INTO rol_visitante_id FROM public.roles WHERE nombre = 'Visitante' LIMIT 1;

    -- Usuario Administrador
    -- Contraseña hasheada con bcrypt (admin123)
    INSERT INTO public.usuarios (nombre, apellido, documento, email, telefono, password, rol_id, activo, creado_en, actualizado_en)
    SELECT 
        'Juan Carlos',
        'Pérez García',
        '12345678',
        'admin@sistema.com',
        '+57 300 123 4567',
        '$2a$10$YourHashedPasswordHere1234567890123456789012345678901234',
        rol_admin_id,
        true,
        NOW(),
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuarios WHERE email = 'admin@sistema.com'
    );

    -- Usuario Supervisor
    -- Contraseña hasheada con bcrypt (supervisor123)
    INSERT INTO public.usuarios (nombre, apellido, documento, email, telefono, password, rol_id, activo, creado_en, actualizado_en)
    SELECT 
        'María Elena',
        'González López',
        '87654321',
        'supervisor@sistema.com',
        '+57 301 987 6543',
        '$2a$10$YourHashedPasswordHere1234567890123456789012345678901234',
        rol_empleado_id,
        true,
        NOW(),
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuarios WHERE email = 'supervisor@sistema.com'
    );

    -- Usuario Empleado
    -- Contraseña hasheada con bcrypt (empleado123)
    INSERT INTO public.usuarios (nombre, apellido, documento, email, telefono, password, rol_id, activo, creado_en, actualizado_en)
    SELECT 
        'Carlos Alberto',
        'Rodríguez Silva',
        '11223344',
        'empleado@sistema.com',
        '+57 302 456 7890',
        '$2a$10$YourHashedPasswordHere1234567890123456789012345678901234',
        rol_empleado_id,
        true,
        NOW(),
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuarios WHERE email = 'empleado@sistema.com'
    );

    -- Usuario Visitante
    -- Contraseña hasheada con bcrypt (visitante123)
    INSERT INTO public.usuarios (nombre, apellido, documento, email, telefono, password, rol_id, activo, creado_en, actualizado_en)
    SELECT 
        'Ana Sofía',
        'Martínez Cruz',
        '44332211',
        'visitante@sistema.com',
        '+57 303 654 3210',
        '$2a$10$YourHashedPasswordHere1234567890123456789012345678901234',
        rol_visitante_id,
        true,
        NOW(),
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuarios WHERE email = 'visitante@sistema.com'
    );

    RAISE NOTICE 'Usuarios creados exitosamente';
END $$;

-- ============================================
-- 3. VERIFICAR USUARIOS CREADOS
-- ============================================

SELECT 
    u.id,
    u.nombre,
    u.apellido,
    u.email,
    r.nombre as rol,
    u.activo
FROM public.usuarios u
JOIN public.roles r ON u.rol_id = r.id
ORDER BY u.id;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 
-- Las contraseñas están hasheadas con bcrypt.
-- Los hashes mostrados arriba son placeholders.
-- 
-- Para generar los hashes reales, ejecuta en Node.js:
-- const bcrypt = require('bcryptjs');
-- console.log(await bcrypt.hash('admin123', 10));
-- 
-- O simplemente ejecuta: npx prisma db seed
-- ============================================
