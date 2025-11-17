'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, Maximize2, Settings, Wifi, WifiOff } from 'lucide-react'
import MJPEGStream from './MJPEGStream'

interface CameraCardProps {
  puntoId: number
  nombre: string
  cameraUrl: string | null
  streamType: string | null
  isHidden?: boolean
  onExpand: () => void
  onConfigure: () => void
}

export default function CameraCard({
  puntoId,
  nombre,
  cameraUrl,
  streamType,
  isHidden = false,
  onExpand,
  onConfigure,
}: CameraCardProps) {
  const [isActive, setIsActive] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!cameraUrl) {
      setIsActive(false)
      return
    }

    setIsActive(true)

    // Para DroidCam /video o streams directos, usar la URL sin modificar
    if (cameraUrl.includes('/video') || cameraUrl.includes('mjpeg') || streamType === 'HTTP') {
      setImageUrl(cameraUrl)
      return
    }

    // Para RTSP, mostrar placeholder (requiere servidor intermediario)
    if (streamType === 'RTSP' || cameraUrl.includes('rtsp://')) {
      setImageUrl(null)
    }
  }, [cameraUrl, streamType])

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-white" />
          <span className="text-white font-semibold text-sm">{nombre}</span>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? (
            <div className="flex items-center gap-1">
              <Wifi className="h-4 w-4 text-green-300" />
              <span className="text-xs text-green-300">Activa</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <WifiOff className="h-4 w-4 text-red-300" />
              <span className="text-xs text-red-300">Sin config</span>
            </div>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
        {isHidden ? (
          <div className="text-center text-gray-400 p-4">
            <Maximize2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Vista ampliada activa</p>
          </div>
        ) : cameraUrl && imageUrl && (cameraUrl.includes('/video') || cameraUrl.includes('mjpeg')) ? (
          // Usar componente MJPEG mejorado para streams en tiempo real
          <MJPEGStream
            url={imageUrl}
            title={nombre}
            onError={() => setIsActive(false)}
            onSuccess={() => setIsActive(true)}
          />
        ) : cameraUrl && imageUrl ? (
          <img
            src={imageUrl}
            alt={nombre}
            className="w-full h-full object-cover"
            onError={() => setIsActive(false)}
          />
        ) : cameraUrl && streamType === 'RTSP' ? (
          <div className="text-center text-gray-400 p-4">
            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Stream RTSP</p>
            <p className="text-xs opacity-70 mt-1">
              {cameraUrl.substring(0, 40)}...
            </p>
            <p className="text-xs opacity-50 mt-2">
              Requiere conversión a HTTP
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-400 p-4">
            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Cámara no configurada</p>
            <button
              onClick={onConfigure}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs"
            >
              Configurar
            </button>
          </div>
        )}

        {/* Overlay con controles */}
        {cameraUrl && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={onExpand}
                className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition"
                title="Ampliar"
              >
                <Maximize2 className="h-5 w-5 text-gray-800" />
              </button>
              <button
                onClick={onConfigure}
                className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition"
                title="Configurar"
              >
                <Settings className="h-5 w-5 text-gray-800" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Punto #{puntoId}</span>
          {streamType && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {streamType}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
