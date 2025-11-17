'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertCircle, Loader } from 'lucide-react'

interface MJPEGStreamProps {
  url: string
  title: string
  onError?: () => void
  onSuccess?: () => void
}

export default function MJPEGStream({ url, title, onError, onSuccess }: MJPEGStreamProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!url) {
      setHasError(true)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    const handleLoad = () => {
      setIsLoading(false)
      setHasError(false)
      if (onSuccess) onSuccess()
      
      // Para MJPEG, continuar cargando frames
      if (url.includes('mjpeg') || url.includes('/video')) {
        // Recargar la imagen cada 100ms para actualización continua
        setTimeout(() => {
          img.src = url + (url.includes('?') ? '&' : '?') + 'ts=' + Date.now()
        }, 100)
      }
    }

    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
      if (onError) onError()
    }

    img.onload = handleLoad
    img.onerror = handleError

    // Iniciar carga
    img.src = url

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [url, onError, onSuccess])

  if (hasError) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400 p-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Error al conectar con la cámara</p>
          <p className="text-xs opacity-70 mt-1">{url.substring(0, 40)}...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Loader className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Conectando a {title}...</p>
        </div>
      </div>
    )
  }

  return (
    <img
      ref={imageRef}
      src={url}
      alt={title}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  )
}
