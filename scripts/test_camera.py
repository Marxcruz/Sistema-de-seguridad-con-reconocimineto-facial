"""
Script de prueba para verificar detección de rostros
"""
import cv2
import numpy as np

# Cargar clasificador de rostros
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Abrir cámara
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ ERROR: No se pudo abrir la cámara")
    exit()

print("✅ Cámara abierta correctamente")
print("📹 Presiona 'q' para salir")
print("📸 Presiona 'ESPACIO' para capturar y analizar")

while True:
    ret, frame = cap.read()
    
    if not ret:
        print("❌ Error al leer frame")
        break
    
    # Convertir a escala de grises
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Detectar rostros
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(120, 120)
    )
    
    # Dibujar rectángulos
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(frame, f'{w}x{h}', (x, y-10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    # Mostrar información
    info_text = f'Rostros detectados: {len(faces)}'
    cv2.putText(frame, info_text, (10, 30), 
               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    # Mostrar frame
    cv2.imshow('Test de Deteccion de Rostros', frame)
    
    # Captura de teclas
    key = cv2.waitKey(1) & 0xFF
    
    if key == ord('q'):
        break
    elif key == ord(' '):  # ESPACIO
        print(f"\n📊 ANÁLISIS DE FRAME:")
        print(f"   Resolución: {frame.shape[1]}x{frame.shape[0]}")
        print(f"   Rostros detectados: {len(faces)}")
        
        if len(faces) > 0:
            for i, (x, y, w, h) in enumerate(faces):
                print(f"\n   Rostro {i+1}:")
                print(f"      Tamaño: {w}x{h}")
                print(f"      Posición: ({x}, {y})")
                
                # Extraer ROI
                face_roi = frame[y:y+h, x:x+w]
                gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
                
                # Calcular nitidez
                laplacian_var = cv2.Laplacian(gray_roi, cv2.CV_64F).var()
                print(f"      Nitidez: {laplacian_var:.1f}")
                
                if laplacian_var < 20:
                    print(f"      ⚠️ ADVERTENCIA: Imagen muy borrosa")
                else:
                    print(f"      ✅ Calidad aceptable")
        else:
            print("   ❌ No se detectaron rostros")
            print("   💡 Consejos:")
            print("      - Acércate más a la cámara")
            print("      - Mejora la iluminación")
            print("      - Asegúrate de estar de frente")

cap.release()
cv2.destroyAllWindows()
print("\n✅ Test finalizado")
