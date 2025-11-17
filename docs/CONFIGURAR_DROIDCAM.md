# 📱 CONFIGURACIÓN DROIDCAM - GUÍA RÁPIDA

## 🎯 Tu DroidCam está en:
```
IP: 192.168.1.40
Puerto: 4747
```

## ✅ PASO 1: Configurar en Dashboard

1. **Abrir Dashboard:** http://localhost:3000
2. **Ir a:** Zonas y Puntos
3. **Click botón 📹** en el punto que quieras (ej: "Entrada Principal")
4. **Llenar formulario:**

```
┌─────────────────────────────────────────────┐
│ Tipo de Conexión                            │
│ → HTTP/MJPEG - Cámara Web                   │
├─────────────────────────────────────────────┤
│ URL / Índice de Cámara                      │
│ → http://192.168.1.40:4747/mjpegfeed       │
├─────────────────────────────────────────────┤
│ Usuario (dejar vacío)                       │
├─────────────────────────────────────────────┤
│ Contraseña (dejar vacío)                    │
└─────────────────────────────────────────────┘
```

5. **Click "Guardar"**

---

## ✅ PASO 2: Usar en App de Escritorio

```bash
cd desktop_access_app
python main.py
```

1. Seleccionar punto: "Entrada Principal"
2. Click "Iniciar Cámara"
3. ✅ Verás video de tu celular en la app

---

## 🔧 URLs ALTERNATIVAS (Si la primera no funciona)

```bash
# Opción 1: MJPEG feed (recomendado)
http://192.168.1.40:4747/mjpegfeed

# Opción 2: Video directo
http://192.168.1.40:4747/video

# Opción 3: HD (si activaste en DroidCam)
http://192.168.1.40:4747/video?1920x1080

# Opción 4: Baja calidad (más rápido)
http://192.168.1.40:4747/video?640x480
```

---

## 🧪 VERIFICAR CONEXIÓN

### Desde navegador:
```
http://192.168.1.40:4747/mjpegfeed
```
Deberías ver el video del celular

### Desde Python (rápido):
```python
import cv2

cap = cv2.VideoCapture('http://192.168.1.40:4747/mjpegfeed')

if cap.isOpened():
    print("✅ DroidCam funcionando")
    ret, frame = cap.read()
    if ret:
        print(f"✅ Frame recibido: {frame.shape}")
else:
    print("❌ No se pudo conectar")

cap.release()
```

---

## ⚠️ TROUBLESHOOTING

### Si no conecta:

1. **Verifica WiFi:** PC y celular en misma red
   ```bash
   ping 192.168.1.40
   ```

2. **Firewall:** Permitir puerto 4747
   
3. **DroidCam activo:** App abierta en celular

4. **IP correcta:** Puede cambiar si se reconecta WiFi

---

## 📊 EJEMPLO COMPLETO

```
┌─────────────────────────────────────┐
│  CELULAR (DroidCam)                 │
│  IP: 192.168.1.40                   │
│  Puerto: 4747                       │
└──────────────┬──────────────────────┘
               │
               │ WiFi (192.168.1.x)
               │
┌──────────────▼──────────────────────┐
│  PC (Dashboard)                     │
│  Config: http://192.168.1.40:4747   │
└──────────────┬──────────────────────┘
               │
               │ API
               │
┌──────────────▼──────────────────────┐
│  App Escritorio                     │
│  Lee config → Conecta a DroidCam    │
│  Muestra video del celular          │
└─────────────────────────────────────┘
```

---

## ✅ VERIFICACIÓN FINAL

Después de configurar, verás en logs de la app:

```
🔍 Obteniendo configuración de cámara para punto 1...
✅ Configuración encontrada: HTTP - http://192.168.1.40:4747/mjpegfeed
📹 Conectando a cámara HTTP: http://192.168.1.40:4747/mjpegfeed
✅ Cámara HTTP conectada exitosamente
🎥 Resolución real de cámara: 640x480
🟢 Sistema Activo - Cámara HTTP
```

---

## 🎉 ¡LISTO!

Ahora tu celular es una cámara IP para el sistema de reconocimiento facial.

**Ventajas:**
- ✅ Sin cables
- ✅ Portátil
- ✅ Puedes mover el celular a diferentes puntos
- ✅ Calidad HD disponible
- ✅ Gratis
