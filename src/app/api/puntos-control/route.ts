import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const crearPuntoControlSchema = z.object({
  zonaId: z.number().int().positive(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  tipoId: z.number().int().positive(),
  ubicacion: z.string().optional(),
  activo: z.boolean().default(true),
})

// GET /api/puntos-control - Obtener todos los puntos de control
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zonaId = searchParams.get('zonaId')

    const where: any = {}
    if (zonaId) {
      where.zonaId = parseInt(zonaId)
    }

    const puntosControl = await prisma.puntoControl.findMany({
      where,
      include: {
        zona: {
          select: {
            id: true,
            nombre: true,
          },
        },
        tipo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        _count: {
          select: {
            accesos: true,
            alertas: true,
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: puntosControl,
    })
  } catch (error) {
    console.error('Error al obtener puntos de control:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// POST /api/puntos-control - Crear nuevo punto de control
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = crearPuntoControlSchema.parse(body)

    // Verificar que la zona existe
    const zona = await prisma.zona.findUnique({
      where: { id: validatedData.zonaId },
    })

    if (!zona) {
      return NextResponse.json(
        {
          success: false,
          error: 'La zona especificada no existe',
        },
        { status: 400 }
      )
    }

    // Verificar que el tipo existe
    const tipo = await prisma.tipoPunto.findUnique({
      where: { id: validatedData.tipoId },
    })

    if (!tipo) {
      return NextResponse.json(
        {
          success: false,
          error: 'El tipo de punto especificado no existe',
        },
        { status: 400 }
      )
    }

    // Crear punto de control
    const nuevoPunto = await prisma.puntoControl.create({
      data: validatedData,
      include: {
        zona: {
          select: {
            nombre: true,
          },
        },
        tipo: {
          select: {
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: nuevoPunto,
      message: 'Punto de control creado exitosamente',
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

    console.error('Error al crear punto de control:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
