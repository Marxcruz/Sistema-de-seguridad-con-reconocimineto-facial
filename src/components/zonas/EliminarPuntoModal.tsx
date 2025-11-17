'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Trash2, AlertTriangle } from 'lucide-react'

interface EliminarPuntoModalProps {
  isOpen: boolean
  onClose: () => void
  punto: { id: number; nombre: string; _count?: { accesos: number; alertas: number } } | null
  onPuntoEliminado: () => void
}

export default function EliminarPuntoModal({ 
  isOpen, 
  onClose, 
  punto, 
  onPuntoEliminado 
}: EliminarPuntoModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmacion, setConfirmacion] = useState('')

  const handleEliminar = async () => {
    if (!punto) return

    // Verificar confirmación
    if (confirmacion !== punto.nombre) {
      setError('El nombre del punto no coincide')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/puntos-control/${punto.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        onPuntoEliminado()
        onClose()
      } else {
        setError(data.error || 'Error al eliminar el punto de control')
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

  const tieneDependencias = punto && (
    (punto._count?.accesos || 0) > 0 || 
    (punto._count?.alertas || 0) > 0
  )

  if (!isOpen || !punto) return null

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
            <h2 className="text-lg font-semibold text-gray-900">Eliminar Punto de Control</h2>
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
            ¿Estás seguro de que deseas eliminar el punto de control <strong>"{punto.nombre}"</strong>?
          </p>

          {/* Advertencia de dependencias */}
          {tieneDependencias && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ¡Atención! Este punto tiene dependencias
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      {punto._count?.accesos && punto._count.accesos > 0 && (
                        <li>{punto._count.accesos} acceso(s) registrado(s)</li>
                      )}
                      {punto._count?.alertas && punto._count.alertas > 0 && (
                        <li>{punto._count.alertas} alerta(s) generada(s)</li>
                      )}
                    </ul>
                    <p className="mt-2">
                      Eliminar este punto también eliminará todas sus dependencias.
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
                    Para confirmar, escribe el nombre del punto: <strong>{punto.nombre}</strong>
                  </p>
                  <input
                    type="text"
                    value={confirmacion}
                    onChange={(e) => setConfirmacion(e.target.value)}
                    placeholder={`Escribe "${punto.nombre}" para confirmar`}
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
            disabled={loading || confirmacion !== punto.nombre}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Eliminando...' : 'Eliminar Punto'}
          </Button>
        </div>
      </div>
    </div>
  )
}
