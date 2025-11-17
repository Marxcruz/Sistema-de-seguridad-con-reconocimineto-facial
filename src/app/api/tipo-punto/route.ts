import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tipo-punto - Obtener todos los tipos de punto
export async function GET(request: NextRequest) {
  try {
    const tipos = await prisma.tipoPunto.findMany({
      orderBy: {
        nombre: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: tipos,
    })
  } catch (error) {
    console.error('Error al obtener tipos de punto:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
