import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const crearAccesoSchema = z.object({
  usuarioId: z.number().int().positive(),
  puntoId: z.number().int().positive(),
  score: z.number().min(0).max(1).optional(),
  decisionId: z.number().int().positive(),
  livenessOk: z.boolean().optional(),
  evidenciaId: z.number().int().positive().optional(),
})

// GET /api/accesos - Obtener accesos con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const usuarioId = searchParams.get('usuarioId')
    const puntoId = searchParams.get('puntoId')
    const decisionId = searchParams.get('decisionId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (usuarioId) {
      where.usuarioId = parseInt(usuarioId)
    }

    if (puntoId) {
      where.puntoId = parseInt(puntoId)
    }

    if (decisionId) {
      where.decisionId = parseInt(decisionId)
    }

    if (fechaInicio || fechaFin) {
      where.creadoEn = {}
      if (fechaInicio) {
        where.creadoEn.gte = new Date(fechaInicio)
      }
      if (fechaFin) {
        where.creadoEn.lte = new Date(fechaFin)
      }
    }

    const [accesos, total] = await Promise.all([
      prisma.acceso.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
            },
          },
          punto: {
            select: {
              id: true,
              nombre: true,
              zona: {
                select: {
                  nombre: true,
                },
              },
            },
          },
          decision: {
            select: {
              nombre: true,
            },
          },
          evidencia: {
            select: {
              path: true,
              mimeType: true,
            },
          },
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.acceso.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: accesos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error al obtener accesos:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// POST /api/accesos - Registrar nuevo acceso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = crearAccesoSchema.parse(body)

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: validatedData.usuarioId },
    })

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 400 }
      )
    }

    // Verificar que el punto de control existe
    const punto = await prisma.puntoControl.findUnique({
      where: { id: validatedData.puntoId },
    })

    if (!punto) {
      return NextResponse.json(
        {
          success: false,
          error: 'Punto de control no encontrado',
        },
        { status: 400 }
      )
    }

    // Crear el acceso
    const nuevoAcceso = await prisma.acceso.create({
      data: validatedData,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
          },
        },
        punto: {
          select: {
            id: true,
            nombre: true,
            zona: {
              select: {
                nombre: true,
              },
            },
          },
        },
        decision: {
          select: {
            nombre: true,
          },
        },
      },
    })

    // Actualizar último acceso del usuario si fue exitoso
    if (validatedData.decisionId === 1) { // Asumiendo que 1 = PERMITIDO
      await prisma.usuario.update({
        where: { id: validatedData.usuarioId },
        data: { ultimoAcceso: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      data: nuevoAcceso,
      message: 'Acceso registrado exitosamente',
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

    console.error('Error al registrar acceso:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
