export interface Notification {
  id: number
  tipo: string
  detalle: string
  creadoEn: string
  puntoNombre?: string
  tipoNombre?: string
  punto:{ubicacion:string}
  evidencia: {tamanoBytes: number, mimeType: string}
  leida: boolean
  prioridad: 'alta' | 'media' | 'baja'
}

export interface NotificationResponse {
  success: boolean
  notifications: Notification[]
  unreadCount: number
  total: number
}

export type NotificationFilter = 'todas' | 'no_leidas'

export type NotificationPriority = 'alta' | 'media' | 'baja'

export interface NotificationStats {
  total: number
  unread: number
  byPriority: {
    alta: number
    media: number
    baja: number
  }
}
