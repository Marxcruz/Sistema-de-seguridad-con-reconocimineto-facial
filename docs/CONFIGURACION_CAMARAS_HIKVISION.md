# 🎥 Configuración: Cámaras Hikvision y IP en tu Red

## 📊 Tu Setup de Cámaras

```
192.168.1.102  → HikVision NVR/Cámara (HTTP: 80)
192.168.1.105  → HikVision IPCam (HTTP: 80, RTSP: 554, 8000)
192.168.1.124  → MiaoMing (HTTP: 80, 8000)
192.168.1.101  → Desconocida (HTTP: 80/8080)
192.168.1.103  → Desconocida (HTTP: 80/8080)
192.168.1.107  → Desconocida (HTTP: 80/8080)
192.168.1.109  → Desconocida (HTTP: 80/8080)
192.168.1.114  → Desconocida (HTTP: 80/8080)
192.168.1.116  → Desconocida (HTTP: 80/8080)
```

**Total: 9 cámaras IP disponibles** 🚀

---

## ✅ Paso 1: Descubrir URLs de Streaming

### Para Hikvision 192.168.1.102 (NVR)

```bash
# Prueba estas URLs en el navegador:
http://192.168.1.102/
http://192.168.1.102/doc/page/login.asp
http://192.168.1.102:80/ISAPI/Streaming/channels/101/picture
```

**Si ves interfaz web:**
- Usuario: `admin` (por defecto)
- Contraseña: `12345` (por defecto Hikvision)

**Para obtener stream MJPEG:**
```
http://192.168.1.102:80/ISAPI/Streaming/channels/101/httppreview
```

---

### Para Hikvision 192.168.1.105 (IPCam)

**RTSP (Mejor calidad):**
```
rtsp://admin:12345@192.168.1.105:554/Streaming/Channels/101
```

**HTTP MJPEG (Alternativa):**
```
http://192.168.1.105:80/ISAPI/Streaming/channels/101/httppreview
```

**Puerto 8000 (Interfaz Web):**
```
http://192.168.1.105:8000/
```

---

### Para MiaoMing 192.168.1.124

```bash
# Interfaz web:
http://192.168.1.124:80/
http://192.168.1.124:8000/

# Posibles URLs de stream:
http://192.168.1.124:80/cgi-bin/mjpg/video.cgi
http://192.168.1.124:8000/mjpg/video.cgi
rtsp://admin:admin@192.168.1.124:554/stream1
```

---

### Para Desconocidas (101, 103, 107, 109, 114, 116)

```bash
# Prueba estas URLs para cada una:
http://192.168.1.10X:80/
http://192.168.1.10X:8080/
http://192.168.1.10X:80/cgi-bin/mjpg/video.cgi
http://192.168.1.10X:80/stream
http://192.168.1.10X:80/mjpeg
```

---

## 🔍 Paso 2: Identificar Credenciales

### Hikvision (Más probable)
```
Usuario: admin
Contraseña: 12345
```

### Alternativas comunes
```
Usuario: admin / root
Contraseña: admin / 12345 / admin123 / password
```

### Para acceder a interfaz:
```
http://192.168.1.10X:80/
http://192.168.1.10X:8000/
```

---

## 🎯 Paso 3: Configurar en tu Dashboard

### Opción A: RTSP (Mejor Calidad - Recomendado)

**Para 192.168.1.105 (Hikvision con RTSP):**

```
URL: rtsp://admin:12345@192.168.1.105:554/Streaming/Channels/101
Tipo: RTSP
Usuario: admin
Contraseña: 12345
```

**PERO NECESITAS CONVERTIR RTSP A HTTP PRIMERO**

---

### Opción B: HTTP MJPEG (Más Fácil - Recomendado para Empezar)

**Para 192.168.1.105 (Hikvision):**

```
URL: http://192.168.1.105:80/ISAPI/Streaming/channels/101/httppreview
Tipo: HTTP
Usuario: admin
Contraseña: 12345
```

**Para 192.168.1.102 (NVR):**

```
URL: http://192.168.1.102:80/ISAPI/Streaming/channels/101/httppreview
Tipo: HTTP
Usuario: admin
Contraseña: 12345
```

**Para 192.168.1.124 (MiaoMing):**

```
URL: http://192.168.1.124:80/cgi-bin/mjpg/video.cgi
Tipo: HTTP
Usuario: admin
Contraseña: admin
```

---

## 🚀 Paso 4: Convertir RTSP a HTTP (Opcional pero Recomendado)

Si quieres usar RTSP para mejor calidad, necesitas FFmpeg:

### Instalar FFmpeg

**Windows:**
```bash
# Descargar desde: https://ffmpeg.org/download.html
# O usar chocolatey:
choco install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

### Convertir RTSP a HTTP

```bash
# Crear servidor HTTP que convierte RTSP
ffmpeg -rtsp_transport tcp -i rtsp://admin:12345@192.168.1.105:554/Streaming/Channels/101 \
  -f mjpeg -q:v 5 -r 15 http://localhost:8888/stream.mjpeg
```

**Luego en dashboard:**
```
URL: http://localhost:8888/stream.mjpeg
Tipo: HTTP
```

---

## 📋 Configuración Recomendada para tu Dashboard

### Punto 1: Entrada Principal (192.168.1.105 - Hikvision)
```
Nombre: Entrada Principal - Hikvision
URL: http://192.168.1.105:80/ISAPI/Streaming/channels/101/httppreview
Tipo: HTTP
Usuario: admin
Contraseña: 12345
```

### Punto 2: Acceso Oficinas (192.168.1.102 - NVR)
```
Nombre: Acceso Oficinas - NVR
URL: http://192.168.1.102:80/ISAPI/Streaming/channels/101/httppreview
Tipo: HTTP
Usuario: admin
Contraseña: 12345
```

### Punto 3: Sala Servidores (192.168.1.124 - MiaoMing)
```
Nombre: Sala Servidores - MiaoMing
URL: http://192.168.1.124:80/cgi-bin/mjpg/video.cgi
Tipo: HTTP
Usuario: admin
Contraseña: admin
```

### Puntos Adicionales (Desconocidas)

Para cada una (101, 103, 107, 109, 114, 116):

```
Nombre: Cámara [IP]
URL: http://192.168.1.10X:80/cgi-bin/mjpg/video.cgi
Tipo: HTTP
Usuario: admin
Contraseña: admin
```

Si no funciona, prueba:
```
URL: http://192.168.1.10X:8080/cgi-bin/mjpg/video.cgi
```

---

## 🔧 Troubleshooting Específico

### "No puedo acceder a la interfaz web"

```bash
# Verifica que la cámara responda:
ping 192.168.1.105

# Verifica puerto abierto:
telnet 192.168.1.105 80
```

### "Credenciales incorrectas"

Intenta resetear la cámara Hikvision:
1. Mantén presionado botón RESET por 10 segundos
2. Usuario: `admin`
3. Contraseña: `12345`

### "Stream no se muestra"

1. Verifica URL en navegador directamente
2. Intenta con usuario/contraseña vacíos
3. Prueba puerto 8080 en lugar de 80
4. Verifica firewall

### "Baja calidad o lag"

1. Reduce resolución en cámara
2. Reduce framerate: `/httppreview?resolution=1&framerate=10`
3. Usa HTTP en lugar de RTSP

---

## 🎯 URLs Específicas por Fabricante

### Hikvision (192.168.1.102, 192.168.1.105)

**MJPEG Stream:**
```
http://IP:80/ISAPI/Streaming/channels/101/httppreview
http://IP:80/ISAPI/Streaming/channels/102/httppreview
http://IP:80/ISAPI/Streaming/channels/103/httppreview
```

**RTSP Stream:**
```
rtsp://admin:12345@IP:554/Streaming/Channels/101
rtsp://admin:12345@IP:554/Streaming/Channels/102
```

**Parámetros opcionales:**
```
?resolution=1&framerate=15&bitrate=512
```

---

### MiaoMing (192.168.1.124)

**MJPEG Stream:**
```
http://IP:80/cgi-bin/mjpg/video.cgi
http://IP:8000/cgi-bin/mjpg/video.cgi
```

**Parámetros:**
```
?resolution=1&framerate=15
```

---

### Genéricas (101, 103, 107, 109, 114, 116)

**Intenta en orden:**
```
1. http://IP:80/cgi-bin/mjpg/video.cgi
2. http://IP:8080/cgi-bin/mjpg/video.cgi
3. http://IP:80/stream
4. http://IP:80/mjpeg
5. http://IP:80/video
6. http://IP:8000/
```

---

## 📊 Ejemplo: 9 Cámaras en Dashboard

Con tu setup podrías tener:

```
Vista 3x3 (9 cámaras):

┌─────────────────────────────────────┐
│ Hikvision  │ NVR         │ MiaoMing  │
│ 192.168... │ 192.168...  │ 192.168.. │
├─────────────────────────────────────┤
│ Cam 101    │ Cam 103     │ Cam 107   │
│ 192.168... │ 192.168...  │ 192.168.. │
├─────────────────────────────────────┤
│ Cam 109    │ Cam 114     │ Cam 116   │
│ 192.168... │ 192.168...  │ 192.168.. │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Configuración

- [ ] Ping a todas las cámaras (verificar conectividad)
- [ ] Acceso a interfaz web de Hikvision (192.168.1.105:8000)
- [ ] Acceso a interfaz web de NVR (192.168.1.102)
- [ ] Acceso a interfaz web de MiaoMing (192.168.1.124:8000)
- [ ] Probé URLs de stream en navegador
- [ ] Identifiqué credenciales correctas
- [ ] Configuré primera cámara en dashboard
- [ ] Primera cámara aparece en tiempo real
- [ ] Configuré las otras 8 cámaras
- [ ] Todas las 9 cámaras visibles en vista 3x3

---

## 🎓 Para tu Tesina

Este setup demuestra:
- ✅ Integración con cámaras IP profesionales
- ✅ Manejo de múltiples fabricantes
- ✅ Configuración centralizada
- ✅ Escalabilidad a 9+ cámaras
- ✅ Arquitectura profesional

---

## 📞 Soporte

Si tienes problemas con URLs específicas:

1. Accede a interfaz web de cada cámara
2. Busca en Settings → Stream o Video
3. Copia la URL del stream
4. Usa esa URL en el dashboard

**Hikvision tiene excelente documentación en:**
```
http://IP:8000/ → Help → API Documentation
```

---

**¡Con 9 cámaras IP tienes un sistema profesional completo!** 🚀
