'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Shield, MapPin, Activity, AlertTriangle, Camera } from 'lucide-react'

interface PuntoDetalle {
  id: number
  nombre: string
  ubicacion?: string
  activo: boolean
  creadoEn: string
  cameraUrl?: string
  streamType?: string
  zona: {
    id: number
    nombre: string
  }
  tipo: {
    id: number
    nombre: string
  }
  _count: {
    accesos: number
    alertas: number
  }
  accesos: Array<{
    id: number
    creadoEn: string
    usuario: { nombre: string; apellido: string }
    decision: { nombre: string }
  }>
}

interface VerPuntoModalProps {
  isOpen: boolean
  onClose: () => void
  puntoId: number | null
}

export default function VerPuntoModal({ isOpen, onClose, puntoId }: VerPuntoModalProps) {
  const [punto, setPunto] = useState<PuntoDetalle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && puntoId) {
      cargarDetallePunto()
    }
  }, [isOpen, puntoId])

  const cargarDetallePunto = async () => {
    if (!puntoId) return
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/puntos-control/${puntoId}`)
      const data = await response.json()

      if (data.success) {
        setPunto(data.data)
      } else {
        setError(data.error || 'Error al cargar detalles del punto de control')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPunto(null)
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
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalles del Punto de Control
              </h2>
              {punto && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-white opacity-90">{punto.nombre}</span>
                  <Badge className={punto.activo 
                    ? "bg-green-500 text-white font-bold px-3 py-1" 
                    : "bg-red-500 text-white font-bold px-3 py-1"}>
                    {punto.activo ? 'Activo' : 'Inactivo'}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200 mb-6">
              {error}
            </div>
          )}

          {punto && (
            <div className="space-y-4">
              {/* Información Básica */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-100">
                <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
                  <div className="bg-indigo-500 p-2 rounded-lg mr-3">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  Información Básica
                </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Nombre:</span>
                  <p className="text-sm text-gray-900">{punto.nombre}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Estado:</span>
                  <p className="text-sm text-gray-900">
                    <Badge className={punto.activo 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-3 py-1 shadow-md" 
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1 shadow-md"}>
                      {punto.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Zona:</span>
                  <p className="text-sm text-gray-900">{punto.zona.nombre}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Tipo:</span>
                  <p className="text-sm text-gray-900">{punto.tipo.nombre}</p>
                </div>
                {punto.ubicacion && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Ubicación:</span>
                    <p className="text-sm text-gray-900">{punto.ubicacion}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Creado:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(punto.creadoEn).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración de Cámara */}
            {punto.cameraUrl && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-blue-600" />
                  Configuración de Cámara
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">URL:</span>
                    <p className="text-sm text-gray-900 break-all">{punto.cameraUrl}</p>
                  </div>
                  {punto.streamType && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Tipo de Stream:</span>
                      <p className="text-sm text-gray-900">{punto.streamType}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estadísticas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Accesos</p>
                      <p className="text-2xl font-bold text-green-900">
                        {punto._count.accesos}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Alertas</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {punto._count.alertas}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Últimos Accesos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Últimos Accesos</h3>
              {punto.accesos && punto.accesos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
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
                      {punto.accesos.map((acceso) => (
                        <tr key={acceso.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {acceso.usuario.nombre} {acceso.usuario.apellido}
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
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
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
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
