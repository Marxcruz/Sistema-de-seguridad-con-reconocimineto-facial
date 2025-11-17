import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura') as any
        
        // Registrar logout en auditoría
        await prisma.logAuditoria.create({
          data: {
            tablaAfectada: 'usuarios',
            campoAfectado: 'sesion',
            registroId: BigInt(decoded.userId),
            accion: 'LOGOUT',
            usuarioId: decoded.userId,
            valorAnterior: 'activo',
            valorNuevo: 'desconectado'
          }
        })
      } catch (error) {
        // Token inválido, pero aún así procesamos el logout
        console.log('Token inválido en logout:', error)
      }
    }

    return NextResponse.json({
      message: 'Logout exitoso'
    })

  } catch (error) {
    console.error('Error en logout:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
