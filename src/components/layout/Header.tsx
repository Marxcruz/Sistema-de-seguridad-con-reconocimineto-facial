'use client'

import { useState, useEffect } from 'react'
import { Bell, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import NotificationPanel from '@/components/notifications/NotificationPanel'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Cargar contador de notificaciones no leídas
  useEffect(() => {
    fetchUnreadCount()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?filter=no_leidas')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error)
    }
  }

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    // Actualizar contador al abrir
    if (!showNotifications) {
      fetchUnreadCount()
    }
  }

  return (
    <header className="bg-gradient-to-r from-white via-slate-50 to-white border-b border-slate-200/60 px-6 py-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Título con gradiente */}
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-1 h-12 rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notifications mejoradas */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative bg-white/80 hover:bg-indigo-50 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
              onClick={handleNotificationClick}
              title="Notificaciones"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>

          {/* User Menu mejorado */}
          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
              </p>
              <p className="text-xs text-slate-500">
                {user ? user.email : 'email@sistema.com'}
              </p>
              <p className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user ? user.rol : 'Administrador'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Logout mejorado */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            title="Cerrar sesión"
            className="bg-white/80 hover:bg-red-50 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
          >
            <LogOut className="h-5 w-5 text-slate-600 group-hover:text-red-500 transition-colors duration-300" />
          </Button>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => {
          setShowNotifications(false)
          fetchUnreadCount() // Actualizar contador al cerrar
        }} 
      />
    </header>
  )
}
