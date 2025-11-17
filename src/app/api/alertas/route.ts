import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const crearAlertaSchema = z.object({
  tipoId: z.number().int().positive(),
  detalle: z.string().optional(),
  puntoId: z.number().int().positive().optional(),
  evidenciaId: z.number().int().positive().optional(),
})

// GET /api/alertas - Obtener alertas con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const tipoId = searchParams.get('tipoId')
    const puntoId = searchParams.get('puntoId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (tipoId) {
      where.tipoId = parseInt(tipoId)
    }

    if (puntoId) {
      where.puntoId = parseInt(puntoId)
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

    const [alertas, total] = await Promise.all([
      prisma.alerta.findMany({
        where,
        include: {
          tipo: {
            select: {
              nombre: true,
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
          evidencia: {
            select: {
              id: true,
              path: true,
              mimeType: true,
              tamanoBytes: true,
            },
          },
          notificaciones: {
            select: {
              id: true,
              estado: true,
              canal: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.alerta.count({ where }),
    ])

    // Convertir BigInt a Number para serialización JSON
    const alertasSerializables = alertas.map(alerta => ({
      ...alerta,
      evidencia: alerta.evidencia ? {
        ...alerta.evidencia,
        tamanoBytes: alerta.evidencia.tamanoBytes ? Number(alerta.evidencia.tamanoBytes) : null,
      } : null,
    }))

    return NextResponse.json({
      success: true,
      data: alertasSerializables,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error al obtener alertas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// POST /api/alertas - Crear nueva alerta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = crearAlertaSchema.parse(body)

    // Verificar que el tipo de alerta existe
    const tipoAlerta = await prisma.tipoAlerta.findUnique({
      where: { id: validatedData.tipoId },
    })

    if (!tipoAlerta) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tipo de alerta no encontrado',
        },
        { status: 400 }
      )
    }

    // Crear la alerta
    const nuevaAlerta = await prisma.alerta.create({
      data: validatedData,
      include: {
        tipo: {
          select: {
            nombre: true,
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
      },
    })

    // Crear notificaciones automáticas
    await crearNotificacionesAutomaticas(nuevaAlerta.id, tipoAlerta.nombre)

    return NextResponse.json({
      success: true,
      data: nuevaAlerta,
      message: 'Alerta creada exitosamente',
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

    console.error('Error al crear alerta:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

async function crearNotificacionesAutomaticas(alertaId: number, tipoAlerta: string) {
  try {
    // Obtener canales de notificación activos
    const canales = await prisma.canalNotificacion.findMany()
    
    // Crear notificaciones para cada canal
    for (const canal of canales) {
      let destino = ''
      
      switch (canal.nombre.toLowerCase()) {
        case 'email':
          destino = 'admin@sistema.com' // Configurar según necesidades
          break
        case 'telegram':
          destino = process.env.TELEGRAM_CHAT_ID || ''
          break
        case 'sistema interno':
          destino = 'dashboard'
          break
        default:
          continue
      }

      if (destino) {
        await prisma.notificacion.create({
          data: {
            alertaId,
            canalId: canal.id,
            destino,
            estado: 'PENDIENTE',
          },
        })
      }
    }
  } catch (error) {
    console.error('Error creando notificaciones automáticas:', error)
  }
}
