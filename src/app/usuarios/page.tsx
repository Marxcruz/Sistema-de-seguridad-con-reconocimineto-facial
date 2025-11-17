'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import RegistroUsuarioModal from '@/components/usuarios/RegistroUsuarioModal'
import VerUsuarioModal from '@/components/usuarios/VerUsuarioModal'
import EditarUsuarioModal from '@/components/usuarios/EditarUsuarioModal'
import GestionRostrosModal from '@/components/usuarios/GestionRostrosModal'
import GestionZonasModal from '@/components/usuarios/GestionZonasModal'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Camera,
  Eye,
  Filter,
  MapPin
} from 'lucide-react'
import { UsuarioCompleto } from '@/types'

interface Rol {
  id: number
  nombre: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('')
  const [filterActive, setFilterActive] = useState<string>('')
  const [showRegistroModal, setShowRegistroModal] = useState(false)
  const [showVerModal, setShowVerModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showRostrosModal, setShowRostrosModal] = useState(false)
  const [showZonasModal, setShowZonasModal] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioCompleto | null>(null)

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    fetchUsuarios()
  }, [searchTerm, filterRole, filterActive])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      if (data.success) {
        setRoles(data.data)
      }
    } catch (err) {
      console.error('Error al cargar roles:', err)
    }
  }

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterRole) params.append('rolId', filterRole)
      if (filterActive) params.append('activo', filterActive)

      const response = await fetch(`/api/usuarios?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setUsuarios(data.data)
        setError(null)
      } else {
        setError(data.error || 'Error al cargar usuarios')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleVerUsuario = (usuario: UsuarioCompleto) => {
    setSelectedUsuario(usuario)
    setShowVerModal(true)
  }

  const handleEditarUsuario = (usuario: UsuarioCompleto) => {
    setSelectedUsuario(usuario)
    setShowEditarModal(true)
  }

  const handleGestionRostros = (usuario: UsuarioCompleto) => {
    setSelectedUsuario(usuario)
    setShowRostrosModal(true)
  }

  const handleGestionZonas = (usuario: UsuarioCompleto) => {
    setSelectedUsuario(usuario)
    setShowZonasModal(true)
  }

  const handleDeleteUser = async (id: number, nombre: string) => {
    const confirmMessage = `⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE\n\n¿Está seguro de eliminar permanentemente al usuario "${nombre}"?\n\nSe eliminarán:\n- Todos sus rostros registrados\n- Su historial de accesos\n- Sus reglas de acceso\n- Sus imágenes de entrenamiento\n\nEsta acción NO se puede deshacer.`
    
    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        alert('✅ Usuario eliminado exitosamente')
        fetchUsuarios()
      } else {
        alert('❌ ' + (data.error || 'Error al eliminar usuario'))
      }
    } catch (err) {
      alert('❌ Error de conexión')
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
    <Layout title="Gestión de Usuarios" subtitle="Administrar usuarios y sus permisos de acceso">
      <div className="space-y-8">
        {/* Header Premium con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Gestión de Usuarios</h2>
                <p className="text-indigo-100">{usuarios.length} usuarios registrados en el sistema</p>
              </div>
            </div>
            <Button 
              className="flex items-center space-x-2 bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
              onClick={() => setShowRegistroModal(true)}
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo Usuario</span>
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda con glassmorphism */}
        <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-white/20">
            <CardTitle className="flex items-center text-gray-800">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg mr-3 shadow-md">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, documento..."
                  className="pl-10 pr-4 py-2.5 w-full border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filtro por rol */}
              <select
                className="px-4 py-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 font-medium"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                aria-label="Filtrar por rol"
              >
                <option value="">Todos los roles</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id.toString()}>
                    {rol.nombre}
                  </option>
                ))}
              </select>

              {/* Filtro por estado */}
              <select
                className="px-4 py-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 font-medium"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>

              {/* Limpiar filtros */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilterRole('')
                  setFilterActive('')
                }}
                className="border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all duration-300 font-medium"
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de usuarios */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
              <CardTitle className="text-xl flex items-center">
                <Users className="h-6 w-6 mr-3" />
                Lista de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b-2 border-indigo-200">
                      <th className="text-left py-4 px-6 font-bold text-indigo-700 uppercase text-xs tracking-wider">Usuario</th>
                      <th className="text-left py-4 px-6 font-bold text-indigo-700 uppercase text-xs tracking-wider">Documento</th>
                      <th className="text-left py-4 px-6 font-bold text-indigo-700 uppercase text-xs tracking-wider">Rol</th>
                      <th className="text-left py-4 px-6 font-bold text-indigo-700 uppercase text-xs tracking-wider">Estado</th>
                      <th className="text-left py-4 px-6 font-bold text-indigo-700 uppercase text-xs tracking-wider">Rostros</th>
                      <th className="text-left py-4 px-6 font-bold text-indigo-700 uppercase text-xs tracking-wider">Último Acceso</th>
                      <th className="text-left py-4 px-6 font-bold text-indigo-700 uppercase text-xs tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100">
                    {usuarios.map((usuario, index) => (
                      <tr 
                        key={usuario.id} 
                        className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                          index % 2 === 0 ? 'bg-white hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50' : 'bg-indigo-50/30 hover:bg-gradient-to-r hover:from-indigo-100/50 hover:to-purple-100/50'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {usuario.nombre} {usuario.apellido}
                            </div>
                            {usuario.email && (
                              <div className="text-sm text-gray-500">{usuario.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700 font-medium">
                          {usuario.documento || 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <Badge 
                            variant="outline"
                            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 font-semibold"
                          >
                            {usuario.rol.nombre}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge 
                            variant={usuario.activo ? "success" : "destructive"}
                            className={usuario.activo 
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md px-3 py-1" 
                              : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md px-3 py-1"
                            }
                          >
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
                            <Camera className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-bold text-blue-700">
                              {usuario._count?.rostros || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                          {usuario.ultimoAcceso 
                            ? formatDate(usuario.ultimoAcceso.toString())
                            : 'Nunca'
                          }
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-indigo-200 hover:text-indigo-700 transition-all duration-300 rounded-lg hover:scale-110 shadow-sm hover:shadow-md"
                              onClick={() => handleVerUsuario(usuario)}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-green-200 hover:text-green-700 transition-all duration-300 rounded-lg hover:scale-110 shadow-sm hover:shadow-md"
                              onClick={() => handleEditarUsuario(usuario)}
                              title="Editar usuario"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-blue-200 hover:text-blue-700 transition-all duration-300 rounded-lg hover:scale-110 shadow-sm hover:shadow-md"
                              onClick={() => handleGestionRostros(usuario)}
                              title="Gestionar rostros"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-purple-200 hover:text-purple-700 transition-all duration-300 rounded-lg hover:scale-110 shadow-sm hover:shadow-md"
                              onClick={() => handleGestionZonas(usuario)}
                              title="Gestionar zonas de acceso"
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-red-200 hover:text-red-700 transition-all duration-300 rounded-lg hover:scale-110 shadow-sm hover:shadow-md"
                              onClick={() => handleDeleteUser(usuario.id, `${usuario.nombre} ${usuario.apellido || ''}`)}
                              title="Eliminar usuario"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {usuarios.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron usuarios</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>

        {/* Modal de registro */}
        <RegistroUsuarioModal
          isOpen={showRegistroModal}
          onClose={() => setShowRegistroModal(false)}
          onSuccess={() => {
            fetchUsuarios()
            setShowRegistroModal(false)
          }}
        />

        {/* Modal de ver detalles */}
        <VerUsuarioModal
          isOpen={showVerModal}
          onClose={() => {
            setShowVerModal(false)
            setSelectedUsuario(null)
          }}
          usuario={selectedUsuario}
        />

        {/* Modal de editar */}
        <EditarUsuarioModal
          isOpen={showEditarModal}
          onClose={() => {
            setShowEditarModal(false)
            setSelectedUsuario(null)
          }}
          usuario={selectedUsuario}
          onSuccess={() => {
            fetchUsuarios()
            setShowEditarModal(false)
            setSelectedUsuario(null)
          }}
        />

        {/* Modal de gestión de rostros */}
        <GestionRostrosModal
          isOpen={showRostrosModal}
          onClose={() => {
            setShowRostrosModal(false)
            setSelectedUsuario(null)
          }}
          usuario={selectedUsuario}
          onSuccess={() => {
            fetchUsuarios()
          }}
        />

        {/* Modal de gestión de zonas */}
        <GestionZonasModal
          show={showZonasModal}
          onClose={() => {
            setShowZonasModal(false)
            setSelectedUsuario(null)
          }}
          usuario={selectedUsuario}
          onSuccess={() => {
            fetchUsuarios()
          }}
        />
    </>
  )
}
