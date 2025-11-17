import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/usuarios/register-face - Registrar rostro de usuario
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const usuarioId = parseInt(formData.get('usuarioId') as string)

    if (!image || isNaN(usuarioId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Imagen y usuario ID son requeridos',
        },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
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

    // Convertir imagen a buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convertir a base64 para enviar a la API de Python
    const base64Image = buffer.toString('base64')

    // Obtener la URL de la API de Python desde variables de entorno
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'

    // Enviar a la API de Python para procesar el rostro
    const response = await fetch(`${pythonApiUrl}/register-face`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        usuario_id: usuarioId,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || 'Error al procesar el rostro',
        },
        { status: response.status || 500 }
      )
    }

    // El rostro ya fue guardado por la API de Python
    // Registrar en auditoría
    await prisma.logAuditoria.create({
      data: {
        tablaAfectada: 'rostros',
        accion: 'CREATE',
        usuarioId: usuarioId,
        valorNuevo: JSON.stringify({
          usuarioId: usuarioId,
          timestamp: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Rostro registrado exitosamente',
      data: data.data,
    })
  } catch (error) {
    console.error('Error al registrar rostro:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
