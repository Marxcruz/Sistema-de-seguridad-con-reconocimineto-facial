import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'no_leidas'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Consultar alertas recientes con información relacionada
    const alertas = await prisma.alerta.findMany({
      take: limit,
      orderBy: {
        creadoEn: 'desc'
      },
      include: {
        tipo: true,
        punto: true,
        evidencia: true,
        notificaciones: {
          include: {
            canal: true
          }
        }
      }
    })

    // Transformar alertas a formato de notificaciones
    const notifications = alertas.map(alerta => {
      // Determinar prioridad basada en el tipo de alerta
      let prioridad: 'alta' | 'media' | 'baja' = 'media'
      const tipoNombre = alerta.tipo.nombre.toLowerCase()
      
      if (tipoNombre.includes('no_autorizado') || 
          tipoNombre.includes('suplantacion') ||
          tipoNombre.includes('intrusion')) {
        prioridad = 'alta'
      } else if (tipoNombre.includes('liveness') || 
                 tipoNombre.includes('denegado')) {
        prioridad = 'media'
      } else {
        prioridad = 'baja'
      }

      // Verificar si la notificación ha sido "leída" (estado 'enviada')
      const leida = alerta.notificaciones.some(n => n.estado === 'enviada')

      return {
        id: alerta.id,
        tipo: alerta.tipo.nombre,
        detalle: alerta.detalle || 'Sin detalles adicionales',
        creadoEn: alerta.creadoEn.toISOString(),
        puntoNombre: alerta.punto?.nombre,
        leida: leida,
        prioridad: prioridad
      }
    })

    // Filtrar según el parámetro
    const filteredNotifications = filter === 'no_leidas' 
      ? notifications.filter(n => !n.leida)
      : notifications

    // Contar no leídas
    const unreadCount = notifications.filter(n => !n.leida).length

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      unreadCount: unreadCount,
      total: notifications.length
    })

  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener notificaciones',
        notifications: [],
        unreadCount: 0,
        total: 0
      },
      { status: 500 }
    )
  }
}
