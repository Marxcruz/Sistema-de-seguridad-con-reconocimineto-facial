# 📊 Diagramas UML - Sistema de Reconocimiento Facial

Esta carpeta contiene todos los diagramas UML del sistema para documentación académica (tesina).

---

## 📁 Archivos Disponibles

### 1. **Diagrama de Casos de Uso**
- **Archivo:** `diagrama_casos_uso.puml`
- **Descripción:** Muestra los actores del sistema y sus interacciones
- **Actores:** Administrador, Supervisor, Persona, Sistema
- **Casos de Uso:** RF1-RF10 completos

### 2. **Diagrama de Clases**
- **Archivo:** `diagrama_clases.puml`
- **Descripción:** Estructura de clases y relaciones del sistema
- **Capas:** Presentación, Servicios, Datos
- **Modelos:** Usuario, Rostro, Acceso, Alerta, etc.

### 3. **Diagrama de Actividades**
- **Archivo:** `diagrama_actividades.puml`
- **Descripción:** Flujos de trabajo del sistema
- **Procesos:** Registro, Reconocimiento, Alertas, Gestión

### 4. **Diagrama de Despliegue** ⭐ NUEVO
- **Archivo:** `diagrama_despliegue.puml`
- **Descripción:** Arquitectura física del sistema
- **Nodos:** Estación de Control, Servidor, Base de Datos, Cámaras
- **Protocolos:** HTTP, TCP/IP, SMTP, Stream
- **Documentación:** `DIAGRAMA_DESPLIEGUE_EXPLICACION.md`

---

## 🚀 Cómo Generar los Diagramas

### Opción 1: Visual Studio Code (Recomendado)

1. **Instalar Extensión:**
   - Abrir VS Code
   - Ir a Extensions (Ctrl+Shift+X)
   - Buscar "PlantUML"
   - Instalar "PlantUML" by jebbs

2. **Generar Diagrama:**
   - Abrir archivo `.puml`
   - Presionar `Alt+D` para preview
   - Click derecho → "Export Current Diagram"
   - Seleccionar formato: PNG, SVG, PDF

3. **Ventajas:**
   - Vista previa en tiempo real
   - Múltiples formatos de exportación
   - Fácil de usar

---

### Opción 2: PlantUML Online

1. **Acceder al Editor:**
   - Ir a: https://www.plantuml.com/plantuml/uml/

2. **Generar Diagrama:**
   - Copiar contenido del archivo `.puml`
   - Pegar en el editor online
   - Ver preview automático
   - Descargar PNG/SVG/PDF

3. **Ventajas:**
   - No requiere instalación
   - Acceso desde cualquier navegador
   - Rápido y simple

---

### Opción 3: Java + PlantUML.jar

1. **Requisitos:**
   - Java instalado: https://www.java.com/download/
   - PlantUML.jar: https://plantuml.com/download

2. **Generar Diagrama:**
   ```bash
   # PNG
   java -jar plantuml.jar -tpng diagrama_despliegue.puml
   
   # SVG (vectorial)
   java -jar plantuml.jar -tsvg diagrama_despliegue.puml
   
   # PDF
   java -jar plantuml.jar -tpdf diagrama_despliegue.puml
   ```

3. **Script Automático:**
   ```bash
   # Ejecutar script incluido
   generar_diagrama_despliegue.bat
   ```

---

## 📋 Formatos de Exportación

| Formato | Uso Recomendado | Calidad |
|---------|----------------|---------|
| **PNG** | Presentaciones, Word | Alta resolución |
| **SVG** | Documentos web, escalable | Vectorial |
| **PDF** | Impresión, tesina | Profesional |
| **EPS** | LaTeX, publicaciones | Vectorial |

---

## 🎨 Personalización

### Cambiar Colores:
```plantuml
skinparam backgroundColor #FEFEFE
skinparam componentStyle rectangle
skinparam shadowing false
```

### Cambiar Fuentes:
```plantuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
```

### Agregar Iconos:
```plantuml
!define ICONURL https://raw.githubusercontent.com/tupadr3/plantuml-icon-font-sprites/v2.4.0
!include ICONURL/font-awesome-5/server.puml
```

---

## 📚 Documentación Adicional

### Diagrama de Despliegue:
- **Explicación Completa:** `DIAGRAMA_DESPLIEGUE_EXPLICACION.md`
- **Contenido:**
  - Descripción de cada nodo
  - Protocolos de comunicación
  - Hardware recomendado
  - Flujos de datos
  - Cumplimiento de requerimientos

### Otros Diagramas:
- Cada diagrama tiene comentarios internos
- Notas técnicas incluidas
- Referencias a requerimientos (RF/RNF)

---

## 🔍 Verificación de Diagramas

### Checklist:

- [ ] **Casos de Uso:** Todos los RF1-RF10 mapeados
- [ ] **Clases:** Relaciones correctas entre entidades
- [ ] **Actividades:** Flujos completos sin puntos muertos
- [ ] **Despliegue:** Todos los nodos y protocolos definidos

### Validación:

```bash
# Verificar sintaxis PlantUML
java -jar plantuml.jar -syntax diagrama_despliegue.puml

# Debe retornar: "No syntax error"
```

---

## 📖 Referencias para Tesina

### Secciones Recomendadas:

1. **Capítulo 3: Diseño del Sistema**
   - 3.1 Arquitectura General (Diagrama de Despliegue)
   - 3.2 Casos de Uso (Diagrama de Casos de Uso)
   - 3.3 Modelo de Datos (Diagrama de Clases)
   - 3.4 Procesos del Sistema (Diagrama de Actividades)

2. **Capítulo 4: Implementación**
   - 4.1 Tecnologías Utilizadas (del Diagrama de Despliegue)
   - 4.2 Componentes del Sistema (del Diagrama de Clases)
   - 4.3 Flujos de Trabajo (del Diagrama de Actividades)

3. **Anexos:**
   - Anexo A: Diagramas UML Completos
   - Anexo B: Especificaciones Técnicas
   - Anexo C: Manual de Despliegue

---

## 🛠️ Troubleshooting

### Problema: "No se genera el diagrama"
**Solución:**
- Verificar sintaxis PlantUML
- Revisar que @startuml y @enduml estén presentes
- Comprobar instalación de Java/Extensión

### Problema: "Caracteres especiales no se ven"
**Solución:**
- Usar encoding UTF-8
- Agregar: `skinparam defaultFontName Arial`

### Problema: "Diagrama muy grande"
**Solución:**
- Exportar en SVG (escalable)
- Aumentar resolución PNG: `-tpng -Sdpi=300`
- Dividir en múltiples diagramas

---

## 📞 Soporte

### Recursos:
- **PlantUML Docs:** https://plantuml.com/
- **UML 2.5 Spec:** https://www.omg.org/spec/UML/
- **Ejemplos:** https://real-world-plantuml.com/

### Comunidad:
- **Stack Overflow:** Tag `plantuml`
- **GitHub:** https://github.com/plantuml/plantuml
- **Forum:** https://forum.plantuml.net/

---

## ✅ Checklist para Tesina

### Antes de Entregar:

- [ ] Todos los diagramas generados en PNG/PDF
- [ ] Diagramas incluidos en documento Word/LaTeX
- [ ] Explicaciones de cada diagrama escritas
- [ ] Referencias cruzadas entre diagramas y texto
- [ ] Leyendas y notas claras en cada diagrama
- [ ] Numeración de figuras correcta
- [ ] Calidad de imagen alta (300 DPI mínimo)
- [ ] Diagramas consistentes en estilo y formato

---

## 📝 Notas Importantes

1. **Consistencia:** Todos los diagramas usan los mismos nombres de clases/componentes
2. **Completitud:** Cada diagrama cubre un aspecto diferente del sistema
3. **Profesionalismo:** Estilo académico apropiado para tesina
4. **Trazabilidad:** Cada elemento mapea a requerimientos (RF/RNF)
5. **Actualización:** Diagramas reflejan implementación real del código

---

**Última Actualización:** Octubre 2025  
**Versión:** 1.0  
**Estado:** Completo y Listo para Tesina ✅
