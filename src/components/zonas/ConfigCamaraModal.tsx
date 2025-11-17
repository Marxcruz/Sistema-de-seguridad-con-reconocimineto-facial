'use client'

import { useState, useEffect } from 'react'
import { Camera, X, Save, Trash2 } from 'lucide-react'

interface ConfigCamaraModalProps {
  puntoId: number
  puntoNombre: string
  onClose: () => void
  onSave: () => void
}

interface CameraConfig {
  cameraUrl: string
  cameraUser: string
  cameraPass: string
  streamType: string
}

export default function ConfigCamaraModal({
  puntoId,
  puntoNombre,
  onClose,
  onSave,
}: ConfigCamaraModalProps) {
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<CameraConfig>({
    cameraUrl: '',
    cameraUser: '',
    cameraPass: '',
    streamType: 'USB',
  })

  // Cargar configuración actual
  useEffect(() => {
    loadConfig()
  }, [puntoId])

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/puntos-control/${puntoId}/camera`)
      const data = await response.json()

      if (data.success && data.data) {
        setConfig({
          cameraUrl: data.data.cameraUrl || '',
          cameraUser: data.data.cameraUser || '',
          cameraPass: '',
          streamType: data.data.streamType || 'USB',
        })
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/puntos-control/${puntoId}/camera`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Configuración de cámara guardada')
        onSave()
        onClose()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error guardando:', error)
      alert('❌ Error al guardar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar configuración de cámara de este punto?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/puntos-control/${puntoId}/camera`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Configuración eliminada')
        onSave()
        onClose()
      } else {
        alert('❌ Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error eliminando:', error)
      alert('❌ Error al eliminar configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Configuración de Cámara
                </h2>
                <p className="text-blue-100 text-sm">{puntoNombre}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Tipo de Stream */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conexión
            </label>
            <select
              value={config.streamType}
              onChange={(e) =>
                setConfig({ ...config, streamType: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USB">USB - Cámara Local (índice 0, 1, 2...)</option>
              <option value="RTSP">RTSP - Cámara IP (Hikvision, Dahua, etc.)</option>
              <option value="HTTP">HTTP/MJPEG - Cámara Web</option>
              <option value="ONVIF">ONVIF - Cámara IP Estándar</option>
            </select>
          </div>

          {/* URL de Cámara */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL / Índice de Cámara *
            </label>
            <input
              type="text"
              value={config.cameraUrl}
              onChange={(e) =>
                setConfig({ ...config, cameraUrl: e.target.value })
              }
              placeholder={
                config.streamType === 'USB'
                  ? '0'
                  : config.streamType === 'RTSP'
                  ? 'rtsp://192.168.1.101:554/stream'
                  : 'http://192.168.1.101:8080/video'
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.streamType === 'USB'
                ? 'Ejemplo: 0 (primera cámara), 1 (segunda cámara)'
                : config.streamType === 'RTSP'
                ? 'Ejemplo: rtsp://admin:password@192.168.1.101:554/stream'
                : 'Ejemplo: http://192.168.1.101:8080/video'}
            </p>
          </div>

          {/* Usuario (solo para IP) */}
          {config.streamType !== 'USB' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario (opcional)
              </label>
              <input
                type="text"
                value={config.cameraUser}
                onChange={(e) =>
                  setConfig({ ...config, cameraUser: e.target.value })
                }
                placeholder="admin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si no incluyes usuario:password en la URL
              </p>
            </div>
          )}

          {/* Contraseña (solo para IP) */}
          {config.streamType !== 'USB' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña (opcional)
              </label>
              <input
                type="password"
                value={config.cameraPass}
                onChange={(e) =>
                  setConfig({ ...config, cameraPass: e.target.value })
                }
                placeholder="********"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dejar vacío si está en la URL o no requiere autenticación
              </p>
            </div>
          )}

          {/* Nota informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Nota:</strong> La configuración se aplicará automáticamente
              cuando el operador seleccione este punto de control en la aplicación
              de escritorio.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar Config
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !config.cameraUrl}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
