'use client'

import { useState, useEffect } from 'react'
import { X, Camera, Wifi } from 'lucide-react'
import MJPEGStream from './MJPEGStream'

interface CameraModalProps {
  nombre: string
  cameraUrl: string
  streamType: string
  onClose: () => void
}

export default function CameraModal({
  nombre,
  cameraUrl,
  streamType,
  onClose,
}: CameraModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (streamType === 'HTTP' || cameraUrl.includes('mjpeg') || cameraUrl.includes('video')) {
      // Para /video usar URL directa sin timestamp
      if (cameraUrl.includes('/video')) {
        setImageUrl(cameraUrl)
      } else {
        // Para MJPEG usar timestamp para forzar refresh
        const interval = setInterval(() => {
          setImageUrl(`${cameraUrl}?t=${Date.now()}`)
        }, 33) // ~30 FPS

        return () => clearInterval(interval)
      }
    }
  }, [cameraUrl, streamType])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">{nombre}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Wifi className="h-4 w-4 text-green-300" />
                <span className="text-sm text-green-300">En vivo</span>
                <span className="text-xs text-blue-200 ml-2">{streamType}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Video Area */}
        <div className="bg-black flex items-center justify-center" style={{ minHeight: '60vh' }}>
          {cameraUrl.includes('/video') || cameraUrl.includes('mjpeg') ? (
            // Usar componente MJPEG mejorado para streams en tiempo real
            <div className="w-full h-[70vh]">
              <MJPEGStream
                url={cameraUrl}
                title={nombre}
              />
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={nombre}
              className="max-w-full max-h-[70vh] object-contain"
            />
          ) : streamType === 'RTSP' ? (
            <div className="text-center text-gray-400 p-8">
              <Camera className="h-20 w-20 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Stream RTSP Detectado</p>
              <p className="text-sm opacity-70">{cameraUrl}</p>
              <p className="text-xs opacity-50 mt-4">
                Los streams RTSP requieren un servidor intermediario<br />
                para mostrarse en el navegador (ffmpeg, mediamtx, etc.)
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-400 p-8">
              <Camera className="h-20 w-20 mx-auto mb-4 opacity-50" />
              <p>Cargando stream...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-3 text-center">
          <p className="text-xs text-gray-400">
            URL: {cameraUrl}
          </p>
        </div>
      </div>
    </div>
  )
}
