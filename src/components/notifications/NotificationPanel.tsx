'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, AlertTriangle, CheckCircle, XCircle, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Notification {
  id: number
  tipo: string
  detalle: string
  creadoEn: string
  puntoNombre?: string
  leida: boolean
  prioridad: 'alta' | 'media' | 'baja'
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todas' | 'no_leidas'>('no_leidas')
  const [previousCount, setPreviousCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, filter])

  // Auto-actualización cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications()
    }, 10000)
    return () => clearInterval(interval)
  }, [filter])

  // Reproducir sonido cuando hay nuevas notificaciones
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.leida).length
    if (previousCount > 0 && unreadCount > previousCount) {
      playNotificationSound()
    }
    setPreviousCount(unreadCount)
  }, [notifications])

  const playNotificationSound = () => {
    try {
      // Generar beep usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800 // Tono agradable
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Sonido no disponible:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      })
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, leida: true } : n)
        )
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      })
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
      }
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
    }
  }

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'acceso_denegado':
      case 'intento_no_autorizado':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'liveness_fallido':
      case 'suplantacion':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'acceso_exitoso':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = (prioridad: string, leida: boolean) => {
    if (leida) return 'border-l-4 border-gray-300'
    switch (prioridad) {
      case 'alta':
        return 'border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-white'
      case 'media':
        return 'border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-white'
      default:
        return 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  if (!isOpen || !mounted) return null

  const unreadCount = notifications.filter(n => !n.leida).length

  const notificationContent = (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        style={{ zIndex: 99998 }}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className="fixed top-16 right-6 w-96 max-h-[600px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-white/20 overflow-hidden"
        style={{ zIndex: 99999 }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg backdrop-blur-sm">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-white text-lg">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                {unreadCount}
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-3 bg-gray-50 flex space-x-2">
          <Button
            variant={filter === 'no_leidas' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('no_leidas')}
            className={filter === 'no_leidas' 
              ? 'flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md' 
              : 'flex-1 hover:bg-blue-50'}
          >
            No leídas ({unreadCount})
          </Button>
          <Button
            variant={filter === 'todas' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('todas')}
            className={filter === 'todas' 
              ? 'flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md' 
              : 'flex-1 hover:bg-blue-50'}
          >
            Todas ({notifications.length})
          </Button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 font-medium transition-all"
            >
              ✓ Marcar todas como leídas
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Cargando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No hay notificaciones</p>
              <p className="text-sm">Estás al día con todas las alertas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:shadow-inner transition-all duration-200 cursor-pointer ${
                    getPriorityColor(notification.prioridad, notification.leida)
                  } ${!notification.leida ? 'hover:bg-gradient-to-r hover:from-blue-100 hover:to-white' : 'hover:bg-gray-50'}`}
                  onClick={() => !notification.leida && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1 p-2 bg-white rounded-lg shadow-sm">
                      {getIcon(notification.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {notification.tipo.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                        {notification.detalle}
                      </p>
                      {notification.puntoNombre && (
                        <div className="inline-flex items-center mt-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          <span className="mr-1">📍</span>
                          {notification.puntoNombre}
                        </div>
                      )}
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(notification.creadoEn)}
                      </div>
                    </div>
                    {!notification.leida && (
                      <div className="flex-shrink-0">
                        <div className="h-3 w-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-md animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )

  return createPortal(notificationContent, document.body)
}
