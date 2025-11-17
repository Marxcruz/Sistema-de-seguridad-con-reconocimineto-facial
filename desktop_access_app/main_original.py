#!/usr/bin/env python3
"""
Sistema de Seguridad con Reconocimiento Facial
Aplicación de Escritorio para Control de Acceso en Tiempo Real

Autor: Sistema de Seguridad
Versión: 1.0
Descripción: Aplicación de escritorio para operadores de seguridad en puntos de control
"""
import tkinter as tk
from tkinter import ttk, messagebox
import cv2
import requests
import base64
import logging
import threading
import time
import json
from datetime import datetime
from typing import Optional
import numpy as np
from PIL import Image, ImageTk

# Configurar logging con UTF-8
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('access_control.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

# Crear instancia del logger
logger = logging.getLogger(__name__)

class AccessControlApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Sistema de Control de Acceso - Reconocimiento Facial")
        self.root.geometry("1400x900")  # Ventana más grande para mejor video
        self.root.configure(bg='#2c3e50')
        
        # Centrar la ventana en la pantalla
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f"{width}x{height}+{x}+{y}")
        
        # Variables de estado
        self.camera = None
        self.is_camera_active = False
        self.is_processing = False
        self.current_frame = None
        self.selected_point = 1  # Será actualizado dinámicamente
        self.access_attempts = []
        self.available_points = []  # Lista de puntos disponibles
        
        # API Configuration
        self.api_base_url = "http://localhost:8000"
        
        # Configurar interfaz
        self.setup_ui()
        
        # Cargar puntos de control disponibles
        self.load_available_points()
        
        # Iniciar hilo de actualización de video
        self.video_thread = None
        self.running = True
        
        # Configurar cierre de aplicación
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def load_available_points(self):
        """Cargar puntos de control disponibles desde la API"""
        try:
            response = requests.get("http://localhost:3000/api/puntos-control", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    self.available_points = data['data']
                    if self.available_points:
                        self.selected_point = self.available_points[0]['id']
                        logging.info(f"Puntos de control cargados: {len(self.available_points)}")
                    else:
                        logging.warning("No se encontraron puntos de control")
                else:
                    logging.error("Error en respuesta de puntos de control")
            else:
                logging.error(f"Error obteniendo puntos de control: {response.status_code}")
        except Exception as e:
            logging.error(f"Error conectando para obtener puntos de control: {e}")
            # Usar valores por defecto si no se puede conectar
            self.available_points = [
                {"id": 1, "nombre": "Entrada Principal"},
                {"id": 2, "nombre": "Acceso Oficinas"},
                {"id": 3, "nombre": "Sala Servidores"}
            ]
            self.selected_point = 1
        
    def setup_ui(self):
        """Configurar la interfaz de usuario"""
        
        # Título principal
        title_frame = tk.Frame(self.root, bg='#2c3e50', height=80)
        title_frame.pack(fill='x', padx=20, pady=(20, 0))
        title_frame.pack_propagate(False)
        
        title_label = tk.Label(
            title_frame,
            text="🔒 CONTROL DE ACCESO - RECONOCIMIENTO FACIAL",
            font=('Arial', 20, 'bold'),
            fg='white',
            bg='#2c3e50'
        )
        title_label.pack(expand=True)
        
        # Frame principal
        main_frame = tk.Frame(self.root, bg='#2c3e50')
        main_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Panel izquierdo - Cámara y controles
        left_panel = tk.Frame(main_frame, bg='#34495e', relief='raised', bd=2)
        left_panel.pack(side='left', fill='both', expand=True, padx=(0, 10))
        
        # Panel derecho - Log de accesos y estado
        right_panel = tk.Frame(main_frame, bg='#34495e', relief='raised', bd=2, width=350)
        right_panel.pack(side='right', fill='y', padx=(10, 0))
        right_panel.pack_propagate(False)
        
        self.setup_camera_panel(left_panel)
        self.setup_access_log_panel(right_panel)
        
    def setup_camera_panel(self, parent):
        """Configurar panel de cámara"""
        
        # Título del panel
        camera_title = tk.Label(
            parent,
            text="📹 CÁMARA DE RECONOCIMIENTO",
            font=('Arial', 14, 'bold'),
            fg='white',
            bg='#34495e'
        )
        camera_title.pack(pady=(20, 10))
        
        # Controles superiores
        controls_frame = tk.Frame(parent, bg='#34495e')
        controls_frame.pack(pady=10)
        
        # Selector de punto de control
        tk.Label(
            controls_frame,
            text="Punto de Control:",
            font=('Arial', 10),
            fg='white',
            bg='#34495e'
        ).pack(side='left', padx=(0, 10))
        
        self.point_var = tk.StringVar(value="1")
        point_combo = ttk.Combobox(
            controls_frame,
            textvariable=self.point_var,
            values=["1 - Entrada Principal", "2 - Acceso Oficinas", "3 - Sala Servidores"],
            state="readonly",
            width=20
        )
        point_combo.pack(side='left', padx=(0, 20))
        point_combo.bind('<<ComboboxSelected>>', self.on_point_changed)
        
        # Botones de control
        self.start_btn = tk.Button(
            controls_frame,
            text="▶ INICIAR CÁMARA",
            font=('Arial', 10, 'bold'),
            bg='#27ae60',
            fg='white',
            command=self.start_camera,
            padx=20,
            pady=5
        )
        self.start_btn.pack(side='left', padx=5)
        
        self.stop_btn = tk.Button(
            controls_frame,
            text="⏹ DETENER",
            font=('Arial', 10, 'bold'),
            bg='#e74c3c',
            fg='white',
            command=self.stop_camera,
            padx=20,
            pady=5,
            state='disabled'
        )
        self.stop_btn.pack(side='left', padx=5)
        
        self.verify_btn = tk.Button(
            controls_frame,
            text="🔍 VERIFICAR ACCESO",
            font=('Arial', 10, 'bold'),
            bg='#3498db',
            fg='white',
            command=self.verify_access,
            padx=20,
            pady=5,
            state='disabled'
        )
        self.verify_btn.pack(side='left', padx=5)
        
        # Frame para video
        video_frame = tk.Frame(parent, bg='black', relief='sunken', bd=3)
        video_frame.pack(pady=20, padx=20, fill='both', expand=True)
        
        # Label para mostrar video
        self.video_label = tk.Label(
            video_frame,
            text="📷\n\nCámara Desconectada\n\nPresiona 'INICIAR CÁMARA' para comenzar",
            font=('Arial', 16),
            fg='white',
            bg='black'
        )
        self.video_label.pack(fill='both', expand=True)
        
        # Estado de procesamiento
        self.status_label = tk.Label(
            parent,
            text="🔴 Sistema Inactivo",
            font=('Arial', 12, 'bold'),
            fg='#e74c3c',
            bg='#34495e'
        )
        self.status_label.pack(pady=10)
        
    def setup_access_log_panel(self, parent):
        """Configurar panel de log de accesos"""
        
        # Título del panel
        log_title = tk.Label(
            parent,
            text="📋 REGISTRO DE ACCESOS",
            font=('Arial', 14, 'bold'),
            fg='white',
            bg='#34495e'
        )
        log_title.pack(pady=(20, 10))
        
        # Frame para la lista de accesos
        log_frame = tk.Frame(parent, bg='#34495e')
        log_frame.pack(fill='both', expand=True, padx=20)
        
        # Scrollbar para la lista
        scrollbar = tk.Scrollbar(log_frame)
        scrollbar.pack(side='right', fill='y')
        
        # Listbox para mostrar accesos
        self.access_listbox = tk.Listbox(
            log_frame,
            yscrollcommand=scrollbar.set,
            font=('Courier', 9),
            bg='#2c3e50',
            fg='white',
            selectbackground='#3498db',
            height=15
        )
        self.access_listbox.pack(side='left', fill='both', expand=True)
        scrollbar.config(command=self.access_listbox.yview)
        
        # Separador
        separator = tk.Frame(parent, height=2, bg='#7f8c8d')
        separator.pack(fill='x', padx=20, pady=20)
        
        # Estado del sistema
        status_title = tk.Label(
            parent,
            text="⚙️ ESTADO DEL SISTEMA",
            font=('Arial', 12, 'bold'),
            fg='white',
            bg='#34495e'
        )
        status_title.pack(pady=(0, 10))
        
        status_frame = tk.Frame(parent, bg='#34495e')
        status_frame.pack(fill='x', padx=20)
        
        # Indicadores de estado
        self.camera_status = tk.Label(
            status_frame,
            text="📷 Cámara: DESCONECTADA",
            font=('Arial', 10),
            fg='#e74c3c',
            bg='#34495e',
            anchor='w'
        )
        self.camera_status.pack(fill='x', pady=2)
        
        self.api_status = tk.Label(
            status_frame,
            text="🤖 Servicio IA: VERIFICANDO...",
            font=('Arial', 10),
            fg='#f39c12',
            bg='#34495e',
            anchor='w'
        )
        self.api_status.pack(fill='x', pady=2)
        
        self.db_status = tk.Label(
            status_frame,
            text="💾 Base de Datos: VERIFICANDO...",
            font=('Arial', 10),
            fg='#f39c12',
            bg='#34495e',
            anchor='w'
        )
        self.db_status.pack(fill='x', pady=2)
        
        # Verificar estado inicial de servicios
        self.check_services_status()
        
    def on_point_changed(self, event):
        """Manejar cambio de punto de control"""
        point_text = self.point_var.get()
        self.selected_point = int(point_text.split(' - ')[0])
        logging.info(f"Punto de control cambiado a: {self.selected_point}")
        
    def check_services_status(self):
        """Verificar estado de servicios en hilo separado"""
        def check():
            # Verificar API de IA
            try:
                response = requests.get(f"{self.api_base_url}/health", timeout=5)
                if response.status_code == 200:
                    self.api_status.config(text="🤖 Servicio IA: CONECTADO", fg='#27ae60')
                else:
                    self.api_status.config(text="🤖 Servicio IA: ERROR", fg='#e74c3c')
            except:
                self.api_status.config(text="🤖 Servicio IA: DESCONECTADO", fg='#e74c3c')
            
            # Verificar Base de Datos (a través de la API web)
            try:
                response = requests.get("http://localhost:3000/api/health", timeout=5)
                if response.status_code == 200:
                    self.db_status.config(text="💾 Base de Datos: CONECTADA", fg='#27ae60')
                else:
                    self.db_status.config(text="💾 Base de Datos: ERROR", fg='#e74c3c')
            except:
                self.db_status.config(text="💾 Base de Datos: DESCONECTADA", fg='#e74c3c')
        
        threading.Thread(target=check, daemon=True).start()
        
    def start_camera(self):
        """Iniciar cámara - con soporte para cámaras IP"""
        try:
            camera_source = None
            camera_type = "USB"
            
            # Intentar obtener configuración de cámara del punto seleccionado
            try:
                logger.info(f"🔍 Obteniendo configuración de cámara para punto {self.selected_point}...")
                response = requests.get(
                    f"http://localhost:3000/api/puntos-control/{self.selected_point}/camera",
                    timeout=2
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('data'):
                        config = data['data']
                        camera_url = config.get('cameraUrl')
                        stream_type = config.get('streamType', 'USB')
                        
                        if camera_url:
                            camera_source = camera_url
                            camera_type = stream_type
                            logger.info(f"✅ Configuración encontrada: {stream_type} - {camera_url}")
                        else:
                            logger.info("ℹ️ No hay URL configurada, usando cámara USB por defecto")
                    else:
                        logger.info("ℹ️ Sin configuración de cámara, usando USB por defecto")
                else:
                    logger.warning(f"⚠️ Error obteniendo config (HTTP {response.status_code}), usando USB")
                    
            except Exception as e:
                logger.warning(f"⚠️ No se pudo obtener config de cámara: {e}. Usando USB por defecto")
            
            # Si no hay configuración, usar USB como siempre
            if camera_source is None:
                camera_source = 0
                camera_type = "USB"
                logger.info("📹 Usando cámara USB local (índice 0)")
            
            # Intentar abrir la cámara
            logger.info(f"📹 Conectando a cámara {camera_type}: {camera_source}")
            
            # Para cámaras IP, el índice debe ser string; para USB, entero
            if isinstance(camera_source, str) and not camera_source.isdigit():
                # Es una URL (RTSP, HTTP, etc.)
                self.camera = cv2.VideoCapture(camera_source)
            else:
                # Es un índice USB (0, 1, 2, etc.)
                self.camera = cv2.VideoCapture(int(camera_source))
            
            # Verificar que se pudo abrir
            if not self.camera.isOpened():
                logger.error(f"❌ No se pudo abrir cámara {camera_type}")
                
                # Si falló cámara IP, intentar fallback a USB
                if camera_type != "USB":
                    logger.info("🔄 Intentando fallback a cámara USB...")
                    self.camera = cv2.VideoCapture(0)
                    if not self.camera.isOpened():
                        messagebox.showerror("Error", "No se pudo acceder a ninguna cámara")
                        return
                    camera_type = "USB (Fallback)"
                else:
                    messagebox.showerror("Error", "No se pudo acceder a la cámara")
                    return
            
            logger.info(f"✅ Cámara {camera_type} conectada exitosamente")
            
            # Configurar resolución (solo para cámaras USB)
            if camera_type in ["USB", "USB (Fallback)"]:
                self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
                self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
                self.camera.set(cv2.CAP_PROP_FPS, 30)
            
            # Verificar resolución real obtenida
            actual_width = int(self.camera.get(cv2.CAP_PROP_FRAME_WIDTH))
            actual_height = int(self.camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
            logger.info(f"🎥 Resolución real de cámara: {actual_width}x{actual_height}")
            
            self.is_camera_active = True
            
            # Actualizar UI
            self.start_btn.config(state='disabled')
            self.stop_btn.config(state='normal')
            self.verify_btn.config(state='normal')
            self.status_label.config(text=f"🟢 Sistema Activo - Cámara {camera_type}", fg='#27ae60')
            self.camera_status.config(text=f"📷 Cámara: {camera_type} CONECTADA", fg='#27ae60')
            
            # Iniciar hilo de video
            self.video_thread = threading.Thread(target=self.update_video, daemon=True)
            self.video_thread.start()
            
            logging.info(f"Cámara {camera_type} iniciada correctamente")
            
        except Exception as e:
            messagebox.showerror("Error", f"Error al iniciar cámara: {str(e)}")
            logging.error(f"Error al iniciar cámara: {e}")
            
    def stop_camera(self):
        """Detener cámara"""
        self.is_camera_active = False
        
        if self.camera:
            self.camera.release()
            self.camera = None
        
        # Actualizar UI
        self.start_btn.config(state='normal')
        self.stop_btn.config(state='disabled')
        self.verify_btn.config(state='disabled')
        self.status_label.config(text="🔴 Sistema Inactivo", fg='#e74c3c')
        self.camera_status.config(text="📷 Cámara: DESCONECTADA", fg='#e74c3c')
        
        # Limpiar video
        self.video_label.config(
            image='',
            text="📷\n\nCámara Desconectada\n\nPresiona 'INICIAR CÁMARA' para comenzar"
        )
        
        logging.info("Cámara detenida")
        
    def update_video(self):
        """Actualizar video en tiempo real con detección facial"""
        while self.is_camera_active and self.camera:
            try:
                ret, frame = self.camera.read()
                if not ret:
                    break
                
                # Usar el frame original sin filtros para mejor calidad
                # Solo redimensionar para display manteniendo proporción
                height, width = frame.shape[:2]
                display_width = 800  # Aumentar tamaño de display
                display_height = int(height * display_width / width)
                display_frame = cv2.resize(frame, (display_width, display_height), interpolation=cv2.INTER_LANCZOS4)
                
                # Detectar rostros usando OpenCV con parámetros mejorados
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                gray = cv2.cvtColor(display_frame, cv2.COLOR_BGR2GRAY)
                
                # Mejorar la detección con parámetros balanceados para capturar rostros reales
                # Estos parámetros son un balance entre detectar rostros completos y evitar falsos positivos
                faces = face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,         # Menos sensible para evitar falsos positivos
                    minNeighbors=6,          # Muy estricto para filtrar falsos positivos
                    minSize=(80, 80),        # Tamaño mínimo más grande
                    maxSize=(280, 280),      # Tamaño máximo más conservador
                    flags=cv2.CASCADE_SCALE_IMAGE | cv2.CASCADE_DO_CANNY_PRUNING
                )
                
                # Filtro inteligente mejorado para eliminar falsos positivos y duplicados
                if len(faces) > 0:
                    # Ordenar rostros por tamaño (más grandes primero)
                    faces = sorted(faces, key=lambda face: face[2] * face[3], reverse=True)
                    
                    # Filtrar rostros superpuestos y muy pequeños
                    filtered_faces = []
                    for (x, y, w, h) in faces:
                        # Filtrar rostros muy pequeños (probablemente falsos positivos)
                        if w * h < 6000:  # Área mínima MUY estricta para ser considerado rostro real
                            continue
                        
                        # Filtrar rostros con proporciones extrañas (no son rostros reales)
                        aspect_ratio = w / h
                        if aspect_ratio < 0.7 or aspect_ratio > 1.4:  # Rostros deben ser aproximadamente cuadrados
                            continue
                        
                        # Analizar calidad del rostro (variación de intensidad)
                        face_region = gray[y:y+h, x:x+w]
                        if face_region.size > 0:
                            face_std = np.std(face_region)
                            if face_std < 15:  # Muy poca variación = probablemente textura plana
                                continue
                            
                        is_duplicate = False
                        for (fx, fy, fw, fh) in filtered_faces:
                            # Calcular distancia entre centros
                            center1 = (x + w//2, y + h//2)
                            center2 = (fx + fw//2, fy + fh//2)
                            distance = ((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)**0.5
                            
                            # Si están muy cerca, es el mismo rostro
                            min_size = min(w, h, fw, fh)
                            if distance < min_size * 1.2:  # Más estricto para evitar duplicados
                                is_duplicate = True
                                break
                        
                        if not is_duplicate:
                            filtered_faces.append((x, y, w, h))
                    
                    # Limitar a máximo 2 rostros y aplicar filtro de confianza adicional
                    if len(filtered_faces) > 1:
                        # Si hay múltiples detecciones, solo mantener las más grandes y separadas
                        final_faces = []
                        for face in filtered_faces[:2]:  # Solo los 2 más grandes
                            x, y, w, h = face
                            # Verificar que esté suficientemente separado de otros rostros
                            is_well_separated = True
                            for other_face in final_faces:
                                ox, oy, ow, oh = other_face
                                distance = ((x + w//2 - ox - ow//2)**2 + (y + h//2 - oy - oh//2)**2)**0.5
                                if distance < max(w, h, ow, oh) * 1.5:  # Deben estar bien separados
                                    is_well_separated = False
                                    break
                            if is_well_separated:
                                final_faces.append(face)
                        faces = final_faces
                    else:
                        faces = filtered_faces
                
                # Dibujar cuadros verdes alrededor de los rostros detectados (únicos)
                for i, (x, y, w, h) in enumerate(faces):
                    # Expandir ligeramente el área de detección para capturar mejor el rostro completo
                    padding = int(min(w, h) * 0.1)  # 10% de padding
                    x_expanded = max(0, x - padding)
                    y_expanded = max(0, y - padding)
                    w_expanded = min(display_frame.shape[1] - x_expanded, w + 2*padding)
                    h_expanded = min(display_frame.shape[0] - y_expanded, h + 2*padding)
                    
                    # Cuadro verde brillante con área expandida
                    cv2.rectangle(display_frame, (x_expanded, y_expanded), 
                                (x_expanded + w_expanded, y_expanded + h_expanded), (0, 255, 0), 3)
                    
                    # Esquinas del cuadro para mejor visualización (usando coordenadas expandidas)
                    corner_length = 25
                    cv2.line(display_frame, (x_expanded, y_expanded), (x_expanded + corner_length, y_expanded), (0, 255, 0), 4)
                    cv2.line(display_frame, (x_expanded, y_expanded), (x_expanded, y_expanded + corner_length), (0, 255, 0), 4)
                    cv2.line(display_frame, (x_expanded + w_expanded, y_expanded), (x_expanded + w_expanded - corner_length, y_expanded), (0, 255, 0), 4)
                    cv2.line(display_frame, (x_expanded + w_expanded, y_expanded), (x_expanded + w_expanded, y_expanded + corner_length), (0, 255, 0), 4)
                    cv2.line(display_frame, (x_expanded, y_expanded + h_expanded), (x_expanded + corner_length, y_expanded + h_expanded), (0, 255, 0), 4)
                    cv2.line(display_frame, (x_expanded, y_expanded + h_expanded), (x_expanded, y_expanded + h_expanded - corner_length), (0, 255, 0), 4)
                    cv2.line(display_frame, (x_expanded + w_expanded, y_expanded + h_expanded), (x_expanded + w_expanded - corner_length, y_expanded + h_expanded), (0, 255, 0), 4)
                    cv2.line(display_frame, (x_expanded + w_expanded, y_expanded + h_expanded), (x_expanded + w_expanded, y_expanded + h_expanded - corner_length), (0, 255, 0), 4)
                    
                    # Texto con fondo para mejor legibilidad (usando coordenadas expandidas)
                    if len(faces) == 1:
                        text = 'ROSTRO DETECTADO'
                    else:
                        text = f'PERSONA {i+1}'
                    text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
                    text_y = max(35, y_expanded)  # Asegurar que el texto no se salga de la imagen
                    cv2.rectangle(display_frame, (x_expanded, text_y-35), (x_expanded + text_size[0] + 10, text_y-5), (0, 255, 0), -1)
                    cv2.putText(display_frame, text, (x_expanded+5, text_y-15), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
                
                # Mostrar contador de rostros en la esquina superior izquierda
                if len(faces) > 0:
                    if len(faces) == 1:
                        counter_text = f'ROSTROS DETECTADOS: {len(faces)}'
                    else:
                        counter_text = f'PERSONAS DETECTADAS: {len(faces)}'
                    cv2.rectangle(display_frame, (10, 10), (320, 50), (0, 255, 0), -1)
                    cv2.putText(display_frame, counter_text, (15, 35), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
                
                # Convertir de BGR a RGB
                rgb_frame = cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB)
                
                # Convertir a PIL Image
                pil_image = Image.fromarray(rgb_frame)
                photo = ImageTk.PhotoImage(pil_image)
                
                # Actualizar label de video
                self.video_label.config(image=photo, text='')
                self.video_label.image = photo
                
                # Guardar frame actual para procesamiento (sin los cuadros dibujados)
                self.current_frame = frame
                
                time.sleep(0.033)  # ~30 FPS
                
            except Exception as e:
                logging.error(f"Error en actualización de video: {e}")
                break
                
    def verify_access(self):
        """Verificar acceso facial"""
        if self.current_frame is None or self.is_processing:
            logging.warning("[WARN] VERIFICACIÓN BLOQUEADA - Sin frame o ya procesando")
            return
            
        # Generar ID único para esta verificación
        verification_id = datetime.now().strftime("%H%M%S%f")[:-3]
        logging.info(f"[ID] INICIANDO VERIFICACIÓN ID: {verification_id}")
        
        self.is_processing = True
        self.verify_btn.config(state='disabled', text="🔄 PROCESANDO...")
        
        def process():
            try:
                # Codificar imagen
                _, buffer = cv2.imencode('.jpg', self.current_frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
                image_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Enviar a API de reconocimiento
                timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
                logging.info(f"[SEND] [{timestamp}] ENVIANDO IMAGEN A API - ID: {verification_id}")
                response = requests.post(
                    f"{self.api_base_url}/recognize-face",
                    json={
                        "image_base64": image_base64,
                        "punto_control_id": self.selected_point
                    },
                    timeout=10
                )
                
                logging.info(f"[RESP] RESPUESTA API: Status {response.status_code} - ID: {verification_id}")
                
                if response.status_code == 200:
                    result = response.json()
                    logging.info(f"[DATA] RESULTADO API COMPLETO - ID: {verification_id}: {result}")
                    
                    # VALIDACIÓN ESTRICTA DE LA RESPUESTA
                    decision = result.get('decision', 'ERROR')
                    confidence = result.get('confidence', 0)
                    success = result.get('success', False)
                    
                    logging.info(f"[DEC] DECISION RECIBIDA - ID: {verification_id}: '{decision}'")
                    logging.info(f"[CONF] CONFIANZA RECIBIDA - ID: {verification_id}: {confidence}")
                    logging.info(f"[SUCC] SUCCESS RECIBIDO - ID: {verification_id}: {success}")
                    logging.info(f"[USER] USER_ID RECIBIDO - ID: {verification_id}: {result.get('user_id', 'NO_USER_ID')}")
                    
                    # VALIDACIÓN: Solo procesar si la respuesta es válida
                    if decision in ['PERMITIDO', 'DENEGADO']:
                        logging.info(f"[OK] RESPUESTA VÁLIDA - Procesando resultado")
                        self.process_recognition_result(result, verification_id)
                    else:
                        logging.error(f"[ERROR] RESPUESTA INVÁLIDA - Decision: '{decision}' no reconocida")
                        self.add_access_log("ERROR", "Respuesta inválida del servidor", 0, False)
                else:
                    logging.error(f"[ERROR] ERROR API: Status {response.status_code}, Response: {response.text}")
                    self.add_access_log("ERROR", "Error en servicio de reconocimiento", 0, False)
                    
            except Exception as e:
                logging.error(f"Error en verificación de acceso: {e}")
                self.add_access_log("ERROR", f"Error: {str(e)}", 0, False)
            finally:
                self.is_processing = False
                self.verify_btn.config(state='normal', text="🔍 VERIFICAR ACCESO")
                
        threading.Thread(target=process, daemon=True).start()
        
    def process_recognition_result(self, result, verification_id="UNKNOWN"):
        """Procesar resultado de reconocimiento"""
        decision = result.get('decision', 'ERROR')
        confidence = result.get('confidence', 0)
        user_id = result.get('user_id')
        message = result.get('message', 'Sin mensaje')
        liveness_ok = result.get('liveness_ok', False)
        processing_time = result.get('processing_time_ms', 0)
        success = result.get('success', False)
        
        logging.info(f"[PROC] PROCESANDO RESULTADO - ID: {verification_id}:")
        logging.info(f"   Decisión: {decision}")
        logging.info(f"   Confianza: {confidence}")
        logging.info(f"   Usuario ID: {user_id}")
        logging.info(f"   Liveness: {liveness_ok}")
        logging.info(f"   Success: {success}")
        logging.info(f"   Mensaje: {message}")
        
        # VALIDACIÓN CRÍTICA: Verificar coherencia de la respuesta
        if decision == "PERMITIDO" and (not success or confidence < 0.5):
            logging.error(f"[WARN] INCOHERENCIA DETECTADA - Decision PERMITIDO pero success={success}, confidence={confidence}")
            logging.error(f"[FIX] CORRIGIENDO A DENEGADO por seguridad")
            decision = "DENEGADO"
            message = "Acceso corregido por incoherencia en respuesta"
        
        if decision == "DENEGADO" and confidence == 0 and not user_id:
            logging.info(f"[OK] COHERENCIA CONFIRMADA - Sin rostro detectado, DENEGADO correcto")
        
        # Agregar al log
        user_name = f"Usuario {user_id}" if user_id else "Desconocido"
        self.add_access_log(decision, user_name, confidence, liveness_ok, processing_time, message)
        
        # Mostrar resultado visual
        self.show_access_result(decision, user_name, confidence, message, verification_id)
        
        # Registrar en base de datos
        self.register_access_in_db(result)
        
    def add_access_log(self, decision, user_name, confidence, liveness_ok, processing_time=0, message=""):
        """Agregar entrada al log de accesos"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        # Formatear entrada
        status_icon = "✅" if decision == "PERMITIDO" else "❌" if decision == "DENEGADO" else "⚠️"
        confidence_pct = int(confidence * 100) if isinstance(confidence, float) else confidence
        liveness_icon = "👤" if liveness_ok else "🚫"
        
        log_entry = f"{timestamp} {status_icon} {user_name}"
        log_entry += f"\n    Confianza: {confidence_pct}% {liveness_icon}"
        log_entry += f"\n    {message[:40]}..."
        log_entry += f"\n    Tiempo: {processing_time}ms"
        log_entry += "\n" + "-"*40
        
        # Agregar a listbox
        self.access_listbox.insert(0, log_entry)
        
        # Mantener solo últimas 20 entradas
        if self.access_listbox.size() > 20:
            self.access_listbox.delete(20, tk.END)
            
        # Scroll automático al inicio
        self.access_listbox.selection_clear(0, tk.END)
        self.access_listbox.selection_set(0)
        self.access_listbox.see(0)
        
    def show_access_result(self, decision, user_name, confidence, message, verification_id="UNKNOWN"):
        """Mostrar resultado visual del acceso"""
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        logging.info(f"[SHOW] [{timestamp}] MOSTRANDO RESULTADO VISUAL - ID: {verification_id}:")
        logging.info(f"   Decision recibida: '{decision}'")
        logging.info(f"   User name: '{user_name}'")
        logging.info(f"   Confidence: {confidence}")
        logging.info(f"   Message: '{message}'")
        
        if decision == "PERMITIDO":
            title = "✅ ACCESO PERMITIDO"
            bg_color = "#27ae60"
            logging.info(f"   [ALLOW] MOSTRANDO: ACCESO PERMITIDO")
        elif decision == "DENEGADO":
            title = "❌ ACCESO DENEGADO"
            bg_color = "#e74c3c"
            logging.info(f"   [DENY] MOSTRANDO: ACCESO DENEGADO")
        else:
            title = "⚠️ ERROR EN VERIFICACIÓN"
            bg_color = "#f39c12"
            logging.info(f"   [ERROR] MOSTRANDO: ERROR")
            
        # Crear ventana de resultado
        result_window = tk.Toplevel(self.root)
        result_window.title("Resultado de Verificación")
        result_window.geometry("400x300")
        result_window.configure(bg=bg_color)
        result_window.transient(self.root)
        result_window.grab_set()
        
        # Centrar ventana
        result_window.geometry("+%d+%d" % (
            self.root.winfo_rootx() + 400,
            self.root.winfo_rooty() + 200
        ))
        
        # Contenido
        tk.Label(
            result_window,
            text=title,
            font=('Arial', 18, 'bold'),
            fg='white',
            bg=bg_color
        ).pack(pady=20)
        
        tk.Label(
            result_window,
            text=user_name,
            font=('Arial', 14),
            fg='white',
            bg=bg_color
        ).pack(pady=10)
        
        confidence_pct = int(confidence * 100) if isinstance(confidence, float) else confidence
        tk.Label(
            result_window,
            text=f"Confianza: {confidence_pct}%",
            font=('Arial', 12),
            fg='white',
            bg=bg_color
        ).pack(pady=5)
        
        tk.Label(
            result_window,
            text=message,
            font=('Arial', 10),
            fg='white',
            bg=bg_color,
            wraplength=350
        ).pack(pady=10)
        
        # Botón cerrar
        tk.Button(
            result_window,
            text="CERRAR",
            font=('Arial', 12, 'bold'),
            command=result_window.destroy,
            padx=30,
            pady=10
        ).pack(pady=20)
        
        # Auto-cerrar después de 5 segundos
        result_window.after(5000, result_window.destroy)
        
    def register_access_in_db(self, result):
        """Registrar acceso en base de datos"""
        try:
            # Solo registrar accesos de usuarios reconocidos por ahora
            if not result.get('user_id') or result.get('user_id') == 'unknown':
                logging.info("Acceso no registrado: usuario no reconocido")
                return
                
            # Mapear decisiones a IDs de base de datos
            decision_map = {
                'PERMITIDO': 1,
                'DENEGADO': 2,
                'ERROR': 3
            }
            decision_id = decision_map.get(result.get('decision', 'ERROR'), 3)
            
            data = {
                "usuarioId": int(result.get('user_id')),  # Asegurar que sea entero
                "puntoId": int(self.selected_point),
                "score": float(result.get('confidence', 0.0)),
                "decisionId": decision_id,
                "livenessOk": bool(result.get('liveness_ok', False))
            }
            
            # Enviar a API web para registro en BD
            response = requests.post(
                "http://localhost:3000/api/accesos", 
                json=data, 
                timeout=10,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                logging.info(f"[OK] Acceso registrado exitosamente: Usuario {data['usuarioId']}")
            else:
                logging.error(f"[ERROR] Error registrando acceso: {response.status_code} - {response.text}")
            
        except Exception as e:
            logging.error(f"Error registrando acceso en BD: {e}")
            
    def on_closing(self):
        """Manejar cierre de aplicación"""
        self.running = False
        self.stop_camera()
        self.root.destroy()

def main():
    """Función principal"""
    root = tk.Tk()
    app = AccessControlApp(root)
    
    try:
        root.mainloop()
    except KeyboardInterrupt:
        app.on_closing()

if __name__ == "__main__":
    main()
