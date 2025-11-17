'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Edit, MapPin, FileText, AlertCircle } from 'lucide-react'

interface EditarZonaForm {
  nombre: string
  descripcion?: string
  activo: boolean
}

interface EditarZonaModalProps {
  isOpen: boolean
  onClose: () => void
  zona: { id: number; nombre: string; descripcion?: string; activo: boolean } | null
  onZonaEditada: () => void
}

export default function EditarZonaModal({ 
  isOpen, 
  onClose, 
  zona, 
  onZonaEditada 
}: EditarZonaModalProps) {
  const [formData, setFormData] = useState<EditarZonaForm>({
    nombre: '',
    descripcion: '',
    activo: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (zona && isOpen) {
      setFormData({
        nombre: zona.nombre,
        descripcion: zona.descripcion || '',
        activo: zona.activo
      })
    }
  }, [zona, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!zona) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/zonas/${zona.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        onZonaEditada()
        onClose()
      } else {
        setError(data.error || 'Error al actualizar la zona')
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

  if (!isOpen || !zona) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Editar Zona</h2>
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
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6 bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
            Modifica la información de la zona <span className="font-bold text-purple-700">"{zona.nombre}"</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-bold text-gray-700 flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Descripción
              </Label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional de la zona..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium transition-all resize-none"
              />
            </div>

            <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                aria-describedby="activo-label"
              />
              <Label htmlFor="activo" id="activo-label" className="font-bold text-gray-700">Zona activa</Label>
            </div>

            {error && (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4">
                <div className="bg-red-500 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t-2 border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="px-6 py-2 font-bold border-2"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.nombre.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
