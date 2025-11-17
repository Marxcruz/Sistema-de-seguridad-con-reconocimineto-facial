import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener configuración de cámara de un punto
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const puntoId = parseInt(params.id)

    const punto = await prisma.puntoControl.findUnique({
      where: { id: puntoId },
      select: {
        id: true,
        nombre: true,
        cameraUrl: true,
        cameraUser: true,
        streamType: true,
      },
    })

    if (!punto) {
      return NextResponse.json(
        { success: false, error: 'Punto de control no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: punto,
    })
  } catch (error) {
    console.error('Error obteniendo configuración de cámara:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar configuración de cámara
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const puntoId = parseInt(params.id)
    const body = await request.json()
    const { cameraUrl, cameraUser, cameraPass, streamType } = body

    // Validar que el punto existe
    const puntoExiste = await prisma.puntoControl.findUnique({
      where: { id: puntoId },
    })

    if (!puntoExiste) {
      return NextResponse.json(
        { success: false, error: 'Punto de control no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar configuración de cámara
    const punto = await prisma.puntoControl.update({
      where: { id: puntoId },
      data: {
        cameraUrl: cameraUrl || null,
        cameraUser: cameraUser || null,
        cameraPass: cameraPass || null, // En producción: encriptar antes de guardar
        streamType: streamType || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Configuración de cámara actualizada',
      data: {
        id: punto.id,
        nombre: punto.nombre,
        cameraUrl: punto.cameraUrl,
        cameraUser: punto.cameraUser,
        streamType: punto.streamType,
      },
    })
  } catch (error) {
    console.error('Error actualizando configuración de cámara:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar configuración de cámara (resetear a null)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const puntoId = parseInt(params.id)

    await prisma.puntoControl.update({
      where: { id: puntoId },
      data: {
        cameraUrl: null,
        cameraUser: null,
        cameraPass: null,
        streamType: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Configuración de cámara eliminada',
    })
  } catch (error) {
    console.error('Error eliminando configuración de cámara:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar configuración' },
      { status: 500 }
    )
  }
}
