import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/roles - Obtener todos los roles
export async function GET() {
  try {
    const roles = await prisma.rol.findMany({
      orderBy: {
        nombre: 'asc',
      },
      include: {
        _count: {
          select: {
            usuarios: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: roles,
    })
  } catch (error) {
    console.error('Error al obtener roles:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
