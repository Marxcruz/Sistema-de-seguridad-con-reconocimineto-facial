import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación para crear usuario
const crearUsuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  documento: z.string().min(1, 'El documento es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  rolId: z.number().int().positive('Rol ID debe ser un número positivo'),
})

// Schema de validación para actualizar usuario
const actualizarUsuarioSchema = crearUsuarioSchema.partial()

// GET /api/usuarios - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const rolId = searchParams.get('rolId')
    const activo = searchParams.get('activo')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { documento: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (rolId) {
      where.rolId = parseInt(rolId)
    }

    if (activo !== null) {
      where.activo = activo === 'true'
    }

    // Obtener usuarios con paginación
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        include: {
          rol: {
            select: {
              id: true,
              nombre: true,
            },
          },
          _count: {
            select: {
              rostros: true,
              accesos: true,
              reglasAcceso: true,
            },
          },
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.usuario.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// POST /api/usuarios - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos de entrada
    const validatedData = crearUsuarioSchema.parse(body)

    // Verificar que el rol existe
    const rol = await prisma.rol.findUnique({
      where: { id: validatedData.rolId },
    })

    if (!rol) {
      return NextResponse.json(
        {
          success: false,
          error: 'El rol especificado no existe',
        },
        { status: 400 }
      )
    }

    // Verificar unicidad del documento si se proporciona
    if (validatedData.documento) {
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { documento: validatedData.documento },
      })

      if (usuarioExistente) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya existe un usuario con este documento',
          },
          { status: 400 }
        )
      }
    }

    // Verificar unicidad del email si se proporciona
    if (validatedData.email) {
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: validatedData.email },
      })

      if (usuarioExistente) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya existe un usuario con este email',
          },
          { status: 400 }
        )
      }
    }

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: validatedData,
      include: {
        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    // Registrar en auditoría
    await prisma.logAuditoria.create({
      data: {
        tablaAfectada: 'usuarios',
        registroId: BigInt(nuevoUsuario.id),
        accion: 'INSERT',
        valorNuevo: JSON.stringify(nuevoUsuario),
      },
    })

    return NextResponse.json({
      success: true,
      data: nuevoUsuario,
      message: 'Usuario creado exitosamente',
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

    console.error('Error al crear usuario:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
