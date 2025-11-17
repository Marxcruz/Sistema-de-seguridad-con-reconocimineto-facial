'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { UsuarioCompleto } from '@/types'
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Shield, 
  Calendar,
  Camera,
  Activity
} from 'lucide-react'

interface VerUsuarioModalProps {
  isOpen: boolean
  onClose: () => void
  usuario: UsuarioCompleto | null
}

export default function VerUsuarioModal({ isOpen, onClose, usuario }: VerUsuarioModalProps) {
  if (!usuario) return null

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white">
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
              <User className="h-6 w-6 text-white" />
            </div>
            <span>Detalles del Usuario</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-6 max-h-[calc(90vh-100px)] overflow-y-auto">
          {/* Información Personal */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100">
            <h3 className="font-bold text-lg mb-4 flex items-center text-blue-800">
              <div className="bg-blue-500 p-2 rounded-lg mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 font-medium">Nombre Completo</label>
                <p className="text-gray-900 mt-1">
                  {usuario.nombre} {usuario.apellido}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Documento
                </label>
                <p className="text-gray-900 mt-1">{usuario.documento || 'No registrado'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </label>
                <p className="text-gray-900 mt-1">{usuario.email || 'No registrado'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Teléfono
                </label>
                <p className="text-gray-900 mt-1">{usuario.telefono || 'No registrado'}</p>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-100">
            <h3 className="font-bold text-lg mb-4 flex items-center text-green-800">
              <div className="bg-green-500 p-2 rounded-lg mr-3">
                <Shield className="h-5 w-5 text-white" />
              </div>
              Información del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 font-medium">Rol</label>
                <div className="mt-1">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold px-3 py-1 text-base">
                    {usuario.rol.nombre}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Estado</label>
                <div className="mt-1">
                  <Badge className={usuario.activo 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-3 py-1 text-base shadow-md" 
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1 text-base shadow-md"}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium flex items-center">
                  <Camera className="h-4 w-4 mr-1" />
                  Rostros Registrados
                </label>
                <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full w-fit mt-1">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <p className="text-blue-700 font-bold text-lg">
                    {usuario._count?.rostros || 0}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  Intentos Fallidos
                </label>
                <div className="flex items-center space-x-2 bg-red-100 px-3 py-1 rounded-full w-fit mt-1">
                  <Activity className="h-4 w-4 text-red-600" />
                  <p className="text-red-700 font-bold text-lg">
                    {usuario.intentosFallidos || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Fechas */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-100">
            <h3 className="font-bold text-lg mb-4 flex items-center text-purple-800">
              <div className="bg-purple-500 p-2 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Fechas Importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 font-medium">Fecha de Registro</label>
                <p className="text-gray-900 mt-1">{formatDate(usuario.creadoEn)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Último Acceso</label>
                <p className="text-gray-900 mt-1">
                  {usuario.ultimoAcceso ? formatDate(usuario.ultimoAcceso) : 'Nunca'}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas de Acceso */}
          {usuario._count && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-100">
              <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
                <div className="bg-orange-500 p-2 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                Estadísticas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-lg text-center">
                  <p className="text-3xl font-bold text-white">
                    {usuario._count.accesos || 0}
                  </p>
                  <p className="text-sm text-white opacity-90 mt-1">Accesos Totales</p>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg text-center">
                  <p className="text-3xl font-bold text-white">
                    {usuario._count.rostros || 0}
                  </p>
                  <p className="text-sm text-white opacity-90 mt-1">Rostros</p>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 shadow-lg text-center">
                  <p className="text-3xl font-bold text-white">
                    {usuario._count.reglasAcceso || 0}
                  </p>
                  <p className="text-sm text-white opacity-90 mt-1">Reglas de Acceso</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
