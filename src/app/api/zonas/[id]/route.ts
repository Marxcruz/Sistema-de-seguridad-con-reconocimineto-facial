import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const actualizarZonaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
})

// PUT /api/zonas/[id] - Actualizar zona
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const zonaId = parseInt(params.id)

    if (isNaN(zonaId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de zona inválido',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = actualizarZonaSchema.parse(body)

    // Verificar que la zona existe
    const zonaExistente = await prisma.zona.findUnique({
      where: { id: zonaId },
    })

    if (!zonaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zona no encontrada',
        },
        { status: 404 }
      )
    }

    // Verificar unicidad del nombre (excluyendo la zona actual)
    if (validatedData.nombre !== zonaExistente.nombre) {
      const zonaConMismoNombre = await prisma.zona.findUnique({
        where: { nombre: validatedData.nombre },
      })

      if (zonaConMismoNombre) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya existe una zona con este nombre',
          },
          { status: 400 }
        )
      }
    }

    // Actualizar zona
    const zonaActualizada = await prisma.zona.update({
      where: { id: zonaId },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: zonaActualizada,
      message: 'Zona actualizada exitosamente',
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

    console.error('Error al actualizar zona:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/zonas/[id] - Eliminar zona
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const zonaId = parseInt(params.id)

    if (isNaN(zonaId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de zona inválido',
        },
        { status: 400 }
      )
    }

    // Verificar que la zona existe
    const zonaExistente = await prisma.zona.findUnique({
      where: { id: zonaId },
      include: {
        _count: {
          select: {
            puntosControl: true,
            reglasAcceso: true,
          },
        },
      },
    })

    if (!zonaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zona no encontrada',
        },
        { status: 404 }
      )
    }

    // Eliminar en orden correcto (dependencias primero)
    await prisma.$transaction(async (tx) => {
      // 1. Eliminar reglas de acceso relacionadas
      await tx.reglaAcceso.deleteMany({
        where: { zonaId: zonaId },
      })

      // 2. Eliminar accesos de puntos de control de esta zona
      const puntosControl = await tx.puntoControl.findMany({
        where: { zonaId: zonaId },
        select: { id: true },
      })

      if (puntosControl.length > 0) {
        const puntosIds = puntosControl.map(p => p.id)
        
        // Eliminar acceso_rostros primero
        await tx.accesoRostro.deleteMany({
          where: {
            acceso: {
              puntoId: { in: puntosIds }
            }
          }
        })

        // Eliminar accesos
        await tx.acceso.deleteMany({
          where: { puntoId: { in: puntosIds } },
        })
      }

      // 3. Eliminar puntos de control
      await tx.puntoControl.deleteMany({
        where: { zonaId: zonaId },
      })

      // 4. Finalmente eliminar la zona
      await tx.zona.delete({
        where: { id: zonaId },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Zona eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar zona:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
