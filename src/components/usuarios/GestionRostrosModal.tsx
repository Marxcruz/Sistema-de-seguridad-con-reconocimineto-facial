'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { UsuarioCompleto } from '@/types'
import { Camera, Trash2, Upload, Video, VideoOff, Check, X, AlertCircle } from 'lucide-react'

interface GestionRostrosModalProps {
  isOpen: boolean
  onClose: () => void
  usuario: UsuarioCompleto | null
  onSuccess: () => void
}

export default function GestionRostrosModal({ 
  isOpen, 
  onClose, 
  usuario, 
  onSuccess 
}: GestionRostrosModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [rostros, setRostros] = useState<any[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen && usuario) {
      fetchRostros()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, usuario])

  // Asignar el stream al video element cuando se active la cámara
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      console.log('🎬 Asignando stream al video element en useEffect')
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraActive])

  const fetchRostros = async () => {
    if (!usuario) return
    
    try {
      const response = await fetch(`/api/usuarios/${usuario.id}/rostros`)
      const data = await response.json()
      
      if (data.success) {
        setRostros(data.data || [])
      }
    } catch (err) {
      console.error('Error al cargar rostros:', err)
    }
  }

  const startCamera = async () => {
    try {
      console.log('🎥 Iniciando cámara...')
      setError(null)
      
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Tu navegador no soporta acceso a la cámara. Usa Chrome, Firefox o Edge.')
        return
      }

      console.log('📹 Solicitando acceso a la cámara...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      })
      
      console.log('✅ Stream obtenido:', stream)
      console.log('📺 Video tracks:', stream.getVideoTracks())
      
      // Guardar el stream primero
      streamRef.current = stream
      
      // Activar la cámara (esto renderizará el video element)
      setCameraActive(true)
      console.log('✅ Estado cameraActive establecido a true')
      setError(null)
    } catch (err: any) {
      console.error('Error al acceder a la cámara:', err)
      
      // Mensajes de error más específicos
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('❌ Permiso denegado. Haz clic en el icono de cámara en la barra de direcciones y permite el acceso.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('❌ No se encontró ninguna cámara conectada. Verifica que tu cámara esté conectada.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('❌ La cámara está siendo usada por otra aplicación. Cierra otras apps que usen la cámara.')
      } else if (err.name === 'OverconstrainedError') {
        setError('❌ La cámara no cumple con los requisitos. Intenta con otra cámara.')
      } else if (err.name === 'SecurityError') {
        setError('❌ Acceso bloqueado por seguridad. Asegúrate de estar usando HTTPS o localhost.')
      } else {
        setError(`❌ Error al acceder a la cámara: ${err.message || 'Error desconocido'}`)
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.95)
      setCapturedImage(imageData)
      stopCamera()
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const registerFace = async () => {
    if (!capturedImage || !usuario) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Convertir base64 a blob
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      
      // Crear FormData
      const formData = new FormData()
      formData.append('image', blob, 'face.jpg')
      formData.append('usuarioId', usuario.id.toString())

      // Enviar a la API
      const registerResponse = await fetch('/api/usuarios/register-face', {
        method: 'POST',
        body: formData,
      })

      const data = await registerResponse.json()

      if (data.success) {
        setSuccess('Rostro registrado exitosamente')
        setCapturedImage(null)
        fetchRostros()
        onSuccess()
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Error al registrar rostro')
      }
    } catch (err) {
      setError('Error de conexión al registrar rostro')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteRostro = async (rostroId: number) => {
    if (!confirm('¿Está seguro de eliminar este rostro?')) return

    try {
      const response = await fetch(`/api/usuarios/rostros/${rostroId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Rostro eliminado exitosamente')
        fetchRostros()
        onSuccess()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Error al eliminar rostro')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  if (!usuario || !isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Gestión de Rostros - {usuario.nombre} {usuario.apellido}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 transition-all p-2 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-100px)] overflow-y-auto">
          <div className="space-y-5">
            {/* Mensajes */}
            {error && (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4">
                <div className="bg-red-500 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <p className="text-green-700 font-medium">{success}</p>
              </div>
            )}

            {/* Sección de Captura */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
              <h3 className="font-bold text-lg mb-4 flex items-center text-blue-800">
                <div className="bg-blue-500 p-2 rounded-lg mr-3">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                Registrar Nuevo Rostro
              </h3>
              
              <div className="space-y-4">
                {/* Video/Imagen */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
                  {(() => {
                    console.log('🎬 Estado de renderizado:', { cameraActive, capturedImage: !!capturedImage })
                    return null
                  })()}
                  
                  {!cameraActive && !capturedImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="bg-white bg-opacity-10 p-6 rounded-full mb-4 mx-auto w-fit backdrop-blur-sm">
                          <Camera className="h-16 w-16 opacity-75" />
                        </div>
                        <p className="text-xl font-bold mb-2">Cámara inactiva</p>
                        <p className="text-sm opacity-75">Presiona "Iniciar Cámara" para comenzar</p>
                      </div>
                    </div>
                  )}

                  {cameraActive && !capturedImage && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ display: 'block' }}
                      onLoadedMetadata={(e) => {
                        console.log('✅ Video cargado:', e.currentTarget.videoWidth, 'x', e.currentTarget.videoHeight)
                        console.log('📺 Video element:', e.currentTarget)
                      }}
                    />
                  )}

                  {capturedImage && (
                    <div className="relative w-full h-full">
                      <img
                        src={capturedImage}
                        alt="Captura"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-green-500 p-3 rounded-full shadow-lg">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Controles */}
                <div className="flex justify-center space-x-3">
                  {!cameraActive && !capturedImage && (
                    <Button 
                      onClick={startCamera}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3 font-bold"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Iniciar Cámara
                    </Button>
                  )}

                  {cameraActive && (
                    <>
                      <Button 
                        onClick={capturePhoto}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3 font-bold"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Capturar Foto
                      </Button>
                      <Button 
                        onClick={stopCamera} 
                        variant="outline"
                        className="px-6 py-3 font-bold border-2"
                      >
                        <VideoOff className="h-5 w-5 mr-2" />
                        Detener Cámara
                      </Button>
                    </>
                  )}

                  {capturedImage && (
                    <>
                      <Button 
                        onClick={registerFace} 
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Registrando...
                          </>
                        ) : (
                          <>
                            <Check className="h-5 w-5 mr-2" />
                            Registrar Rostro
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={retakePhoto} 
                        variant="outline"
                        className="px-6 py-3 font-bold border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Tomar Otra Foto
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Rostros Registrados */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-100">
              <h3 className="font-bold text-lg mb-4 flex items-center text-green-800">
                <div className="bg-green-500 p-2 rounded-lg mr-3">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                Rostros Registrados ({rostros.length})
              </h3>
              
              {rostros.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Camera className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No hay rostros registrados para este usuario</p>
                  <p className="text-gray-500 text-sm mt-1">Captura una foto para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rostros.map((rostro, index) => (
                    <div 
                      key={rostro.id} 
                      className="flex items-center justify-between bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Rostro #{index + 1}</p>
                          <p className="text-sm text-gray-600">
                            Registrado: {new Date(rostro.creadoEn).toLocaleDateString('es-ES')}
                          </p>
                          {rostro.calidad && (
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="bg-green-100 px-2 py-1 rounded-full">
                                <p className="text-xs font-bold text-green-700">
                                  Calidad: {(rostro.calidad * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRostro(rostro.id)}
                        className="hover:bg-red-100 transition-all duration-200"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
