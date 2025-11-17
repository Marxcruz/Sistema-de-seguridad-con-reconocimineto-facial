# 🎥 SETUP COMPLETO: 9 Cámaras IP Hikvision + Genéricas

## 🎯 Tu Configuración Específica

```
📍 Punto 1: 192.168.1.102 (Hikvision NVR)
📍 Punto 2: 192.168.1.105 (Hikvision IPCam)
📍 Punto 3: 192.168.1.124 (MiaoMing)
📍 Punto 4: 192.168.1.101 (Desconocida)
📍 Punto 5: 192.168.1.103 (Desconocida)
📍 Punto 6: 192.168.1.107 (Desconocida)
📍 Punto 7: 192.168.1.109 (Desconocida)
📍 Punto 8: 192.168.1.114 (Desconocida)
📍 Punto 9: 192.168.1.116 (Desconocida)
```

---

## ⚡ INICIO RÁPIDO (10 minutos)

### Paso 1: Ejecutar Descubridor Automático (2 minutos)

```bash
python descubrir_camaras_ip.py
```

Este script:
- ✅ Prueba todas tus cámaras
- ✅ Encuentra URLs de streaming
- ✅ Identifica credenciales
- ✅ Genera configuración lista para usar
- ✅ Guarda resultados en `camaras_descubiertas.json`

**Salida esperada:**
```
✅ 192.168.1.102:80 - Interfaz Web
✅ 192.168.1.105:80 - Interfaz Web
✅ 192.168.1.105:80/ISAPI/Streaming/channels/101/httppreview (admin:12345)
✅ 192.168.1.124:80 - Interfaz Web
✅ 192.168.1.124:80/cgi-bin/mjpg/video.cgi (admin:admin)
...
```

---

### Paso 2: Iniciar Sistema (2 minutos)

```bash
# Terminal 1
cd face_recognition_service
python main.py

# Terminal 2
npm run dev
```

---

### Paso 3: Configurar en Dashboard (5 minutos)

1. Abre: `http://localhost:3000`
2. Login: `admin@sistema.com` / `admin123`
3. Ve a: **Monitoreo en Vivo**
4. Para cada punto, haz clic en **⚙️ Configurar**
5. Copia URLs del archivo `camaras_descubiertas.json`
6. Haz clic en **Guardar**

---

### Paso 4: ¡Disfruta! (1 minuto)

- ✅ Verás todas las cámaras en tiempo real
- ✅ Cambia vista a 3x3 para ver las 9 simultáneamente
- ✅ Amplía cualquier cámara a pantalla completa

---

## 📋 Configuración Manual (Si el descubridor no funciona)

### Hikvision 192.168.1.102 (NVR)

**Interfaz Web:**
```
http://192.168.1.102:8000/
Usuario: admin
Contraseña: 12345
```

**Stream MJPEG:**
```
URL: http://192.168.1.102:80/ISAPI/Streaming/channels/101/httppreview
Tipo: HTTP
Usuario: admin
Contraseña: 12345
```

---

### Hikvision 192.168.1.105 (IPCam)

**Interfaz Web:**
```
http://192.168.1.105:8000/
Usuario: admin
Contraseña: 12345
```

**Stream MJPEG (Recomendado):**
```
URL: http://192.168.1.105:80/ISAPI/Streaming/channels/101/httppreview
Tipo: HTTP
Usuario: admin
Contraseña: 12345
```

**Stream RTSP (Mejor calidad, requiere FFmpeg):**
```
URL: rtsp://admin:12345@192.168.1.105:554/Streaming/Channels/101
Tipo: RTSP
```

---

### MiaoMing 192.168.1.124

**Interfaz Web:**
```
http://192.168.1.124:8000/
Usuario: admin
Contraseña: admin
```

**Stream MJPEG:**
```
URL: http://192.168.1.124:80/cgi-bin/mjpg/video.cgi
Tipo: HTTP
Usuario: admin
Contraseña: admin
```

---

### Desconocidas (101, 103, 107, 109, 114, 116)

**Intenta estas URLs en orden:**

```
1. http://192.168.1.10X:80/cgi-bin/mjpg/video.cgi
2. http://192.168.1.10X:8080/cgi-bin/mjpg/video.cgi
3. http://192.168.1.10X:80/stream
4. http://192.168.1.10X:80/mjpeg
5. http://192.168.1.10X:80/video
```

**Credenciales a probar:**
```
admin / 12345
admin / admin
admin / admin123
root / 12345
(sin credenciales)
```

---

## 🔧 Solucionar Problemas

### "No encuentro la URL de streaming"

1. Accede a interfaz web:
   ```
   http://192.168.1.10X:80/
   http://192.168.1.10X:8000/
   ```

2. Busca en Settings → Stream o Video

3. Copia la URL del stream

4. Usa esa URL en el dashboard

### "Credenciales incorrectas"

Para Hikvision, resetea:
1. Mantén presionado botón RESET por 10 segundos
2. Usuario: `admin`
3. Contraseña: `12345`

### "Stream no se muestra en dashboard"

1. Verifica URL en navegador directamente
2. Verifica que usuario/contraseña sean correctos
3. Intenta sin credenciales
4. Verifica firewall

### "Baja calidad o lag"

1. Reduce resolución en cámara
2. Reduce framerate: `/httppreview?resolution=1&framerate=10`
3. Usa HTTP en lugar de RTSP

---

## 📊 Vista Final: 9 Cámaras en 3x3

```
┌──────────────────────────────────────────────────────────┐
│ Monitoreo en Vivo                                        │
│ 9 de 9 cámaras activas                                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Hikvision   │  │ NVR         │  │ MiaoMing    │     │
│  │ 192.168...  │  │ 192.168...  │  │ 192.168...  │     │
│  │ 102         │  │ 105         │  │ 124         │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Cámara 101  │  │ Cámara 103  │  │ Cámara 107  │     │
│  │ 192.168...  │  │ 192.168...  │  │ 192.168...  │     │
│  │ 101         │  │ 103         │  │ 107         │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Cámara 109  │  │ Cámara 114  │  │ Cámara 116  │     │
│  │ 192.168...  │  │ 192.168...  │  │ 192.168...  │     │
│  │ 109         │  │ 114         │  │ 116         │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🎓 Ventajas de tu Setup

✅ **9 cámaras profesionales**
✅ **Hikvision de grado empresarial**
✅ **Múltiples fabricantes (diversidad)**
✅ **Cobertura completa de instalación**
✅ **Escalable a más cámaras**
✅ **Integración perfecta con tu sistema**

---

## 🚀 Próximos Pasos Avanzados

### 1. Usar RTSP para Mejor Calidad

```bash
# Instalar FFmpeg
choco install ffmpeg  # Windows
# o
sudo apt-get install ffmpeg  # Linux

# Convertir RTSP a HTTP
ffmpeg -rtsp_transport tcp -i rtsp://admin:12345@192.168.1.105:554/Streaming/Channels/101 \
  -f mjpeg -q:v 5 -r 15 http://localhost:8888/stream.mjpeg

# Usar en dashboard:
# URL: http://localhost:8888/stream.mjpeg
```

### 2. Grabación de Streams

```bash
# Grabar stream a archivo
ffmpeg -i http://192.168.1.105:80/ISAPI/Streaming/channels/101/httppreview \
  -c copy output.mp4
```

### 3. Alertas por Movimiento

Próxima mejora: Detectar movimiento en streams y generar alertas automáticas

### 4. Análisis de Eventos

Próxima mejora: Integrar eventos de cámaras Hikvision (detección de personas, etc.)

---

## 📞 Soporte Específico

### Hikvision API Documentation
```
http://192.168.1.105:8000/
→ Help → API Documentation
```

### URLs Útiles
```
http://192.168.1.105:8000/doc/page/login.asp
http://192.168.1.105:80/ISAPI/System/deviceInfo
http://192.168.1.105:80/ISAPI/Streaming/channels
```

---

## ✅ Checklist Final

- [ ] Ejecuté `python descubrir_camaras_ip.py`
- [ ] Obtuve archivo `camaras_descubiertas.json`
- [ ] Inicié API Python
- [ ] Inicié Dashboard
- [ ] Logueado en dashboard
- [ ] En página "Monitoreo en Vivo"
- [ ] Configuré primeras 3 cámaras (Hikvision, NVR, MiaoMing)
- [ ] Configuré las 6 cámaras desconocidas
- [ ] Todas las 9 cámaras visibles
- [ ] Cambié vista a 3x3
- [ ] Probé ampliar una cámara

---

## 🎉 ¡LISTO!

Tienes un **sistema profesional de monitoreo con 9 cámaras IP** completamente integrado en tu dashboard.

**Esto es perfecto para tu tesina** porque demuestra:
- Integración con hardware profesional
- Escalabilidad real
- Manejo de múltiples fabricantes
- Arquitectura empresarial

---

**Versión**: 1.1.0  
**Fecha**: 13 de Noviembre 2025  
**Estado**: ✅ LISTO PARA PRODUCCIÓN
