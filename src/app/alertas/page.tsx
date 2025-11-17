'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  Bell,
  Clock,
  MapPin,
  User,
  Camera,
  Trash2
} from 'lucide-react'
import { AlertaCompleta } from '@/types'

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterPoint, setFilterPoint] = useState<string>('')
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaCompleta | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    fetchAlertas()
  }, [searchTerm, filterType, filterPoint])

  const fetchAlertas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType) params.append('tipoId', filterType)
      if (filterPoint) params.append('puntoId', filterPoint)

      const response = await fetch(`/api/alertas?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setAlertas(data.data)
        setError(null)
      } else {
        setError(data.error || 'Error al cargar alertas')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'acceso no autorizado':
        return <User className="h-5 w-5 text-red-600" />
      case 'falla en prueba de vida':
        return <Camera className="h-5 w-5 text-orange-600" />
      case 'usuario desconocido':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Bell className="h-5 w-5 text-blue-600" />
    }
  }

  const getAlertBadge = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'acceso no autorizado':
        return <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1 shadow-md">Crítica</Badge>
      case 'falla en prueba de vida':
        return <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-3 py-1 shadow-md">Alta</Badge>
      case 'usuario desconocido':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold px-3 py-1 shadow-md">Media</Badge>
      default:
        return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold px-3 py-1 shadow-md">Baja</Badge>
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const alertDate = new Date(date)
    const diffMs = now.getTime() - alertDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }

  const handleViewDetails = (alerta: AlertaCompleta) => {
    setSelectedAlerta(alerta)
    setShowModal(true)
  }

  const handleViewImage = (alerta: AlertaCompleta) => {
    setSelectedAlerta(alerta)
    setShowImageModal(true)
  }

  const handleDeleteAlerta = async (alertaId: number) => {
    // Confirmación antes de eliminar
    if (!confirm('¿Estás seguro de que deseas eliminar esta alerta?\n\nEsta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/alertas/${alertaId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        // Actualizar la lista eliminando la alerta
        setAlertas(alertas.filter(a => a.id !== alertaId))
        
        // Cerrar modal si está abierto
        if (showModal && selectedAlerta?.id === alertaId) {
          setShowModal(false)
        }
        if (showImageModal && selectedAlerta?.id === alertaId) {
          setShowImageModal(false)
        }
      } else {
        alert('Error al eliminar la alerta: ' + data.error)
      }
    } catch (err) {
      alert('Error de conexión al eliminar la alerta')
    }
  }

  return (
    <>
    <Layout title="Sistema de Alertas" subtitle="Monitoreo y gestión de alertas de seguridad">
      <div className="space-y-8">
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Sistema de Alertas</h2>
                <p className="text-indigo-100">Monitoreo y gestión centralizada de alertas de seguridad</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header con estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 opacity-95"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white opacity-90">Total Alertas</p>
                  <p className="text-4xl font-bold text-white mt-2">{alertas.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 opacity-95"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white opacity-90">Críticas</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {alertas.filter(a => a.tipo.nombre === 'Acceso no autorizado').length}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 opacity-95"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white opacity-90">Hoy</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {alertas.filter(a => {
                      const today = new Date().toDateString()
                      return new Date(a.creadoEn).toDateString() === today
                    }).length}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 opacity-95"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white opacity-90">Última Hora</p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {alertas.filter(a => {
                      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
                      return new Date(a.creadoEn) > hourAgo
                    }).length}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                  <Bell className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros con glassmorphism */}
        <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-white/20">
            <CardTitle className="flex items-center text-gray-800">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg mr-3 shadow-md">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar alertas..."
                  className="pl-10 pr-4 py-2.5 w-full border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="px-4 py-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 font-medium"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="1">Acceso no autorizado</option>
                <option value="2">Falla en prueba de vida</option>
                <option value="3">Usuario desconocido</option>
                <option value="4">Múltiples intentos fallidos</option>
              </select>

              <select
                className="px-4 py-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 font-medium"
                value={filterPoint}
                onChange={(e) => setFilterPoint(e.target.value)}
              >
                <option value="">Todos los puntos</option>
                <option value="1">Entrada Principal</option>
                <option value="2">Acceso Oficinas</option>
                <option value="3">Sala Servidores</option>
              </select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('')
                  setFilterPoint('')
                }}
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all duration-300 font-medium"
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de alertas */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-500 to-orange-600 text-white">
              <CardTitle className="text-xl flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3" />
                Alertas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {alertas.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <AlertTriangle className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">No se encontraron alertas</p>
                    <p className="text-gray-500 text-sm mt-2">El sistema está funcionando correctamente</p>
                  </div>
                ) : (
                  alertas.map((alerta) => (
                    <div key={alerta.id} className="border-l-4 border-gray-200 rounded-lg p-5 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-purple-50 hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm">
                            {getAlertIcon(alerta.tipo.nombre)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-base font-bold text-gray-900">
                                {alerta.tipo.nombre}
                              </h3>
                              {getAlertBadge(alerta.tipo.nombre)}
                            </div>
                            
                            {alerta.detalle && (
                              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                                {alerta.detalle}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs">
                              <div className="flex items-center space-x-1 bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(alerta.creadoEn.toString())}</span>
                              </div>
                              
                              {alerta.punto && (
                                <div className="flex items-center space-x-1 bg-purple-100 px-3 py-1 rounded-full text-purple-700 font-medium">
                                  <MapPin className="h-3 w-3" />
                                  <span>{alerta.punto.nombre} - {alerta.punto.zona.nombre}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                            {getTimeAgo(alerta.creadoEn.toString())}
                          </span>
                          
                          {alerta.evidencia && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 rounded-lg"
                              onClick={() => handleViewImage(alerta)}
                              title="Ver foto"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 rounded-lg"
                            onClick={() => handleViewDetails(alerta)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteAlerta(alerta.id)}
                            title="Eliminar alerta"
                            className="hover:bg-red-100 hover:text-red-700 transition-all duration-200 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>

        {/* Modal de detalles */}
        {showModal && selectedAlerta && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header del modal */}
              <div className="sticky top-0 bg-gradient-to-r from-red-500 to-orange-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                    {getAlertIcon(selectedAlerta.tipo.nombre)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Detalles de la Alerta
                    </h2>
                    <p className="text-sm text-white opacity-90">
                      ID: {selectedAlerta.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 transition-all p-2 rounded-lg"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="px-6 py-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Evidencia Fotográfica */}
                {selectedAlerta.evidencia && (
                  <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center space-x-2">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                      <span>Evidencia Fotográfica</span>
                    </h3>
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 shadow-inner">
                      <img 
                        src={`http://localhost:8000/evidencias/${selectedAlerta.evidencia.id}/imagen`}
                        alt="Evidencia de la alerta"
                        className="w-full h-auto rounded-lg shadow-xl border-4 border-white"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png'
                          e.currentTarget.alt = 'Imagen no disponible'
                        }}
                      />
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-500 font-medium">Tamaño</p>
                          <p className="text-sm font-bold text-gray-800">{(selectedAlerta.evidencia.tamanoBytes / 1024).toFixed(2)} KB</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-500 font-medium">Tipo</p>
                          <p className="text-sm font-bold text-gray-800">{selectedAlerta.evidencia.mimeType}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tipo y prioridad */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Tipo de Alerta</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-bold text-gray-900">
                      {selectedAlerta.tipo.nombre}
                    </span>
                    {getAlertBadge(selectedAlerta.tipo.nombre)}
                  </div>
                </div>

                {/* Detalle */}
                {selectedAlerta.detalle && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Descripción</h3>
                    <p className="text-gray-900 bg-white p-4 rounded-lg shadow-sm leading-relaxed">
                      {selectedAlerta.detalle}
                    </p>
                  </div>
                )}

                {/* Información de ubicación */}
                {selectedAlerta.punto && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-100">
                      <h3 className="text-xs font-bold text-gray-600 mb-3">Punto de Control</h3>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="font-bold">{selectedAlerta.punto.nombre}</span>
                      </div>
                      {selectedAlerta.punto.ubicacion && (
                        <p className="text-sm text-gray-600 mt-2 ml-7">
                          {selectedAlerta.punto.ubicacion}
                        </p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-100">
                      <h3 className="text-xs font-bold text-gray-600 mb-3">Zona</h3>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <span className="font-bold">{selectedAlerta.punto.zona.nombre}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fecha y hora */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border-2 border-orange-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Fecha y Hora</h3>
                  <div className="flex items-center space-x-3 text-gray-900">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">{formatDate(selectedAlerta.creadoEn.toString())}</p>
                      <p className="text-sm text-gray-600">
                        Hace {getTimeAgo(selectedAlerta.creadoEn.toString())}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notificaciones asociadas */}
                {selectedAlerta.notificaciones && selectedAlerta.notificaciones.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notificaciones Enviadas</h3>
                    <div className="space-y-2">
                      {selectedAlerta.notificaciones.map((notif: any) => (
                        <div key={notif.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Bell className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-900">
                              {notif.canal?.nombre || notif.canalId || 'Canal desconocido'}
                            </span>
                          </div>
                          <Badge variant={notif.estado === 'enviado' ? 'default' : 'outline'}>
                            {notif.estado}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 px-6 py-4 flex justify-between">
                <Button
                  onClick={() => handleDeleteAlerta(selectedAlerta.id)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Alerta
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de solo imagen */}
        {showImageModal && selectedAlerta && selectedAlerta.evidencia && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Camera className="h-6 w-6 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Evidencia Fotográfica
                    </h2>
                    <p className="text-sm text-gray-500">
                      Alerta ID: {selectedAlerta.id} - {selectedAlerta.tipo.nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del modal - Solo la imagen */}
              <div className="px-6 py-6">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="relative">
                    <img 
                      src={`http://localhost:8000/evidencias/${selectedAlerta.evidencia.id}/imagen`}
                      alt="Evidencia de la alerta"
                      className="w-full h-auto rounded-lg shadow-lg"
                      onLoad={() => console.log('✅ Imagen cargada correctamente')}
                      onError={(e) => {
                        console.error('❌ Error al cargar imagen:', `http://localhost:8000/evidencias/${selectedAlerta.evidencia.id}/imagen`)
                        e.currentTarget.style.display = 'none'
                        const errorDiv = document.createElement('div')
                        errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-8 text-center'
                        errorDiv.innerHTML = `
                          <p class="text-red-600 font-semibold mb-2">⚠️ No se pudo cargar la imagen</p>
                          <p class="text-sm text-gray-600">ID de evidencia: ${selectedAlerta.evidencia.id}</p>
                          <p class="text-xs text-gray-500 mt-2">Verifica que el servicio de Python esté corriendo</p>
                        `
                        e.currentTarget.parentElement?.appendChild(errorDiv)
                      }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-gray-500 text-xs">Tamaño</p>
                      <p className="font-semibold text-gray-900">
                        {(selectedAlerta.evidencia.tamanoBytes / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-gray-500 text-xs">Tipo</p>
                      <p className="font-semibold text-gray-900">
                        {selectedAlerta.evidencia.mimeType}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-gray-500 text-xs">Fecha</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(selectedAlerta.creadoEn.toString())}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer del modal */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
                <Button
                  onClick={() => {
                    setShowImageModal(false)
                    setShowModal(true)
                  }}
                  variant="outline"
                >
                  Ver Detalles Completos
                </Button>
                <Button
                  onClick={() => setShowImageModal(false)}
                  variant="default"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
    </>
  )
}
