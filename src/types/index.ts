import { Notificacion } from '@prisma/client'

// Tipos base de Prisma
export type {
  Usuario,
  Rol,
  Rostro,
  ImagenEntrenamiento,
  Zona,
  PuntoControl,
  Evidencia,
  Acceso,
  AccesoRostro,
  Alerta,
  ReglaAcceso,
  Notificacion,
  LogAuditoria,
  TipoDecision,
  TipoAlerta,
  TipoPunto,
  TipoEvidencia,
  CanalNotificacion,
  ModeloFacial,
} from '@prisma/client'

// Tipos extendidos con relaciones
export interface UsuarioCompleto {
  id: number
  nombre: string
  apellido?: string
  documento?: string
  email?: string
  telefono?: string
  rolId: number
  activo: boolean
  intentosFallidos: number
  ultimoAcceso?: Date
  creadoEn: Date
  rol: {
    id: number
    nombre: string
  }
  _count?: {
    rostros: number
    accesos: number
    reglasAcceso: number
  }
}

export interface AccesoCompleto {
  id: number
  uuid: string
  usuarioId: number
  puntoId: number
  score?: number
  decisionId: number
  livenessOk?: boolean
  evidenciaId?: number
  creadoEn: Date
  usuario: {
    id: number
    nombre: string
    apellido?: string
    documento?: string
  }
  punto: {
    id: number
    nombre: string
    zona: {
      nombre: string
    }
  }
  decision: {
    nombre: string
  }
  evidencia?: {
    path: string
    mimeType?: string
  }
}

export interface AlertaCompleta {
  id: number
  uuid: string
  tipoId: number
  detalle?: string
  puntoId: number
  evidenciaId: number
  creadoEn: Date
  tipo: {
    nombre: string
  }
  punto?: {
    ubicacion: any
    nombre: string
    zona: {
      nombre: string
    }
  }
  notificaciones: Notificacion[]
  evidencia: {
    id: number
    path: string
    mimeType?: string
    tamanoBytes: number
  }
}

export interface PuntoControlCompleto {
  id: number
  zonaId: number
  nombre: string
  tipoId: number
  activo: boolean
  ubicacion?: string
  creadoEn: Date
  zona: {
    nombre: string
  }
  tipo: {
    nombre: string
  }
  _count?: {
    accesos: number
  }
}

// Tipos para formularios
export interface CrearUsuarioForm {
  nombre: string
  apellido?: string
  documento?: string
  email?: string
  telefono?: string
  rolId: number
}

export interface CrearZonaForm {
  nombre: string
  descripcion?: string
  activo: boolean
}

export interface CrearPuntoControlForm {
  zonaId: number
  nombre: string
  tipoId: number
  ubicacion?: string
  activo: boolean
}

export interface CrearReglaAccesoForm {
  usuarioId?: number
  zonaId?: number
  horaInicio: string
  horaFin: string
  diaSemana?: number
  activo: boolean
}

// Tipos para APIs
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Tipos para reconocimiento facial
export interface FaceDetectionResult {
  detected: boolean
  faces: FaceData[]
  confidence: number
  livenessScore?: number
}

export interface FaceData {
  embedding: number[]
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  landmarks?: FaceLandmark[]
  quality: number
}

export interface FaceLandmark {
  type: string
  x: number
  y: number
}

export interface FaceMatchResult {
  matched: boolean
  userId?: number
  confidence: number
  score: number
  threshold: number
}

// Tipos para notificaciones en tiempo real
export interface NotificacionTiempoReal {
  tipo: 'ACCESO' | 'ALERTA' | 'USUARIO_NUEVO' | 'SISTEMA'
  titulo: string
  mensaje: string
  datos?: any
  timestamp: Date
}

// Tipos para estadísticas del dashboard
export interface EstadisticasDashboard {
  accesosHoy: number
  alertasHoy: number
  usuariosActivos: number
  puntosActivos: number
  accesosPorHora: Array<{
    hora: string
    accesos: number
  }>
  alertasPorTipo: Array<{
    tipo: string
    cantidad: number
  }>
  topUsuarios: Array<{
    usuario: string
    accesos: number
  }>
}

// Tipos para configuración del sistema
export interface ConfiguracionSistema {
  umbralReconocimiento: number
  tiempoMaximoRespuesta: number
  intentosMaximosFallidos: number
  habilitarLiveness: boolean
  habilitarNotificaciones: boolean
  rutaAlmacenamientoEvidencias: string
}

// Enums
export enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  ENVIADA = 'ENVIADA',
  FALLA = 'FALLA',
}

export enum AccionAuditoria {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum DiaSemana {
  DOMINGO = 0,
  LUNES = 1,
  MARTES = 2,
  MIERCOLES = 3,
  JUEVES = 4,
  VIERNES = 5,
  SABADO = 6,
}
