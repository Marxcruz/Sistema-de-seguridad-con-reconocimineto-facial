# 📱 CONFIGURACIÓN DROIDCAM - CHECKLIST COMPLETO

## ✅ EN EL CELULAR (Android/iOS)

### 1. Instalar DroidCam
- [Android] Google Play Store → "DroidCam Wireless Webcam"
- [iOS] App Store → "DroidCam Webcam"

### 2. Conectar a WiFi
```
✅ Celular y laptop en MISMA red WiFi
✅ Usar WiFi 2.4GHz (más estable que 5GHz)
✅ NO usar datos móviles
```

### 3. Abrir DroidCam App
```
✅ App completamente abierta
✅ NO minimizada
✅ NO en segundo plano
✅ Pantalla del celular ENCENDIDA
```

### 4. Verificar que Muestra:
```
┌─────────────────────────────┐
│ DroidCam                    │
│                             │
│ WiFi IP: 192.168.1.40       │
│ Puerto DroidCam: 4747       │
│                             │
│ [Video preview visible]     │
└─────────────────────────────┘
```

### 5. Configuración Recomendada (⋮ menú)
```
Settings / Configuración:

✅ Video: ON
✅ Audio: OFF (opcional, no necesario)
✅ Keep Screen On: ON (importante)
✅ Quality: 480p o superior
✅ FPS: 30fps (si disponible)
```

---

## 🧪 VERIFICAR QUE FUNCIONA

### Prueba 1: Desde Navegador
```
En laptop, abrir:
http://192.168.1.40:4747

Deberías ver:
- Página principal de DroidCam
- Links a diferentes streams
- Información de conexión
```

### Prueba 2: Stream Directo
```
En laptop, abrir:
http://192.168.1.40:4747/mjpegfeed

Deberías ver:
- Video en tiempo real del celular
- Actualización continua (30fps)
```

### Prueba 3: Desde Python
```python
import cv2

cap = cv2.VideoCapture('http://192.168.1.40:4747/mjpegfeed')

if cap.isOpened():
    print("✅ DroidCam funcionando")
    ret, frame = cap.read()
    if ret:
        print(f"✅ Frame: {frame.shape}")
        cv2.imshow("DroidCam", frame)
        cv2.waitKey(3000)
else:
    print("❌ No conecta")

cap.release()
cv2.destroyAllWindows()
```

---

## ⚠️ PROBLEMAS COMUNES

### "No se conecta desde laptop"
```
Causa: Firewall bloqueando puerto 4747

Solución:
1. Firewall Windows → Permitir puerto 4747
2. O temporalmente desactivar firewall (solo para prueba)
3. Verificar que ambos estén en MISMA red
```

### "Video se congela"
```
Causa: Celular entrando en modo ahorro

Solución:
1. DroidCam Settings → Keep Screen On: ON
2. Desactivar modo ahorro en celular
3. Conectar celular a cargador
```

### "IP cambia constantemente"
```
Causa: Router asigna IP dinámica

Solución:
1. Router → Reservar IP para MAC del celular
2. O configurar IP estática en celular
3. O simplemente reconfigurar en Dashboard cuando cambie
```

### "Calidad muy mala"
```
Causa: Configuración de calidad baja

Solución:
1. DroidCam → Settings → Video Quality: 720p
2. Verificar que WiFi tenga buena señal
3. Acercar celular al router
```

---

## 📊 RENDIMIENTO ESPERADO

```
Resolución  | FPS | Uso de Red | Calidad
------------|-----|------------|----------
480p        | 30  | ~2 Mbps    | Buena
720p        | 30  | ~4 Mbps    | Muy buena
1080p       | 30  | ~8 Mbps    | Excelente
```

Para reconocimiento facial: **480p es suficiente** ✅

---

## 🎯 FLUJO COMPLETO

```
1. CELULAR
   ├─ Conectar WiFi (192.168.1.x)
   ├─ Abrir DroidCam
   ├─ Ver IP: 192.168.1.40:4747
   └─ Mantener app abierta

2. LAPTOP - Navegador (prueba)
   ├─ Abrir: http://192.168.1.40:4747/mjpegfeed
   └─ Verificar que se ve video ✅

3. LAPTOP - Dashboard
   ├─ Configurar punto con URL
   └─ Guardar configuración ✅

4. LAPTOP - App Escritorio
   ├─ Seleccionar punto
   ├─ Iniciar cámara
   └─ Ver video del celular ✅
```

---

## ✅ ESTADO ÓPTIMO

```
CELULAR:
✅ DroidCam abierta en primer plano
✅ Pantalla encendida
✅ WiFi conectado
✅ IP visible: 192.168.1.40:4747
✅ Preview de cámara funcionando

LAPTOP:
✅ Navegador muestra video: http://192.168.1.40:4747/mjpegfeed
✅ Dashboard configurado con URL
✅ App de escritorio puede conectar
```

Cuando todo esté así → Sistema funcionará perfectamente 🎉
