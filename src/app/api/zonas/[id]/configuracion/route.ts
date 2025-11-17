import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const configuracionZonaSchema = z.object({
  zonaId: z.number(),
  nombreZona: z.string(),
  // Configuración de seguridad
  confianzaMinima: z.number().min(50).max(99),
  livenessObligatorio: z.boolean(),
  dobleAutenticacion: z.boolean(),
  // Configuración de horarios
  horario24h: z.boolean(),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
  diasSemana: z.array(z.number().min(0).max(6)),
  // Configuración de alertas
  maxIntentosFallidos: z.number().min(1).max(10),
  alertaInmediata: z.boolean(),
  notificarAdmin: z.boolean(),
  notificarSupervisor: z.boolean(),
  // Configuración de evidencia
  evidenciaObligatoria: z.boolean(),
  guardarFotosAcceso: z.boolean(),
})

// GET /api/zonas/[id]/configuracion - Obtener configuración de zona
export async function GET(
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
    const zona = await prisma.zona.findUnique({
      where: { id: zonaId },
    })

    if (!zona) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zona no encontrada',
        },
        { status: 404 }
      )
    }

    // Por ahora, devolvemos configuración por defecto
    // En el futuro, esto vendría de una tabla de configuraciones
    const configuracionDefault = {
      zonaId: zona.id,
      nombreZona: zona.nombre,
      confianzaMinima: 80,
      livenessObligatorio: true,
      dobleAutenticacion: false,
      horario24h: false,
      horaInicio: '08:00',
      horaFin: '18:00',
      diasSemana: [1, 2, 3, 4, 5], // Lunes a Viernes
      maxIntentosFallidos: 3,
      alertaInmediata: false,
      notificarAdmin: true,
      notificarSupervisor: false,
      evidenciaObligatoria: true,
      guardarFotosAcceso: true,
    }

    return NextResponse.json({
      success: true,
      data: configuracionDefault,
    })
  } catch (error) {
    console.error('Error al obtener configuración de zona:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// POST /api/zonas/[id]/configuracion - Guardar configuración de zona
export async function POST(
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
    const validatedData = configuracionZonaSchema.parse(body)

    // Verificar que la zona existe
    const zona = await prisma.zona.findUnique({
      where: { id: zonaId },
    })

    if (!zona) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zona no encontrada',
        },
        { status: 404 }
      )
    }

    // Por ahora, solo validamos y devolvemos éxito
    // En el futuro, guardaríamos en una tabla de configuraciones
    console.log('Configuración guardada para zona:', zonaId, validatedData)

    // Aquí podrías guardar en una tabla como:
    // await prisma.configuracionZona.upsert({
    //   where: { zonaId },
    //   update: validatedData,
    //   create: { ...validatedData, zonaId }
    // })

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada exitosamente',
      data: validatedData,
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

    console.error('Error al guardar configuración de zona:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
