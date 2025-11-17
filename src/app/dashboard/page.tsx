'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import StatsCard from '@/components/dashboard/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

interface DashboardStats {
  resumen: {
    accesosHoy: number
    alertasHoy: number
    usuariosActivos: number
    puntosActivos: number
    totalUsuarios: number
    totalAccesos: number
  }
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
  accesosPorDecision: Array<{
    decision: string
    cantidad: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Tooltip personalizado para mostrar nombres completos
const CustomAlertTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="font-semibold text-gray-900">{payload[0].payload.tipoOriginal || payload[0].payload.tipo}</p>
        <p className="text-red-600 font-bold">{payload[0].value} alertas</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      console.log('📊 Dashboard Stats Response:', data)
      console.log('📊 Alertas por Tipo:', data.data?.alertasPorTipo)
      
      if (data.success) {
        // Acortar nombres de alertas muy largos para el gráfico
        if (data.data.alertasPorTipo) {
          data.data.alertasPorTipo = data.data.alertasPorTipo.map((alerta: any) => ({
            ...alerta,
            tipoOriginal: alerta.tipo,
            tipo: alerta.tipo.length > 20 ? alerta.tipo.substring(0, 17) + '...' : alerta.tipo
          }))
        }
        setStats(data.data)
        setError(null)
      } else {
        setError(data.error || 'Error al cargar estadísticas')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Monitoreo en tiempo real del sistema">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Dashboard" subtitle="Monitoreo en tiempo real del sistema">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </Layout>
    )
  }

  if (!stats) return null

  return (
    <Layout title="Dashboard" subtitle="Monitoreo en tiempo real del sistema">
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 -m-6 p-6 relative">
        <div className="space-y-8">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
                <p className="text-indigo-100">Sistema de Seguridad con Reconocimiento Facial</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
                  <div className="text-sm opacity-90">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Accesos Hoy */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Accesos Hoy</p>
                  <p className="text-4xl font-bold mt-2">{stats.resumen.accesosHoy}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Activity className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">Tiempo real</span>
              </div>
            </div>

            {/* Alertas Hoy */}
            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Alertas Hoy</p>
                  <p className="text-4xl font-bold mt-2">{stats.resumen.alertasHoy}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                <span className="text-sm">Seguridad activa</span>
              </div>
            </div>

            {/* Usuarios Activos */}
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Usuarios Activos</p>
                  <p className="text-4xl font-bold mt-2">{stats.resumen.usuariosActivos}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                <span className="text-sm">En línea</span>
              </div>
            </div>

            {/* Puntos Activos */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Puntos Activos</p>
                  <p className="text-4xl font-bold mt-2">{stats.resumen.puntosActivos}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Shield className="h-8 w-8" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">Monitoreando</span>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Accesos por Hora */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/20">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Accesos por Hora</h3>
                    <p className="text-blue-100 text-sm">Actividad de hoy</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.accesosPorHora}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hora" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        border: '2px solid #3b82f6',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                    <Bar dataKey="accesos" fill="url(#colorAccesos)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="colorAccesos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#1e40af" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Accesos por Decisión */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/20">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Accesos por Decisión</h3>
                    <p className="text-purple-100 text-sm">Resultados de hoy</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.accesosPorDecision}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ decision, cantidad }) => `${decision}: ${cantidad}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {stats.accesosPorDecision.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        border: '2px solid #a855f7',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Usuarios */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/20">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Top Usuarios</h3>
                    <p className="text-green-100 text-sm">Más activos este mes</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.topUsuarios.map((usuario, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl hover:from-green-100/70 hover:to-emerald-100/70 transition-all duration-300 border border-green-100/50 hover:border-green-200 hover:shadow-lg transform hover:-translate-y-1"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-gray-800 text-lg">{usuario.usuario}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{usuario.accesos}</div>
                        <div className="text-sm text-green-500">accesos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alertas por Tipo */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-white/20">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-t-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-xl mr-4">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Alertas por Tipo</h3>
                    <p className="text-red-100 text-sm">Eventos de seguridad</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {stats.alertasPorTipo && stats.alertasPorTipo.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={stats.alertasPorTipo}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="tipo" stroke="#64748b" fontSize={12} />
                      <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                      <Tooltip content={<CustomAlertTooltip />} />
                      <Bar 
                        dataKey="cantidad" 
                        fill="url(#colorAlertas)" 
                        radius={[6, 6, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="colorAlertas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                    <div className="bg-green-100 p-6 rounded-full mb-4">
                      <Shield className="h-12 w-12 text-green-600" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">Sistema Seguro</p>
                    <p className="text-sm text-gray-500 text-center max-w-xs">No se han detectado alertas de seguridad este mes. El sistema está funcionando correctamente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumen General Mejorado */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
              <div className="flex items-center justify-center">
                <div className="bg-white/20 p-3 rounded-xl mr-4">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Resumen General del Sistema</h3>
                  <p className="text-indigo-100 mt-1">Estadísticas globales de rendimiento</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    {stats.resumen.totalUsuarios}
                  </div>
                  <div className="text-lg font-semibold text-blue-700">Total Usuarios</div>
                  <div className="text-sm text-blue-500 mt-1">Registrados en el sistema</div>
                </div>
                
                <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {stats.resumen.totalAccesos.toLocaleString()}
                  </div>
                  <div className="text-lg font-semibold text-green-700">Total Accesos</div>
                  <div className="text-sm text-green-500 mt-1">Desde el inicio del sistema</div>
                </div>
                
                <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {Math.round((stats.resumen.accesosHoy / Math.max(stats.resumen.totalAccesos, 1)) * 100 * 100) / 100}%
                  </div>
                  <div className="text-lg font-semibold text-purple-700">Actividad Hoy</div>
                  <div className="text-sm text-purple-500 mt-1">Porcentaje del total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
