'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, MapPin, AlertCircle } from 'lucide-react'
import { CrearZonaForm } from '@/types'

interface CrearZonaModalProps {
  isOpen: boolean
  onClose: () => void
  onZonaCreated: () => void
}

export default function CrearZonaModal({ isOpen, onClose, onZonaCreated }: CrearZonaModalProps) {
  const [formData, setFormData] = useState<CrearZonaForm>({
    nombre: '',
    descripcion: '',
    activo: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/zonas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Reset form
        setFormData({
          nombre: '',
          descripcion: '',
          activo: true
        })
        onZonaCreated()
        onClose()
      } else {
        setError(data.error || 'Error al crear la zona')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      activo: true
    })
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
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Crear Nueva Zona</h2>
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
        
        <div className="p-6">
          <p className="text-sm text-gray-700 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-100">
            Agrega una nueva zona de seguridad al sistema.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-bold text-gray-700 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Nombre de la Zona *
              </Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Recepción, Oficinas, Sala de Servidores"
                required
                className="border-2 border-gray-200 focus:border-green-500 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-bold text-gray-700">Descripción</Label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional de la zona..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-100">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                aria-describedby="activo-label"
              />
              <Label htmlFor="activo" id="activo-label" className="font-bold text-gray-700 cursor-pointer">Zona activa</Label>
            </div>

            {error && (
              <div className="flex items-center space-x-3 text-sm text-red-700 bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200">
                <div className="bg-red-500 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t-2 border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="px-6 py-2 font-bold"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.nombre.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando...' : 'Crear Zona'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
