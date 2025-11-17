'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Shield, 
  Settings,
  Home,
  MapPin,
  Video
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Usuarios', href: '/usuarios', icon: Users },
  { name: 'Zonas y Puntos', href: '/zonas', icon: MapPin },
  { name: 'Monitoreo', href: '/monitoreo', icon: Video },
  { name: 'Alertas', href: '/alertas', icon: AlertTriangle },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
      {/* Logo con gradiente */}
      <div className="flex h-16 items-center px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="flex items-center">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-white">
            SecureFace
          </span>
        </div>
      </div>

      {/* Navigation mejorada */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-lg backdrop-blur-sm'
              )}
            >
              <div className={cn(
                'p-2 rounded-lg mr-3 transition-all duration-300',
                isActive 
                  ? 'bg-white/20 shadow-lg' 
                  : 'bg-slate-700/50 group-hover:bg-white/10'
              )}>
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-all duration-300',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  )}
                />
              </div>
              <span className="font-semibold">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer mejorado */}
      <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-700 shadow-inner">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-sm font-semibold text-white mb-1">
            Sistema de Seguridad Facial
          </div>
          <div className="text-xs text-slate-300">
            v1.0.0 • Powered by AI
          </div>
          <div className="mt-2 flex justify-center">
            <div className="w-8 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
