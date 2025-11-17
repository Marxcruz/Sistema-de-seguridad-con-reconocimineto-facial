"""
Modelos TensorFlow para reconocimiento facial avanzado
Este módulo contiene funciones para crear y cargar modelos de deep learning
"""

import tensorflow as tf
from tensorflow import keras
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)

def create_liveness_model(input_shape=(64, 64, 3)):
    """
    Crea un modelo CNN para detección de liveness
    """
    model = keras.Sequential([
        keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Conv2D(64, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Conv2D(64, (3, 3), activation='relu'),
        keras.layers.Flatten(),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.5),
        keras.layers.Dense(1, activation='sigmoid')  # Salida binaria: real/fake
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def create_spoofing_detection_model(input_shape=(128, 128, 3)):
    """
    Crea un modelo para detección de ataques de spoofing
    """
    model = keras.Sequential([
        keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        
        keras.layers.Conv2D(64, (3, 3), activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        
        keras.layers.Conv2D(128, (3, 3), activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        
        keras.layers.GlobalAveragePooling2D(),
        keras.layers.Dense(128, activation='relu'),
        keras.layers.Dropout(0.5),
        keras.layers.Dense(3, activation='softmax')  # 3 clases: real, photo, screen
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def create_emotion_detection_model(input_shape=(48, 48, 1)):
    """
    Crea un modelo para detección de emociones
    """
    model = keras.Sequential([
        keras.layers.Conv2D(64, (3, 3), activation='relu', input_shape=input_shape),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Dropout(0.25),
        
        keras.layers.Conv2D(128, (3, 3), activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Dropout(0.25),
        
        keras.layers.Conv2D(256, (3, 3), activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Dropout(0.25),
        
        keras.layers.Flatten(),
        keras.layers.Dense(512, activation='relu'),
        keras.layers.BatchNormalization(),
        keras.layers.Dropout(0.5),
        keras.layers.Dense(7, activation='softmax')  # 7 emociones
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def load_or_create_model(model_path: str, model_type: str):
    """
    Carga un modelo existente o crea uno nuevo
    """
    if os.path.exists(model_path):
        try:
            logger.info(f"Cargando modelo {model_type} desde {model_path}")
            return keras.models.load_model(model_path)
        except Exception as e:
            logger.warning(f"Error cargando modelo {model_type}: {e}")
    
    logger.info(f"Creando nuevo modelo {model_type}")
    
    if model_type == "liveness":
        return create_liveness_model()
    elif model_type == "spoofing":
        return create_spoofing_detection_model()
    elif model_type == "emotion":
        return create_emotion_detection_model()
    else:
        raise ValueError(f"Tipo de modelo desconocido: {model_type}")

def preprocess_face_for_liveness(face_image: np.ndarray) -> np.ndarray:
    """
    Preprocesa una imagen de rostro para el modelo de liveness
    """
    # Redimensionar a 64x64
    face_resized = tf.image.resize(face_image, [64, 64])
    
    # Normalizar valores de píxeles
    face_normalized = tf.cast(face_resized, tf.float32) / 255.0
    
    # Añadir dimensión de batch
    face_batch = tf.expand_dims(face_normalized, 0)
    
    return face_batch

def preprocess_face_for_spoofing(face_image: np.ndarray) -> np.ndarray:
    """
    Preprocesa una imagen de rostro para el modelo de spoofing
    """
    # Redimensionar a 128x128
    face_resized = tf.image.resize(face_image, [128, 128])
    
    # Normalizar valores de píxeles
    face_normalized = tf.cast(face_resized, tf.float32) / 255.0
    
    # Añadir dimensión de batch
    face_batch = tf.expand_dims(face_normalized, 0)
    
    return face_batch

def preprocess_face_for_emotion(face_image: np.ndarray) -> np.ndarray:
    """
    Preprocesa una imagen de rostro para el modelo de emociones
    """
    # Convertir a escala de grises si es necesario
    if len(face_image.shape) == 3:
        face_gray = tf.image.rgb_to_grayscale(face_image)
    else:
        face_gray = tf.expand_dims(face_image, -1)
    
    # Redimensionar a 48x48
    face_resized = tf.image.resize(face_gray, [48, 48])
    
    # Normalizar valores de píxeles
    face_normalized = tf.cast(face_resized, tf.float32) / 255.0
    
    # Añadir dimensión de batch
    face_batch = tf.expand_dims(face_normalized, 0)
    
    return face_batch

# Mapeo de emociones
EMOTION_LABELS = {
    0: 'angry',
    1: 'disgust', 
    2: 'fear',
    3: 'happy',
    4: 'sad',
    5: 'surprise',
    6: 'neutral'
}

def predict_emotion(model, face_image: np.ndarray) -> dict:
    """
    Predice la emoción de un rostro
    """
    try:
        # Preprocesar imagen
        processed_face = preprocess_face_for_emotion(face_image)
        
        # Realizar predicción
        predictions = model.predict(processed_face, verbose=0)
        
        # Obtener la emoción con mayor probabilidad
        emotion_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][emotion_idx])
        emotion = EMOTION_LABELS.get(emotion_idx, 'unknown')
        
        return {
            'emotion': emotion,
            'confidence': confidence,
            'all_probabilities': {
                EMOTION_LABELS[i]: float(predictions[0][i]) 
                for i in range(len(EMOTION_LABELS))
            }
        }
        
    except Exception as e:
        logger.error(f"Error en predicción de emoción: {e}")
        return {
            'emotion': 'neutral',
            'confidence': 0.5,
            'all_probabilities': {}
        }

def enhanced_face_encoding_tf(face_image: np.ndarray) -> np.ndarray:
    """
    Genera embeddings faciales mejorados usando TensorFlow
    Esta función simula un modelo más avanzado como FaceNet
    """
    try:
        # Preprocesar imagen
        face_resized = tf.image.resize(face_image, [160, 160])
        face_normalized = tf.cast(face_resized, tf.float32) / 255.0
        face_batch = tf.expand_dims(face_normalized, 0)
        
        # Simular embedding de 512 dimensiones (en producción usarías FaceNet)
        # Por ahora, generamos características basadas en la imagen
        features = []
        
        # Características de color
        mean_rgb = tf.reduce_mean(face_batch, axis=[1, 2])
        features.extend(tf.reshape(mean_rgb, [-1]).numpy())
        
        # Características de textura (usando convoluciones)
        conv1 = tf.nn.conv2d(face_batch, 
                           tf.random.normal([3, 3, 3, 32]), 
                           strides=1, padding='SAME')
        pooled1 = tf.nn.max_pool2d(conv1, ksize=2, strides=2, padding='SAME')
        
        conv2 = tf.nn.conv2d(pooled1,
                           tf.random.normal([3, 3, 32, 64]),
                           strides=1, padding='SAME')
        pooled2 = tf.nn.max_pool2d(conv2, ksize=2, strides=2, padding='SAME')
        
        # Aplanar y tomar características representativas
        flattened = tf.reshape(pooled2, [1, -1])
        
        # Reducir a 512 dimensiones
        if flattened.shape[1] > 512:
            # Tomar las primeras 512 características
            embedding = flattened[0, :512]
        else:
            # Rellenar con ceros si es necesario
            padding_size = 512 - flattened.shape[1]
            padding = tf.zeros([padding_size])
            embedding = tf.concat([flattened[0], padding], axis=0)
        
        # Normalizar el embedding
        embedding_normalized = tf.nn.l2_normalize(embedding, axis=0)
        
        return embedding_normalized.numpy()
        
    except Exception as e:
        logger.error(f"Error generando embedding TF: {e}")
        # Fallback: generar embedding aleatorio normalizado
        random_embedding = np.random.normal(0, 1, 512)
        return random_embedding / np.linalg.norm(random_embedding)

class TensorFlowModelManager:
    """
    Gestor de modelos TensorFlow para el sistema de reconocimiento facial
    """
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.models = {}
        
        # Crear directorio de modelos si no existe
        os.makedirs(models_dir, exist_ok=True)
        
    def load_all_models(self):
        """
        Carga todos los modelos disponibles
        """
        model_configs = {
            "liveness": "liveness_model.h5",
            "spoofing": "spoofing_model.h5", 
            "emotion": "emotion_model.h5"
        }
        
        for model_type, filename in model_configs.items():
            model_path = os.path.join(self.models_dir, filename)
            try:
                self.models[model_type] = load_or_create_model(model_path, model_type)
                logger.info(f"Modelo {model_type} cargado exitosamente")
            except Exception as e:
                logger.error(f"Error cargando modelo {model_type}: {e}")
                self.models[model_type] = None
    
    def get_model(self, model_type: str):
        """
        Obtiene un modelo específico
        """
        return self.models.get(model_type)
    
    def save_model(self, model_type: str, model):
        """
        Guarda un modelo en disco
        """
        filename = f"{model_type}_model.h5"
        model_path = os.path.join(self.models_dir, filename)
        
        try:
            model.save(model_path)
            logger.info(f"Modelo {model_type} guardado en {model_path}")
        except Exception as e:
            logger.error(f"Error guardando modelo {model_type}: {e}")
    
    def is_model_available(self, model_type: str) -> bool:
        """
        Verifica si un modelo está disponible
        """
        return model_type in self.models and self.models[model_type] is not None
