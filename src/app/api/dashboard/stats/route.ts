import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/stats - Obtener estadísticas del dashboard
export async function GET() {
  try {
    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const finHoy = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000)

    // Estadísticas básicas
    const [
      accesosHoy,
      alertasHoy,
      usuariosActivos,
      puntosActivos,
      totalUsuarios,
      totalAccesos,
    ] = await Promise.all([
      prisma.acceso.count({
        where: {
          creadoEn: {
            gte: inicioHoy,
            lt: finHoy,
          },
        },
      }),
      prisma.alerta.count({
        where: {
          creadoEn: {
            gte: inicioHoy,
            lt: finHoy,
          },
        },
      }),
      prisma.usuario.count({
        where: { activo: true },
      }),
      prisma.puntoControl.count({
        where: { activo: true },
      }),
      prisma.usuario.count(),
      prisma.acceso.count(),
    ])

    // Accesos por hora (últimas 24 horas)
    const accesosPorHora = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM creado_en) as hora,
        COUNT(*) as accesos
      FROM accesos 
      WHERE creado_en >= ${inicioHoy}
      GROUP BY EXTRACT(HOUR FROM creado_en)
      ORDER BY hora
    `

    // Alertas por tipo (último mes)
    // CORREGIDO: Usar Date.UTC para evitar problemas de zona horaria
    const inicioMes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1))
    
    console.log('🔍 DEBUG Alertas por Tipo:')
    console.log('  Fecha inicio mes:', inicioMes.toISOString())
    console.log('  Fecha hoy:', hoy.toISOString())
    
    const alertasPorTipo = await prisma.alerta.groupBy({
      by: ['tipoId'],
      where: {
        creadoEn: {
          gte: inicioMes,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    })
    
    console.log('  Alertas encontradas:', alertasPorTipo.length)
    console.log('  Datos:', JSON.stringify(alertasPorTipo, null, 2))

    // Obtener nombres de tipos de alerta
    const tiposAlerta = await prisma.tipoAlerta.findMany()
    const alertasConNombres = alertasPorTipo.map(alerta => ({
      tipo: tiposAlerta.find(t => t.id === alerta.tipoId)?.nombre || 'Desconocido',
      cantidad: alerta._count.id,
    }))

    // Top usuarios por accesos (último mes)
    const topUsuarios = await prisma.acceso.groupBy({
      by: ['usuarioId'],
      where: {
        creadoEn: {
          gte: inicioMes,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    })

    // Obtener nombres de usuarios
    const usuariosInfo = await prisma.usuario.findMany({
      where: {
        id: {
          in: topUsuarios.map(u => u.usuarioId),
        },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
      },
    })

    const topUsuariosConNombres = topUsuarios.map(usuario => {
      const info = usuariosInfo.find(u => u.id === usuario.usuarioId)
      return {
        usuario: info ? `${info.nombre} ${info.apellido || ''}`.trim() : 'Desconocido',
        accesos: usuario._count.id,
      }
    })

    // Accesos por decisión (hoy)
    const accesosPorDecision = await prisma.acceso.groupBy({
      by: ['decisionId'],
      where: {
        creadoEn: {
          gte: inicioHoy,
          lt: finHoy,
        },
      },
      _count: {
        id: true,
      },
    })

    const tiposDecision = await prisma.tipoDecision.findMany()
    const decisionesConNombres = accesosPorDecision.map(decision => ({
      decision: tiposDecision.find(t => t.id === decision.decisionId)?.nombre || 'Desconocido',
      cantidad: decision._count.id,
    }))

    return NextResponse.json({
      success: true,
      data: {
        resumen: {
          accesosHoy,
          alertasHoy,
          usuariosActivos,
          puntosActivos,
          totalUsuarios,
          totalAccesos,
        },
        accesosPorHora: Array.from({ length: 24 }, (_, i) => {
          const acceso = (accesosPorHora as any[]).find(a => Number(a.hora) === i)
          return {
            hora: `${i.toString().padStart(2, '0')}:00`,
            accesos: acceso ? Number(acceso.accesos) : 0,
          }
        }),
        alertasPorTipo: alertasConNombres,
        topUsuarios: topUsuariosConNombres,
        accesosPorDecision: decisionesConNombres,
      },
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
