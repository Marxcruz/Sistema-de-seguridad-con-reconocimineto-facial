import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const crearReglaSchema = z.object({
  usuarioId: z.number().int().positive('Usuario ID debe ser un número positivo'),
  zonaId: z.number().int().positive('Zona ID debe ser un número positivo'),
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  horaFin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  diaSemana: z.number().int().min(0).max(6).nullable().optional(), // 0=Domingo, 6=Sábado, null=Todos
  activo: z.boolean().default(true),
})

// GET /api/reglas-acceso - Obtener reglas de acceso (filtrado opcional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get('usuarioId')
    const zonaId = searchParams.get('zonaId')
    const activo = searchParams.get('activo')

    // Construir filtros dinámicamente
    const where: any = {}
    if (usuarioId) where.usuarioId = parseInt(usuarioId)
    if (zonaId) where.zonaId = parseInt(zonaId)
    if (activo !== null) where.activo = activo === 'true'

    const reglas = await prisma.reglaAcceso.findMany({
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
        zona: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
      },
      orderBy: [
        { usuarioId: 'asc' },
        { zonaId: 'asc' },
        { diaSemana: 'asc' },
      ],
    })

    // Formatear horarios para presentación
    const reglasFormateadas = reglas.map((regla) => ({
      ...regla,
      horaInicio: regla.horaInicio.toISOString().substring(11, 16), // HH:MM
      horaFin: regla.horaFin.toISOString().substring(11, 16), // HH:MM
      diaNombre: regla.diaSemana !== null ? 
        ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][regla.diaSemana] : 
        'Todos los días',
    }))

    return NextResponse.json({
      success: true,
      data: reglasFormateadas,
      count: reglasFormateadas.length,
    })
  } catch (error) {
    console.error('Error al obtener reglas de acceso:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// POST /api/reglas-acceso - Crear nueva regla de acceso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = crearReglaSchema.parse(body)

    // Verificar que el usuario existe y está activo
    const usuario = await prisma.usuario.findUnique({
      where: { id: validatedData.usuarioId },
    })

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          error: 'El usuario especificado no existe',
        },
        { status: 404 }
      )
    }

    if (!usuario.activo) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se pueden asignar zonas a un usuario inactivo',
        },
        { status: 400 }
      )
    }

    // Verificar que la zona existe y está activa
    const zona = await prisma.zona.findUnique({
      where: { id: validatedData.zonaId },
    })

    if (!zona) {
      return NextResponse.json(
        {
          success: false,
          error: 'La zona especificada no existe',
        },
        { status: 404 }
      )
    }

    if (!zona.activo) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se pueden asignar usuarios a una zona inactiva',
        },
        { status: 400 }
      )
    }

    // Verificar que no exista una regla duplicada (mismo usuario, zona, día)
    const reglaExistente = await prisma.reglaAcceso.findFirst({
      where: {
        usuarioId: validatedData.usuarioId,
        zonaId: validatedData.zonaId,
        diaSemana: validatedData.diaSemana || null,
      },
    })

    if (reglaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: `Ya existe una regla para este usuario en esta zona${validatedData.diaSemana !== undefined ? ' en este día' : ''}`,
        },
        { status: 400 }
      )
    }

    // Validar que hora inicio sea menor que hora fin
    const [horaInicioH, horaInicioM] = validatedData.horaInicio.split(':').map(Number)
    const [horaFinH, horaFinM] = validatedData.horaFin.split(':').map(Number)
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

    // Crear las fechas con la hora especificada (usando fecha ficticia para tipo Time)
    const baseDate = '1970-01-01'
    const horaInicioDate = new Date(`${baseDate}T${validatedData.horaInicio}:00.000Z`)
    const horaFinDate = new Date(`${baseDate}T${validatedData.horaFin}:00.000Z`)

    // Crear regla de acceso
    const nuevaRegla = await prisma.reglaAcceso.create({
      data: {
        usuarioId: validatedData.usuarioId,
        zonaId: validatedData.zonaId,
        horaInicio: horaInicioDate,
        horaFin: horaFinDate,
        diaSemana: validatedData.diaSemana || null,
        activo: validatedData.activo,
      },
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
        registroId: BigInt(nuevaRegla.id),
        accion: 'CREATE',
        valorNuevo: JSON.stringify(nuevaRegla),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...nuevaRegla,
        horaInicio: validatedData.horaInicio,
        horaFin: validatedData.horaFin,
      },
      message: `Regla de acceso creada: ${nuevaRegla.usuario.nombre} puede acceder a ${nuevaRegla.zona.nombre}`,
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

    console.error('Error al crear regla de acceso:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
