'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Settings, Clock, Shield, AlertTriangle } from 'lucide-react'

interface ConfiguracionZona {
  zonaId: number
  nombreZona: string
  // Configuración de seguridad
  confianzaMinima: number
  livenessObligatorio: boolean
  dobleAutenticacion: boolean
  // Configuración de horarios
  horario24h: boolean
  horaInicio: string
  horaFin: string
  diasSemana: number[]
  // Configuración de alertas
  maxIntentosFallidos: number
  alertaInmediata: boolean
  notificarAdmin: boolean
  notificarSupervisor: boolean
  // Configuración de evidencia
  evidenciaObligatoria: boolean
  guardarFotosAcceso: boolean
}

interface ConfiguracionZonaModalProps {
  isOpen: boolean
  onClose: () => void
  zona: { id: number; nombre: string } | null
  onConfiguracionGuardada: () => void
}

export default function ConfiguracionZonaModal({ 
  isOpen, 
  onClose, 
  zona, 
  onConfiguracionGuardada 
}: ConfiguracionZonaModalProps) {
  const [config, setConfig] = useState<ConfiguracionZona>({
    zonaId: 0,
    nombreZona: '',
    // Valores por defecto
    confianzaMinima: 80,
    livenessObligatorio: true,
    dobleAutenticacion: false,
    horario24h: false,
    horaInicio: '08:00',
    horaFin: '18:00',
    diasSemana: [1, 2, 3, 4, 5], // Lunes a Viernes
    maxIntentosFallidos: 3,
    alertaInmediata: false,
    notificarAdmin: true,
    notificarSupervisor: false,
    evidenciaObligatoria: true,
    guardarFotosAcceso: true
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'seguridad' | 'horarios' | 'alertas' | 'evidencia'>('seguridad')

  const diasSemanaLabels = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 0, label: 'Dom' }
  ]

  useEffect(() => {
    if (zona && isOpen) {
      setConfig(prev => ({
        ...prev,
        zonaId: zona.id,
        nombreZona: zona.nombre
      }))
      // Aquí cargaríamos la configuración existente de la API
      cargarConfiguracion(zona.id)
    }
  }, [zona, isOpen])

  const cargarConfiguracion = async (zonaId: number) => {
    try {
      const response = await fetch(`/api/zonas/${zonaId}/configuracion`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setConfig(prev => ({ ...prev, ...data.data }))
        }
      }
    } catch (err) {
      console.log('No hay configuración previa, usando valores por defecto')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/zonas/${config.zonaId}/configuracion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        onConfiguracionGuardada()
        onClose()
      } else {
        setError(data.error || 'Error al guardar la configuración')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setActiveTab('seguridad')
    onClose()
  }

  const toggleDiaSemana = (dia: number) => {
    setConfig(prev => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia]
    }))
  }

  if (!isOpen || !zona) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Configuración de Zona
              </h2>
              <p className="text-sm text-gray-600">{zona.nombre}</p>
            </div>
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

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'seguridad', label: 'Seguridad', icon: Shield },
            { key: 'horarios', label: 'Horarios', icon: Clock },
            { key: 'alertas', label: 'Alertas', icon: AlertTriangle },
            { key: 'evidencia', label: 'Evidencia', icon: Settings }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab: Seguridad */}
          {activeTab === 'seguridad' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Seguridad</h3>
              
              <div className="space-y-2">
                <Label htmlFor="confianza">Confianza Mínima (%)</Label>
                <Input
                  id="confianza"
                  type="number"
                  min="50"
                  max="99"
                  value={config.confianzaMinima}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    confianzaMinima: parseInt(e.target.value) 
                  }))}
                />
                <p className="text-xs text-gray-500">
                  Nivel de confianza requerido para permitir acceso (50-99%)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="liveness"
                  checked={config.livenessObligatorio}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    livenessObligatorio: e.target.checked 
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="liveness">Detección de vida obligatoria</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="dobleAuth"
                  checked={config.dobleAutenticacion}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    dobleAutenticacion: e.target.checked 
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="dobleAuth">Doble autenticación requerida</Label>
              </div>
            </div>
          )}

          {/* Tab: Horarios */}
          {activeTab === 'horarios' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Horarios</h3>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="horario24h"
                  checked={config.horario24h}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    horario24h: e.target.checked 
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="horario24h">Acceso 24 horas</Label>
              </div>

              {!config.horario24h && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horaInicio">Hora de Inicio</Label>
                      <Input
                        id="horaInicio"
                        type="time"
                        value={config.horaInicio}
                        onChange={(e) => setConfig(prev => ({ 
                          ...prev, 
                          horaInicio: e.target.value 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horaFin">Hora de Fin</Label>
                      <Input
                        id="horaFin"
                        type="time"
                        value={config.horaFin}
                        onChange={(e) => setConfig(prev => ({ 
                          ...prev, 
                          horaFin: e.target.value 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Días de la Semana</Label>
                    <div className="flex flex-wrap gap-2">
                      {diasSemanaLabels.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleDiaSemana(value)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            config.diasSemana.includes(value)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Alertas */}
          {activeTab === 'alertas' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Alertas</h3>
              
              <div className="space-y-2">
                <Label htmlFor="maxIntentos">Máximo Intentos Fallidos</Label>
                <Input
                  id="maxIntentos"
                  type="number"
                  min="1"
                  max="10"
                  value={config.maxIntentosFallidos}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    maxIntentosFallidos: parseInt(e.target.value) 
                  }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="alertaInmediata"
                  checked={config.alertaInmediata}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    alertaInmediata: e.target.checked 
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="alertaInmediata">Alerta inmediata en acceso denegado</Label>
              </div>

              <div className="space-y-3">
                <Label>Notificaciones</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notificarAdmin"
                    checked={config.notificarAdmin}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      notificarAdmin: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="notificarAdmin">Notificar Administrador</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notificarSupervisor"
                    checked={config.notificarSupervisor}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      notificarSupervisor: e.target.checked 
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="notificarSupervisor">Notificar Supervisor</Label>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Evidencia */}
          {activeTab === 'evidencia' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Evidencia</h3>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="evidenciaObligatoria"
                  checked={config.evidenciaObligatoria}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    evidenciaObligatoria: e.target.checked 
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="evidenciaObligatoria">Evidencia fotográfica obligatoria</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="guardarFotos"
                  checked={config.guardarFotosAcceso}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    guardarFotosAcceso: e.target.checked 
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="guardarFotos">Guardar fotos de todos los accesos</Label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Consideraciones de Almacenamiento
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Guardar evidencia fotográfica aumentará significativamente 
                        el uso de almacenamiento. Considere implementar políticas 
                        de retención de datos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
