'use client'

import { useState } from 'react'
import CameraCard from './CameraCard'
import CameraModal from './CameraModal'
import ConfigCamaraModal from '../zonas/ConfigCamaraModal'

interface Punto {
  id: number
  nombre: string
  cameraUrl: string | null
  streamType: string | null
}

interface CameraGridProps {
  puntos: Punto[]
  gridMode: '2x2' | '3x2' | '3x3' | '4x3'
  onRefresh: () => void
}

export default function CameraGrid({ puntos, gridMode, onRefresh }: CameraGridProps) {
  const [expandedCamera, setExpandedCamera] = useState<Punto | null>(null)
  const [configCamera, setConfigCamera] = useState<Punto | null>(null)
  const [hiddenCameraId, setHiddenCameraId] = useState<number | null>(null)

  const getGridClass = () => {
    switch (gridMode) {
      case '2x2':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
      case '3x2':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case '3x3':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case '4x3':
        return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  const handleExpand = (punto: Punto) => {
    if (punto.cameraUrl) {
      setHiddenCameraId(punto.id) // Ocultar cámara del grid
      setExpandedCamera(punto)
    }
  }

  const handleCloseExpanded = () => {
    setExpandedCamera(null)
    setHiddenCameraId(null) // Mostrar cámara de nuevo en grid
  }

  const handleConfigure = (punto: Punto) => {
    setConfigCamera(punto)
  }

  const handleConfigSave = () => {
    setConfigCamera(null)
    onRefresh()
  }

  return (
    <>
      <div className={`grid ${getGridClass()} gap-4`}>
        {puntos.map((punto) => (
          <CameraCard
            key={punto.id}
            puntoId={punto.id}
            nombre={punto.nombre}
            cameraUrl={punto.cameraUrl}
            streamType={punto.streamType}
            isHidden={hiddenCameraId === punto.id}
            onExpand={() => handleExpand(punto)}
            onConfigure={() => handleConfigure(punto)}
          />
        ))}
      </div>

      {/* Modal para ampliar cámara */}
      {expandedCamera && expandedCamera.cameraUrl && (
        <CameraModal
          nombre={expandedCamera.nombre}
          cameraUrl={expandedCamera.cameraUrl}
          streamType={expandedCamera.streamType || 'HTTP'}
          onClose={handleCloseExpanded}
        />
      )}

      {/* Modal de configuración */}
      {configCamera && (
        <ConfigCamaraModal
          puntoId={configCamera.id}
          puntoNombre={configCamera.nombre}
          onClose={() => setConfigCamera(null)}
          onSave={handleConfigSave}
        />
      )}
    </>
  )
}
