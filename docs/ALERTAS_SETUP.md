# 🚨 Configuración del Sistema de Alertas

## Problema Resuelto

La aplicación de escritorio ahora **SÍ crea alertas automáticamente** en la base de datos cuando:
- Se deniega un acceso
- Se detecta un usuario no registrado
- Falla la detección de liveness (anti-spoofing)
- La confianza es insuficiente

## 🔧 Configuración Inicial

### Paso 1: Ejecutar Script de Catálogos

Abre pgAdmin o tu cliente PostgreSQL y ejecuta:

```sql
-- Archivo: database/seed_alertas.sql
```

Este script crea los tipos de alerta necesarios:
- `acceso_denegado` (ID: 1)
- `intento_no_autorizado` (ID: 2)
- `liveness_fallido` (ID: 3)
- `suplantacion` (ID: 4)
- `acceso_exitoso` (ID: 5)

### Paso 2: Verificar Configuración

Ejecuta el script de verificación:

```sql
-- Archivo: database/verify_alertas_setup.sql
```

Deberías ver:
- ✅ 5 tipos de alerta
- ✅ 2 tipos de decisión (PERMITIDO, DENEGADO)
- ✅ 4 canales de notificación
- ✅ Al menos 1 punto de control

## 🚀 Cómo Funciona

### Flujo Automático

```
1. Usuario se presenta ante la cámara (App Escritorio)
   ↓
2. App envía imagen a API Python (/recognize-face)
   ↓
3. API procesa reconocimiento facial
   ↓
4. API registra en BD:
   - Tabla 'accesos': Registro del intento
   - Tabla 'acceso_rostros': Datos del rostro procesado
   - Tabla 'alertas': SI fue denegado
   - Tabla 'notificaciones': Para la alerta creada
   ↓
5. Dashboard consulta /api/notifications
   ↓
6. Notificaciones aparecen en tiempo real 🔔
```

### Tipos de Alertas Generadas

| Situación | Tipo de Alerta | Prioridad |
|-----------|----------------|-----------|
| Usuario no registrado (confianza < 80%) | `intento_no_autorizado` | 🔴 Alta |
| Falla liveness (foto/video detectado) | `liveness_fallido` | 🟠 Media |
| Confianza insuficiente (80-95%) | `acceso_denegado` | 🟠 Media |
| Usuario registrado sin permisos | `acceso_denegado` | 🟠 Media |

## 🧪 Prueba del Sistema

### Opción 1: Usar App de Escritorio

1. **Inicia el servicio Python:**
   ```bash
   cd face_recognition_service
   .\start.bat
   ```

2. **Inicia el dashboard:**
   ```bash
   npm run dev
   ```

3. **Inicia la app de escritorio:**
   ```bash
   cd desktop_access_app
   .\run.bat
   ```

4. **Genera una alerta:**
   - Presenta un rostro NO registrado ante la cámara
   - O usa una foto del celular (fallará liveness)

5. **Verifica en el dashboard:**
   - Abre http://localhost:3000
   - Haz clic en el botón de notificaciones 🔔
   - Deberías ver la alerta creada

### Opción 2: Insertar Alerta Manualmente (Prueba Rápida)

```sql
-- Crear una alerta de prueba
INSERT INTO alertas (tipo_id, detalle, punto_id)
VALUES (2, 'Prueba: Usuario no registrado intentó acceder', 1);

-- Crear notificación asociada
INSERT INTO notificaciones (alerta_id, canal_id, destino, estado)
VALUES (
    (SELECT MAX(id) FROM alertas),
    1,
    'sistema',
    'pendiente'
);
```

Luego refresca el dashboard y verás la notificación.

## 📊 Verificar que Funciona

### En Logs de Python

Cuando se procesa un acceso denegado, deberías ver:

```
✅ Acceso registrado en BD: ID 123
✅ Rostro registrado para acceso 123
🚨 ALERTA CREADA: ID 45 - Tipo 2
   Detalle: Persona no registrada intentó acceder (confianza: 45.2%)
📬 Notificación creada para alerta 45
```

### En Dashboard Web

1. El contador de notificaciones debe mostrar un número > 0
2. Al hacer clic en 🔔 debe abrir el panel
3. Deberías ver las alertas con:
   - Icono según tipo (❌ ⚠️ ✅)
   - Detalle del evento
   - Timestamp ("Hace 2 min")
   - Color según prioridad

### En Base de Datos

```sql
-- Ver últimas alertas
SELECT * FROM alertas ORDER BY creado_en DESC LIMIT 5;

-- Ver últimas notificaciones
SELECT * FROM notificaciones ORDER BY creado_en DESC LIMIT 5;

-- Ver últimos accesos
SELECT * FROM accesos ORDER BY fecha_hora DESC LIMIT 5;
```

## 🐛 Solución de Problemas

### No aparecen alertas en el dashboard

1. **Verificar que el servicio Python esté corriendo:**
   ```bash
   # Debería responder
   curl http://localhost:8000/health
   ```

2. **Verificar logs de Python:**
   - Buscar mensajes "🚨 ALERTA CREADA"
   - Si no aparecen, el acceso fue PERMITIDO (no genera alerta)

3. **Verificar en BD:**
   ```sql
   SELECT COUNT(*) FROM alertas;
   ```

4. **Verificar API de notificaciones:**
   ```bash
   # Debería devolver JSON con alertas
   curl http://localhost:3000/api/notifications
   ```

### Error "tipo_alerta no existe"

Ejecuta el script de catálogos:
```sql
-- database/seed_alertas.sql
```

### Error "punto_id no existe"

Crea un punto de control:
```sql
INSERT INTO puntos_control (nombre, ubicacion, tipo_id, activo)
VALUES ('Entrada Principal', 'Recepción', 1, true);
```

## 📈 Estadísticas

Para ver estadísticas de alertas:

```sql
SELECT 
    ta.nombre as tipo_alerta,
    COUNT(*) as cantidad,
    MAX(a.creado_en) as ultima_alerta
FROM alertas a
JOIN tipo_alerta ta ON a.tipo_id = ta.id
GROUP BY ta.nombre
ORDER BY cantidad DESC;
```

## 🔄 Actualización Automática

El sistema actualiza las notificaciones:
- **Automáticamente cada 30 segundos** (Header.tsx)
- **Al abrir el panel** de notificaciones
- **Al cerrar el panel** de notificaciones

## 🎯 Próximos Pasos

- [ ] Configurar notificaciones por Email (SMTP)
- [ ] Configurar notificaciones por Telegram
- [ ] Agregar filtros por tipo de alerta
- [ ] Implementar WebSocket para tiempo real
- [ ] Agregar sonido de notificación

---

**¡El sistema está listo para usar!** 🎉

Cada vez que la app de escritorio procese un rostro, se creará automáticamente:
1. Registro de acceso
2. Alerta (si fue denegado)
3. Notificación (visible en dashboard)
