'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Clock, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UsuarioCompleto } from '@/types'

interface ReglaAcceso {
  id: number
  usuarioId: number
  zonaId: number
  horaInicio: string
  horaFin: string
  diaSemana: number | null
  diaNombre: string
  activo: boolean
  zona: {
    id: number
    nombre: string
    descripcion: string | null
  }
}

interface Zona {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

interface GestionZonasModalProps {
  show: boolean
  onClose: () => void
  usuario: UsuarioCompleto | null
  onSuccess?: () => void
}

export default function GestionZonasModal({ show, onClose, usuario, onSuccess }: GestionZonasModalProps) {
  const [reglas, setReglas] = useState<ReglaAcceso[]>([])
  const [zonasDisponibles, setZonasDisponibles] = useState<Zona[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Form state
  const [selectedZonaId, setSelectedZonaId] = useState<number | ''>('')
  const [horaInicio, setHoraInicio] = useState('08:00')
  const [horaFin, setHoraFin] = useState('18:00')
  const [diaSemana, setDiaSemana] = useState<number | null>(null)
  const [activo, setActivo] = useState(true)

  const diasSemana = [
    { value: null, label: 'Todos los días' },
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
  ]

  useEffect(() => {
    if (show && usuario) {
      fetchReglas()
      fetchZonas()
    }
  }, [show, usuario])

  const fetchReglas = async () => {
    if (!usuario) return
    
    try {
      const response = await fetch(`/api/reglas-acceso?usuarioId=${usuario.id}`)
      const data = await response.json()
      
      if (data.success) {
        setReglas(data.data)
      }
    } catch (error) {
      console.error('Error al cargar reglas:', error)
    }
  }

  const fetchZonas = async () => {
    try {
      const response = await fetch('/api/zonas')
      const data = await response.json()
      
      if (data.success) {
        setZonasDisponibles(data.data.filter((z: Zona) => z.activo))
      }
    } catch (error) {
      console.error('Error al cargar zonas:', error)
    }
  }

  const handleAddRegla = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuario || selectedZonaId === '') return

    setLoading(true)
    try {
      const response = await fetch('/api/reglas-acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: usuario.id,
          zonaId: selectedZonaId,
          horaInicio,
          horaFin,
          diaSemana,
          activo,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ ${data.message}`)
        fetchReglas()
        setShowAddForm(false)
        resetForm()
        if (onSuccess) onSuccess()
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRegla = async (reglaId: number) => {
    if (!confirm('¿Está seguro de eliminar esta regla de acceso?')) return

    try {
      const response = await fetch(`/api/reglas-acceso/${reglaId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert(`✅ ${data.message}`)
        fetchReglas()
        if (onSuccess) onSuccess()
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const handleToggleActivo = async (regla: ReglaAcceso) => {
    try {
      const response = await fetch(`/api/reglas-acceso/${regla.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activo: !regla.activo,
        }),
      })

      const data = await response.json()

      if (data.success) {
        fetchReglas()
        if (onSuccess) onSuccess()
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const resetForm = () => {
    setSelectedZonaId('')
    setHoraInicio('08:00')
    setHoraFin('18:00')
    setDiaSemana(null)
    setActivo(true)
  }

  if (!show || !usuario) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Gestión de Zonas de Acceso</h2>
                <p className="text-blue-100 mt-1">
                  {usuario.nombre} {usuario.apellido}
                </p>
                <p className="text-blue-200 text-sm">
                  {usuario.documento} • {usuario.rol?.nombre}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 transition-all p-2 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Add Button */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Asignar Nueva Zona
            </Button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
              <h3 className="text-lg font-bold mb-4 flex items-center text-green-800">
                <div className="bg-green-500 p-2 rounded-lg mr-3">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                Nueva Regla de Acceso
              </h3>
              <form onSubmit={handleAddRegla} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Zona */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Zona *
                    </label>
                    <select
                      value={selectedZonaId}
                      onChange={(e) => setSelectedZonaId(Number(e.target.value))}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    >
                      <option value="">Seleccionar zona...</option>
                      {zonasDisponibles.map((zona) => (
                        <option key={zona.id} value={zona.id}>
                          {zona.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Día de la semana */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Día de la Semana
                    </label>
                    <select
                      value={diaSemana === null ? '' : diaSemana}
                      onChange={(e) => setDiaSemana(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    >
                      {diasSemana.map((dia) => (
                        <option key={dia.label} value={dia.value === null ? '' : dia.value}>
                          {dia.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hora Inicio */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Hora de Inicio *
                    </label>
                    <input
                      type="time"
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    />
                  </div>

                  {/* Hora Fin */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Hora de Fin *
                    </label>
                    <input
                      type="time"
                      value={horaFin}
                      onChange={(e) => setHoraFin(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 justify-end pt-4 border-t-2 border-green-200">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      resetForm()
                    }}
                    variant="outline"
                    className="px-6 py-2 font-bold border-2"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : 'Guardar Regla'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Reglas */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center text-blue-800">
              <div className="bg-blue-500 p-2 rounded-lg mr-3">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              Zonas Asignadas ({reglas.length})
            </h3>

            {reglas.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <div className="bg-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-700 font-bold text-lg">
                  No hay zonas asignadas a este usuario
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Haz clic en "Asignar Nueva Zona" para comenzar
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reglas.map((regla) => (
                  <div
                    key={regla.id}
                    className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-bold text-lg text-gray-900">{regla.zona.nombre}</h4>
                          <Badge className={regla.activo 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-3 py-1 shadow-md" 
                            : "bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold px-3 py-1 shadow-md"}>
                            {regla.activo ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-700">
                              {regla.horaInicio} - {regla.horaFin}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-gray-700">{regla.diaNombre}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleToggleActivo(regla)}
                          className={regla.activo 
                            ? "bg-orange-500 hover:bg-orange-600 text-white font-bold" 
                            : "bg-green-500 hover:bg-green-600 text-white font-bold"}
                        >
                          {regla.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteRegla(regla.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t-2 border-gray-200">
          <div className="flex justify-end">
            <Button 
              onClick={onClose} 
              variant="outline"
              className="px-6 py-2 font-bold border-2"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
