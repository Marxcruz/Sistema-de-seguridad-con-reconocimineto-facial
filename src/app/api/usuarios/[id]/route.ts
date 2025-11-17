import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  apellido: z.string().optional(),
  documento: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().optional(),
  rolId: z.number().int().positive('Rol ID debe ser un número positivo').optional(),
  activo: z.boolean().optional(),
})

// GET /api/usuarios/[id] - Obtener usuario por ID
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
          error: 'ID de usuario inválido',
        },
        { status: 400 }
      )
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
        rostros: {
          select: {
            id: true,
            calidad: true,
            creadoEn: true,
            modelo: {
              select: {
                nombre: true,
                version: true,
              },
            },
          },
        },
        reglasAcceso: {
          include: {
            zona: {
              select: {
                nombre: true,
              },
            },
          },
        },
        _count: {
          select: {
            accesos: true,
            rostros: true,
            reglasAcceso: true,
          },
        },
      },
    })

    if (!usuario) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: usuario,
    })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// PUT /api/usuarios/[id] - Actualizar usuario
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
          error: 'ID de usuario inválido',
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = actualizarUsuarioSchema.parse(body)

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
    })

    if (!usuarioExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      )
    }

    // Verificar que el rol existe si se está actualizando
    if (validatedData.rolId) {
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
    }

    // Verificar unicidad del documento si se está actualizando
    if (validatedData.documento && validatedData.documento !== usuarioExistente.documento) {
      const usuarioConDocumento = await prisma.usuario.findUnique({
        where: { documento: validatedData.documento },
      })

      if (usuarioConDocumento) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya existe un usuario con este documento',
          },
          { status: 400 }
        )
      }
    }

    // Verificar unicidad del email si se está actualizando
    if (validatedData.email && validatedData.email !== usuarioExistente.email) {
      const usuarioConEmail = await prisma.usuario.findUnique({
        where: { email: validatedData.email },
      })

      if (usuarioConEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ya existe un usuario con este email',
          },
          { status: 400 }
        )
      }
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
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
        registroId: BigInt(id),
        accion: 'UPDATE',
        valorAnterior: JSON.stringify(usuarioExistente),
        valorNuevo: JSON.stringify(usuarioActualizado),
      },
    })

    return NextResponse.json({
      success: true,
      data: usuarioActualizado,
      message: 'Usuario actualizado exitosamente',
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

    console.error('Error al actualizar usuario:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/usuarios/[id] - Eliminar usuario permanentemente
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
          error: 'ID de usuario inválido',
        },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rostros: true,
            accesos: true,
            reglasAcceso: true,
          },
        },
      },
    })

    if (!usuarioExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usuario no encontrado',
        },
        { status: 404 }
      )
    }

    // Registrar en auditoría ANTES de eliminar
    await prisma.logAuditoria.create({
      data: {
        tablaAfectada: 'usuarios',
        registroId: BigInt(id),
        accion: 'DELETE',
        valorAnterior: JSON.stringify({
          id: usuarioExistente.id,
          nombre: usuarioExistente.nombre,
          apellido: usuarioExistente.apellido,
          documento: usuarioExistente.documento,
          email: usuarioExistente.email,
        }),
        valorNuevo: null,
      },
    })

    // Eliminar en cascada:
    // 1. Eliminar acceso_rostros relacionados con los accesos del usuario
    const accesosDelUsuario = await prisma.acceso.findMany({
      where: { usuarioId: id },
      select: { id: true },
    })
    
    if (accesosDelUsuario.length > 0) {
      await prisma.accesoRostro.deleteMany({
        where: {
          accesoId: {
            in: accesosDelUsuario.map(a => a.id),
          },
        },
      })
    }

    // 2. Eliminar accesos del usuario
    await prisma.acceso.deleteMany({
      where: { usuarioId: id },
    })

    // 3. Eliminar rostros del usuario
    await prisma.rostro.deleteMany({
      where: { usuarioId: id },
    })

    // 4. Eliminar reglas de acceso
    await prisma.reglaAcceso.deleteMany({
      where: { usuarioId: id },
    })

    // 5. Eliminar imágenes de entrenamiento
    await prisma.imagenEntrenamiento.deleteMany({
      where: { usuarioId: id },
    })

    // 6. Finalmente, eliminar el usuario
    await prisma.usuario.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
