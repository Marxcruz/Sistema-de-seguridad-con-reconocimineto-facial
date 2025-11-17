// ============================================
// RESTAURAR DATOS DE LA BASE DE DATOS
// SIN BORRAR USUARIOS EXISTENTES
// ============================================

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function restaurarDatos() {
  console.log('🔄 RESTAURANDO DATOS DE LA BASE DE DATOS')
  console.log('⚠️  Los usuarios existentes NO serán modificados\n')

  try {
    // 1. ROLES (si no existen)
    console.log('📋 Creando roles...')
    await prisma.rol.createMany({
      data: [
        { nombre: 'Administrador' },
        { nombre: 'Supervisor' },
        { nombre: 'Empleado' },
        { nombre: 'Visitante' },
        { nombre: 'Contratista' },
      ],
      skipDuplicates: true
    })
    console.log('   ✅ Roles creados/verificados\n')

    // 2. TIPOS DE DECISIÓN
    console.log('⚖️  Creando tipos de decisión...')
    await prisma.tipoDecision.createMany({
      data: [
        { nombre: 'PERMITIDO' },
        { nombre: 'DENEGADO' },
        { nombre: 'PENDIENTE' },
      ],
      skipDuplicates: true
    })
    console.log('   ✅ Tipos de decisión creados\n')

    // 3. TIPOS DE ALERTA
    console.log('🚨 Creando tipos de alerta...')
    await prisma.tipoAlerta.createMany({
      data: [
        { nombre: 'Acceso no autorizado' },
        { nombre: 'Falla en prueba de vida' },
        { nombre: 'Usuario desconocido' },
        { nombre: 'Múltiples intentos fallidos' },
        { nombre: 'Acceso fuera de horario' },
        { nombre: 'Zona restringida' },
      ],
      skipDuplicates: true
    })
    console.log('   ✅ Tipos de alerta creados\n')

    // 4. TIPOS DE PUNTO
    console.log('📍 Creando tipos de punto...')
    await prisma.tipoPunto.createMany({
      data: [
        { nombre: 'Entrada principal' },
        { nombre: 'Entrada secundaria' },
        { nombre: 'Sala de servidores' },
        { nombre: 'Oficina ejecutiva' },
        { nombre: 'Laboratorio' },
        { nombre: 'Almacén' },
      ],
      skipDuplicates: true
    })
    console.log('   ✅ Tipos de punto creados\n')

    // 5. TIPOS DE EVIDENCIA
    console.log('📸 Creando tipos de evidencia...')
    await prisma.tipoEvidencia.createMany({
      data: [
        { nombre: 'FOTO_ACCESO' },
        { nombre: 'VIDEO_ACCESO' },
        { nombre: 'FOTO_ALERTA' },
        { nombre: 'FOTO_ROSTRO' },
      ],
      skipDuplicates: true
    })
    console.log('   ✅ Tipos de evidencia creados\n')

    // 6. CANALES DE NOTIFICACIÓN
    console.log('📧 Creando canales de notificación...')
    await prisma.canalNotificacion.createMany({
      data: [
        { nombre: 'Email' },
        { nombre: 'Telegram' },
        { nombre: 'SMS' },
        { nombre: 'Sistema interno' },
      ],
      skipDuplicates: true
    })
    console.log('   ✅ Canales de notificación creados\n')

    // 7. MODELOS FACIALES
    console.log('🤖 Creando modelos faciales...')
    await prisma.modeloFacial.createMany({
      data: [
        { nombre: 'FaceNet', version: '1.0.0' },
        { nombre: 'ArcFace', version: '1.0.0' },
        { nombre: 'DeepFace', version: '1.0.0' },
      ],
      skipDuplicates: true
    })
    console.log('   ✅ Modelos faciales creados\n')

    // 8. ZONAS
    console.log('🏢 Creando zonas...')
    const zonasExistentes = await prisma.zona.count()
    if (zonasExistentes === 0) {
      await prisma.zona.createMany({
        data: [
          { nombre: 'Recepción', descripcion: 'Área de recepción y espera', activo: true },
          { nombre: 'Oficinas Administrativas', descripcion: 'Área de oficinas del personal', activo: true },
          { nombre: 'Sala de Servidores', descripcion: 'Área restringida de servidores', activo: true },
          { nombre: 'Laboratorio', descripcion: 'Laboratorio de desarrollo', activo: true },
          { nombre: 'Almacén', descripcion: 'Área de almacenamiento', activo: true },
        ]
      })
      console.log('   ✅ 5 Zonas creadas\n')
    } else {
      console.log(`   ✓ Ya existen ${zonasExistentes} zonas\n`)
    }

    // 9. PUNTOS DE CONTROL
    console.log('🎯 Creando puntos de control...')
    const puntosExistentes = await prisma.puntoControl.count()
    if (puntosExistentes === 0) {
      const zonaRecepcion = await prisma.zona.findFirst({ where: { nombre: 'Recepción' } })
      const zonaOficinas = await prisma.zona.findFirst({ where: { nombre: 'Oficinas Administrativas' } })
      const zonaServidores = await prisma.zona.findFirst({ where: { nombre: 'Sala de Servidores' } })
      
      const tipoEntrada = await prisma.tipoPunto.findFirst({ where: { nombre: 'Entrada principal' } })
      const tipoSala = await prisma.tipoPunto.findFirst({ where: { nombre: 'Sala de servidores' } })

      if (zonaRecepcion && zonaOficinas && zonaServidores && tipoEntrada && tipoSala) {
        await prisma.puntoControl.createMany({
          data: [
            {
              zonaId: zonaRecepcion.id,
              nombre: 'Entrada Principal',
              tipoId: tipoEntrada.id,
              ubicacion: 'Lobby principal',
              activo: true,
            },
            {
              zonaId: zonaOficinas.id,
              nombre: 'Acceso Oficinas',
              tipoId: tipoEntrada.id,
              ubicacion: 'Pasillo segundo piso',
              activo: true,
            },
            {
              zonaId: zonaServidores.id,
              nombre: 'Sala Servidores',
              tipoId: tipoSala.id,
              ubicacion: 'Edificio B - Sótano',
              activo: true,
            },
          ]
        })
        console.log('   ✅ 3 Puntos de control creados\n')
      }
    } else {
      console.log(`   ✓ Ya existen ${puntosExistentes} puntos de control\n`)
    }

    // 10. RESUMEN FINAL
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE LA BASE DE DATOS:\n')
    
    const [usuarios, zonas, puntos, roles, alertaTipos, decisionTipos] = await Promise.all([
      prisma.usuario.count(),
      prisma.zona.count(),
      prisma.puntoControl.count(),
      prisma.rol.count(),
      prisma.tipoAlerta.count(),
      prisma.tipoDecision.count(),
    ])

    console.log(`👥 Usuarios:           ${usuarios}`)
    console.log(`🏢 Zonas:              ${zonas}`)
    console.log(`🎯 Puntos de Control:  ${puntos}`)
    console.log(`📋 Roles:              ${roles}`)
    console.log(`🚨 Tipos de Alerta:    ${alertaTipos}`)
    console.log(`⚖️  Tipos de Decisión:  ${decisionTipos}`)
    
    console.log('\n' + '='.repeat(60))
    console.log('\n✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE\n')
    console.log('Los datos han sido restaurados y el sistema está listo para usar.')
    console.log('Tus 4 usuarios existentes NO fueron modificados.\n')

  } catch (error) {
    console.error('❌ Error durante la restauración:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
restaurarDatos()
  .then(() => {
    console.log('🎉 Proceso finalizado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
