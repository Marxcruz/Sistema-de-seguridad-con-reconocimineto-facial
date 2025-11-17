import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/usuarios/rostros/[id] - Eliminar un rostro específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de rostro inválido',
        },
        { status: 400 }
      )
    }

    // Verificar que el rostro existe
    const rostro = await prisma.rostro.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    if (!rostro) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rostro no encontrado',
        },
        { status: 404 }
      )
    }

    // Eliminar el rostro
    await prisma.rostro.delete({
      where: { id },
    })

    // Registrar en auditoría
    await prisma.logAuditoria.create({
      data: {
        tablaAfectada: 'rostros',
        registroId: BigInt(id),
        accion: 'DELETE',
        usuarioId: rostro.usuarioId,
        valorAnterior: JSON.stringify({
          id: rostro.id,
          usuarioId: rostro.usuarioId,
          calidad: rostro.calidad,
        }),
        valorNuevo: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Rostro eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar rostro:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
