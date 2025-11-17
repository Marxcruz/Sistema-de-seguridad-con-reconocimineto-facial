import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const usuario = await prisma.usuario.findFirst({
      where: { 
        email: email.toLowerCase(),
        activo: true 
      },
      include: {
        rol: true
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verificar contraseña hasheada
    if (!usuario.password) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, usuario.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        rol: usuario.rol.nombre 
      },
      process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura',
      { expiresIn: '24h' }
    )

    // Registrar login en auditoría
    await prisma.logAuditoria.create({
      data: {
        usuarioId: usuario.id,
        accion: 'LOGIN',
        tablaAfectada: 'usuarios',
        registroId: BigInt(usuario.id),
        valorNuevo: `Usuario ${usuario.email} inició sesión desde IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`
      }
    })

    // Respuesta exitosa
    return NextResponse.json({
      message: 'Login exitoso',
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol.nombre,
        documento: usuario.documento
      }
    })

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
