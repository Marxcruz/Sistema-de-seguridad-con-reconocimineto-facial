'use client'

import { useState, useEffect } from 'react'
import { Camera, Grid3x3, LayoutGrid, RefreshCw, Video } from 'lucide-react'
import CameraGrid from '@/components/monitoreo/CameraGrid'

interface Punto {
  id: number
  nombre: string
  cameraUrl: string | null
  streamType: string | null
}

export default function MonitoreoPage() {
  const [puntos, setPuntos] = useState<Punto[]>([])
  const [loading, setLoading] = useState(true)
  const [gridMode, setGridMode] = useState<'2x2' | '3x2' | '3x3' | '4x3'>('3x2')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    cargarPuntos()
  }, [refreshKey])

  const cargarPuntos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/puntos-control')
      const data = await response.json()

      if (data.success && data.data) {
        // Obtener configuración de cámara para cada punto
        const puntosConCamara = await Promise.all(
          data.data.map(async (punto: any) => {
            try {
              const camResponse = await fetch(`/api/puntos-control/${punto.id}/camera`)
              const camData = await camResponse.json()

              return {
                id: punto.id,
                nombre: punto.nombre,
                cameraUrl: camData.success ? camData.data?.cameraUrl || null : null,
                streamType: camData.success ? camData.data?.streamType || null : null,
              }
            } catch {
              return {
                id: punto.id,
                nombre: punto.nombre,
                cameraUrl: null,
                streamType: null,
              }
            }
          })
        )

        setPuntos(puntosConCamara)
      }
    } catch (error) {
      console.error('Error cargando puntos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const puntosActivos = puntos.filter((p) => p.cameraUrl).length
  const puntosTotal = puntos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <Video className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Monitoreo en Vivo
                </h1>
                <p className="text-indigo-100 text-sm mt-1 font-medium">
                  {puntosActivos} de {puntosTotal} cámaras activas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Selector de Grid con glassmorphism */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex gap-1 border border-white/20 shadow-lg">
                <button
                  onClick={() => setGridMode('2x2')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    gridMode === '2x2'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  title="2x2"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setGridMode('3x2')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    gridMode === '3x2'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  title="3x2"
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setGridMode('3x3')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    gridMode === '3x3'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  title="3x3"
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setGridMode('4x3')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    gridMode === '4x3'
                      ? 'bg-white/30 text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  title="4x3"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>

              {/* Botón Refresh mejorado */}
              <button
                onClick={handleRefresh}
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <RefreshCw className="h-5 w-5" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando cámaras...</p>
          </div>
        ) : puntos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay puntos de control configurados</p>
            <p className="text-gray-500 text-sm mt-2">
              Agrega puntos de control en la sección de Zonas y Puntos
            </p>
          </div>
        ) : (
          <CameraGrid puntos={puntos} gridMode={gridMode} onRefresh={handleRefresh} />
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Nota sobre Streams RTSP
              </h3>
              <p className="text-sm text-blue-800">
                Las cámaras con protocolo RTSP requieren un servidor intermediario (como ffmpeg o mediamtx) 
                para convertir el stream a HTTP/WebRTC y mostrarlo en el navegador. Las cámaras HTTP/MJPEG 
                funcionan directamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
