import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Obtener todas las alertas recientes (últimas 100)
    const alertasRecientes = await prisma.alerta.findMany({
      take: 100,
      orderBy: {
        creadoEn: 'desc'
      },
      select: {
        id: true
      }
    })

    const alertaIds = alertasRecientes.map(a => a.id)

    // Actualizar todas las notificaciones relacionadas
    const updateResult = await prisma.notificacion.updateMany({
      where: {
        alertaId: { in: alertaIds },
        estado: { not: 'enviada' }
      },
      data: {
        estado: 'enviada'
      }
    })

    // Para alertas sin notificaciones, crear una notificación "leída"
    const alertasConNotificaciones = await prisma.alerta.findMany({
      where: {
        id: { in: alertaIds }
      },
      include: {
        notificaciones: true
      }
    })

    const alertasSinNotificaciones = alertasConNotificaciones
      .filter(a => a.notificaciones.length === 0)
      .map(a => a.id)

    if (alertasSinNotificaciones.length > 0) {
      await prisma.notificacion.createMany({
        data: alertasSinNotificaciones.map(alertaId => ({
          alertaId: alertaId,
          canalId: 1, // Canal "Sistema"
          destino: 'sistema',
          estado: 'enviada'
        }))
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      updated: updateResult.count + alertasSinNotificaciones.length
    })

  } catch (error) {
    console.error('Error al marcar todas como leídas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar notificaciones' },
      { status: 500 }
    )
  }
}
