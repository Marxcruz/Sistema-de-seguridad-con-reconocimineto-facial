'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  X, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Upload,
  Check,
  AlertCircle
} from 'lucide-react'

interface RegistroUsuarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  nombre: string
  apellido: string
  documento: string
  email: string
  telefono: string
  rolId: number
}

export default function RegistroUsuarioModal({ isOpen, onClose, onSuccess }: RegistroUsuarioModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<{id: number, nombre: string}[]>([])
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    telefono: '',
    rolId: 3 // Empleado por defecto
  })
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Cargar roles al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchRoles()
    }
  }, [isOpen])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      if (data.success) {
        setRoles(data.data)
        // Establecer el primer rol como default si existe
        if (data.data.length > 0) {
          setFormData(prev => ({ ...prev, rolId: data.data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error al cargar roles:', error)
    }
  }

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30, min: 15 },
          aspectRatio: { ideal: 16/9 }
        } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Optimize canvas rendering for registration photos
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        context.drawImage(video, 0, 0)
        
        const photoData = canvas.toDataURL('image/jpeg', 0.95) // Alta calidad para DeepFace
        setCapturedPhoto(photoData)
        stopCamera() // Detener cámara después de capturar
      }
    }
  }

  const removePhoto = () => {
    setCapturedPhoto(null)
    startCamera() // Reiniciar cámara para tomar otra foto
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.nombre.trim()) return 'El nombre es requerido'
    if (!formData.apellido.trim()) return 'El apellido es requerido'
    if (!formData.documento.trim()) return 'El documento es requerido'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Email inválido'
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!capturedPhoto) {
      setError('Debe capturar una foto del rostro')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Crear usuario
      console.log('Enviando datos del usuario:', formData)
      const userResponse = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      console.log('Respuesta del servidor:', userResponse.status)
      const userData = await userResponse.json()
      console.log('Datos de respuesta:', userData)
      
      if (!userData.success) {
        throw new Error(userData.error || 'Error al crear usuario')
      }

      const userId = userData.data.id

      // 2. Procesar foto con la API de Python (solo 1 foto de alta calidad)
      const photoBase64 = capturedPhoto.split(',')[1]
      
      const faceResponse = await fetch('http://localhost:8000/enroll-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          images_base64: [photoBase64], // Array con 1 sola imagen de alta calidad
          model_name: 'ArcFace' // Nombre del modelo en la tabla modelos_faciales
        })
      })

      const faceData = await faceResponse.json()
      if (!faceData.success) {
        // Si falla el registro facial, eliminar usuario creado
        await fetch(`/api/usuarios/${userId}`, { method: 'DELETE' })
        throw new Error(faceData.message || 'Error al procesar rostros')
      }

      // Éxito
      onSuccess()
      handleClose()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    stopCamera()
    setStep(1)
    setFormData({
      nombre: '',
      apellido: '',
      documento: '',
      email: '',
      telefono: '',
      rolId: 3
    })
    setCapturedPhoto(null)
    setError(null)
    onClose()
  }

  const nextStep = () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setStep(2)
    startCamera()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              {step === 1 ? <User className="h-6 w-6 text-white" /> : <Camera className="h-6 w-6 text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {step === 1 ? 'Datos del Usuario' : 'Captura Facial'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 transition-all p-2 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-100px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl flex items-center shadow-md">
              <div className="bg-red-500 p-2 rounded-lg mr-3">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100">
                <h3 className="font-bold text-lg mb-4 flex items-center text-blue-800">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      <User className="h-4 w-4 inline mr-1" />
                      Nombre *
                    </label>
                    <Input
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      placeholder="Nombre"
                      className="border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      <User className="h-4 w-4 inline mr-1" />
                      Apellido *
                    </label>
                    <Input
                      value={formData.apellido}
                      onChange={(e) => handleInputChange('apellido', e.target.value)}
                      placeholder="Apellido"
                      className="border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    <CreditCard className="h-4 w-4 inline mr-1" />
                    Documento *
                  </label>
                  <Input
                    value={formData.documento}
                    onChange={(e) => handleInputChange('documento', e.target.value)}
                    placeholder="Número de documento"
                    className="border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-100">
                <h3 className="font-bold text-lg mb-4 flex items-center text-green-800">
                  <div className="bg-green-500 p-2 rounded-lg mr-3">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  Información de Contacto
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="border-2 border-gray-200 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Teléfono
                    </label>
                    <Input
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      placeholder="Número de teléfono"
                      className="border-2 border-gray-200 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-100">
                <h3 className="font-bold text-lg mb-4 flex items-center text-purple-800">
                  <div className="bg-purple-500 p-2 rounded-lg mr-3">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Rol del Sistema
                </h3>
                <label className="block text-sm font-bold mb-2 text-gray-700">Rol</label>
                <select
                  value={formData.rolId}
                  onChange={(e) => handleInputChange('rolId', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                  title="Seleccionar rol del usuario"
                >
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t-2 border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="px-6 py-2 font-bold"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 font-bold"
                >
                  Siguiente: Captura Facial
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="bg-blue-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-lg">
                  <Camera className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-blue-800">Captura de Rostro</h3>
                <p className="text-gray-700 font-medium">
                  Capture una foto de alta calidad para el reconocimiento facial
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4 shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-80 h-60 bg-gray-900 rounded-xl shadow-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {!capturedPhoto ? (
                  <Button 
                    onClick={capturePhoto} 
                    disabled={!stream}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3 font-bold"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Capturar Foto de Alta Calidad
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-4 border-green-500 shadow-xl">
                        <img
                          src={capturedPhoto}
                          alt="Foto capturada"
                          className="w-64 h-64 object-cover rounded-xl"
                        />
                        <div className="absolute -top-3 -right-3 bg-green-500 rounded-full p-2 shadow-lg">
                          <Check className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={removePhoto}
                      className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Tomar Otra Foto
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t-2 border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="px-6 py-2 font-bold"
                >
                  Anterior
                </Button>
                <div className="space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleClose}
                    className="px-6 py-2 font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading || !capturedPhoto}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Registrando...' : 'Registrar Usuario'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
