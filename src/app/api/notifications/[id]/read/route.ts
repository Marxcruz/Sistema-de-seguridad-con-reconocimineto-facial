import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertaId = parseInt(params.id)

    if (isNaN(alertaId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar si la alerta existe
    const alerta = await prisma.alerta.findUnique({
      where: { id: alertaId },
      include: {
        notificaciones: true
      }
    })

    if (!alerta) {
      return NextResponse.json(
        { success: false, error: 'Alerta no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar todas las notificaciones relacionadas a estado 'enviada'
    await prisma.notificacion.updateMany({
      where: {
        alertaId: alertaId,
        estado: { not: 'enviada' }
      },
      data: {
        estado: 'enviada'
      }
    })

    // Si no hay notificaciones, crear una para marcar como leída
    if (alerta.notificaciones.length === 0) {
      await prisma.notificacion.create({
        data: {
          alertaId: alertaId,
          canalId: 1, // Canal "Sistema" por defecto
          destino: 'sistema',
          estado: 'enviada'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Notificación marcada como leída'
    })

  } catch (error) {
    console.error('Error al marcar notificación como leída:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar notificación' },
      { status: 500 }
    )
  }
}
