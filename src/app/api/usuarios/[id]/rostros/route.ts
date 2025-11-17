import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/usuarios/[id]/rostros - Obtener rostros de un usuario
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de usuario inválido',
        },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    })

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      )
    }

    // Obtener rostros del usuario
    const rostros = await prisma.rostro.findMany({
      where: { usuarioId: id },
      select: {
        id: true,
        calidad: true,
        creadoEn: true,
        modelo: {
          select: {
            nombre: true,
            version: true,
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: rostros,
    })
  } catch (error) {
    console.error('Error al obtener rostros:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
