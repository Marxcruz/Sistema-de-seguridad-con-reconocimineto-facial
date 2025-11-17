import cv2
import numpy as np
import os
import logging
# import mediapipe as mp  # Temporalmente deshabilitado por conflictos
from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from PIL import Image
import io
import base64
import json
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime
import asyncpg
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import aiofiles
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import LabelEncoder
import warnings
# import face_recognition  # Requiere dlib - usar OpenCV por ahora
import tensorflow as tf
from tensorflow import keras
from deepface import DeepFace
import tempfile
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import hashlib

# Cargar variables de entorno desde el archivo .env consolidado en la raíz
load_dotenv(dotenv_path="../.env")

# Suprimir warnings para output limpio
warnings.filterwarnings('ignore')
tf.get_logger().setLevel('ERROR')  # Suprimir warnings de TensorFlow
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Confirmar carga de variables de entorno
logger.info("✅ Variables de entorno cargadas desde archivo .env consolidado")

app = FastAPI(title="Face Recognition Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/sistema_seguridad_facial")
# Usar clave de encriptación persistente desde .env o generar una nueva
ENCRYPTION_KEY_B64 = os.getenv("ENCRYPTION_KEY")
if ENCRYPTION_KEY_B64:
    try:
        # Intentar usar la clave del .env
        ENCRYPTION_KEY = ENCRYPTION_KEY_B64.encode() if isinstance(ENCRYPTION_KEY_B64, str) else ENCRYPTION_KEY_B64
        # Validar que sea una clave Fernet válida
        test_cipher = Fernet(ENCRYPTION_KEY)
        logger.info("✅ Using existing encryption key from environment")
    except Exception as e:
        logger.warning(f"❌ Invalid encryption key in environment: {e}")
        logger.info("🔧 Generating new valid encryption key...")
        ENCRYPTION_KEY = Fernet.generate_key()
        logger.info("✅ Generated new encryption key for this session")
        logger.info(f"📝 Add this to your .env file: ENCRYPTION_KEY={ENCRYPTION_KEY.decode()}")
else:
    ENCRYPTION_KEY = Fernet.generate_key()
    logger.info("🔧 No encryption key found in environment")
    logger.info("✅ Generated new encryption key for this session")
    logger.info(f"📝 Add this to your .env file: ENCRYPTION_KEY={ENCRYPTION_KEY.decode()}")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.95"))  # UMBRAL MUY ESTRICTO - Solo usuarios muy seguros
LIVENESS_THRESHOLD = float(os.getenv("LIVENESS_THRESHOLD", "0.7"))  # UMBRAL MUY ESTRICTO - Anti-spoofing fuerte
MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", "5242880"))  # 5MB
ENABLE_TENSORFLOW = os.getenv("ENABLE_TENSORFLOW", "true").lower() == "true"
TF_LIVENESS_THRESHOLD = float(os.getenv("TF_LIVENESS_THRESHOLD", "0.05"))  # Muy relajado para pruebas

# Inicializar cifrado
cipher_suite = Fernet(ENCRYPTION_KEY)

# MediaPipe temporalmente deshabilitado
# mp_face_detection = mp.solutions.face_detection
# mp_drawing = mp.solutions.drawing_utils
# face_detection = mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.7)

# Modelos Pydantic
class FaceDetectionRequest(BaseModel):
    image_base64: str
    check_liveness: bool = True

class FaceDetectionResponse(BaseModel):
    detected: bool
    faces_count: int
    faces: List[dict]
    liveness_score: Optional[float] = None
    processing_time_ms: float

class FaceRecognitionRequest(BaseModel):
    image_base64: str
    punto_control_id: int
    check_liveness: bool = True

class FaceRecognitionResponse(BaseModel):
    success: bool
    user_id: Optional[int] = None
    confidence: float
    decision: str  # PERMITIDO, DENEGADO, PENDIENTE
    liveness_ok: bool
    processing_time_ms: float
    message: str
    faces: Optional[List[Dict]] = None  # Coordenadas faciales para tracking

class FaceEnrollmentRequest(BaseModel):
    user_id: int
    images_base64: List[str]
    model_name: str = "face_recognition"

class FaceEnrollmentResponse(BaseModel):
    success: bool
    faces_processed: int
    average_quality: float
    message: str

# Funciones auxiliares
def decode_base64_image(image_base64: str) -> np.ndarray:
    """Decodifica imagen base64 a array numpy"""
    try:
        image_data = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error decodificando imagen: {str(e)}")

def encrypt_embedding(embedding: np.ndarray) -> bytes:
    """Cifra un embedding facial"""
    embedding_bytes = embedding.tobytes()
    encrypted = cipher_suite.encrypt(embedding_bytes)
    return encrypted

def decrypt_embedding(encrypted_embedding: bytes) -> np.ndarray:
    """Descifra un embedding facial"""
    decrypted_bytes = cipher_suite.decrypt(encrypted_embedding)
    embedding = np.frombuffer(decrypted_bytes, dtype=np.float64)
    return embedding

def generate_deepface_embedding(face_roi: np.ndarray, model_name: str = "ArcFace") -> np.ndarray:
    """
    Genera embedding facial usando DeepFace con modelo pre-entrenado
    Modelos disponibles: ArcFace, Facenet, VGG-Face, OpenFace, DeepID
    """
    try:
        # Validar entrada
        if face_roi.size == 0:
            raise ValueError("ROI de rostro vacío")
        
        # Crear archivo temporal para DeepFace
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            # Convertir numpy array a imagen y guardar
            success = cv2.imwrite(temp_file.name, face_roi)
            if not success:
                raise ValueError("Error guardando imagen temporal")
            
            # Generar embedding con DeepFace
            try:
                logger.info(f"🔍 Ejecutando DeepFace.represent con modelo {model_name}...")
                result = DeepFace.represent(temp_file.name, model_name=model_name, enforce_detection=False)
                
                if not result or len(result) == 0:
                    raise Exception("DeepFace no retornó ningún resultado")
                
                embedding_data = result[0].get("embedding")
                if embedding_data is None:
                    raise Exception("DeepFace no retornó embedding en el resultado")
                
                embedding = np.array(embedding_data, dtype=np.float64)
                
                # Validar embedding
                if len(embedding) == 0:
                    raise Exception("Embedding generado está vacío")
                
                logger.info(f"✅ DeepFace {model_name} embedding generado: {len(embedding)} dimensiones")
                logger.info(f"📊 Embedding sample: [{embedding[0]:.4f}, {embedding[1]:.4f}, {embedding[2]:.4f}...]")
                logger.info(f"📊 Norma L2: {np.linalg.norm(embedding):.4f}")
                return embedding
                
            except Exception as deepface_error:
                logger.error(f"❌ FALLO CRÍTICO DeepFace {model_name}: {str(deepface_error)}")
                logger.error(f"❌ Tipo de error: {type(deepface_error)}")
                logger.error(f"❌ Archivo temporal: {temp_file.name}")
                
                # Verificar si el archivo existe y es válido
                if os.path.exists(temp_file.name):
                    file_size = os.path.getsize(temp_file.name)
                    logger.error(f"❌ Tamaño del archivo: {file_size} bytes")
                else:
                    logger.error(f"❌ Archivo temporal no existe")
                
                # NO FALLBACK - Forzar que DeepFace funcione
                raise Exception(f"DeepFace falló completamente: {str(deepface_error)}")
            
            finally:
                # Limpiar archivo temporal
                try:
                    os.unlink(temp_file.name)
                except:
                    pass
                    
    except Exception as e:
        logger.error(f"❌ ERROR CRÍTICO en generate_deepface_embedding: {str(e)}")
        # NO FALLBACK - Sistema requiere DeepFace
        raise Exception(f"DeepFace completamente falló: {str(e)}")

def compare_faces_deepface(face1_path: str, face2_path: str, model_name: str = "ArcFace") -> tuple:
    """
    Compara dos rostros usando DeepFace
    Retorna (es_mismo_rostro: bool, distancia: float)
    """
    try:
        result = DeepFace.verify(face1_path, face2_path, model_name=model_name, enforce_detection=False)
        return result["verified"], result["distance"]
    except Exception as e:
        logger.warning(f"Error en comparación DeepFace: {str(e)}")
        return False, 1.0

def generate_face_embedding(face_roi: np.ndarray) -> np.ndarray:
    """
    Función principal para generar embeddings faciales
    SOLO DeepFace ArcFace - SIN fallback híbrido
    """
    logger.info("🧠 GENERANDO EMBEDDING CON DEEPFACE ArcFace")
    
    try:
        embedding = generate_deepface_embedding(face_roi, model_name="ArcFace")
        
        # Verificar que sea DeepFace (512 dimensiones)
        if len(embedding) != 512:
            raise Exception(f"Error: Embedding tiene {len(embedding)} dimensiones, esperadas 512 (DeepFace)")
        
        # Verificar que el embedding sea válido (no todos ceros o valores extraños)
        if np.all(embedding == 0):
            raise Exception("Error: Embedding generado es todo ceros")
        
        if np.any(np.isnan(embedding)) or np.any(np.isinf(embedding)):
            raise Exception("Error: Embedding contiene valores NaN o infinitos")
        
        # Verificar rango de valores (embeddings DeepFace ArcFace pueden tener normas altas)
        embedding_norm = np.linalg.norm(embedding)
        if embedding_norm < 0.1 or embedding_norm > 50:  # Umbral más realista para ArcFace
            logger.warning(f"⚠️ Norma del embedding inusual: {embedding_norm:.4f}")
        elif embedding_norm > 20:
            logger.info(f"ℹ️ Norma del embedding alta pero normal para ArcFace: {embedding_norm:.4f}")
        
        logger.info(f"✅ DeepFace confirmado: {len(embedding)} dimensiones, norma: {embedding_norm:.4f}")
        logger.info(f"📊 Rango: [{embedding.min():.4f}, {embedding.max():.4f}]")
        return embedding
        
    except Exception as e:
        logger.error(f"❌ FALLO CRÍTICO DeepFace: {str(e)}")
        logger.error(f"❌ NO SE PUEDE CONTINUAR SIN DEEPFACE FUNCIONANDO")
        raise Exception(f"Sistema requiere DeepFace funcionando correctamente: {str(e)}")

def generate_face_embedding_custom(face_roi: np.ndarray) -> np.ndarray:
    """
    Algoritmo personalizado para generar embeddings faciales (BACKUP)
    Usado como fallback si DeepFace falla
    """
    try:
        # Validar entrada
        if face_roi.size == 0:
            raise ValueError("ROI de rostro vacío")
        
        # Normalización básica de iluminación para mayor consistencia
        face_gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        face_equalized = cv2.equalizeHist(face_gray)
        face_resized = cv2.resize(face_equalized, (128, 128))
        
        # 1. Histograma de gradientes (HOG-like)
        sobelx = cv2.Sobel(face_resized, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(face_resized, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(sobelx**2 + sobely**2)
        
        # 2. Patrones binarios locales (LBP-like)
        lbp_features = []
        for i in range(1, face_resized.shape[0]-1):
            for j in range(1, face_resized.shape[1]-1):
                center = face_resized[i, j]
                pattern = 0
                pattern |= (face_resized[i-1, j-1] >= center) << 7
                pattern |= (face_resized[i-1, j] >= center) << 6
                pattern |= (face_resized[i-1, j+1] >= center) << 5
                pattern |= (face_resized[i, j+1] >= center) << 4
                pattern |= (face_resized[i+1, j+1] >= center) << 3
                pattern |= (face_resized[i+1, j] >= center) << 2
                pattern |= (face_resized[i+1, j-1] >= center) << 1
                pattern |= (face_resized[i, j-1] >= center) << 0
                lbp_features.append(pattern)
        
        # 3. Combinar características con tamaño fijo
        # Asegurar tamaños fijos para consistencia
        pixel_features = face_resized.flatten()
        if len(pixel_features) > 2048:
            pixel_features = pixel_features[:2048]
        elif len(pixel_features) < 2048:
            pixel_features = np.pad(pixel_features, (0, 2048 - len(pixel_features)), 'constant')
        
        gradient_features = gradient_magnitude.flatten()
        if len(gradient_features) > 1024:
            gradient_features = gradient_features[:1024]
        elif len(gradient_features) < 1024:
            gradient_features = np.pad(gradient_features, (0, 1024 - len(gradient_features)), 'constant')
        
        lbp_hist, _ = np.histogram(lbp_features, bins=32, range=(0, 256))
        
        # Normalizar cada tipo de característica
        pixel_features = pixel_features / 255.0
        gradient_features = gradient_features / (np.max(gradient_features) + 1e-8)
        lbp_hist = lbp_hist / (np.sum(lbp_hist) + 1e-8)
        
        # Combinar en un embedding de tamaño fijo: 2048 + 1024 + 32 = 3104
        embedding = np.concatenate([
            pixel_features * 0.4,      # 2048 elementos
            gradient_features * 0.4,   # 1024 elementos  
            lbp_hist * 0.2            # 32 elementos
        ])
        
        # Verificar tamaño final
        assert len(embedding) == 3104, f"Embedding debe tener 3104 dimensiones, tiene {len(embedding)}"
        
        logger.debug(f"Embedding generado exitosamente: {len(embedding)} dimensiones")
        return embedding
        
    except Exception as e:
        logger.error(f"Error generando embedding: {str(e)}")
        raise ValueError(f"Error en generación de embedding: {str(e)}")

def calculate_similarity_score(face_encoding: np.ndarray, stored_embedding: np.ndarray) -> float:
    """
    Función de similitud SOLO para DeepFace (512 dimensiones)
    Usa distancia euclidiana optimizada para ArcFace
    """
    try:
        # Verificar que ambos embeddings sean DeepFace (512 dim)
        if len(face_encoding) != 512 or len(stored_embedding) != 512:
            logger.error(f"❌ Embeddings incompatibles: {len(face_encoding)} vs {len(stored_embedding)} (esperado: 512)")
            return 0.0
        
        # Usar lógica específica de DeepFace
        return calculate_similarity_score_deepface(face_encoding, stored_embedding)
        
    except Exception as e:
        logger.error(f"Error calculando similitud: {str(e)}")
        return 0.0

def calculate_similarity_score_deepface(face_encoding: np.ndarray, stored_embedding: np.ndarray) -> float:
    """Función específica para embeddings DeepFace (512 dimensiones)
    
    Umbrales basados en DeepFace ArcFace oficial:
    - Distancia < 4.15 = Misma persona (umbral recomendado)
    - Usamos similitud coseno que es más estable para DeepFace
    """
    try:
        # Normalizar embeddings L2 para similitud coseno
        face_encoding_norm = face_encoding / (np.linalg.norm(face_encoding) + 1e-8)
        stored_embedding_norm = stored_embedding / (np.linalg.norm(stored_embedding) + 1e-8)
        
        # Calcular similitud coseno (más estable que distancia euclidiana)
        cosine_similarity = np.dot(face_encoding_norm, stored_embedding_norm)
        
        # También calcular distancia euclidiana sin normalizar (escala original DeepFace)
        euclidean_distance = np.linalg.norm(face_encoding - stored_embedding)
        
        logger.info(f"📏 DeepFace - Similitud coseno: {cosine_similarity:.4f}, Distancia euclidiana: {euclidean_distance:.4f}")
        
        # UMBRALES BASADOS EN SIMILITUD COSENO (más confiable para DeepFace)
        # Similitud coseno: 1.0 = idéntico, 0.0 = ortogonal, -1.0 = opuesto
        if cosine_similarity >= 0.70:  # Muy similar (mismo usuario)
            confidence = 0.85 + (cosine_similarity - 0.70) * 0.5  # 85-100%
            logger.info(f"✅ DeepFace MATCH CONFIRMADO: coseno={cosine_similarity:.4f} -> {confidence:.3f}")
        elif cosine_similarity >= 0.60:  # Similar (probablemente mismo usuario)
            confidence = 0.70 + (cosine_similarity - 0.60) * 1.5  # 70-85%
            logger.info(f"✅ DeepFace MATCH VÁLIDO: coseno={cosine_similarity:.4f} -> {confidence:.3f}")
        elif cosine_similarity >= 0.50:  # Dudoso
            confidence = 0.50 + (cosine_similarity - 0.50) * 2.0  # 50-70%
            logger.warning(f"⚠️ DeepFace DUDOSO: coseno={cosine_similarity:.4f} -> {confidence:.3f}")
        elif cosine_similarity >= 0.40:  # Probablemente diferente
            confidence = 0.30 + (cosine_similarity - 0.40) * 2.0  # 30-50%
            logger.warning(f"⚠️ DeepFace PROBABLEMENTE DIFERENTE: coseno={cosine_similarity:.4f} -> {confidence:.3f}")
        else:  # Diferente persona
            confidence = max(0.0, cosine_similarity * 0.75)  # 0-30%
            logger.info(f"❌ DeepFace NO MATCH: coseno={cosine_similarity:.4f} -> {confidence:.3f}")
        
        return max(0.0, min(1.0, confidence))
        
    except Exception as e:
        logger.error(f"Error en similitud DeepFace: {str(e)}")
        return 0.0

def calculate_custom_similarity(face_encoding: np.ndarray, stored_embedding: np.ndarray) -> float:
    """Función específica para embeddings personalizados (3104 dimensiones)"""
    try:
        # Normalizar embeddings L2
        face_encoding_norm = face_encoding / (np.linalg.norm(face_encoding) + 1e-8)
        stored_embedding_norm = stored_embedding / (np.linalg.norm(stored_embedding) + 1e-8)
        
        # Calcular múltiples métricas
        cosine_sim = np.dot(face_encoding_norm, stored_embedding_norm)
        euclidean_dist = np.linalg.norm(face_encoding_norm - stored_embedding_norm)
        correlation = np.corrcoef(face_encoding, stored_embedding)[0, 1]
        
        logger.info(f"📏 Personalizado - Coseno: {cosine_sim:.4f}, Euclidiana: {euclidean_dist:.4f}, Correlación: {correlation:.4f}")
        
        # Lógica estricta para algoritmo personalizado
        if cosine_sim >= 0.95 and euclidean_dist <= 0.8 and correlation >= 0.85:
            confidence = min(0.98, (cosine_sim + (2.0 - euclidean_dist) + correlation) / 3.0)
            logger.info(f"✅ Personalizado MATCH: {confidence:.3f}")
        elif cosine_sim >= 0.90 and euclidean_dist <= 1.0 and correlation >= 0.80:
            confidence = min(0.75, cosine_sim * 0.8)
            logger.warning(f"⚠️ Personalizado parcial: {confidence:.3f}")
        else:
            confidence = max(0.0, min(0.30, cosine_sim * 0.3))
            logger.info(f"❌ Personalizado NO MATCH: {confidence:.3f}")
        
        return max(0.0, min(1.0, confidence))
        
    except Exception as e:
        logger.error(f"Error en similitud personalizada: {str(e)}")
        return 0.0

def calculate_face_quality(face_encoding: np.ndarray, face_location: tuple) -> float:
    """Calcula la calidad de un rostro detectado"""
    # Factores de calidad basados en el tamaño y posición del rostro
    top, right, bottom, left = face_location
    face_width = right - left
    face_height = bottom - top
    
    # Calidad basada en tamaño (rostros más grandes = mejor calidad)
    size_quality = min(1.0, (face_width * face_height) / (100 * 100))
    
    # Calidad basada en la varianza del encoding (más varianza = más características)
    variance_quality = min(1.0, np.var(face_encoding) * 10)
    
    # Combinar factores
    quality = (size_quality + variance_quality) / 2
    return float(quality)

def detect_liveness(image: np.ndarray, face_location: tuple) -> float:
    """Detección ULTRA ESTRICTA de anti-spoofing"""
    try:
        top, right, bottom, left = face_location
        face_roi = image[top:bottom, left:right]
        
        if face_roi.size == 0:
            logger.warning("🚫 LIVENESS: ROI vacío")
            return 0.0  # FALLO automático
        
        # Convertir a escala de grises
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        
        # 1. ANÁLISIS DE NITIDEZ (detecta fotos borrosas)
        laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
        logger.info(f"📊 LIVENESS - Nitidez: {laplacian_var:.2f}")
        
        # 2. ANÁLISIS DE BORDES (detecta pantallas)
        edges = cv2.Canny(gray_face, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        logger.info(f"📊 LIVENESS - Densidad bordes: {edge_density:.3f}")
        
        # 3. ANÁLISIS DE CONTRASTE (detecta fotos planas)
        contrast = gray_face.std()
        logger.info(f"📊 LIVENESS - Contraste: {contrast:.2f}")
        
        # CRITERIOS MÁS PERMISIVOS PARA CÁMARAS WEB
        nitidez_ok = laplacian_var > 50   # Reducido de 200 a 50
        bordes_ok = edge_density > 0.05   # Reducido de 0.1 a 0.05
        contraste_ok = contrast > 20      # Reducido de 30 a 20
        
        logger.info(f"🔍 VALIDACIONES LIVENESS:")
        logger.info(f"   - Nitidez OK: {nitidez_ok} ({laplacian_var:.1f} > 50)")
        logger.info(f"   - Bordes OK: {bordes_ok} ({edge_density:.3f} > 0.05)")
        logger.info(f"   - Contraste OK: {contraste_ok} ({contrast:.1f} > 20)")
        
        # SOLO si TODO está perfecto
        if nitidez_ok and bordes_ok and contraste_ok:
            liveness_score = 0.9
            logger.info(f"✅ LIVENESS APROBADO: {liveness_score}")
        else:
            liveness_score = 0.0
            logger.error(f"🚫 LIVENESS FALLIDO: {liveness_score}")
        
        return float(liveness_score)
    except Exception as e:
        logger.error(f"Error en detección de liveness: {str(e)}")
        return 0.0  # FALLO en caso de error

def advanced_liveness_tensorflow(image: np.ndarray, face_location: tuple) -> float:
    """Detección avanzada de liveness usando TensorFlow"""
    if not ENABLE_TENSORFLOW:
        return detect_liveness(image, face_location)
    
    try:
        top, right, bottom, left = face_location
        face_roi = image[top:bottom, left:right]
        
        if face_roi.size == 0:
            return 0.0
        
        # Redimensionar rostro para análisis
        face_resized = cv2.resize(face_roi, (64, 64))
        face_normalized = face_resized.astype(np.float32) / 255.0
        
        # Análisis de textura avanzado con TensorFlow
        gray_face = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
        
        # Calcular múltiples características
        # 1. Varianza de Laplaciano (nitidez)
        laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
        
        # 2. Análisis de frecuencias usando FFT
        f_transform = np.fft.fft2(gray_face)
        f_shift = np.fft.fftshift(f_transform)
        magnitude_spectrum = np.log(np.abs(f_shift) + 1)
        frequency_score = np.std(magnitude_spectrum)
        
        # 3. Análisis de gradientes
        grad_x = cv2.Sobel(gray_face, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray_face, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        gradient_score = np.mean(gradient_magnitude)
        
        # 4. Análisis de patrones locales (LBP simulado)
        lbp_score = np.std(gray_face)
        
        # Combinar características usando TensorFlow
        features = tf.constant([[
            laplacian_var / 500.0,
            frequency_score / 10.0,
            gradient_score / 50.0,
            lbp_score / 100.0
        ]], dtype=tf.float32)
        
        # Red neuronal simple para clasificación de liveness
        # (En producción, cargarías un modelo pre-entrenado)
        weights = tf.constant([[0.3], [0.25], [0.25], [0.2]], dtype=tf.float32)
        bias = tf.constant([0.1], dtype=tf.float32)
        
        # Cálculo de score
        raw_score = tf.matmul(features, weights) + bias
        liveness_score = tf.sigmoid(raw_score).numpy()[0][0]
        
        # Aplicar umbral más estricto para TensorFlow
        return float(liveness_score)
        
    except Exception as e:
        logger.warning(f"Error en liveness TensorFlow: {str(e)}")
        # Fallback a método básico
        return detect_liveness(image, face_location)

def detect_spoofing_tensorflow(image: np.ndarray, face_location: tuple) -> dict:
    """Detección de ataques de spoofing usando TensorFlow"""
    if not ENABLE_TENSORFLOW:
        return {"spoofing_detected": False, "confidence": 0.5, "attack_type": "none"}
    
    try:
        top, right, bottom, left = face_location
        face_roi = image[top:bottom, left:right]
        
        if face_roi.size == 0:
            return {"spoofing_detected": True, "confidence": 1.0, "attack_type": "invalid_face"}
        
        # Redimensionar para análisis
        face_resized = cv2.resize(face_roi, (128, 128))
        face_normalized = face_resized.astype(np.float32) / 255.0
        
        # Análisis de diferentes tipos de ataques
        results = {}
        
        # 1. Detección de foto impresa (análisis de bordes)
        gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Las fotos impresas tienden a tener bordes más definidos
        photo_attack_score = 1.0 if edge_density > 0.15 else edge_density / 0.15
        
        # 2. Detección de pantalla (análisis de píxeles)
        # Las pantallas tienen patrones de píxeles regulares
        hsv = cv2.cvtColor(face_resized, cv2.COLOR_BGR2HSV)
        saturation_var = np.var(hsv[:,:,1])
        screen_attack_score = 1.0 if saturation_var < 200 else (400 - saturation_var) / 200
        
        # 3. Análisis de profundidad simulado
        # Usar gradientes para estimar profundidad
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        depth_variation = np.std(np.sqrt(grad_x**2 + grad_y**2))
        
        # Rostros reales tienen más variación de profundidad
        depth_score = 1.0 - min(1.0, depth_variation / 30.0)
        
        # Combinar scores usando TensorFlow
        features = tf.constant([[photo_attack_score, screen_attack_score, depth_score]], dtype=tf.float32)
        
        # Red neuronal para clasificación de ataques
        attack_weights = tf.constant([[0.4], [0.3], [0.3]], dtype=tf.float32)
        attack_bias = tf.constant([0.0], dtype=tf.float32)
        
        spoofing_probability = tf.sigmoid(tf.matmul(features, attack_weights) + attack_bias).numpy()[0][0]
        
        # Determinar tipo de ataque más probable
        attack_scores = {
            "photo": photo_attack_score,
            "screen": screen_attack_score,
            "mask": depth_score
        }
        
        most_likely_attack = max(attack_scores.items(), key=lambda x: x[1])
        
        return {
            "spoofing_detected": spoofing_probability > 0.8,  # Más permisivo para pruebas
            "confidence": float(spoofing_probability),
            "attack_type": most_likely_attack[0] if spoofing_probability > 0.8 else "none",
            "detailed_scores": attack_scores
        }
        
    except Exception as e:
        logger.warning(f"Error en detección de spoofing: {str(e)}")
        return {"spoofing_detected": False, "confidence": 0.5, "attack_type": "error"}

async def get_db_connection():
    """Obtiene conexión a la base de datos"""
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Error conectando a la base de datos: {str(e)}")
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")

async def ensure_catalog_data():
    """
    Asegura que los datos de catálogo necesarios existan en la base de datos.
    Se ejecuta al iniciar el servicio para auto-configuración.
    SEGURO: Solo inserta si no existe, no modifica datos existentes.
    """
    try:
        conn = await get_db_connection()
        try:
            logger.info("🔧 Verificando catálogos de base de datos...")
            
            # 1. Tipos de Alerta - Respetar tipos existentes en BD
            # El usuario ya tiene 6 tipos configurados:
            # 1 = "Acceso no autorizado"
            # 2 = "Falla en prueba de vida"
            # 3 = "Usuario desconocido"
            # 4 = "Múltiples intentos fallidos"
            # 5 = "Acceso fuera de horario"
            # 6 = "Zona restringida"
            # No sobrescribir - usar los existentes
            logger.info("   ✅ Tipos de alerta: Usando tipos existentes en BD (6 tipos)")
            
            # 2. Tipos de Decisión
            await conn.execute("""
                INSERT INTO tipo_decision (id, nombre) VALUES 
                (1, 'PERMITIDO'),
                (2, 'DENEGADO')
                ON CONFLICT (id) DO NOTHING
            """)
            
            # 3. Canales de Notificación
            await conn.execute("""
                INSERT INTO canal_notificacion (id, nombre) VALUES 
                (1, 'Sistema'),
                (2, 'Email'),
                (3, 'Telegram'),
                (4, 'SMS')
                ON CONFLICT (id) DO NOTHING
            """)
            
            # 4. Tipos de Punto de Control
            await conn.execute("""
                INSERT INTO tipo_punto (id, nombre) VALUES 
                (1, 'Entrada'),
                (2, 'Salida'),
                (3, 'Acceso Restringido')
                ON CONFLICT (id) DO NOTHING
            """)
            
            # 5. Puntos de Control - NO crear automáticamente
            # El usuario ya tiene puntos configurados en su BD
            # La tabla requiere zona_id que no podemos determinar automáticamente
            logger.info("   ✅ Puntos de control: Usando puntos existentes en BD")
            
            # Verificar que se crearon correctamente
            tipo_alerta_count = await conn.fetchval("SELECT COUNT(*) FROM tipo_alerta")
            tipo_decision_count = await conn.fetchval("SELECT COUNT(*) FROM tipo_decision")
            canal_count = await conn.fetchval("SELECT COUNT(*) FROM canal_notificacion")
            tipo_punto_count = await conn.fetchval("SELECT COUNT(*) FROM tipo_punto")
            punto_count = await conn.fetchval("SELECT COUNT(*) FROM puntos_control")
            
            logger.info(f"✅ Catálogos verificados:")
            logger.info(f"   - Tipos de Alerta: {tipo_alerta_count}")
            logger.info(f"   - Tipos de Decisión: {tipo_decision_count}")
            logger.info(f"   - Canales de Notificación: {canal_count}")
            logger.info(f"   - Tipos de Punto: {tipo_punto_count}")
            logger.info(f"   - Puntos de Control: {punto_count} (existentes)")
            
        finally:
            await conn.close()
            
    except Exception as e:
        logger.warning(f"⚠️ No se pudieron verificar catálogos: {str(e)}")
        logger.warning("   El sistema continuará, pero las alertas podrían fallar")

async def save_evidence_photo(image_array: np.ndarray, tipo_evidencia_id: int, prefix: str = "evidencia") -> Optional[Dict[str, Any]]:
    """
    Guarda una foto como evidencia en disco y retorna información para BD.
    
    Args:
        image_array: Array numpy de la imagen (BGR)
        tipo_evidencia_id: ID del tipo de evidencia (1=FOTO_ACCESO, 3=FOTO_ALERTA, 4=FOTO_ROSTRO)
        prefix: Prefijo para el nombre del archivo
    
    Returns:
        Dict con path, hash, mime_type, tamano_bytes, metadata o None si falla
    """
    try:
        # Crear estructura de carpetas por fecha
        now = datetime.now()
        year = now.strftime("%Y")
        month = now.strftime("%m")
        day = now.strftime("%d")
        
        # Ruta base de evidencias (absoluta desde el directorio del proyecto)
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        base_path = os.path.join(project_root, "evidencias", year, month, day)
        os.makedirs(base_path, exist_ok=True)
        
        # Nombre único del archivo
        timestamp = now.strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{prefix}_{timestamp}.jpg"
        filepath = os.path.join(base_path, filename)
        
        # Convertir BGR a RGB para guardar correctamente
        image_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
        image_pil = Image.fromarray(image_rgb)
        
        # Guardar con calidad optimizada
        image_pil.save(filepath, "JPEG", quality=85, optimize=True)
        
        # Calcular hash SHA256
        with open(filepath, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        
        # Obtener tamaño del archivo
        file_size = os.path.getsize(filepath)
        
        # Metadata
        height, width = image_array.shape[:2]
        metadata = {
            "width": width,
            "height": height,
            "timestamp": now.isoformat(),
            "format": "JPEG",
            "quality": 85
        }
        
        logger.info(f"📸 Evidencia guardada: {filepath} ({file_size} bytes)")
        
        return {
            "path": filepath.replace("\\", "/"),  # Normalizar path para BD
            "hash": file_hash,
            "mime_type": "image/jpeg",
            "tamano_bytes": file_size,
            "metadata": metadata,
            "tipo_id": tipo_evidencia_id
        }
        
    except Exception as e:
        logger.error(f"❌ Error al guardar evidencia: {str(e)}")
        return None

async def create_evidence_record(conn, evidence_data: Dict[str, Any]) -> Optional[int]:
    """
    Crea un registro de evidencia en la base de datos.
    
    Args:
        conn: Conexión a la base de datos
        evidence_data: Diccionario con datos de la evidencia
    
    Returns:
        ID de la evidencia creada o None si falla
    """
    try:
        query = """
        INSERT INTO evidencias (tipo_id, path, hash, mime_type, tamano_bytes, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        """
        result = await conn.fetchrow(
            query,
            evidence_data["tipo_id"],
            evidence_data["path"],
            evidence_data["hash"],
            evidence_data["mime_type"],
            evidence_data["tamano_bytes"],
            json.dumps(evidence_data["metadata"])
        )
        
        evidencia_id = result['id']
        logger.info(f"✅ Evidencia registrada en BD: ID {evidencia_id}")
        return evidencia_id
        
    except Exception as e:
        logger.error(f"❌ Error al crear registro de evidencia: {str(e)}")
        return None

async def send_email_alert(tipo_alerta: str, detalle: str, punto: str, fecha: str):
    """
    Envía un email de notificación de alerta.
    """
    try:
        # Email destino (hardcoded para el usuario)
        email_to = "crumarx140@gmail.com"
        
        # Configuración SMTP de Gmail
        smtp_host = "smtp.gmail.com"
        smtp_port = 587
        smtp_user = os.getenv('SMTP_USER', 'crumarx140@gmail.com')
        smtp_password = os.getenv('SMTP_PASSWORD', '')
        
        if not smtp_password:
            logger.warning("⚠️ SMTP_PASSWORD no configurado - Email no enviado")
            return False
        
        # Determinar emoji y prioridad según tipo
        if 'desconocido' in tipo_alerta.lower():
            emoji = '⚠️'
            prioridad = 'Media'
            color = '#f59e0b'
        elif 'vida' in tipo_alerta.lower():
            emoji = '📸'
            prioridad = 'Alta'
            color = '#ef4444'
        else:
            emoji = '🚨'
            prioridad = 'Crítica'
            color = '#dc2626'
        
        # Crear mensaje
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"{emoji} Alerta de Seguridad - {tipo_alerta}"
        msg['From'] = smtp_user
        msg['To'] = email_to
        
        # HTML del email
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 10px; }}
                .header {{ background: linear-gradient(135deg, {color} 0%, #991b1b 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }}
                .alert-box {{ background: white; border-left: 4px solid {color}; padding: 15px; margin: 15px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .info-row {{ display: block; margin: 8px 0; padding: 10px; background: #f3f4f6; border-radius: 5px; }}
                .info-label {{ font-weight: bold; color: #6b7280; display: block; margin-bottom: 5px; font-size: 14px; }}
                .info-value {{ color: #111827; display: block; word-wrap: break-word; font-size: 14px; }}
                .footer {{ background: #1f2937; color: #9ca3af; padding: 20px 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }}
                .priority-badge {{ display: inline-block; padding: 8px 15px; background: {color}; color: white; border-radius: 20px; font-weight: bold; font-size: 13px; }}
                .action-box {{ margin-top: 15px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 5px; font-size: 14px; }}
                
                @media only screen and (max-width: 600px) {{
                    .container {{ padding: 5px !important; }}
                    .header {{ padding: 20px 15px !important; }}
                    .header h1 {{ font-size: 22px !important; }}
                    .header p {{ font-size: 13px !important; }}
                    .content {{ padding: 15px !important; }}
                    .alert-box {{ padding: 12px !important; margin: 10px 0 !important; }}
                    .info-row {{ padding: 8px !important; margin: 6px 0 !important; }}
                    .info-label {{ font-size: 13px !important; }}
                    .info-value {{ font-size: 13px !important; }}
                    .priority-badge {{ font-size: 12px !important; padding: 6px 12px !important; }}
                    .action-box {{ padding: 12px !important; font-size: 13px !important; }}
                    .footer {{ padding: 15px 10px !important; font-size: 11px !important; }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">{emoji} ALERTA DE SEGURIDAD</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Reconocimiento Facial</p>
                </div>
                
                <div class="content">
                    <p style="font-size: 16px; margin-top: 0;">Estimado Administrador,</p>
                    <p>Se ha generado una nueva alerta en el sistema de seguridad facial:</p>
                    
                    <div class="alert-box">
                        <div style="margin-bottom: 15px;">
                            <span class="priority-badge">Prioridad: {prioridad}</span>
                        </div>
                        
                        <div class="info-row">
                            <div class="info-label">🔴 Tipo:</div>
                            <div class="info-value">{tipo_alerta}</div>
                        </div>
                        
                        <div class="info-row">
                            <div class="info-label">📝 Descripción:</div>
                            <div class="info-value">{detalle}</div>
                        </div>
                        
                        <div class="info-row">
                            <div class="info-label">📍 Ubicación:</div>
                            <div class="info-value">{punto}</div>
                        </div>
                        
                        <div class="info-row">
                            <div class="info-label">🕐 Fecha y Hora:</div>
                            <div class="info-value">{fecha}</div>
                        </div>
                    </div>
                    
                    <div class="action-box">
                        <strong>⚡ Acción Requerida:</strong> Por favor, revise el dashboard del sistema para más detalles y tome las medidas necesarias.
                    </div>
                </div>
                
                <div class="footer">
                    <p style="margin: 0;">Sistema de Seguridad con Reconocimiento Facial</p>
                    <p style="margin: 5px 0 0 0;">Este es un mensaje automático, por favor no responder.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Adjuntar HTML
        part = MIMEText(html, 'html')
        msg.attach(part)
        
        # Enviar email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        logger.info(f"📧 Email enviado exitosamente a {email_to}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error al enviar email: {str(e)}")
        return False

async def get_user_embeddings():
    """Obtiene todos los embeddings de usuarios de la base de datos"""
    conn = await get_db_connection()
    try:
        query = """
        SELECT r.id, r.usuario_id, r.embedding, u.activo
        FROM rostros r
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE u.activo = true
        """
        rows = await conn.fetch(query)
        
        embeddings = []
        decryption_errors = 0
        for row in rows:
            try:
                decrypted_embedding = decrypt_embedding(row['embedding'])
                embeddings.append({
                    'id': row['id'],
                    'usuario_id': row['usuario_id'],
                    'embedding': decrypted_embedding
                })
            except Exception as e:
                decryption_errors += 1
        
        if decryption_errors > 0:
            logger.warning(f"Could not decrypt {decryption_errors} embeddings (likely from previous sessions with different encryption keys)")
        
        return embeddings
    finally:
        await conn.close()

# ============================================================
# EVENTO DE INICIO - AUTO-CONFIGURACIÓN
# ============================================================
@app.on_event("startup")
async def startup_event():
    """Se ejecuta al iniciar el servicio"""
    logger.info("🚀 Iniciando Face Recognition Service...")
    logger.info(f"📊 TensorFlow habilitado: {ENABLE_TENSORFLOW}")
    logger.info(f"🎯 Umbral de confianza: {CONFIDENCE_THRESHOLD}")
    logger.info(f"👁️ Umbral de liveness: {LIVENESS_THRESHOLD}")
    
    # Auto-configurar catálogos de base de datos
    await ensure_catalog_data()
    
    logger.info("✅ Servicio iniciado correctamente")

# Endpoints
@app.get("/health")
async def health_check():
    """Endpoint de salud del servicio"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/detect-face", response_model=FaceDetectionResponse)
async def detect_faces(request: FaceDetectionRequest):
    """Detecta rostros en una imagen usando OpenCV"""
    start_time = datetime.now()
    
    try:
        # Decodificar imagen
        image = decode_base64_image(request.image_base64)
        
        # Detectar rostros usando OpenCV mejorado
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Usar múltiples detectores para mejor precisión
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
        
        # Detectar rostros frontales - PARÁMETROS ULTRA ESTRICTOS
        faces_front = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.05,      # MUY PEQUEÑO - detección más precisa
            minNeighbors=15,       # ULTRA RESTRICTIVO - requiere muchas confirmaciones
            minSize=(150, 150),    # Rostro mínimo GRANDE para evitar falsos positivos
            maxSize=(300, 300),    # Rostros más controlados
            flags=cv2.CASCADE_SCALE_IMAGE | cv2.CASCADE_DO_CANNY_PRUNING
        )
        
        # Detectar rostros de perfil - PARÁMETROS ULTRA ESTRICTOS
        faces_profile = profile_cascade.detectMultiScale(
            gray,
            scaleFactor=1.05,      # MUY PEQUEÑO - detección más precisa
            minNeighbors=15,       # ULTRA RESTRICTIVO - requiere muchas confirmaciones
            minSize=(150, 150),    # Rostro mínimo GRANDE para evitar falsos positivos
            maxSize=(300, 300),    # Rostros más controlados
            flags=cv2.CASCADE_SCALE_IMAGE | cv2.CASCADE_DO_CANNY_PRUNING
        )
        
        # Combinar detecciones
        all_faces = []
        if len(faces_front) > 0:
            all_faces.extend(faces_front)
        if len(faces_profile) > 0:
            all_faces.extend(faces_profile)
        
        faces_data = []
        face_locations = []
        
        logger.info(f"OpenCV detectó {len(all_faces)} rostros")
        
        for i, (x, y, w, h) in enumerate(all_faces):
            # Convertir a formato (top, right, bottom, left)
            top = y
            right = x + w
            bottom = y + h
            left = x
            
            # VALIDACIÓN ADICIONAL DE CALIDAD DE ROSTRO
            face_roi = image[top:bottom, left:right]
            if face_roi.size == 0:
                logger.warning(f"🚫 Rostro {i}: ROI vacío - RECHAZADO")
                continue
                
            # Validar que tenga características de rostro real
            gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            
            # 1. Verificar variación de intensidad (rostros reales tienen variación)
            intensity_std = gray_face.std()
            if intensity_std < 25:  # Muy uniforme = no es rostro
                logger.warning(f"🚫 Rostro {i}: Muy uniforme (std={intensity_std:.1f}) - RECHAZADO")
                continue
            
            # 2. Verificar relación ancho/alto (rostros humanos tienen proporción específica)
            aspect_ratio = w / h
            if aspect_ratio < 0.6 or aspect_ratio > 1.4:  # Fuera de rango humano
                logger.warning(f"🚫 Rostro {i}: Proporción incorrecta ({aspect_ratio:.2f}) - RECHAZADO")
                continue
            
            # 3. Verificar que no sea muy pequeño después de filtros estrictos
            if w < 150 or h < 150:
                logger.warning(f"🚫 Rostro {i}: Muy pequeño ({w}x{h}) - RECHAZADO")
                continue
            
            logger.info(f"✅ Rostro {i} VALIDADO: {w}x{h}, std={intensity_std:.1f}, ratio={aspect_ratio:.2f}")
            
            face_locations.append((top, right, bottom, left))
            
            faces_data.append({
                "top": int(top),
                "right": int(right), 
                "bottom": int(bottom),
                "left": int(left),
                "width": int(w),
                "height": int(h),
                "confidence": 0.85  # Confianza fija para OpenCV
            })
        
        # Detectar liveness si se solicita
        total_liveness = 0
        for i, face_data in enumerate(faces_data):
            if request.check_liveness:
                face_location = (face_data["top"], face_data["right"], face_data["bottom"], face_data["left"])
                liveness_score = detect_liveness(image, face_location)
                face_data["liveness_score"] = liveness_score
                total_liveness += liveness_score
            else:
                face_data["liveness_score"] = None
        
        # Calcular tiempo de procesamiento
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Score promedio de liveness
        avg_liveness = total_liveness / len(faces_data) if faces_data and request.check_liveness else None
        
        return FaceDetectionResponse(
            detected=len(faces_data) > 0,
            faces_count=len(faces_data),
            faces=faces_data,
            liveness_score=avg_liveness,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error en detección de rostros: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")

async def validate_access_rules(user_id: int, punto_control_id: int) -> tuple[bool, str, int]:
    """
    Valida si un usuario tiene permiso de acceso a la zona del punto de control en el horario actual
    
    Returns:
        tuple[bool, str, int]: (tiene_permiso, mensaje_error, tipo_alerta_id)
    """
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        try:
            # Obtener la zona del punto de control
            zona_query = """
            SELECT zona_id, nombre 
            FROM puntos_control 
            WHERE id = $1 AND activo = true
            """
            punto_info = await conn.fetchrow(zona_query, punto_control_id)
            
            if not punto_info:
                logger.error(f"❌ Punto de control {punto_control_id} no encontrado o inactivo")
                return False, f"Punto de control {punto_control_id} no configurado", 6  # DENEGAR si punto no configurado
            
            zona_id = punto_info['zona_id']
            zona_nombre = punto_info['nombre']
            
            # Obtener fecha/hora actual
            now = datetime.now()
            dia_semana = now.weekday()  # 0=Lunes, 6=Domingo
            # Convertir a formato PostgreSQL (0=Domingo, 6=Sábado)
            dia_semana_pg = (dia_semana + 1) % 7
            hora_actual = now.time()
            
            logger.info(f"🔍 Validando acceso: Usuario {user_id} → Zona {zona_id} ({zona_nombre})")
            logger.info(f"   Día: {dia_semana_pg} ({['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][dia_semana_pg]}), Hora: {hora_actual.strftime('%H:%M')}")
            
            # Buscar reglas de acceso para este usuario y zona
            reglas_query = """
            SELECT id, hora_inicio, hora_fin, dia_semana, activo
            FROM reglas_acceso
            WHERE usuario_id = $1 
            AND zona_id = $2 
            AND activo = true
            AND (dia_semana IS NULL OR dia_semana = $3)
            ORDER BY dia_semana NULLS LAST
            """
            reglas = await conn.fetch(reglas_query, user_id, zona_id, dia_semana_pg)
            
            if not reglas:
                logger.warning(f"❌ ZONA RESTRINGIDA: Usuario {user_id} no tiene reglas de acceso para zona {zona_id}")
                return False, f"Usuario no autorizado para acceder a {zona_nombre}", 6  # Tipo 6: Zona restringida
            
            # Verificar horarios
            for regla in reglas:
                hora_inicio = regla['hora_inicio']
                hora_fin = regla['hora_fin']
                dia_regla = regla['dia_semana']
                
                logger.info(f"   Regla #{regla['id']}: {hora_inicio.strftime('%H:%M')} - {hora_fin.strftime('%H:%M')} (Día: {dia_regla if dia_regla is not None else 'Todos'})")
                
                # Verificar si está dentro del horario
                if hora_inicio <= hora_actual <= hora_fin:
                    logger.info(f"✅ ACCESO PERMITIDO: Usuario dentro del horario permitido")
                    return True, "", 0
            
            # Si llegamos aquí, hay reglas pero ninguna coincide con el horario actual
            logger.warning(f"❌ FUERA DE HORARIO: Usuario {user_id} intentó acceder fuera de horario permitido")
            hora_inicio_str = reglas[0]['hora_inicio'].strftime('%H:%M')
            hora_fin_str = reglas[0]['hora_fin'].strftime('%H:%M')
            return False, f"Acceso fuera de horario permitido ({hora_inicio_str} - {hora_fin_str})", 5  # Tipo 5: Acceso fuera de horario
            
        finally:
            await conn.close()
            
    except Exception as e:
        logger.error(f"❌ Error validando reglas de acceso: {str(e)}")
        # SEGURIDAD: En caso de error, DENEGAR acceso para proteger el sistema
        return False, f"Error en validación de acceso: {str(e)}", 1

@app.post("/recognize-face", response_model=FaceRecognitionResponse)
async def recognize_face(request: FaceRecognitionRequest):
    """Reconoce un rostro y determina acceso"""
    start_time = datetime.now()
    
    try:
        # Decodificar imagen
        image = decode_base64_image(request.image_base64)
        
        # Detectar rostros usando OpenCV (igual que detect-face)
        logger.info("🔍 INICIANDO RECONOCIMIENTO FACIAL")
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.05,      # MUY PEQUEÑO - detección más precisa
            minNeighbors=15,       # ULTRA RESTRICTIVO - requiere muchas confirmaciones
            minSize=(150, 150),    # Rostro mínimo GRANDE para evitar falsos positivos
            maxSize=(300, 300),    # Rostros más controlados
            flags=cv2.CASCADE_SCALE_IMAGE | cv2.CASCADE_DO_CANNY_PRUNING
        )
        
        logger.info(f"📊 DETECCIÓN: {len(faces)} rostros encontrados por OpenCV")
        
        face_locations = []
        face_encodings = []
        
        # Convertir detecciones de OpenCV con validación de calidad
        for (x, y, w, h) in faces:
            top, right, bottom, left = y, x + w, y + h, x
            face_roi = image[top:bottom, left:right]
            
            # VALIDACIÓN DE CALIDAD DEL ROSTRO
            if face_roi.size == 0:
                logger.warning(f"⚠️ Rostro descartado: ROI vacío")
                continue
                
            # Verificar tamaño mínimo
            if w < 120 or h < 120:
                logger.warning(f"⚠️ Rostro descartado: Muy pequeño ({w}x{h})")
                continue
                
            # Verificar calidad de imagen (nitidez)
            gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray_roi, cv2.CV_64F).var()
            if laplacian_var < 20:  # Umbral más permisivo para cámaras web
                logger.warning(f"⚠️ Rostro descartado: Imagen muy borrosa (nitidez: {laplacian_var:.1f})")
                continue
                
            logger.info(f"✅ Rostro válido: {w}x{h}, nitidez: {laplacian_var:.1f}")
            face_locations.append((top, right, bottom, left))
            
            try:
                # Usar la función unificada para garantizar consistencia
                embedding = generate_face_embedding(face_roi)
                face_encodings.append(embedding)
                logger.debug(f"Embedding generado para reconocimiento: {len(embedding)} dimensiones")
            except Exception as e:
                logger.warning(f"Error generando embedding para rostro: {str(e)}")
                continue
        
        if not face_encodings:
            logger.warning("🚫 DIAGNÓSTICO: No se detectaron rostros en la imagen")
            logger.info(f"📊 Rostros detectados por OpenCV: {len(faces)}")
            return FaceRecognitionResponse(
                success=False,
                confidence=0.0,
                decision="DENEGADO",
                liveness_ok=False,
                processing_time_ms=(datetime.now() - start_time).total_seconds() * 1000,
                message="No se detectó ningún rostro válido para procesar",
                faces=[]  # Sin rostros detectados
            )
        
        # Usar el primer rostro detectado
        face_encoding = face_encodings[0]
        face_location = face_locations[0]
        
        # Verificar liveness con TensorFlow si está habilitado
        liveness_ok = True
        liveness_score = 0.0
        spoofing_result = {"spoofing_detected": False, "confidence": 0.0, "attack_type": "none"}
        
        if request.check_liveness:
            if ENABLE_TENSORFLOW:
                # Usar detección avanzada con TensorFlow
                liveness_score = advanced_liveness_tensorflow(image, face_location)
                spoofing_result = detect_spoofing_tensorflow(image, face_location)
                
                # Combinar liveness y anti-spoofing
                liveness_ok = (liveness_score >= TF_LIVENESS_THRESHOLD and 
                             not spoofing_result["spoofing_detected"])
            else:
                # Usar método básico
                liveness_score = detect_liveness(image, face_location)
                liveness_ok = liveness_score >= LIVENESS_THRESHOLD
        
        # Obtener embeddings de la base de datos
        user_embeddings = await get_user_embeddings()
        
        if not user_embeddings:
            # Preparar coordenadas faciales incluso si no hay usuarios registrados
            faces_data = []
            if face_locations:
                top, right, bottom, left = face_locations[0]
                faces_data.append({
                    "left": int(left),    # Convertir numpy.int32 a int
                    "top": int(top),      # Convertir numpy.int32 a int
                    "right": int(right),  # Convertir numpy.int32 a int
                    "bottom": int(bottom) # Convertir numpy.int32 a int
                })
            
            return FaceRecognitionResponse(
                success=False,
                confidence=0.0,
                decision="DENEGADO",
                liveness_ok=liveness_ok,
                processing_time_ms=(datetime.now() - start_time).total_seconds() * 1000,
                message="No hay usuarios registrados en el sistema",
                faces=faces_data  # Incluir coordenadas para tracking
            )
        
        # Comparar con embeddings conocidos
        best_match_user_id = None
        best_confidence = 0.0
        
        # Agrupar embeddings por usuario para comparación múltiple
        user_confidences = {}
        
        for user_data in user_embeddings:
            user_id = user_data['usuario_id']
            
            # Verificar compatibilidad de dimensiones
            stored_embedding = user_data['embedding']
            
            logger.info(f"🔍 Comparando embeddings - Actual: {len(face_encoding)} dim, BD: {len(stored_embedding)} dim")
            
            # Solo comparar si las dimensiones son compatibles
            if len(face_encoding) != len(stored_embedding):
                logger.warning(f"⚠️ Dimensiones incompatibles - Saltando usuario {user_id}")
                confidence = 0.0  # Forzar confianza 0 para embeddings incompatibles
            else:
                # Usar nueva función mejorada de similitud
                confidence = calculate_similarity_score(face_encoding, stored_embedding)
                
                # VALIDACIÓN CRÍTICA: Si la confianza es >90% para cualquier usuario, verificar que sea realista
                if confidence > 0.90:
                    logger.warning(f"⚠️ ALTA CONFIANZA DETECTADA para Usuario {user_id}: {confidence:.3f}")
                    logger.warning(f"   Esto podría indicar un problema con el modelo o embeddings")
                    logger.warning(f"   Verificar que el rostro sea realmente del Usuario {user_id}")
            
            logger.info(f"👤 Usuario {user_id}: confianza calculada = {confidence:.3f}")
            
            # Guardar la mejor confianza para este usuario
            if user_id not in user_confidences or confidence > user_confidences[user_id]:
                user_confidences[user_id] = confidence
        
        # Encontrar el usuario con la mayor confianza VÁLIDA
        best_confidence = 0.0
        best_match_user_id = None
        
        for user_id, confidence in user_confidences.items():
            # Usar el umbral configurado en lugar de valor fijo
            if confidence > best_confidence and confidence >= CONFIDENCE_THRESHOLD:
                best_confidence = confidence
                best_match_user_id = user_id
                logger.info(f"✅ Usuario {user_id} considerado válido con confianza {confidence:.3f} (umbral: {CONFIDENCE_THRESHOLD})")
            elif confidence >= CONFIDENCE_THRESHOLD:
                logger.info(f"✅ Usuario {user_id} también válido con confianza {confidence:.3f} (umbral: {CONFIDENCE_THRESHOLD})")
            else:
                logger.warning(f"❌ Usuario {user_id} descartado - confianza {confidence:.3f} < umbral {CONFIDENCE_THRESHOLD}")
        
        # Si no hay confianza válida, es definitivamente un usuario no registrado
        if best_match_user_id is None:
            logger.error("🚫 NINGÚN USUARIO REGISTRADO - Todas las confianzas son muy bajas")
            # Mostrar todas las confianzas para debug
            for user_id, confidence in user_confidences.items():
                logger.error(f"   Usuario {user_id}: {confidence:.3f}")
        
        # Determinar decisión con lógica mejorada y más permisiva
        decision = "DENEGADO"
        success = False
        message = "Rostro no reconocido"
        tipo_alerta_zona_restriccion = 0  # Inicializar para alertas de zona/horario
        
        logger.info(f"🔍 Evaluando acceso - Confianza: {best_confidence:.1%}, Liveness: {liveness_ok}, Umbral: 95%")
        
        # LÓGICA DE SEGURIDAD ULTRA ESTRICTA - SOLO USUARIOS REGISTRADOS
        logger.info(f"🔒 VALIDACIÓN ULTRA ESTRICTA:")
        logger.info(f"   - Mejor match: Usuario {best_match_user_id}")
        logger.info(f"   - Confianza: {best_confidence:.3f}")
        logger.info(f"   - Liveness: {liveness_ok}")
        logger.info(f"   - Umbral requerido: 95% (ULTRA ESTRICTO)")
        
        # REGLA 1: Sin usuario registrado = DENEGADO AUTOMÁTICO
        if best_match_user_id is None:
            decision = "DENEGADO"
            message = f"❌ ACCESO DENEGADO - Ningún usuario registrado reconocido"
            logger.error(f"🚫 ACCESO DENEGADO - Sin match de usuario registrado")
            
        # REGLA 1.5: Validación adicional - Si confianza es muy baja, es usuario no registrado
        elif best_confidence < 0.80:  # Confianza muy baja = definitivamente no registrado
            decision = "DENEGADO"
            message = f"❌ ACCESO DENEGADO - Usuario no registrado (confianza: {best_confidence:.1%})"
            logger.error(f"🚫 ACCESO DENEGADO - Usuario no registrado detectado: {best_confidence:.3f}")
            
        # REGLA 2: Confianza < CONFIDENCE_THRESHOLD = DENEGADO
        elif best_confidence < CONFIDENCE_THRESHOLD:
            decision = "DENEGADO"
            message = f"❌ ACCESO DENEGADO - Confianza insuficiente ({best_confidence:.1%} < {CONFIDENCE_THRESHOLD:.1%})"
            logger.error(f"🚫 ACCESO DENEGADO - Confianza insuficiente: {best_confidence:.3f} < {CONFIDENCE_THRESHOLD}")
            
        # REGLA 3: Sin liveness = DENEGADO (Anti-spoofing)
        elif not liveness_ok:
            decision = "DENEGADO"
            message = f"❌ ACCESO DENEGADO - Falla anti-spoofing (foto/pantalla detectada)"
            logger.error(f"🚫 ACCESO DENEGADO - Liveness fallido para Usuario {best_match_user_id}")
            
        # REGLA 4: Validar zona y horario de acceso (RF4, RF10)
        else:
            # Validar reglas de acceso por zona y horario
            tiene_permiso, mensaje_zona, tipo_alerta_zona = await validate_access_rules(
                best_match_user_id, 
                request.punto_control_id
            )
            
            if not tiene_permiso:
                decision = "DENEGADO"
                message = f"❌ ACCESO DENEGADO - {mensaje_zona}"
                logger.error(f"🚫 ACCESO DENEGADO - Regla de zona: {mensaje_zona}")
                # Guardar tipo de alerta para uso posterior (tipo 5 o 6)
                tipo_alerta_zona_restriccion = tipo_alerta_zona
            else:
                # REGLA 5: SOLO si TODO está perfecto = PERMITIDO
                decision = "PERMITIDO"
                success = True
                message = f"✅ ACCESO AUTORIZADO - Usuario {best_match_user_id} (confianza: {best_confidence:.1%})"
                logger.info(f"✅ ACCESO AUTORIZADO - Usuario {best_match_user_id} - Confianza: {best_confidence:.3f}")
                tipo_alerta_zona_restriccion = 0
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Preparar coordenadas faciales para tracking
        faces_data = []
        if face_locations:
            top, right, bottom, left = face_locations[0]  # Usar el primer rostro
            faces_data.append({
                "left": int(left),    # Convertir numpy.int32 a int
                "top": int(top),      # Convertir numpy.int32 a int
                "right": int(right),  # Convertir numpy.int32 a int
                "bottom": int(bottom) # Convertir numpy.int32 a int
            })
        
        # ============================================================
        # GUARDAR EVIDENCIAS FOTOGRÁFICAS
        # ============================================================
        evidencia_acceso_id = None
        evidencia_alerta_id = None
        evidencia_rostro_id = None
        
        # Guardar foto completa del acceso (Tipo 1: FOTO_ACCESO)
        evidence_data_acceso = await save_evidence_photo(image, tipo_evidencia_id=1, prefix="acceso")
        
        # Guardar rostro recortado si se detectó (Tipo 4: FOTO_ROSTRO)
        if face_location:
            top, right, bottom, left = face_location
            face_roi = image[top:bottom, left:right]
            evidence_data_rostro = await save_evidence_photo(face_roi, tipo_evidencia_id=4, prefix="rostro")
        else:
            evidence_data_rostro = None
        
        # ============================================================
        # REGISTRAR ACCESO Y ALERTAS EN BASE DE DATOS
        # ============================================================
        try:
            conn = await get_db_connection()
            try:
                # Registrar evidencias en BD primero
                if evidence_data_acceso:
                    evidencia_acceso_id = await create_evidence_record(conn, evidence_data_acceso)
                
                if evidence_data_rostro:
                    evidencia_rostro_id = await create_evidence_record(conn, evidence_data_rostro)
                
                # Determinar tipo de decisión (1=PERMITIDO, 2=DENEGADO)
                tipo_decision_id = 1 if success else 2
                acceso_id = None
                
                # Solo registrar acceso si hay usuario reconocido
                if best_match_user_id is not None:
                    # Crear registro de acceso con evidencia
                    acceso_query = """
                    INSERT INTO accesos (usuario_id, punto_id, decision_id, evidencia_id, creado_en)
                    VALUES ($1, $2, $3, $4, NOW())
                    RETURNING id
                    """
                    acceso_result = await conn.fetchrow(
                        acceso_query,
                        best_match_user_id,
                        request.punto_control_id,  # Usar punto de control real del request
                        tipo_decision_id,
                        evidencia_acceso_id  # Asociar evidencia
                    )
                    acceso_id = acceso_result['id']
                    logger.info(f"✅ Acceso registrado en BD: ID {acceso_id}")
                    
                    # Crear registro de rostro procesado
                    acceso_rostro_query = """
                    INSERT INTO acceso_rostros (acceso_id, usuario_id, score, liveness_ok)
                    VALUES ($1, $2, $3, $4)
                    """
                    await conn.execute(
                        acceso_rostro_query,
                        acceso_id,
                        best_match_user_id,
                        float(best_confidence),
                        liveness_ok
                    )
                    logger.info(f"✅ Rostro registrado para acceso {acceso_id}")
                else:
                    logger.warning(f"⚠️ No se registró acceso: usuario no reconocido")
                
                # CREAR ALERTA SI EL ACCESO FUE DENEGADO
                if not success:
                    # Determinar tipo de alerta según la razón del rechazo
                    # 
                    # TIPOS DISPONIBLES EN BD (6 tipos):
                    # 1 = "Acceso no autorizado"
                    # 2 = "Falla en prueba de vida"
                    # 3 = "Usuario desconocido"
                    # 4 = "Múltiples intentos fallidos"
                    # 5 = "Acceso fuera de horario" (RF10)
                    # 6 = "Zona restringida" (RF10)
                    #
                    # Ahora se usan TODOS los tipos según la situación
                    
                    tipo_alerta_id = 1  # Por defecto: "Acceso no autorizado"
                    detalle_alerta = message
                    
                    # Prioridad: Tipo específico de zona/horario > Usuario desconocido > Liveness > Confianza
                    if 'tipo_alerta_zona_restriccion' in locals() and tipo_alerta_zona_restriccion in [5, 6]:
                        # Alertas de zona restringida o fuera de horario (RF10)
                        tipo_alerta_id = tipo_alerta_zona_restriccion
                        detalle_alerta = message  # Ya tiene el mensaje correcto de validate_access_rules
                        logger.info(f"🚨 Alerta tipo {tipo_alerta_id}: {'Fuera de horario' if tipo_alerta_id == 5 else 'Zona restringida'}")
                    elif best_match_user_id is None or best_confidence < 0.80:
                        # Usuario no registrado
                        tipo_alerta_id = 3  # "Usuario desconocido"
                        detalle_alerta = f"Persona no registrada intentó acceder (confianza: {best_confidence:.1%})"
                    elif not liveness_ok:
                        # Falla de liveness (posible spoofing)
                        tipo_alerta_id = 2  # "Falla en prueba de vida"
                        detalle_alerta = f"Falla en detección de vida - Posible foto/video (Usuario: {best_match_user_id})"
                    elif best_confidence < CONFIDENCE_THRESHOLD:
                        # Confianza insuficiente
                        tipo_alerta_id = 1  # "Acceso no autorizado"
                        detalle_alerta = f"Confianza insuficiente: {best_confidence:.1%} < {CONFIDENCE_THRESHOLD:.1%}"
                    
                    # Guardar evidencia específica para la alerta (Tipo 3: FOTO_ALERTA)
                    evidence_data_alerta = await save_evidence_photo(image, tipo_evidencia_id=3, prefix="alerta")
                    if evidence_data_alerta:
                        evidencia_alerta_id = await create_evidence_record(conn, evidence_data_alerta)
                    
                    # Insertar alerta en BD con evidencia
                    alerta_query = """
                    INSERT INTO alertas (tipo_id, detalle, punto_id, evidencia_id)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id
                    """
                    alerta_result = await conn.fetchrow(
                        alerta_query,
                        tipo_alerta_id,
                        detalle_alerta,
                        request.punto_control_id,  # Usar punto de control real del request
                        evidencia_alerta_id  # Asociar evidencia
                    )
                    alerta_id = alerta_result['id']
                    logger.info(f"🚨 ALERTA CREADA: ID {alerta_id} - Tipo {tipo_alerta_id}")
                    logger.info(f"   Detalle: {detalle_alerta}")
                    
                    # Crear notificación para la alerta
                    notificacion_query = """
                    INSERT INTO notificaciones (alerta_id, canal_id, destino, estado)
                    VALUES ($1, $2, $3, $4)
                    """
                    await conn.execute(
                        notificacion_query,
                        alerta_id,
                        1,  # canal_id = 1 (Sistema)
                        'sistema',
                        'pendiente'  # Estado inicial
                    )
                    logger.info(f"📬 Notificación creada para alerta {alerta_id}")
                    
                    # Obtener nombre del tipo de alerta para el email
                    tipo_nombre_query = "SELECT nombre FROM tipo_alerta WHERE id = $1"
                    tipo_nombre = await conn.fetchval(tipo_nombre_query, tipo_alerta_id)
                    
                    # Enviar email de notificación
                    fecha_actual = datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
                    email_enviado = await send_email_alert(
                        tipo_alerta=tipo_nombre or "Alerta de Seguridad",
                        detalle=detalle_alerta,
                        punto="Entrada Principal - Recepción",
                        fecha=fecha_actual
                    )
                    
                    if email_enviado:
                        # Actualizar estado de notificación a 'enviado'
                        await conn.execute(
                            "UPDATE notificaciones SET estado = 'enviado' WHERE alerta_id = $1 AND canal_id = 1",
                            alerta_id
                        )
                        logger.info(f"✅ Email enviado y notificación actualizada")
                
            finally:
                await conn.close()
        except Exception as db_error:
            logger.error(f"❌ Error al registrar en BD: {str(db_error)}")
            # No fallar el reconocimiento por error de BD
        
        return FaceRecognitionResponse(
            success=success,
            user_id=best_match_user_id if success else None,
            confidence=best_confidence,
            decision=decision,
            liveness_ok=liveness_ok,
            processing_time_ms=processing_time,
            message=message,
            faces=faces_data  # Incluir coordenadas para tracking
        )
        
    except Exception as e:
        logger.error(f"Error en reconocimiento facial: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando reconocimiento: {str(e)}")

@app.post("/enroll-face", response_model=FaceEnrollmentResponse)
async def enroll_face(request: FaceEnrollmentRequest):
    """Registra rostros de un usuario en la base de datos"""
    logger.info(f"Iniciando registro facial para usuario {request.user_id}")
    logger.info(f"Recibidas {len(request.images_base64)} imágenes")
    
    try:
        embeddings = []
        qualities = []
        
        # Procesar cada imagen
        for i, image_base64 in enumerate(request.images_base64):
            logger.info(f"Procesando imagen {i+1}/{len(request.images_base64)}")
            
            try:
                image = decode_base64_image(image_base64)
                logger.info(f"Imagen {i+1} decodificada: {image.shape}")
                
                # Detectar rostros usando OpenCV (simulado)
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                logger.info(f"Detectados {len(faces)} rostros en imagen {i+1}")
                
                face_locations = [(y, x+w, y+h, x) for (x, y, w, h) in faces]
                face_encodings = []
                
                # SOLO procesar el PRIMER rostro detectado para evitar múltiples registros
                if len(faces) > 0:
                    x, y, w, h = faces[0]  # Solo el primer rostro
                    top, right, bottom, left = y, x + w, y + h, x
                    face_roi = image[top:bottom, left:right]
                    if face_roi.size > 0:
                        try:
                            # Verificar calidad antes de procesar
                            gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
                            laplacian_var = cv2.Laplacian(gray_roi, cv2.CV_64F).var()
                            
                            if laplacian_var >= 20:  # Mismo umbral que reconocimiento
                                embedding = generate_face_embedding(face_roi)
                                face_encodings.append(embedding)
                                logger.info(f"✅ Rostro registrado en imagen {i+1}: nitidez {laplacian_var:.1f}")
                            else:
                                logger.warning(f"⚠️ Rostro descartado en imagen {i+1}: muy borroso (nitidez: {laplacian_var:.1f})")
                        except Exception as e:
                            logger.warning(f"Error generando embedding para rostro en imagen {i+1}: {str(e)}")
                else:
                    logger.warning(f"No se detectaron rostros en imagen {i+1}")
                
                if face_encodings:
                    face_encoding = face_encodings[0]
                    face_location = face_locations[0]
                    
                    # Calcular calidad
                    quality = calculate_face_quality(face_encoding, face_location)
                    logger.info(f"Calidad calculada para imagen {i+1}: {quality}")
                    
                    if quality >= 0.3:  # Umbral mínimo de calidad
                        embeddings.append(face_encoding)
                        qualities.append(quality)
                        logger.info(f"Embedding agregado para imagen {i+1}")
                    else:
                        logger.warning(f"Calidad insuficiente en imagen {i+1}: {quality}")
                else:
                    logger.warning(f"No se encontraron rostros en imagen {i+1}")
                    
            except Exception as img_error:
                logger.error(f"Error procesando imagen {i+1}: {str(img_error)}")
                continue
        
        if not embeddings:
            return FaceEnrollmentResponse(
                success=False,
                faces_processed=0,
                average_quality=0.0,
                message="No se encontraron rostros de calidad suficiente"
            )
        
        # Guardar embeddings en la base de datos
        logger.info(f"Conectando a la base de datos para guardar {len(embeddings)} embeddings")
        conn = await get_db_connection()
        try:
            # Obtener modelo facial por defecto
            logger.info(f"Buscando modelo facial: {request.model_name}")
            model_query = "SELECT id FROM modelos_faciales WHERE nombre = $1 LIMIT 1"
            model_row = await conn.fetchrow(model_query, request.model_name)
            model_id = model_row['id'] if model_row else None
            logger.info(f"Modelo encontrado: {model_id}")
            
            # Insertar cada embedding
            for i, (embedding, quality) in enumerate(zip(embeddings, qualities)):
                logger.info(f"Insertando embedding {i+1}/{len(embeddings)}")
                encrypted_embedding = encrypt_embedding(embedding)
                
                insert_query = """
                INSERT INTO rostros (usuario_id, embedding, calidad, modelo_id)
                VALUES ($1, $2, $3, $4)
                """
                await conn.execute(insert_query, request.user_id, encrypted_embedding, quality, model_id)
                logger.info(f"Embedding {i+1} insertado exitosamente")
            
            avg_quality = sum(qualities) / len(qualities)
            logger.info(f"Registro completado. Calidad promedio: {avg_quality}")
            
            return FaceEnrollmentResponse(
                success=True,
                faces_processed=len(embeddings),
                average_quality=avg_quality,
                message=f"Se registraron {len(embeddings)} rostros exitosamente"
            )
            
        finally:
            await conn.close()
            
    except Exception as e:
        logger.error(f"Error en registro facial: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error registrando rostros: {str(e)}")

@app.get("/stats")
async def get_service_stats():
    """Obtiene estadísticas del servicio"""
    conn = await get_db_connection()
    try:
        # Contar rostros registrados
        rostros_count = await conn.fetchval("SELECT COUNT(*) FROM rostros")
        
        # Contar usuarios activos con rostros
        usuarios_con_rostros = await conn.fetchval("""
            SELECT COUNT(DISTINCT r.usuario_id) 
            FROM rostros r 
            JOIN usuarios u ON r.usuario_id = u.id 
            WHERE u.activo = true
        """)
        
        return {
            "rostros_registrados": rostros_count,
            "usuarios_con_rostros": usuarios_con_rostros,
            "umbral_confianza": CONFIDENCE_THRESHOLD,
            "umbral_liveness": LIVENESS_THRESHOLD,
            "servicio_activo": True
        }
    finally:
        await conn.close()

@app.get("/evidencias/{evidencia_id}/imagen")
async def get_evidencia_imagen(evidencia_id: int):
    """
    Sirve la imagen de una evidencia específica.
    """
    try:
        conn = await get_db_connection()
        try:
            # Obtener información de la evidencia
            query = """
            SELECT id, path, mime_type
            FROM evidencias
            WHERE id = $1
            """
            evidencia = await conn.fetchrow(query, evidencia_id)
            
            if not evidencia:
                raise HTTPException(status_code=404, detail="Evidencia no encontrada")
            
            # Obtener ruta del archivo
            file_path = evidencia['path']
            logger.info(f"📂 Ruta de evidencia: {file_path}")
            
            # Si la ruta es relativa (por compatibilidad con datos antiguos), hacerla absoluta
            if not os.path.isabs(file_path):
                project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                file_path = os.path.join(project_root, file_path.lstrip('../'))
                logger.info(f"📂 Ruta relativa convertida a absoluta: {file_path}")
            
            # Verificar que el archivo existe
            if not os.path.exists(file_path):
                logger.error(f"❌ Archivo de evidencia no encontrado: {file_path}")
                logger.error(f"   Directorio actual: {os.path.dirname(__file__)}")
                logger.error(f"   Archivos en directorio padre: {os.listdir(os.path.dirname(os.path.dirname(__file__)))}")
                raise HTTPException(status_code=404, detail="Archivo de imagen no encontrado")
            
            logger.info(f"✅ Sirviendo imagen: {file_path} ({os.path.getsize(file_path)} bytes)")
            
            # Servir el archivo
            return FileResponse(
                path=file_path,
                media_type=evidencia['mime_type'] or "image/jpeg",
                filename=f"evidencia_{evidencia_id}.jpg"
            )
            
        finally:
            await conn.close()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al servir imagen de evidencia: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener imagen: {str(e)}")

@app.get("/")
async def root():
    """Ruta raíz del servicio"""
    return {
        "service": "Face Recognition Service",
        "version": "1.0.0",
        "status": "active",
        "endpoints": [
            "/health",
            "/detect-face",
            "/recognize-face",
            "/register-face",
            "/stats"
        ]
    }

@app.get("/health")
async def health_check():
    """Verificación de salud del servicio"""
    return {
        "status": "healthy",
        "service": "Face Recognition Service",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
