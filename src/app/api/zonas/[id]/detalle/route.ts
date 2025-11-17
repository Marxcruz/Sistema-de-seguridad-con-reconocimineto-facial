import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/zonas/[id]/detalle - Obtener detalles completos de zona
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

    // Obtener información completa de la zona
    const zona = await prisma.zona.findUnique({
      where: { id: zonaId },
      include: {
        puntosControl: {
          include: {
            tipo: {
              select: { nombre: true },
            },
            _count: {
              select: { accesos: true },
            },
          },
        },
        _count: {
          select: {
            puntosControl: true,
            reglasAcceso: true,
          },
        },
      },
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

    // Obtener estadísticas adicionales
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay())

    // Obtener puntos de control IDs para consultas
    const puntosControlIds = zona.puntosControl.map(p => p.id)

    // Estadísticas de accesos
    const [accesosHoy, accesosEstaSemana, usuariosUnicos, alertasRecientes] = await Promise.all([
      // Accesos hoy
      puntosControlIds.length > 0 ? prisma.acceso.count({
        where: {
          puntoId: { in: puntosControlIds },
          creadoEn: { gte: hoy },
        },
      }) : 0,

      // Accesos esta semana
      puntosControlIds.length > 0 ? prisma.acceso.count({
        where: {
          puntoId: { in: puntosControlIds },
          creadoEn: { gte: inicioSemana },
        },
      }) : 0,

      // Usuarios únicos
      puntosControlIds.length > 0 ? prisma.acceso.findMany({
        where: {
          puntoId: { in: puntosControlIds },
          creadoEn: { gte: inicioSemana },
        },
        select: { usuarioId: true },
        distinct: ['usuarioId'],
      }).then(result => result.length) : 0,

      // Alertas recientes (últimos 7 días)
      puntosControlIds.length > 0 ? prisma.alerta.count({
        where: {
          puntoId: { in: puntosControlIds },
          creadoEn: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }) : 0,
    ])

    // Últimos accesos
    const ultimosAccesos = puntosControlIds.length > 0 ? await prisma.acceso.findMany({
      where: {
        puntoId: { in: puntosControlIds },
      },
      include: {
        usuario: {
          select: { nombre: true, apellido: true },
        },
        punto: {
          select: { nombre: true },
        },
        decision: {
          select: { nombre: true },
        },
      },
      orderBy: { creadoEn: 'desc' },
      take: 10,
    }) : []

    // Contar accesos y alertas totales
    const [totalAccesos, totalAlertas] = await Promise.all([
      puntosControlIds.length > 0 ? prisma.acceso.count({
        where: { puntoId: { in: puntosControlIds } },
      }) : 0,
      puntosControlIds.length > 0 ? prisma.alerta.count({
        where: { puntoId: { in: puntosControlIds } },
      }) : 0,
    ])

    const zonaDetalle = {
      ...zona,
      estadisticas: {
        accesosHoy,
        accesosEstaSemana,
        usuariosUnicos,
        alertasRecientes,
      },
      ultimosAccesos,
      _count: {
        ...zona._count,
        accesos: totalAccesos,
        alertas: totalAlertas,
      },
    }

    return NextResponse.json({
      success: true,
      data: zonaDetalle,
    })
  } catch (error) {
    console.error('Error al obtener detalles de zona:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
