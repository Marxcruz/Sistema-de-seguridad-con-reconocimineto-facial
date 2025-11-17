import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const actualizarReglaSchema = z.object({
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  horaFin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  diaSemana: z.number().int().min(0).max(6).nullable().optional(),
  activo: z.boolean().optional(),
})

// GET /api/reglas-acceso/[id] - Obtener regla específica
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
          error: 'ID de regla inválido',
        },
        { status: 400 }
      )
    }

    const regla = await prisma.reglaAcceso.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            documento: true,
            email: true,
          },
        },
        zona: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            activo: true,
          },
        },
      },
    })

    if (!regla) {
      return NextResponse.json(
        {
          success: false,
          error: 'Regla de acceso no encontrada',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...regla,
        horaInicio: regla.horaInicio.toISOString().substring(11, 16),
        horaFin: regla.horaFin.toISOString().substring(11, 16),
        diaNombre: regla.diaSemana !== null ? 
          ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][regla.diaSemana] : 
          'Todos los días',
      },
    })
  } catch (error) {
    console.error('Error al obtener regla de acceso:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// PUT /api/reglas-acceso/[id] - Actualizar regla de acceso
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
          error: 'ID de regla inválido',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = actualizarReglaSchema.parse(body)

    // Verificar que la regla existe
    const reglaExistente = await prisma.reglaAcceso.findUnique({
      where: { id },
      include: {
        usuario: true,
        zona: true,
      },
    })

    if (!reglaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Regla de acceso no encontrada',
        },
        { status: 404 }
      )
    }

    // Validar horarios si se están actualizando
    if (validatedData.horaInicio || validatedData.horaFin) {
      const horaInicio = validatedData.horaInicio || reglaExistente.horaInicio.toISOString().substring(11, 16)
      const horaFin = validatedData.horaFin || reglaExistente.horaFin.toISOString().substring(11, 16)

      const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number)
      const [horaFinH, horaFinM] = horaFin.split(':').map(Number)
      const minutosInicio = horaInicioH * 60 + horaInicioM
      const minutosFin = horaFinH * 60 + horaFinM

      if (minutosInicio >= minutosFin) {
        return NextResponse.json(
          {
            success: false,
            error: 'La hora de inicio debe ser menor que la hora de fin',
          },
          { status: 400 }
        )
      }
    }

    // Preparar datos para actualización
    const updateData: any = {}
    
    if (validatedData.horaInicio) {
      const baseDate = '1970-01-01'
      updateData.horaInicio = new Date(`${baseDate}T${validatedData.horaInicio}:00.000Z`)
    }
    
    if (validatedData.horaFin) {
      const baseDate = '1970-01-01'
      updateData.horaFin = new Date(`${baseDate}T${validatedData.horaFin}:00.000Z`)
    }
    
    if (validatedData.diaSemana !== undefined) {
      updateData.diaSemana = validatedData.diaSemana
    }
    
    if (validatedData.activo !== undefined) {
      updateData.activo = validatedData.activo
    }

    // Actualizar regla
    const reglaActualizada = await prisma.reglaAcceso.update({
      where: { id },
      data: updateData,
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        zona: {
          select: {
            nombre: true,
          },
        },
      },
    })

    // Registrar en auditoría
    await prisma.logAuditoria.create({
      data: {
        tablaAfectada: 'reglas_acceso',
        registroId: BigInt(id),
        accion: 'UPDATE',
        valorAnterior: JSON.stringify(reglaExistente),
        valorNuevo: JSON.stringify(reglaActualizada),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...reglaActualizada,
        horaInicio: reglaActualizada.horaInicio.toISOString().substring(11, 16),
        horaFin: reglaActualizada.horaFin.toISOString().substring(11, 16),
      },
      message: 'Regla de acceso actualizada exitosamente',
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

    console.error('Error al actualizar regla de acceso:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/reglas-acceso/[id] - Eliminar regla de acceso
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
          error: 'ID de regla inválido',
        },
        { status: 400 }
      )
    }

    // Verificar que la regla existe
    const reglaExistente = await prisma.reglaAcceso.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        zona: {
          select: {
            nombre: true,
          },
        },
      },
    })

    if (!reglaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Regla de acceso no encontrada',
        },
        { status: 404 }
      )
    }

    // Registrar en auditoría ANTES de eliminar
    await prisma.logAuditoria.create({
      data: {
        tablaAfectada: 'reglas_acceso',
        registroId: BigInt(id),
        accion: 'DELETE',
        valorAnterior: JSON.stringify(reglaExistente),
        valorNuevo: null,
      },
    })

    // Eliminar regla
    await prisma.reglaAcceso.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Regla de acceso eliminada: ${reglaExistente.usuario.nombre} - ${reglaExistente.zona.nombre}`,
    })
  } catch (error) {
    console.error('Error al eliminar regla de acceso:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
