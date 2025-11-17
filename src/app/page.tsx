'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'
import { Shield, Users, Camera, AlertTriangle, BarChart3, Settings } from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen security-gradient">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Shield className="h-16 w-16 text-white mr-4" />
            <h1 className="text-5xl font-bold text-white">
              Sistema de Seguridad
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Control de acceso inteligente con reconocimiento facial avanzado
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Dashboard */}
          <Link href="/dashboard" className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg mb-6 mx-auto group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-3">
                Dashboard
              </h3>
              <p className="text-white/80 text-center">
                Monitoreo en tiempo real de accesos, alertas y estadísticas del sistema
              </p>
            </div>
          </Link>


          {/* Gestión de Usuarios */}
          <Link href="/usuarios" className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-3">
                Usuarios
              </h3>
              <p className="text-white/80 text-center">
                Administración de usuarios, roles y registro de rostros biométricos
              </p>
            </div>
          </Link>

          {/* Alertas */}
          <Link href="/alertas" className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg mb-6 mx-auto group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-3">
                Alertas
              </h3>
              <p className="text-white/80 text-center">
                Gestión de alertas de seguridad y notificaciones del sistema
              </p>
            </div>
          </Link>

          {/* Zonas y Puntos */}
          <Link href="/zonas" className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-3">
                Zonas y Puntos
              </h3>
              <p className="text-white/80 text-center">
                Configuración de zonas de seguridad y puntos de control de acceso
              </p>
            </div>
          </Link>

          {/* Configuración */}
          <Link href="/configuracion" className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-lg mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-3">
                Configuración
              </h3>
              <p className="text-white/80 text-center">
                Ajustes del sistema, modelos de IA y parámetros de seguridad
              </p>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Reconocimiento en Tiempo Real
              </h3>
              <p className="text-white/80">
                Procesamiento facial en menos de 500ms con alta precisión
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Seguridad Avanzada
              </h3>
              <p className="text-white/80">
                Cifrado de datos biométricos y auditoría completa
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Análisis Inteligente
              </h3>
              <p className="text-white/80">
                Reportes detallados y métricas de rendimiento
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center">
          <p className="text-white/60">
            Sistema desarrollado para tesina de grado - Tecnología de vanguardia en seguridad biométrica
          </p>
        </div>
      </div>
    </div>
  )
}
