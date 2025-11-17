'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CrearZonaModal from '@/components/zonas/CrearZonaModal'
import CrearPuntoModal from '@/components/zonas/CrearPuntoModal'
import ConfiguracionZonaModal from '@/components/zonas/ConfiguracionZonaModal'
import VerZonaModal from '@/components/zonas/VerZonaModal'
import EditarZonaModal from '@/components/zonas/EditarZonaModal'
import EliminarZonaModal from '@/components/zonas/EliminarZonaModal'
import ConfigCamaraModal from '@/components/zonas/ConfigCamaraModal'
import VerPuntoModal from '@/components/zonas/VerPuntoModal'
import EditarPuntoModal from '@/components/zonas/EditarPuntoModal'
import EliminarPuntoModal from '@/components/zonas/EliminarPuntoModal'
import { 
  MapPin, 
  Plus, 
  Settings, 
  Shield, 
  Users,
  Activity,
  Eye,
  Edit,
  Trash2,
  Camera
} from 'lucide-react'

interface Zona {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
  puntosControl?: PuntoControl[]
  _count: {
    puntosControl: number
    reglasAcceso: number
  }
}

interface PuntoControl {
  id: number
  nombre: string
  activo: boolean
  ubicacion?: string
  zona: {
    id: number
    nombre: string
  }
  tipo: {
    id: number
    nombre: string
  }
  _count: {
    accesos: number
    alertas?: number
  }
}

export default function ZonasPage() {
  const [zonas, setZonas] = useState<Zona[]>([])
  const [puntosControl, setPuntosControl] = useState<PuntoControl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedZona, setSelectedZona] = useState<number | null>(null)
  const [showPoints, setShowPoints] = useState(false)
  const [showCrearZonaModal, setShowCrearZonaModal] = useState(false)
  const [showCrearPuntoModal, setShowCrearPuntoModal] = useState(false)
  const [showConfiguracionModal, setShowConfiguracionModal] = useState(false)
  const [showVerModal, setShowVerModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showEliminarModal, setShowEliminarModal] = useState(false)
  const [zonaSeleccionada, setZonaSeleccionada] = useState<{id: number, nombre: string} | null>(null)
  const [zonaParaEditar, setZonaParaEditar] = useState<{id: number, nombre: string, descripcion?: string, activo: boolean} | null>(null)
  const [zonaParaEliminar, setZonaParaEliminar] = useState<{id: number, nombre: string, _count?: {puntosControl: number, reglasAcceso: number}} | null>(null)
  const [showConfigCamaraModal, setShowConfigCamaraModal] = useState(false)
  const [puntoParaConfigCamara, setPuntoParaConfigCamara] = useState<{id: number, nombre: string} | null>(null)
  const [showVerPuntoModal, setShowVerPuntoModal] = useState(false)
  const [showEditarPuntoModal, setShowEditarPuntoModal] = useState(false)
  const [showEliminarPuntoModal, setShowEliminarPuntoModal] = useState(false)
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<number | null>(null)
  const [puntoParaEditar, setPuntoParaEditar] = useState<PuntoControl | null>(null)
  const [puntoParaEliminar, setPuntoParaEliminar] = useState<{id: number, nombre: string, _count?: {accesos: number, alertas: number}} | null>(null)

  useEffect(() => {
    fetchZonas()
    fetchPuntosControl()
  }, [])

  const fetchZonas = async () => {
    try {
      const response = await fetch('/api/zonas?includePoints=true')
      const data = await response.json()
      
      if (data.success) {
        setZonas(data.data)
        setError(null)
      } else {
        setError(data.error || 'Error al cargar zonas')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const fetchPuntosControl = async () => {
    try {
      const response = await fetch('/api/puntos-control')
      const data = await response.json()
      
      if (data.success) {
        setPuntosControl(data.data)
      }
    } catch (err) {
      console.error('Error fetching puntos control:', err)
    }
  }

  const handleZonaSelect = (zonaId: number) => {
    setSelectedZona(selectedZona === zonaId ? null : zonaId)
  }

  const getZonaPuntos = (zonaId: number) => {
    return puntosControl.filter(punto => punto.id === zonaId) // This should be punto.zonaId in real implementation
  }

  const handleZonaCreated = () => {
    fetchZonas() // Recargar la lista de zonas
  }

  const handlePuntoCreado = () => {
    fetchPuntosControl() // Recargar la lista de puntos
  }

  const handleConfigurarZona = (zona: {id: number, nombre: string}) => {
    setZonaSeleccionada(zona)
    setShowConfiguracionModal(true)
  }

  const handleConfiguracionGuardada = () => {
    fetchZonas() // Recargar la lista de zonas
  }

  const handleVerZona = (zonaId: number) => {
    setZonaSeleccionada({ id: zonaId, nombre: '' })
    setShowVerModal(true)
  }

  const handleEditarZona = (zona: Zona) => {
    setZonaParaEditar({
      id: zona.id,
      nombre: zona.nombre,
      descripcion: zona.descripcion,
      activo: zona.activo
    })
    setShowEditarModal(true)
  }

  const handleEliminarZona = (zona: Zona) => {
    setZonaParaEliminar({
      id: zona.id,
      nombre: zona.nombre,
      _count: zona._count
    })
    setShowEliminarModal(true)
  }

  const handleZonaEditada = () => {
    fetchZonas() // Recargar la lista de zonas
  }

  const handleZonaEliminada = () => {
    fetchZonas() // Recargar la lista de zonas
  }

  const handleVerPunto = (puntoId: number) => {
    setPuntoSeleccionado(puntoId)
    setShowVerPuntoModal(true)
  }

  const handleEditarPunto = (punto: PuntoControl) => {
    setPuntoParaEditar(punto)
    setShowEditarPuntoModal(true)
  }

  const handleEliminarPunto = (punto: PuntoControl) => {
    setPuntoParaEliminar({
      id: punto.id,
      nombre: punto.nombre,
      _count: {
        accesos: punto._count.accesos,
        alertas: punto._count.alertas || 0
      }
    })
    setShowEliminarPuntoModal(true)
  }

  const handlePuntoEditado = () => {
    fetchPuntosControl() // Recargar la lista de puntos
  }

  const handlePuntoEliminado = () => {
    fetchPuntosControl() // Recargar la lista de puntos
  }

  return (
    <Layout title="Zonas y Puntos de Control" subtitle="Gestión de zonas de seguridad y puntos de acceso">
      <div className="space-y-8">
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">Zonas y Puntos de Control</h2>
                <p className="text-indigo-100">Gestión centralizada de zonas de seguridad y puntos de acceso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de vista */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-indigo-200 shadow-md">
            <Button 
              variant={!showPoints ? "default" : "outline"}
              onClick={() => setShowPoints(false)}
              className={`flex items-center space-x-2 transition-all duration-300 ${!showPoints ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'hover:bg-indigo-50'}`}
            >
              <MapPin className="h-4 w-4" />
              <span>Zonas ({zonas.length})</span>
            </Button>
            <Button 
              variant={showPoints ? "default" : "outline"}
              onClick={() => setShowPoints(true)}
              className={`flex items-center space-x-2 transition-all duration-300 ${showPoints ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'hover:bg-indigo-50'}`}
            >
              <Shield className="h-4 w-4" />
              <span>Puntos ({puntosControl.length})</span>
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all duration-300 font-medium"
              onClick={() => {
                if (zonas.length > 0) {
                  handleConfigurarZona({ id: zonas[0].id, nombre: zonas[0].nombre })
                }
              }}
            >
              <Settings className="h-4 w-4" />
              <span>Configurar</span>
            </Button>
            <Button 
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                if (showPoints) {
                  setShowCrearPuntoModal(true)
                } else {
                  setShowCrearZonaModal(true)
                }
              }}
            >
              <Plus className="h-4 w-4" />
              <span>{showPoints ? 'Nuevo Punto' : 'Nueva Zona'}</span>
            </Button>
          </div>
        </div>

        {/* Vista de Zonas */}
        {!showPoints && (
          <>
            {/* Estadísticas de zonas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 opacity-95"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-100">Total Zonas</p>
                      <p className="text-4xl font-bold text-white mt-2">{zonas.length}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 opacity-95"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-100">Zonas Activas</p>
                      <p className="text-4xl font-bold text-white mt-2">
                        {zonas.filter(z => z.activo).length}
                      </p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 opacity-95"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-100">Puntos Totales</p>
                      <p className="text-4xl font-bold text-white mt-2">
                        {zonas.reduce((acc, zona) => acc + zona._count.puntosControl, 0)}
                      </p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 opacity-95"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-100">Reglas Activas</p>
                      <p className="text-4xl font-bold text-white mt-2">
                        {zonas.reduce((acc, zona) => acc + zona._count.reglasAcceso, 0)}
                      </p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de zonas */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {zonas.map((zona) => (
                  <Card key={zona.id} className="border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                    <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                          {zona.nombre}
                        </CardTitle>
                        <Badge 
                          variant={zona.activo ? "success" : "destructive"}
                          className={zona.activo ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md" : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"}
                        >
                          {zona.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {zona.descripcion && (
                        <p className="text-sm text-gray-600 mb-4 italic">{zona.descripcion}</p>
                      )}
                      
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <span className="text-sm font-medium text-blue-700 flex items-center">
                            <Shield className="h-4 w-4 mr-2" />
                            Puntos de Control
                          </span>
                          <span className="font-bold text-blue-700 bg-white px-3 py-1 rounded-full text-sm shadow-sm">
                            {zona._count.puntosControl}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                          <span className="text-sm font-medium text-purple-700 flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Reglas de Acceso
                          </span>
                          <span className="font-bold text-purple-700 bg-white px-3 py-1 rounded-full text-sm shadow-sm">
                            {zona._count.reglasAcceso}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => handleVerZona(zona.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 hover:bg-green-50 hover:text-green-700 transition-colors"
                          onClick={() => handleEditarZona(zona)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() => handleEliminarZona(zona)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Vista de Puntos de Control */}
        {showPoints && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white pb-6">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Shield className="h-6 w-6 mr-3" />
                Puntos de Control
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wider">Punto</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wider">Zona</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wider">Tipo</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wider">Estado</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wider">Accesos</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-xs tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {puntosControl.map((punto, index) => (
                      <tr 
                        key={punto.id} 
                        className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="py-4 px-6 font-semibold text-gray-900">{punto.nombre}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                            <MapPin className="h-3 w-3 mr-1" />
                            {punto.zona.nombre}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">{punto.tipo.nombre}</td>
                        <td className="py-4 px-6">
                          <Badge 
                            variant={punto.activo ? "success" : "destructive"}
                            className={punto.activo 
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md px-4 py-1" 
                              : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md px-4 py-1"
                            }
                          >
                            {punto.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-700">
                            {punto._count.accesos}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 rounded-lg"
                              onClick={() => {
                                setPuntoParaConfigCamara({id: punto.id, nombre: punto.nombre})
                                setShowConfigCamaraModal(true)
                              }}
                              title="Configurar Cámara"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 rounded-lg"
                              onClick={() => handleVerPunto(punto.id)}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-green-100 hover:text-green-700 transition-all duration-200 rounded-lg"
                              onClick={() => handleEditarPunto(punto)}
                              title="Editar punto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="hover:bg-red-100 hover:text-red-700 transition-all duration-200 rounded-lg"
                              onClick={() => handleEliminarPunto(punto)}
                              title="Eliminar punto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {puntosControl.length === 0 && (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Shield className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No se encontraron puntos de control</p>
                  <p className="text-gray-500 text-sm mt-2">Crea un nuevo punto para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal para crear nueva zona */}
      <CrearZonaModal
        isOpen={showCrearZonaModal}
        onClose={() => setShowCrearZonaModal(false)}
        onZonaCreated={handleZonaCreated}
      />

      {/* Modal para crear nuevo punto de control */}
      <CrearPuntoModal
        isOpen={showCrearPuntoModal}
        onClose={() => setShowCrearPuntoModal(false)}
        onPuntoCreado={handlePuntoCreado}
      />

      {/* Modal para configurar zona */}
      <ConfiguracionZonaModal
        isOpen={showConfiguracionModal}
        onClose={() => setShowConfiguracionModal(false)}
        zona={zonaSeleccionada}
        onConfiguracionGuardada={handleConfiguracionGuardada}
      />

      {/* Modal para ver zona */}
      <VerZonaModal
        isOpen={showVerModal}
        onClose={() => setShowVerModal(false)}
        zonaId={zonaSeleccionada?.id || null}
      />

      {/* Modal para editar zona */}
      <EditarZonaModal
        isOpen={showEditarModal}
        onClose={() => setShowEditarModal(false)}
        zona={zonaParaEditar}
        onZonaEditada={handleZonaEditada}
      />

      {/* Modal para eliminar zona */}
      <EliminarZonaModal
        isOpen={showEliminarModal}
        onClose={() => setShowEliminarModal(false)}
        zona={zonaParaEliminar}
        onZonaEliminada={handleZonaEliminada}
      />

      {/* Modal para configurar cámara de punto de control */}
      {showConfigCamaraModal && puntoParaConfigCamara && (
        <ConfigCamaraModal
          puntoId={puntoParaConfigCamara.id}
          puntoNombre={puntoParaConfigCamara.nombre}
          onClose={() => {
            setShowConfigCamaraModal(false)
            setPuntoParaConfigCamara(null)
          }}
          onSave={() => {
            fetchPuntosControl()
          }}
        />
      )}

      {/* Modal para ver punto de control */}
      <VerPuntoModal
        isOpen={showVerPuntoModal}
        onClose={() => setShowVerPuntoModal(false)}
        puntoId={puntoSeleccionado}
      />

      {/* Modal para editar punto de control */}
      <EditarPuntoModal
        isOpen={showEditarPuntoModal}
        onClose={() => setShowEditarPuntoModal(false)}
        punto={puntoParaEditar}
        onPuntoEditado={handlePuntoEditado}
      />

      {/* Modal para eliminar punto de control */}
      <EliminarPuntoModal
        isOpen={showEliminarPuntoModal}
        onClose={() => setShowEliminarPuntoModal(false)}
        punto={puntoParaEliminar}
        onPuntoEliminado={handlePuntoEliminado}
      />
    </Layout>
  )
}
