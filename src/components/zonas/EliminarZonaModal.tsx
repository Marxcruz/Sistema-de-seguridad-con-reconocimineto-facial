'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Trash2, AlertTriangle } from 'lucide-react'

interface EliminarZonaModalProps {
  isOpen: boolean
  onClose: () => void
  zona: { id: number; nombre: string; _count?: { puntosControl: number; reglasAcceso: number } } | null
  onZonaEliminada: () => void
}

export default function EliminarZonaModal({ 
  isOpen, 
  onClose, 
  zona, 
  onZonaEliminada 
}: EliminarZonaModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmacion, setConfirmacion] = useState('')

  const handleEliminar = async () => {
    if (!zona) return

    // Verificar confirmación
    if (confirmacion !== zona.nombre) {
      setError('El nombre de la zona no coincide')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/zonas/${zona.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        onZonaEliminada()
        onClose()
      } else {
        setError(data.error || 'Error al eliminar la zona')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmacion('')
    setError(null)
    onClose()
  }

  const tieneDependencias = zona && (
    (zona._count?.puntosControl || 0) > 0 || 
    (zona._count?.reglasAcceso || 0) > 0
  )

  if (!isOpen || !zona) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Eliminar Zona</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            ¿Estás seguro de que deseas eliminar la zona <strong>"{zona.nombre}"</strong>?
          </p>

          {/* Advertencia de dependencias */}
          {tieneDependencias && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ¡Atención! Esta zona tiene dependencias
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      {zona._count?.puntosControl && zona._count.puntosControl > 0 && (
                        <li>{zona._count.puntosControl} punto(s) de control</li>
                      )}
                      {zona._count?.reglasAcceso && zona._count.reglasAcceso > 0 && (
                        <li>{zona._count.reglasAcceso} regla(s) de acceso</li>
                      )}
                    </ul>
                    <p className="mt-2">
                      Eliminar esta zona también eliminará todas sus dependencias.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmación */}
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Esta acción no se puede deshacer
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p className="mb-3">
                    Para confirmar, escribe el nombre de la zona: <strong>{zona.nombre}</strong>
                  </p>
                  <input
                    type="text"
                    value={confirmacion}
                    onChange={(e) => setConfirmacion(e.target.value)}
                    placeholder={`Escribe "${zona.nombre}" para confirmar`}
                    className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEliminar}
            disabled={loading || confirmacion !== zona.nombre}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Eliminando...' : 'Eliminar Zona'}
          </Button>
        </div>
      </div>
    </div>
  )
}
