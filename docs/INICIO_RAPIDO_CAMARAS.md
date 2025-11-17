# 🚀 Inicio Rápido: Múltiples Cámaras (5 minutos)

## ⚡ En 5 Pasos

### 1️⃣ Inicia los Servicios (2 minutos)

**Terminal 1 - API Python:**
```bash
cd face_recognition_service
python main.py
```

**Terminal 2 - Dashboard:**
```bash
npm run dev
```

Espera a que ambos digan "✅ Listo" o "Ready"

---

### 2️⃣ Abre el Dashboard (30 segundos)

Abre en tu navegador:
```
http://localhost:3000
```

Inicia sesión:
- Email: `admin@sistema.com`
- Contraseña: `admin123`

---

### 3️⃣ Ve a Monitoreo en Vivo (30 segundos)

1. En el menú lateral, haz clic en **Monitoreo en Vivo**
2. Verás 3 tarjetas de puntos de control
3. Cada una dice "Cámara no configurada"

---

### 4️⃣ Configura tu Primera Cámara (1 minuto)

**Para DroidCam (Celular):**

1. Abre la app DroidCam en tu celular
2. Anota la IP (ej: 192.168.1.40)
3. En el dashboard, haz clic en **⚙️ Configurar** en la primera tarjeta
4. Ingresa:
   - URL: `http://192.168.1.40:4747/video`
   - Tipo: `HTTP`
5. Haz clic en **Guardar**

**Para Cámara IP:**

1. Anota la URL de tu cámara (ej: `http://192.168.1.100:8080/mjpeg`)
2. En el dashboard, haz clic en **⚙️ Configurar**
3. Ingresa:
   - URL: `http://192.168.1.100:8080/mjpeg`
   - Tipo: `HTTP`
   - Usuario: `admin` (si requiere)
   - Contraseña: `password` (si requiere)
4. Haz clic en **Guardar**

---

### 5️⃣ ¡Disfruta! (30 segundos)

✅ La cámara debería aparecer en la tarjeta  
✅ Pasa el mouse para ver controles  
✅ Haz clic en 🔍 para ampliar  
✅ Cambia vista con botones en el header

---

## 📱 Tipos de Cámaras Rápido

| Tipo | URL Ejemplo | Tipo Stream |
|------|-------------|------------|
| **DroidCam** | `http://192.168.1.40:4747/video` | HTTP |
| **Cámara IP** | `http://192.168.1.100:8080/mjpeg` | HTTP |
| **USB Local** | `0` | USB |
| **RTSP** | `rtsp://admin:pass@192.168.1.100:554/stream` | RTSP* |

*RTSP requiere conversión con FFmpeg

---

## 🎮 Controles Rápidos

| Acción | Cómo |
|--------|------|
| **Ampliar cámara** | Pasa mouse + haz clic en 🔍 |
| **Configurar cámara** | Haz clic en ⚙️ |
| **Cambiar vista** | Botones en header (2x2, 3x2, 3x3, 4x3) |
| **Actualizar** | Botón 🔄 en header |
| **Cerrar ampliada** | Haz clic en X o presiona ESC |

---

## ✅ Checklist

- [ ] API Python corriendo
- [ ] Dashboard corriendo
- [ ] Logueado en dashboard
- [ ] En página "Monitoreo en Vivo"
- [ ] Primera cámara configurada
- [ ] Cámara visible en tarjeta
- [ ] Puedo ampliar la cámara
- [ ] Puedo cambiar vista

---

## 🆘 Si Algo No Funciona

**Cámara no aparece:**
- Recarga la página (F5)
- Verifica que guardaste la configuración
- Verifica que la URL sea correcta

**Error de conexión:**
- Verifica que la cámara esté encendida
- Verifica que esté en el mismo WiFi
- Prueba la URL en el navegador

**Baja calidad:**
- Reduce resolución en la cámara
- Acerca cámara al router

---

## 📚 Más Información

Para guía completa: `GUIA_MULTIPLES_CAMARAS.md`  
Para troubleshooting: `RESUMEN_CAMARAS_MULTIPLES.txt`  
Para pruebas: `python test_multiples_camaras.py`

---

## 🎯 Próximo Paso

Configura las otras 2 cámaras y disfruta del monitoreo en tiempo real 🎥

**¡Listo! Ahora tienes múltiples cámaras en tu dashboard.**
