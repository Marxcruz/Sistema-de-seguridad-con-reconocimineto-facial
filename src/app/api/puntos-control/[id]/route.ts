import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const actualizarPuntoControlSchema = z.object({
  zonaId: z.number().int().positive().optional(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  tipoId: z.number().int().positive().optional(),
  ubicacion: z.string().optional().nullable(),
  activo: z.boolean().optional(),
  cameraUrl: z.string().optional().nullable(),
  cameraUser: z.string().optional().nullable(),
  cameraPass: z.string().optional().nullable(),
  streamType: z.string().optional().nullable(),
})

// GET /api/puntos-control/[id] - Obtener detalle de un punto de control
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
          error: 'ID de punto de control inválido',
        },
        { status: 400 }
      )
    }

    const puntoControl = await prisma.puntoControl.findUnique({
      where: { id },
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
        accesos: {
          take: 10,
          orderBy: {
            creadoEn: 'desc',
          },
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
            decision: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    })

    if (!puntoControl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Punto de control no encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: puntoControl,
    })
  } catch (error) {
    console.error('Error al obtener punto de control:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// PUT /api/puntos-control/[id] - Actualizar punto de control
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de punto de control inválido',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = actualizarPuntoControlSchema.parse(body)

    // Verificar que el punto de control existe
    const puntoExistente = await prisma.puntoControl.findUnique({
      where: { id },
    })

    if (!puntoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Punto de control no encontrado',
        },
        { status: 404 }
      )
    }

    // Si se está cambiando la zona, verificar que existe
    if (validatedData.zonaId) {
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
    }

    // Si se está cambiando el tipo, verificar que existe
    if (validatedData.tipoId) {
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
    }

    // Actualizar punto de control
    const puntoActualizado = await prisma.puntoControl.update({
      where: { id },
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
      data: puntoActualizado,
      message: 'Punto de control actualizado exitosamente',
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

    console.error('Error al actualizar punto de control:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/puntos-control/[id] - Eliminar punto de control
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
          error: 'ID de punto de control inválido',
        },
        { status: 400 }
      )
    }

    // Verificar que el punto de control existe
    const puntoControl = await prisma.puntoControl.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            accesos: true,
            alertas: true,
          },
        },
      },
    })

    if (!puntoControl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Punto de control no encontrado',
        },
        { status: 404 }
      )
    }

    // Eliminar punto de control (las relaciones se manejan con CASCADE en la BD)
    await prisma.puntoControl.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Punto de control eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar punto de control:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
