// ============================================
// SCRIPT PARA CREAR USUARIOS DE LOGIN
// Sistema de Reconocimiento Facial
// ============================================

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function crearUsuarios() {
  console.log('🔐 Creando usuarios para login...\n')

  try {
    // 1. Verificar/Crear roles
    console.log('📋 Verificando roles...')
    
    let rolAdmin = await prisma.rol.findFirst({ where: { nombre: 'Administrador' } })
    if (!rolAdmin) {
      rolAdmin = await prisma.rol.create({ data: { nombre: 'Administrador' } })
      console.log('   ✅ Rol Administrador creado')
    } else {
      console.log('   ✓ Rol Administrador existe')
    }

    let rolEmpleado = await prisma.rol.findFirst({ where: { nombre: 'Empleado' } })
    if (!rolEmpleado) {
      rolEmpleado = await prisma.rol.create({ data: { nombre: 'Empleado' } })
      console.log('   ✅ Rol Empleado creado')
    } else {
      console.log('   ✓ Rol Empleado existe')
    }

    let rolVisitante = await prisma.rol.findFirst({ where: { nombre: 'Visitante' } })
    if (!rolVisitante) {
      rolVisitante = await prisma.rol.create({ data: { nombre: 'Visitante' } })
      console.log('   ✅ Rol Visitante creado')
    } else {
      console.log('   ✓ Rol Visitante existe')
    }

    console.log('\n👥 Creando usuarios...\n')

    // 2. Crear usuarios con contraseñas hasheadas
    const usuarios = [
      {
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        documento: '12345678',
        email: 'admin@sistema.com',
        telefono: '+57 300 123 4567',
        password: 'admin123',
        rolId: rolAdmin.id,
        rol: 'Administrador'
      },
      {
        nombre: 'María Elena',
        apellido: 'González López',
        documento: '87654321',
        email: 'supervisor@sistema.com',
        telefono: '+57 301 987 6543',
        password: 'supervisor123',
        rolId: rolEmpleado.id,
        rol: 'Empleado'
      },
      {
        nombre: 'Carlos Alberto',
        apellido: 'Rodríguez Silva',
        documento: '11223344',
        email: 'empleado@sistema.com',
        telefono: '+57 302 456 7890',
        password: 'empleado123',
        rolId: rolEmpleado.id,
        rol: 'Empleado'
      },
      {
        nombre: 'Ana Sofía',
        apellido: 'Martínez Cruz',
        documento: '44332211',
        email: 'visitante@sistema.com',
        telefono: '+57 303 654 3210',
        password: 'visitante123',
        rolId: rolVisitante.id,
        rol: 'Visitante'
      }
    ]

    for (const userData of usuarios) {
      // Verificar si el usuario ya existe
      const existente = await prisma.usuario.findFirst({
        where: { email: userData.email }
      })

      if (existente) {
        console.log(`   ⚠️  Usuario ${userData.email} ya existe (ID: ${existente.id})`)
        
        // Actualizar contraseña si es necesario
        const passwordHash = await bcrypt.hash(userData.password, 10)
        await prisma.usuario.update({
          where: { id: existente.id },
          data: { 
            password: passwordHash,
            activo: true
          }
        })
        console.log(`   ✅ Contraseña actualizada para ${userData.email}`)
      } else {
        // Crear nuevo usuario
        const passwordHash = await bcrypt.hash(userData.password, 10)
        
        const nuevoUsuario = await prisma.usuario.create({
          data: {
            nombre: userData.nombre,
            apellido: userData.apellido,
            documento: userData.documento,
            email: userData.email,
            telefono: userData.telefono,
            password: passwordHash,
            rolId: userData.rolId,
            activo: true
          }
        })

        console.log(`   ✅ Usuario creado: ${userData.email} (ID: ${nuevoUsuario.id})`)
      }
      
      console.log(`      📧 Email: ${userData.email}`)
      console.log(`      🔑 Contraseña: ${userData.password}`)
      console.log(`      👤 Rol: ${userData.rol}`)
      console.log('')
    }

    // 3. Mostrar resumen
    console.log('\n📊 RESUMEN DE USUARIOS:\n')
    console.log('┌─────────────────────────────────────────────────────────┐')
    console.log('│  Email                    │ Contraseña    │ Rol         │')
    console.log('├─────────────────────────────────────────────────────────┤')
    console.log('│  admin@sistema.com        │ admin123      │ Admin       │')
    console.log('│  supervisor@sistema.com   │ supervisor123 │ Empleado    │')
    console.log('│  empleado@sistema.com     │ empleado123   │ Empleado    │')
    console.log('│  visitante@sistema.com    │ visitante123  │ Visitante   │')
    console.log('└─────────────────────────────────────────────────────────┘')
    console.log('\n✅ PROCESO COMPLETADO\n')
    console.log('Ahora puedes hacer login en: http://localhost:3000/login\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
crearUsuarios()
  .then(() => {
    console.log('✨ Script finalizado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
