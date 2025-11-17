'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, MapPin, Shield, Users, Activity, Clock, AlertTriangle, Camera } from 'lucide-react'

interface ZonaDetalle {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
  creadoEn: string
  puntosControl: Array<{
    id: number
    nombre: string
    tipo: { nombre: string }
    activo: boolean
    _count: { accesos: number }
  }>
  _count: {
    puntosControl: number
    reglasAcceso: number
    accesos: number
    alertas: number
  }
  estadisticas: {
    accesosHoy: number
    accesosEstaSemana: number
    alertasRecientes: number
    usuariosUnicos: number
  }
  ultimosAccesos: Array<{
    id: number
    creadoEn: string
    usuario: { nombre: string; apellido: string }
    punto: { nombre: string }
    decision: { nombre: string }
  }>
}

interface VerZonaModalProps {
  isOpen: boolean
  onClose: () => void
  zonaId: number | null
}

export default function VerZonaModal({ isOpen, onClose, zonaId }: VerZonaModalProps) {
  const [zona, setZona] = useState<ZonaDetalle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && zonaId) {
      cargarDetalleZona()
    }
  }, [isOpen, zonaId])

  const cargarDetalleZona = async () => {
    if (!zonaId) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/zonas/${zonaId}/detalle`)
      const data = await response.json()

      if (data.success) {
        setZona(data.data)
      } else {
        setError(data.error || 'Error al cargar detalles de la zona')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setZona(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalles de Zona
              </h2>
              {zona && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-white opacity-90">{zona.nombre}</span>
                  <Badge className={zona.activo 
                    ? "bg-green-500 text-white font-bold px-3 py-1" 
                    : "bg-red-500 text-white font-bold px-3 py-1"}>
                    {zona.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 transition-all p-2 rounded-lg"
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-150px)] overflow-y-auto">

          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200 mb-6">
              {error}
            </div>
          )}

          {zona && (
            <div className="space-y-6">
              {/* Información Básica */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  Información Básica
                </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Nombre:</span>
                  <p className="text-sm text-gray-900">{zona.nombre}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Estado:</span>
                  <p className="text-sm text-gray-900">
                    <Badge className={zona.activo 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-3 py-1 shadow-md" 
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1 shadow-md"}>
                      {zona.activo ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </p>
                </div>
                {zona.descripcion && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Descripción:</span>
                    <p className="text-sm text-gray-900">{zona.descripcion}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Creada:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(zona.creadoEn).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

              {/* Estadísticas */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Estadísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white opacity-90">Accesos Hoy</p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {zona.estadisticas?.accesosHoy || 0}
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white opacity-90">Esta Semana</p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {zona.estadisticas?.accesosEstaSemana || 0}
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white opacity-90">Usuarios Únicos</p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {zona.estadisticas?.usuariosUnicos || 0}
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white opacity-90">Alertas</p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {zona.estadisticas?.alertasRecientes || 0}
                        </p>
                      </div>
                      <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Puntos de Control */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Puntos de Control ({zona.puntosControl?.length || 0})
                </h3>
                {zona.puntosControl && zona.puntosControl.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {zona.puntosControl.map((punto) => (
                      <div key={punto.id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-900">{punto.nombre}</h4>
                          <Badge className={punto.activo 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-3 py-1" 
                            : "bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1"}>
                            {punto.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 font-medium">
                          Tipo: <span className="text-blue-600">{punto.tipo.nombre}</span>
                        </p>
                        <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full w-fit">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-bold text-blue-700">
                            {punto._count.accesos} accesos
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Shield className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No hay puntos de control configurados</p>
                  </div>
                )}
              </div>

            {/* Últimos Accesos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Últimos Accesos</h3>
              {zona.ultimosAccesos && zona.ultimosAccesos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Punto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Decisión
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha/Hora
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {zona.ultimosAccesos.map((acceso) => (
                        <tr key={acceso.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {acceso.usuario.nombre} {acceso.usuario.apellido}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {acceso.punto.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={acceso.decision.nombre === 'PERMITIDO' ? 'success' : 'destructive'}>
                              {acceso.decision.nombre}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(acceso.creadoEn).toLocaleString('es-ES')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay accesos registrados</p>
                </div>
              )}
            </div>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
          <Button 
            onClick={handleClose}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
