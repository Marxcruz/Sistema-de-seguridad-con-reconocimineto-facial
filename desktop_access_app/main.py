#!/usr/bin/env python3
"""
Sistema de Seguridad con Reconocimiento Facial - VERSIÓN MEJORADA
Aplicación de Escritorio para Control de Acceso en Tiempo Real

Mejoras visuales:
- Diseño moderno y profesional
- Mejor distribución de elementos
- Colores más atractivos
- Iconos mejorados
- Animaciones suaves
- Interfaz más intuitiva
- Toda la funcionalidad preservada
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

logger = logging.getLogger(__name__)

# Paleta de colores moderna
COLORS = {
    'bg_primary': '#0f172a',      # Azul muy oscuro
    'bg_secondary': '#1e293b',    # Azul oscuro
    'bg_tertiary': '#334155',     # Azul gris
    'accent_blue': '#0ea5e9',     # Azul brillante
    'accent_green': '#10b981',    # Verde
    'accent_red': '#ef4444',      # Rojo
    'accent_yellow': '#f59e0b',   # Amarillo
    'text_primary': '#f1f5f9',    # Blanco suave
    'text_secondary': '#cbd5e1',  # Gris claro
    'border': '#475569',          # Gris oscuro
}

class AccessControlAppMejorada:
    def __init__(self, root):
        self.root = root
        self.root.title("🔐 Control de Acceso - Reconocimiento Facial")
        self.root.geometry("1600x950")
        self.root.configure(bg=COLORS['bg_primary'])
        
        # Centrar la ventana
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
        self.selected_point = 1
        self.access_attempts = []
        self.available_points = []
        
        # API Configuration
        self.api_base_url = "http://localhost:8000"
        
        # Configurar interfaz
        self.setup_ui()
        
        # Cargar puntos de control
        self.load_available_points()
        
        # Variables de control
        self.video_thread = None
        self.running = True
        
        # Configurar cierre
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def load_available_points(self):
        """Cargar puntos de control disponibles"""
        try:
            response = requests.get("http://localhost:3000/api/puntos-control", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    self.available_points = data['data']
                    if self.available_points:
                        self.selected_point = self.available_points[0]['id']
                        self.update_point_combo()
                        logging.info(f"✅ Puntos cargados: {len(self.available_points)}")
        except Exception as e:
            logging.error(f"Error cargando puntos: {e}")
            self.available_points = [
                {"id": 1, "nombre": "Entrada Principal"},
                {"id": 2, "nombre": "Acceso Oficinas"},
                {"id": 3, "nombre": "Sala Servidores"}
            ]
            self.selected_point = 1
    
    def update_point_combo(self):
        """Actualizar combo de puntos"""
        if hasattr(self, 'point_combo'):
            values = [f"{p['id']} - {p['nombre']}" for p in self.available_points]
            self.point_combo['values'] = values
            if values:
                self.point_combo.current(0)
    
    def setup_ui(self):
        """Configurar interfaz mejorada"""
        
        # Header con gradiente visual
        header = tk.Frame(self.root, bg=COLORS['bg_secondary'], height=70)
        header.pack(fill='x', padx=0, pady=0)
        header.pack_propagate(False)
        
        # Título principal
        title = tk.Label(
            header,
            text="🔐 SISTEMA DE CONTROL DE ACCESO",
            font=('Segoe UI', 24, 'bold'),
            fg=COLORS['accent_blue'],
            bg=COLORS['bg_secondary']
        )
        title.pack(side='left', padx=30, pady=15)
        
        # Subtítulo
        subtitle = tk.Label(
            header,
            text="Reconocimiento Facial en Tiempo Real",
            font=('Segoe UI', 11),
            fg=COLORS['text_secondary'],
            bg=COLORS['bg_secondary']
        )
        subtitle.pack(side='left', padx=30, pady=15)
        
        # Separador
        separator = tk.Frame(self.root, bg=COLORS['accent_blue'], height=2)
        separator.pack(fill='x')
        
        # Contenido principal
        main_container = tk.Frame(self.root, bg=COLORS['bg_primary'])
        main_container.pack(fill='both', expand=True, padx=20, pady=20)
        
        # Panel izquierdo - Cámara (70%)
        left_panel = tk.Frame(main_container, bg=COLORS['bg_secondary'], relief='flat', bd=0)
        left_panel.pack(side='left', fill='both', expand=True, padx=(0, 15))
        
        # Panel derecho - Información (30%)
        right_panel = tk.Frame(main_container, bg=COLORS['bg_secondary'], relief='flat', bd=0, width=400)
        right_panel.pack(side='right', fill='y', expand=False, padx=(15, 0))
        right_panel.pack_propagate(False)
        
        self.setup_camera_panel_mejorado(left_panel)
        self.setup_info_panel_mejorado(right_panel)
    
    def setup_camera_panel_mejorado(self, parent):
        """Panel de cámara mejorado"""
        
        # Título
        title_frame = tk.Frame(parent, bg=COLORS['bg_secondary'])
        title_frame.pack(fill='x', padx=20, pady=(20, 15))
        
        title = tk.Label(
            title_frame,
            text="📹 CÁMARA EN VIVO",
            font=('Segoe UI', 16, 'bold'),
            fg=COLORS['accent_blue'],
            bg=COLORS['bg_secondary']
        )
        title.pack(side='left')
        
        # Controles superiores
        controls_frame = tk.Frame(parent, bg=COLORS['bg_secondary'])
        controls_frame.pack(fill='x', padx=20, pady=(0, 15))
        
        # Selector de punto
        point_label = tk.Label(
            controls_frame,
            text="Punto de Control:",
            font=('Segoe UI', 10),
            fg=COLORS['text_primary'],
            bg=COLORS['bg_secondary']
        )
        point_label.pack(side='left', padx=(0, 10))
        
        self.point_var = tk.StringVar()
        self.point_combo = ttk.Combobox(
            controls_frame,
            textvariable=self.point_var,
            state="readonly",
            width=25,
            font=('Segoe UI', 10)
        )
        self.point_combo.pack(side='left', padx=(0, 20))
        self.point_combo.bind('<<ComboboxSelected>>', self.on_point_changed)
        
        # Estilo del combobox
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TCombobox',
            fieldbackground=COLORS['bg_tertiary'],
            background=COLORS['bg_tertiary'],
            foreground=COLORS['text_primary']
        )
        
        # Botones de control
        button_frame = tk.Frame(controls_frame, bg=COLORS['bg_secondary'])
        button_frame.pack(side='left', fill='x', expand=True)
        
        self.start_btn = tk.Button(
            button_frame,
            text="▶ INICIAR",
            font=('Segoe UI', 11, 'bold'),
            bg=COLORS['accent_green'],
            fg='white',
            command=self.start_camera,
            padx=20,
            pady=8,
            relief='flat',
            cursor='hand2',
            activebackground='#059669'
        )
        self.start_btn.pack(side='left', padx=5)
        
        self.stop_btn = tk.Button(
            button_frame,
            text="⏹ DETENER",
            font=('Segoe UI', 11, 'bold'),
            bg=COLORS['accent_red'],
            fg='white',
            command=self.stop_camera,
            padx=20,
            pady=8,
            relief='flat',
            cursor='hand2',
            state='disabled',
            activebackground='#dc2626'
        )
        self.stop_btn.pack(side='left', padx=5)
        
        self.verify_btn = tk.Button(
            button_frame,
            text="✓ VERIFICAR",
            font=('Segoe UI', 11, 'bold'),
            bg=COLORS['accent_blue'],
            fg='white',
            command=self.verify_access,
            padx=20,
            pady=8,
            relief='flat',
            cursor='hand2',
            state='disabled',
            activebackground='#0284c7'
        )
        self.verify_btn.pack(side='left', padx=5)
        
        # Frame de video
        video_frame = tk.Frame(parent, bg='black', relief='flat', bd=0)
        video_frame.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        
        self.video_label = tk.Label(
            video_frame,
            text="📷\n\nCámara Desconectada\n\nPresiona 'INICIAR' para comenzar",
            font=('Segoe UI', 14),
            fg=COLORS['text_secondary'],
            bg='black'
        )
        self.video_label.pack(fill='both', expand=True)
        
        # Estado
        status_frame = tk.Frame(parent, bg=COLORS['bg_secondary'])
        status_frame.pack(fill='x', padx=20, pady=(0, 20))
        
        self.status_label = tk.Label(
            status_frame,
            text="🔴 Sistema Inactivo",
            font=('Segoe UI', 11, 'bold'),
            fg=COLORS['accent_red'],
            bg=COLORS['bg_secondary']
        )
        self.status_label.pack(side='left')
    
    def setup_info_panel_mejorado(self, parent):
        """Panel de información mejorado"""
        
        # Registro de accesos
        log_title = tk.Label(
            parent,
            text="📋 REGISTRO DE ACCESOS",
            font=('Segoe UI', 14, 'bold'),
            fg=COLORS['accent_blue'],
            bg=COLORS['bg_secondary']
        )
        log_title.pack(fill='x', padx=20, pady=(20, 10))
        
        # Listbox con scrollbar
        log_frame = tk.Frame(parent, bg=COLORS['bg_secondary'])
        log_frame.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        
        scrollbar = tk.Scrollbar(log_frame)
        scrollbar.pack(side='right', fill='y')
        
        self.access_listbox = tk.Listbox(
            log_frame,
            yscrollcommand=scrollbar.set,
            font=('Courier', 8),
            bg=COLORS['bg_tertiary'],
            fg=COLORS['text_primary'],
            selectbackground=COLORS['accent_blue'],
            relief='flat',
            bd=0
        )
        self.access_listbox.pack(side='left', fill='both', expand=True)
        scrollbar.config(command=self.access_listbox.yview)
        
        # Separador
        sep = tk.Frame(parent, bg=COLORS['border'], height=1)
        sep.pack(fill='x', padx=20, pady=15)
        
        # Estado del sistema
        status_title = tk.Label(
            parent,
            text="⚙️ ESTADO DEL SISTEMA",
            font=('Segoe UI', 12, 'bold'),
            fg=COLORS['accent_blue'],
            bg=COLORS['bg_secondary']
        )
        status_title.pack(fill='x', padx=20, pady=(0, 10))
        
        status_frame = tk.Frame(parent, bg=COLORS['bg_secondary'])
        status_frame.pack(fill='x', padx=20, pady=(0, 20))
        
        # Indicadores
        self.camera_status = tk.Label(
            status_frame,
            text="📷 Cámara: DESCONECTADA",
            font=('Segoe UI', 9),
            fg=COLORS['accent_red'],
            bg=COLORS['bg_secondary'],
            anchor='w',
            justify='left'
        )
        self.camera_status.pack(fill='x', pady=4)
        
        self.api_status = tk.Label(
            status_frame,
            text="🤖 API: VERIFICANDO...",
            font=('Segoe UI', 9),
            fg=COLORS['accent_yellow'],
            bg=COLORS['bg_secondary'],
            anchor='w',
            justify='left'
        )
        self.api_status.pack(fill='x', pady=4)
        
        self.db_status = tk.Label(
            status_frame,
            text="💾 Base de Datos: VERIFICANDO...",
            font=('Segoe UI', 9),
            fg=COLORS['accent_yellow'],
            bg=COLORS['bg_secondary'],
            anchor='w',
            justify='left'
        )
        self.db_status.pack(fill='x', pady=4)
        
        # Verificar servicios
        self.check_services_status()
    
    def on_point_changed(self, event):
        """Manejar cambio de punto"""
        point_text = self.point_var.get()
        try:
            self.selected_point = int(point_text.split(' - ')[0])
            logging.info(f"Punto cambiado a: {self.selected_point}")
        except:
            pass
    
    def check_services_status(self):
        """Verificar estado de servicios"""
        def check():
            try:
                response = requests.get(f"{self.api_base_url}/health", timeout=5)
                if response.status_code == 200:
                    self.api_status.config(text="🤖 API: CONECTADA", fg=COLORS['accent_green'])
                else:
                    self.api_status.config(text="🤖 API: ERROR", fg=COLORS['accent_red'])
            except:
                self.api_status.config(text="🤖 API: DESCONECTADA", fg=COLORS['accent_red'])
            
            try:
                response = requests.get("http://localhost:3000/api/health", timeout=5)
                if response.status_code == 200:
                    self.db_status.config(text="💾 Base de Datos: CONECTADA", fg=COLORS['accent_green'])
                else:
                    self.db_status.config(text="💾 Base de Datos: ERROR", fg=COLORS['accent_red'])
            except:
                self.db_status.config(text="💾 Base de Datos: DESCONECTADA", fg=COLORS['accent_red'])
        
        threading.Thread(target=check, daemon=True).start()
    
    def start_camera(self):
        """Iniciar cámara"""
        try:
            camera_source = None
            camera_type = "USB"
            
            # Obtener configuración de cámara
            try:
                logger.info(f"🔍 Obteniendo configuración para punto {self.selected_point}...")
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
                            logger.info(f"✅ Configuración: {stream_type} - {camera_url}")
            except Exception as e:
                logger.warning(f"⚠️ No se pudo obtener config: {e}. Usando USB")
            
            if camera_source is None:
                camera_source = 0
                camera_type = "USB"
                logger.info("📹 Usando cámara USB local")
            
            logger.info(f"📹 Conectando a: {camera_type}")
            
            if isinstance(camera_source, str) and not camera_source.isdigit():
                self.camera = cv2.VideoCapture(camera_source)
            else:
                self.camera = cv2.VideoCapture(int(camera_source))
            
            if not self.camera.isOpened():
                logger.error(f"❌ No se pudo abrir cámara {camera_type}")
                
                if camera_type != "USB":
                    logger.info("🔄 Intentando fallback a USB...")
                    self.camera = cv2.VideoCapture(0)
                    if not self.camera.isOpened():
                        messagebox.showerror("Error", "No se pudo acceder a ninguna cámara")
                        return
                    camera_type = "USB (Fallback)"
                else:
                    messagebox.showerror("Error", "No se pudo acceder a la cámara")
                    return
            
            logger.info(f"✅ Cámara {camera_type} conectada")
            
            if camera_type in ["USB", "USB (Fallback)"]:
                self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
                self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
                self.camera.set(cv2.CAP_PROP_FPS, 30)
            
            actual_width = int(self.camera.get(cv2.CAP_PROP_FRAME_WIDTH))
            actual_height = int(self.camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
            logger.info(f"🎥 Resolución: {actual_width}x{actual_height}")
            
            self.is_camera_active = True
            
            self.start_btn.config(state='disabled')
            self.stop_btn.config(state='normal')
            self.verify_btn.config(state='normal')
            self.status_label.config(text=f"🟢 Activo - {camera_type}", fg=COLORS['accent_green'])
            self.camera_status.config(text=f"📷 Cámara: {camera_type} CONECTADA", fg=COLORS['accent_green'])
            
            self.video_thread = threading.Thread(target=self.update_video, daemon=True)
            self.video_thread.start()
            
            logging.info(f"Cámara {camera_type} iniciada correctamente")
            
        except Exception as e:
            messagebox.showerror("Error", f"Error al iniciar cámara: {str(e)}")
            logging.error(f"Error: {e}")
    
    def stop_camera(self):
        """Detener cámara"""
        self.is_camera_active = False
        
        if self.camera:
            self.camera.release()
            self.camera = None
        
        self.start_btn.config(state='normal')
        self.stop_btn.config(state='disabled')
        self.verify_btn.config(state='disabled')
        self.status_label.config(text="🔴 Sistema Inactivo", fg=COLORS['accent_red'])
        self.camera_status.config(text="📷 Cámara: DESCONECTADA", fg=COLORS['accent_red'])
        
        self.video_label.config(
            image='',
            text="📷\n\nCámara Desconectada\n\nPresiona 'INICIAR' para comenzar"
        )
        
        logging.info("Cámara detenida")
    
    def update_video(self):
        """Actualizar video"""
        while self.is_camera_active and self.camera:
            try:
                ret, frame = self.camera.read()
                if not ret:
                    break
                
                height, width = frame.shape[:2]
                display_width = 800
                display_height = int(height * display_width / width)
                display_frame = cv2.resize(frame, (display_width, display_height), interpolation=cv2.INTER_LANCZOS4)
                
                face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                gray = cv2.cvtColor(display_frame, cv2.COLOR_BGR2GRAY)
                
                faces = face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=5,
                    minSize=(30, 30),
                    flags=cv2.CASCADE_SCALE_IMAGE
                )
                
                for (x, y, w, h) in faces:
                    cv2.rectangle(display_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                    cv2.putText(display_frame, "ROSTRO DETECTADO", (x, y-10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                
                if len(faces) > 0:
                    cv2.putText(display_frame, f"ROSTROS DETECTADOS: {len(faces)}", (10, 30),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                image_rgb = cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB)
                image_pil = Image.fromarray(image_rgb)
                image_tk = ImageTk.PhotoImage(image_pil)
                
                self.video_label.config(image=image_tk)
                self.video_label.image = image_tk
                
                self.current_frame = frame
                
                time.sleep(0.03)
                
            except Exception as e:
                logging.error(f"Error actualizando video: {e}")
                break
    
    def verify_access(self):
        """Verificar acceso"""
        if self.current_frame is None:
            messagebox.showwarning("Advertencia", "No hay frame disponible")
            return
        
        try:
            # Codificar imagen con calidad alta
            _, buffer = cv2.imencode('.jpg', self.current_frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
            image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Payload correcto para la API
            payload = {
                "image_base64": image_base64,
                "punto_control_id": self.selected_point
            }
            
            logger.info(f"📤 Enviando solicitud de verificación al punto {self.selected_point}...")
            
            response = requests.post(
                f"{self.api_base_url}/recognize-face",
                json=payload,
                timeout=10
            )
            
            logger.info(f"📥 Respuesta API: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                # Procesar resultado
                decision = result.get('decision', 'ERROR')
                confidence = result.get('confidence', 0)
                user_id = result.get('user_id', 'Desconocido')
                user_name = result.get('user_name', result.get('nombre', 'Desconocido'))
                
                # Si no viene el nombre, intentar obtenerlo de la API
                if user_name == 'Desconocido' and user_id != 'Desconocido':
                    try:
                        user_response = requests.get(
                            f"http://localhost:3000/api/usuarios/{user_id}",
                            timeout=2
                        )
                        if user_response.status_code == 200:
                            user_data = user_response.json()
                            if user_data.get('success') and user_data.get('data'):
                                user_name = user_data['data'].get('nombre', 'Desconocido')
                                logger.info(f"📝 Nombre obtenido: {user_name}")
                    except Exception as e:
                        logger.warning(f"No se pudo obtener nombre del usuario: {e}")
                
                timestamp = datetime.now().strftime("%H:%M:%S")
                
                if decision == 'PERMITIDO':
                    self.access_listbox.insert(0, f"[{timestamp}] ✅ {user_name} - {confidence*100:.1f}%")
                    messagebox.showinfo("✅ Acceso Permitido", f"Usuario: {user_name}\nConfianza: {confidence*100:.1f}%")
                    logger.info(f"✅ Acceso permitido para {user_name}")
                elif decision == 'DENEGADO':
                    self.access_listbox.insert(0, f"[{timestamp}] ❌ Acceso Denegado")
                    messagebox.showwarning("❌ Acceso Denegado", "No autorizado")
                    logger.warning(f"❌ Acceso denegado")
                else:
                    self.access_listbox.insert(0, f"[{timestamp}] ⚠️ Error: {decision}")
                    messagebox.showerror("Error", f"Respuesta inválida: {decision}")
                    logger.error(f"Respuesta inválida: {decision}")
            else:
                logger.error(f"Error API: {response.status_code} - {response.text}")
                messagebox.showerror("Error", f"Error en API: {response.status_code}\n{response.text}")
                
        except Exception as e:
            logger.error(f"Error en verificación: {e}")
            messagebox.showerror("Error", f"Error: {str(e)}")
    
    def on_closing(self):
        """Cerrar aplicación"""
        self.running = False
        self.is_camera_active = False
        
        if self.camera:
            self.camera.release()
        
        self.root.destroy()

def main():
    """Función principal"""
    root = tk.Tk()
    app = AccessControlAppMejorada(root)
    root.mainloop()

if __name__ == "__main__":
    main()
