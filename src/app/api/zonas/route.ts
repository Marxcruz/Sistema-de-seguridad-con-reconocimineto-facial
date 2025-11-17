import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const crearZonaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
})

// GET /api/zonas - Obtener todas las zonas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includePoints = searchParams.get('includePoints') === 'true'

    const zonas = await prisma.zona.findMany({
      include: {
        puntosControl: includePoints ? {
          include: {
            tipo: {
              select: {
                nombre: true,
              },
            },
            _count: {
              select: {
                accesos: true,
              },
            },
          },
        } : false,
        _count: {
          select: {
            puntosControl: true,
            reglasAcceso: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: zonas,
    })
  } catch (error) {
    console.error('Error al obtener zonas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// POST /api/zonas - Crear nueva zona
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = crearZonaSchema.parse(body)

    // Verificar unicidad del nombre
    const zonaExistente = await prisma.zona.findUnique({
      where: { nombre: validatedData.nombre },
    })

    if (zonaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ya existe una zona con este nombre',
        },
        { status: 400 }
      )
    }

    // Crear zona
    const nuevaZona = await prisma.zona.create({
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: nuevaZona,
      message: 'Zona creada exitosamente',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de entrada inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Error al crear zona:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
