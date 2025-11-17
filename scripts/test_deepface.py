#!/usr/bin/env python3
"""
Script para probar si DeepFace está funcionando correctamente
"""
import cv2
import numpy as np
from deepface import DeepFace
import tempfile
import os

def test_deepface():
    print("🧪 PROBANDO DEEPFACE...")
    print("=" * 50)
    
    try:
        # Crear una imagen de prueba simple
        test_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        
        # Guardar en archivo temporal
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            cv2.imwrite(temp_file.name, test_image)
            temp_path = temp_file.name
        
        try:
            print("📸 Probando DeepFace.represent con ArcFace...")
            result = DeepFace.represent(temp_path, model_name="ArcFace", enforce_detection=False)
            embedding = np.array(result[0]["embedding"])
            
            print(f"✅ DeepFace FUNCIONA!")
            print(f"📊 Embedding generado: {len(embedding)} dimensiones")
            print(f"📊 Sample: [{embedding[0]:.4f}, {embedding[1]:.4f}, {embedding[2]:.4f}...]")
            print(f"📊 Rango: [{embedding.min():.4f}, {embedding.max():.4f}]")
            
            return True
            
        except Exception as e:
            print(f"❌ DeepFace FALLÓ: {str(e)}")
            print(f"❌ Tipo de error: {type(e)}")
            return False
            
        finally:
            # Limpiar archivo temporal
            try:
                os.unlink(temp_path)
            except:
                pass
                
    except Exception as e:
        print(f"❌ Error general: {str(e)}")
        return False

def test_deepface_models():
    print("\n🔍 PROBANDO MODELOS DEEPFACE DISPONIBLES...")
    print("=" * 50)
    
    models = ["VGG-Face", "Facenet", "Facenet512", "OpenFace", "DeepFace", "DeepID", "ArcFace", "Dlib", "SFace"]
    
    for model in models:
        try:
            print(f"🧠 Probando modelo: {model}")
            # Crear imagen simple
            test_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
            
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
                cv2.imwrite(temp_file.name, test_image)
                
                try:
                    result = DeepFace.represent(temp_file.name, model_name=model, enforce_detection=False)
                    embedding = np.array(result[0]["embedding"])
                    print(f"   ✅ {model}: {len(embedding)} dimensiones")
                except Exception as e:
                    print(f"   ❌ {model}: {str(e)}")
                finally:
                    os.unlink(temp_file.name)
                    
        except Exception as e:
            print(f"   ❌ {model}: Error general - {str(e)}")

if __name__ == "__main__":
    print("🚀 DIAGNÓSTICO DEEPFACE")
    print("=" * 60)
    
    # Probar DeepFace básico
    success = test_deepface()
    
    if success:
        print("\n✅ DeepFace está funcionando correctamente")
        print("🔧 El problema debe estar en otra parte del código")
    else:
        print("\n❌ DeepFace NO está funcionando")
        print("🔧 Necesitamos instalar o reparar DeepFace")
        
    # Probar todos los modelos
    test_deepface_models()
    
    print("\n" + "=" * 60)
    print("🏁 DIAGNÓSTICO COMPLETADO")
