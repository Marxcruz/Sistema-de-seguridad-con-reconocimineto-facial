'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Shield, MapPin, Navigation, Plus, AlertCircle } from 'lucide-react'

interface CrearPuntoForm {
  nombre: string
  ubicacion?: string
  activo: boolean
  zonaId: number
  tipoId: number
}

interface Zona {
  id: number
  nombre: string
}

interface TipoPunto {
  id: number
  nombre: string
}

interface CrearPuntoModalProps {
  isOpen: boolean
  onClose: () => void
  onPuntoCreado: () => void
}

export default function CrearPuntoModal({ isOpen, onClose, onPuntoCreado }: CrearPuntoModalProps) {
  const [formData, setFormData] = useState<CrearPuntoForm>({
    nombre: '',
    ubicacion: '',
    activo: true,
    zonaId: 0,
    tipoId: 0
  })
  const [zonas, setZonas] = useState<Zona[]>([])
  const [tipos, setTipos] = useState<TipoPunto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      cargarZonas()
      cargarTipos()
    }
  }, [isOpen])

  const cargarZonas = async () => {
    try {
      const response = await fetch('/api/zonas')
      const data = await response.json()
      if (data.success) {
        setZonas(data.data)
        // Seleccionar la primera zona por defecto si existe
        if (data.data.length > 0 && formData.zonaId === 0) {
          setFormData(prev => ({ ...prev, zonaId: data.data[0].id }))
        }
      }
    } catch (err) {
      console.error('Error cargando zonas:', err)
    }
  }

  const cargarTipos = async () => {
    try {
      const response = await fetch('/api/tipo-punto')
      const data = await response.json()
      if (data.success) {
        setTipos(data.data)
        // Seleccionar el primer tipo por defecto si existe
        if (data.data.length > 0 && formData.tipoId === 0) {
          setFormData(prev => ({ ...prev, tipoId: data.data[0].id }))
        }
      }
    } catch (err) {
      console.error('Error cargando tipos:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/puntos-control', {
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
          ubicacion: '',
          activo: true,
          zonaId: zonas[0]?.id || 0,
          tipoId: tipos[0]?.id || 0
        })
        onPuntoCreado()
        onClose()
      } else {
        setError(data.error || 'Error al crear el punto de control')
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
      ubicacion: '',
      activo: true,
      zonaId: zonas[0]?.id || 0,
      tipoId: tipos[0]?.id || 0
    })
    setError(null)
    onClose()
  }

  if (!isOpen) return null

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
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Crear Nuevo Punto de Control</h2>
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
          <p className="text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
            Agrega un nuevo punto de control al sistema.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-bold text-gray-700 flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Nombre del Punto *
              </Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Entrada Principal, Sala Servidores"
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zona" className="text-sm font-bold text-gray-700 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Zona *
              </Label>
              <select
                id="zona"
                value={formData.zonaId}
                onChange={(e) => setFormData({ ...formData, zonaId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                required
              >
                <option value="0" disabled>Seleccionar zona...</option>
                {zonas.map((zona) => (
                  <option key={zona.id} value={zona.id}>
                    {zona.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-bold text-gray-700 flex items-center">
                <Navigation className="h-4 w-4 mr-1" />
                Tipo de Punto *
              </Label>
              <select
                id="tipo"
                value={formData.tipoId}
                onChange={(e) => setFormData({ ...formData, tipoId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
                required
              >
                <option value="0" disabled>Seleccionar tipo...</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion" className="text-sm font-bold text-gray-700 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Ubicación
              </Label>
              <Input
                id="ubicacion"
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej: Edificio A - Piso 1"
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
              <Label htmlFor="activo" id="activo-label" className="font-bold text-gray-700">Punto activo</Label>
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
                disabled={loading || !formData.nombre.trim() || formData.zonaId === 0 || formData.tipoId === 0}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando...' : 'Crear Punto'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
