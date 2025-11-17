import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/alertas/[id] - Eliminar una alerta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertaId = parseInt(params.id)

    if (isNaN(alertaId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de alerta inválido',
        },
        { status: 400 }
      )
    }

    // Verificar que la alerta existe
    const alerta = await prisma.alerta.findUnique({
      where: { id: alertaId },
    })

    if (!alerta) {
      return NextResponse.json(
        {
          success: false,
          error: 'Alerta no encontrada',
        },
        { status: 404 }
      )
    }

    // Eliminar notificaciones asociadas primero (por la relación)
    await prisma.notificacion.deleteMany({
      where: { alertaId },
    })

    // Eliminar la alerta
    await prisma.alerta.delete({
      where: { id: alertaId },
    })

    return NextResponse.json({
      success: true,
      message: 'Alerta eliminada correctamente',
    })
  } catch (error) {
    console.error('Error al eliminar alerta:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
