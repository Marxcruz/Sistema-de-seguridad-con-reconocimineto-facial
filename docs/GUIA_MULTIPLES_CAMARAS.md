# 📹 Guía: Configurar Múltiples Cámaras en Tiempo Real

## 🎯 Descripción General

Tu sistema ahora soporta **múltiples cámaras en tiempo real** en el dashboard de administración. Puedes:

- ✅ Conectar cámaras USB locales
- ✅ Conectar cámaras IP (HTTP, MJPEG)
- ✅ Conectar cámaras DroidCam (celular)
- ✅ Visualizar todas simultáneamente en el dashboard
- ✅ Cambiar entre diferentes vistas (2x2, 3x2, 3x3, 4x3)
- ✅ Ampliar cualquier cámara a pantalla completa

---

## 🚀 Paso 1: Acceder al Módulo de Monitoreo

1. Inicia sesión en el dashboard: `http://localhost:3000`
2. Navega a **Monitoreo en Vivo** (en el menú principal)
3. Verás una cuadrícula con tus puntos de control

---

## 📍 Paso 2: Configurar Cámaras por Punto de Control

### Opción A: Desde el Dashboard (Recomendado)

1. En la página de **Monitoreo en Vivo**, haz clic en el botón **⚙️ Configurar** en cualquier tarjeta de cámara
2. Se abrirá un modal con los siguientes campos:
   - **URL de Cámara**: La dirección de tu cámara
   - **Tipo de Stream**: HTTP, MJPEG, RTSP, USB
   - **Usuario** (opcional): Para cámaras que requieren autenticación
   - **Contraseña** (opcional): Encriptada en la base de datos

3. Haz clic en **Guardar** y la cámara se conectará automáticamente

### Opción B: Desde la Base de Datos (SQL)

```sql
-- Actualizar punto de control con cámara
UPDATE puntos_control 
SET 
  camera_url = 'http://192.168.1.40:4747/video',
  stream_type = 'HTTP',
  camera_user = NULL,
  camera_pass = NULL
WHERE id = 1;
```

---

## 🎥 Tipos de Cámaras Soportadas

### 1. Cámara USB Local (Laptop/PC)

**Tipo**: USB  
**URL**: `0` (índice del dispositivo)  
**Ejemplo**:
```
URL: 0
Tipo: USB
```

**Nota**: La app de escritorio usa la cámara USB por defecto. El dashboard no puede acceder directamente a USB desde el navegador.

---

### 2. DroidCam (Celular como Cámara)

**Tipo**: HTTP  
**URL**: `http://IP_CELULAR:4747/video`  
**Ejemplo**:
```
URL: http://192.168.1.40:4747/video
Tipo: HTTP
```

**Requisitos**:
- App DroidCam instalada en celular
- Celular y laptop en mismo WiFi
- Pantalla del celular encendida

**Pasos**:
1. Descarga DroidCam Wireless Webcam en tu celular
2. Abre la app y anota la IP (ej: 192.168.1.40)
3. Usa puerto 4747 (por defecto)
4. En el dashboard, configura: `http://192.168.1.40:4747/video`

---

### 3. Cámara IP HTTP/MJPEG

**Tipo**: HTTP  
**URL**: `http://IP_CAMARA:PUERTO/stream`  
**Ejemplo**:
```
URL: http://192.168.1.100:8080/mjpeg
Tipo: HTTP
Usuario: admin
Contraseña: password123
```

**Cámaras compatibles**:
- Hikvision
- Dahua
- Axis
- Foscam
- TP-Link
- Cualquier cámara IP con stream HTTP

---

### 4. Cámara IP RTSP

**Tipo**: RTSP  
**URL**: `rtsp://IP_CAMARA:PUERTO/stream`  
**Ejemplo**:
```
URL: rtsp://admin:password@192.168.1.100:554/stream
Tipo: RTSP
```

**⚠️ Nota Importante**: 
Los streams RTSP requieren un servidor intermediario para mostrarse en el navegador. Opciones:

#### Opción 1: FFmpeg (Recomendado)
```bash
# Instalar FFmpeg
# Windows: https://ffmpeg.org/download.html
# Linux: sudo apt-get install ffmpeg
# macOS: brew install ffmpeg

# Convertir RTSP a HTTP
ffmpeg -rtsp_transport tcp -i rtsp://admin:pass@192.168.1.100:554/stream \
  -f mjpeg -q:v 5 -r 15 http://localhost:8888/stream.mjpeg
```

#### Opción 2: MediaMTX
```bash
# Descargar: https://github.com/bluenviron/mediamtx
# Configurar en mediamtx.yml:
paths:
  cam1:
    source: rtsp://admin:pass@192.168.1.100:554/stream

# Luego usar en dashboard:
# URL: http://localhost:8554/cam1/mjpeg
```

---

## 🎛️ Vistas de Cuadrícula

En el header del módulo de Monitoreo, puedes cambiar la vista:

- **2x2**: 4 cámaras (mejor para pantallas pequeñas)
- **3x2**: 6 cámaras (recomendado para 3 puntos)
- **3x3**: 9 cámaras (para múltiples puntos)
- **4x3**: 12 cámaras (para sistemas grandes)

---

## 🔍 Ampliar Cámara a Pantalla Completa

1. Pasa el mouse sobre cualquier tarjeta de cámara
2. Haz clic en el botón **🔍 Ampliar**
3. Se abrirá un modal con la cámara en tamaño grande
4. Haz clic en la **X** para cerrar

---

## 📊 Ejemplo: Configuración Completa de 3 Cámaras

### Punto 1: Entrada Principal (DroidCam)
```
Nombre: Entrada Principal
URL: http://192.168.1.40:4747/video
Tipo: HTTP
```

### Punto 2: Acceso Oficinas (Cámara IP)
```
Nombre: Acceso Oficinas
URL: http://192.168.1.100:8080/mjpeg
Tipo: HTTP
Usuario: admin
Contraseña: admin123
```

### Punto 3: Sala Servidores (RTSP convertido)
```
Nombre: Sala Servidores
URL: http://localhost:8888/stream.mjpeg
Tipo: HTTP
```

**Resultado**: En el dashboard verás las 3 cámaras en tiempo real en una cuadrícula 3x2.

---

## ✅ Checklist de Configuración

- [ ] Acceso al dashboard en `http://localhost:3000`
- [ ] Navegué a **Monitoreo en Vivo**
- [ ] Identifiqué mis puntos de control (3 por defecto)
- [ ] Configuré URL de cámara para cada punto
- [ ] Seleccioné el tipo de stream correcto
- [ ] Agregué credenciales si es necesario
- [ ] Guardé la configuración
- [ ] Las cámaras aparecen en el dashboard
- [ ] Probé ampliar una cámara
- [ ] Cambié entre diferentes vistas de cuadrícula

---

## 🔧 Troubleshooting

### Problema: "Cámara no configurada"
**Solución**: 
- Verifica que hayas guardado la configuración
- Recarga la página (F5)
- Verifica que la URL sea correcta

### Problema: "Error al conectar con la cámara"
**Solución**:
- Verifica que la cámara esté encendida y conectada
- Prueba la URL en el navegador directamente
- Verifica firewall/puertos abiertos
- Para DroidCam: verifica que celular y laptop estén en mismo WiFi

### Problema: Stream RTSP no se muestra
**Solución**:
- Necesitas convertir RTSP a HTTP con FFmpeg o MediaMTX
- Usa la URL convertida en el dashboard
- Ver sección "Cámara IP RTSP" arriba

### Problema: Baja calidad de video
**Solución**:
- Reduce la resolución en la cámara
- Aumenta el bitrate si es posible
- Reduce la distancia entre cámara y router WiFi

---

## 🚀 Características Avanzadas

### Actualizar Cámara en Tiempo Real
- Haz clic en **🔄 Actualizar** en el header
- Las cámaras se reconectarán automáticamente

### Cambiar Configuración sin Recargar
1. Haz clic en **⚙️ Configurar**
2. Modifica la URL o tipo
3. Haz clic en **Guardar**
4. La cámara se actualizará automáticamente

### Monitoreo Continuo
- El dashboard actualiza los streams automáticamente
- Puedes dejar abierto el navegador para monitoreo 24/7
- Los streams se reconectan si hay desconexión

---

## 📱 Integración con App de Escritorio

La app de escritorio (Control de Acceso) usa:
- **Cámara USB local** por defecto
- Pero también puede usar **cámaras IP** si configuras la URL en la BD

Para cambiar en la app de escritorio:
```python
# En desktop_access_app/main.py
# Línea ~62: self.api_base_url = "http://localhost:8000"
# La app carga la URL de cámara desde la API automáticamente
```

---

## 📝 Notas Importantes

1. **Seguridad**: Las contraseñas se encriptan en la base de datos
2. **Performance**: Más cámaras = más uso de ancho de banda
3. **Resolución**: Recomendado 640x480 para mejor performance
4. **Actualización**: Los streams se actualizan cada 100ms (~10 FPS)

---

## 🎓 Para Tesina

Este módulo demuestra:
- ✅ Arquitectura escalable para múltiples cámaras
- ✅ Integración de diferentes tipos de streams
- ✅ UI responsiva con Tailwind CSS
- ✅ Manejo de errores y fallbacks
- ✅ Configuración centralizada en BD
- ✅ Componentes reutilizables (MJPEGStream)

---

**¿Preguntas?** Revisa los archivos de documentación:
- `DROIDCAM_SETUP.md` - Configuración específica de DroidCam
- `CONFIGURAR_DROIDCAM.md` - Guía paso a paso
- `README.md` - Documentación general del proyecto
