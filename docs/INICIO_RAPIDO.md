# 🚀 INICIO RÁPIDO - 5 MINUTOS

## ⚡ Pasos para Iniciar el Sistema

### 1️⃣ Preparar Base de Datos (Solo primera vez)
```bash
# En la raíz del proyecto
npx prisma db push
npx prisma db seed
```
✅ Esto crea las tablas y carga datos de prueba

### 2️⃣ Iniciar API Python
```bash
cd face_recognition_service
face_env\Scripts\activate
python main.py
```
✅ Espera mensaje: `Uvicorn running on http://localhost:8000`

### 3️⃣ Iniciar Dashboard Web
```bash
# Nueva terminal en raíz del proyecto
npm run dev
```
✅ Espera mensaje: `Ready on http://localhost:3000`

### 4️⃣ Iniciar App de Escritorio
```bash
# Nueva terminal
cd desktop_access_app
python main.py
```
✅ Debe abrir ventana gráfica

---

## 🔐 Login Dashboard

Abrir navegador: http://localhost:3000

```
📧 admin@sistema.com
🔑 admin123
```

---

## 🎯 Flujo de Uso Rápido

### Opción A: Usar Datos de Prueba
Los usuarios Juan y María ya están en el sistema con zonas asignadas.

1. **App Escritorio:**
   - Click "Iniciar Cámara"
   - Seleccionar punto de control
   - Capturar rostro
   - Click "Reconocer"

2. **Ver en Dashboard:**
   - Ir a "Accesos" para ver historial
   - Ir a "Alertas" para ver rechazos

### Opción B: Crear Nuevo Usuario
1. **Dashboard → Usuarios → Nuevo Usuario**
   - Nombre: Tu nombre
   - Documento: 12345678
   - Rol: Empleado
   - Guardar

2. **Registrar Rostro:**
   - Click botón 📷 (Cámara)
   - Capturar 3-5 fotos
   - Esperar confirmación

3. **Asignar Zona:**
   - Click botón 📍 (MapPin azul)
   - Seleccionar zona: "Recepción"
   - Horario: 08:00 - 18:00
   - Días: Todos los días
   - Guardar

4. **Probar Acceso:**
   - App Escritorio
   - Iniciar cámara
   - Reconocer rostro
   - ✅ Debe mostrar: PERMITIDO (verde)

---

## 📍 Puntos de Control Disponibles

```
1 - Entrada Principal (Zona: Recepción)
2 - Acceso Oficinas (Zona: Oficinas Admin)
3 - Sala Servidores (Zona: Sala de Servidores)
```

---

## 🧪 Prueba Rápida de Validación de Zonas

### Escenario 1: Acceso Permitido
1. Asignar zona "Recepción" a usuario
2. Horario: 00:00 - 23:59
3. Intentar acceder en punto "Entrada Principal"
4. **Resultado:** ✅ PERMITIDO

### Escenario 2: Zona Restringida (Alerta Tipo 6)
1. Usuario solo tiene zona "Recepción"
2. Intentar acceder a "Sala Servidores"
3. **Resultado:** ❌ DENEGADO + Alerta

### Escenario 3: Fuera de Horario (Alerta Tipo 5)
1. Asignar zona con horario 08:00 - 18:00
2. Cambiar hora del sistema a 20:00
3. Intentar acceder
4. **Resultado:** ❌ DENEGADO + Alerta

---

## 📊 Ver Resultados

### Dashboard Web
- **Accesos:** Historial completo con evidencias
- **Alertas:** Filtrar por tipo 5 (horario) o 6 (zona)
- **Usuarios:** Ver zonas asignadas (botón 📍)
- **Zonas:** Ver estadísticas por zona

### Logs Python
```bash
# Ver en consola donde corre main.py
🔍 Validando acceso: Usuario X → Zona Y
✅ ACCESO PERMITIDO: Usuario dentro del horario
```

---

## ⚠️ Problemas Comunes

### Error: No encuentra PostgreSQL
```bash
# Verificar que PostgreSQL está corriendo
# Windows: Services → PostgreSQL
```

### Error: Puerto 3000 en uso
```bash
# Matar proceso
npx kill-port 3000
# O cambiar puerto en package.json
```

### Error: Cámara no detectada
```bash
# App Escritorio usa cámara por defecto (index 0)
# Si no funciona, verificar que no esté en uso
```

---

## 🎯 Checklist de Verificación

- [ ] PostgreSQL corriendo
- [ ] Base de datos creada y seeded
- [ ] API Python en puerto 8000
- [ ] Dashboard Web en puerto 3000
- [ ] App Escritorio abierta
- [ ] Login exitoso en Dashboard
- [ ] Cámara funcionando
- [ ] Reconocimiento funciona
- [ ] Zonas asignadas correctamente
- [ ] Alertas se generan

---

## 📞 Si algo no funciona

1. Revisar `VERIFICACION_SISTEMA_COMPLETO.md`
2. Ver logs en consolas
3. Verificar .env tiene configuración correcta
4. Reiniciar servicios en orden: BD → Python → Web → Desktop

---

## ✅ Sistema Listo

Si todos los servicios están corriendo y login funciona:

```
🎉 ¡SISTEMA COMPLETAMENTE OPERATIVO!

Ahora puedes:
✅ Registrar usuarios
✅ Asignar zonas
✅ Controlar accesos
✅ Ver alertas
✅ Generar reportes

Para tu tesina: TODO FUNCIONA PERFECTAMENTE
```

**Tiempo de setup:** 5 minutos  
**Tiempo de prueba:** 2 minutos  
**Estado:** ✅ LISTO PARA DEMOSTRACIÓN
