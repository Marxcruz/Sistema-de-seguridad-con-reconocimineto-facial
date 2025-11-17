# 🔐 Credenciales de Acceso al Sistema

## 📋 Credenciales Disponibles

### **1. Administrador**
```
Email: admin@sistema.com
Contraseña: admin123
Rol: Administrador
```
**Permisos:** Acceso completo al sistema

---

### **2. Supervisor**
```
Email: supervisor@sistema.com
Contraseña: supervisor123
Rol: Empleado
```
**Permisos:** Gestión de alertas y monitoreo

---

### **3. Empleado**
```
Email: empleado@sistema.com
Contraseña: empleado123
Rol: Empleado
```
**Permisos:** Acceso básico

---

### **4. Visitante**
```
Email: visitante@sistema.com
Contraseña: visitante123
Rol: Visitante
```
**Permisos:** Acceso limitado

---

## 🔧 Solución al Error "Credenciales inválidas"

Si ves el error "Credenciales inválidas" o "invalid signature", sigue estos pasos:

### **Paso 1: Verificar que el archivo .env existe**
```bash
dir .env
```

### **Paso 2: Copiar .env.example a .env (si no existe)**
```bash
copy .env.example .env
```

### **Paso 3: Reiniciar el servidor Next.js**
```bash
# Detener el servidor (Ctrl+C)
# Luego iniciar nuevamente:
npm run dev
```

### **Paso 4: Limpiar caché del navegador**
- Presiona `Ctrl + Shift + Delete`
- Selecciona "Cookies y datos de sitios"
- Limpia y recarga la página

### **Paso 5: Verificar que los usuarios existen en la BD**
```bash
npx prisma studio
```
Abre http://localhost:5555 y verifica la tabla `usuarios`

---

## 🐛 Troubleshooting

### **Error: "invalid signature"**
**Causa:** El JWT_SECRET en .env no coincide entre login y middleware

**Solución:**
1. Detener el servidor (Ctrl+C)
2. Eliminar el archivo .env
3. Copiar .env.example a .env
4. Reiniciar: `npm run dev`

### **Error: "Token inválido"**
**Causa:** Token antiguo en localStorage

**Solución:**
1. Abrir DevTools (F12)
2. Ir a Application → Local Storage
3. Eliminar `auth_token`
4. Recargar la página

### **Error: "Usuario no encontrado"**
**Causa:** Base de datos sin seed

**Solución:**
```bash
npx prisma db push
npx prisma db seed
```

---

## ✅ Verificación Rápida

### **1. Verificar que Next.js está corriendo:**
```bash
# Deberías ver:
▲ Next.js 14.2.33
- Local: http://localhost:3000
✓ Ready in X.Xs
```

### **2. Verificar que PostgreSQL está activo:**
```bash
# En pgAdmin o terminal PostgreSQL
SELECT * FROM usuarios WHERE email = 'admin@sistema.com';
```

### **3. Probar login con curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@sistema.com\",\"password\":\"admin123\"}"
```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan Carlos",
    "apellido": "Pérez García",
    "email": "admin@sistema.com",
    "rol": "Administrador"
  }
}
```

---

## 🔄 Reinicio Completo del Sistema

Si nada funciona, ejecuta estos comandos en orden:

```bash
# 1. Detener todos los servicios
# Presiona Ctrl+C en todas las terminales

# 2. Limpiar caché de Next.js
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# 3. Reinstalar dependencias (opcional)
# npm install

# 4. Verificar .env
copy .env.example .env

# 5. Sincronizar base de datos
npx prisma generate
npx prisma db push

# 6. Cargar datos de prueba
npx prisma db seed

# 7. Iniciar servidor
npm run dev
```

---

## 📞 Contacto

Si el problema persiste, verifica:
- ✅ PostgreSQL está corriendo
- ✅ Variables de entorno en .env son correctas
- ✅ Puerto 3000 está libre
- ✅ No hay errores en la consola del servidor

---

**Última actualización:** Octubre 2025  
**Versión del sistema:** 1.0.0
