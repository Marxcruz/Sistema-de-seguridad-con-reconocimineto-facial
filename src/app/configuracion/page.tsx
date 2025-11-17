'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database,
  Camera,
  Shield,
  Bell,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface SystemConfig {
  umbralReconocimiento: number
  tiempoMaximoRespuesta: number
  intentosMaximosFallidos: number
  habilitarLiveness: boolean
  habilitarNotificaciones: boolean
  rutaAlmacenamientoEvidencias: string
}

interface SystemStatus {
  database: 'connected' | 'disconnected' | 'error'
  faceRecognitionService: 'connected' | 'disconnected' | 'error'
  camera: 'available' | 'unavailable' | 'error'
  storage: 'available' | 'full' | 'error'
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<SystemConfig>({
    umbralReconocimiento: 0.6,
    tiempoMaximoRespuesta: 500,
    intentosMaximosFallidos: 3,
    habilitarLiveness: true,
    habilitarNotificaciones: true,
    rutaAlmacenamientoEvidencias: './uploads/evidencias'
  })

  const [status, setStatus] = useState<SystemStatus>({
    database: 'connected',
    faceRecognitionService: 'connected',
    camera: 'available',
    storage: 'available'
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      // Check database
      const dbResponse = await fetch('/api/dashboard/stats')
      const dbStatus = dbResponse.ok ? 'connected' : 'error'

      // Check face recognition service
      const faceResponse = await fetch('http://localhost:8000/health')
      const faceStatus = faceResponse.ok ? 'connected' : 'disconnected'

      setStatus(prev => ({
        ...prev,
        database: dbStatus,
        faceRecognitionService: faceStatus
      }))
    } catch (error) {
      console.error('Error checking system status:', error)
    }
  }

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    try {
      // Simulate API call to save configuration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar configuración' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'available':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'disconnected':
      case 'unavailable':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error':
      case 'full':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <RefreshCw className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'available':
        return <Badge variant="success">Conectado</Badge>
      case 'disconnected':
      case 'unavailable':
        return <Badge variant="warning">Desconectado</Badge>
      case 'error':
      case 'full':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <Layout title="Configuración del Sistema" subtitle="Ajustes y parámetros de seguridad">
      <div className="space-y-6">
        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 
            'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Base de Datos</p>
                    <p className="text-sm text-gray-500">PostgreSQL</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status.database)}
                  {getStatusBadge(status.database)}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Servicio IA</p>
                    <p className="text-sm text-gray-500">FastAPI</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status.faceRecognitionService)}
                  {getStatusBadge(status.faceRecognitionService)}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Camera className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Cámara</p>
                    <p className="text-sm text-gray-500">WebRTC</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status.camera)}
                  {getStatusBadge(status.camera)}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-6 w-6 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Almacenamiento</p>
                    <p className="text-sm text-gray-500">Local</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status.storage)}
                  {getStatusBadge(status.storage)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={checkSystemStatus} className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Actualizar Estado</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recognition Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Configuración de Reconocimiento Facial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Umbral de Confianza
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={config.umbralReconocimiento}
                    onChange={(e) => handleConfigChange('umbralReconocimiento', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-900 w-12">
                    {(config.umbralReconocimiento * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Nivel mínimo de confianza para autorizar acceso
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo Máximo de Respuesta (ms)
                </label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
                  value={config.tiempoMaximoRespuesta}
                  onChange={(e) => handleConfigChange('tiempoMaximoRespuesta', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tiempo límite para procesar reconocimiento
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intentos Máximos Fallidos
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={config.intentosMaximosFallidos}
                  onChange={(e) => handleConfigChange('intentosMaximosFallidos', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número de intentos antes de bloquear usuario
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ruta de Evidencias
                </label>
                <input
                  type="text"
                  value={config.rutaAlmacenamientoEvidencias}
                  onChange={(e) => handleConfigChange('rutaAlmacenamientoEvidencias', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Directorio para almacenar evidencias visuales
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Detección de Vida (Liveness)</p>
                  <p className="text-sm text-gray-500">Verificar que el rostro es real</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.habilitarLiveness}
                    onChange={(e) => handleConfigChange('habilitarLiveness', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Notificaciones</p>
                  <p className="text-sm text-gray-500">Alertas automáticas por eventos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.habilitarNotificaciones}
                    onChange={(e) => handleConfigChange('habilitarNotificaciones', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">1.0.0</p>
                <p className="text-sm text-gray-600">Versión del Sistema</p>
              </div>
              
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">PostgreSQL</p>
                <p className="text-sm text-gray-600">Base de Datos</p>
              </div>
              
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">FastAPI</p>
                <p className="text-sm text-gray-600">Servicio IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveConfig}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Guardando...' : 'Guardar Configuración'}</span>
          </Button>
        </div>
      </div>
    </Layout>
  )
}
