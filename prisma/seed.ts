import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes (comentado para db:reset)
  // await prisma.logAuditoria.deleteMany()
  // await prisma.notificacion.deleteMany()
  // await prisma.alerta.deleteMany()
  // await prisma.accesoRostro.deleteMany()
  // await prisma.acceso.deleteMany()
  // await prisma.reglaAcceso.deleteMany()
  // await prisma.evidencia.deleteMany()
  // await prisma.puntoControl.deleteMany()
  // await prisma.zona.deleteMany()
  // await prisma.imagenEntrenamiento.deleteMany()
  // await prisma.rostro.deleteMany()
  // await prisma.usuario.deleteMany()
  // await prisma.modeloFacial.deleteMany()
  // await prisma.canalNotificacion.deleteMany()
  // await prisma.tipoEvidencia.deleteMany()
  // await prisma.tipoPunto.deleteMany()
  // await prisma.tipoAlerta.deleteMany()
  // await prisma.tipoDecision.deleteMany()
  // await prisma.rol.deleteMany()

  // Catálogos base
  const roles = await prisma.rol.createMany({
    data: [
      { nombre: 'Administrador' },
      { nombre: 'Supervisor' },
      { nombre: 'Empleado' },
      { nombre: 'Visitante' },
      { nombre: 'Contratista' },
    ],
  })

  const tiposDecision = await prisma.tipoDecision.createMany({
    data: [
      { nombre: 'PERMITIDO' },
      { nombre: 'DENEGADO' },
      { nombre: 'PENDIENTE' },
    ],
  })

  const tiposAlerta = await prisma.tipoAlerta.createMany({
    data: [
      { nombre: 'Acceso no autorizado' },
      { nombre: 'Falla en prueba de vida' },
      { nombre: 'Usuario desconocido' },
      { nombre: 'Múltiples intentos fallidos' },
      { nombre: 'Acceso fuera de horario' },
      { nombre: 'Zona restringida' },
    ],
  })

  const tiposPunto = await prisma.tipoPunto.createMany({
    data: [
      { nombre: 'Entrada principal' },
      { nombre: 'Entrada secundaria' },
      { nombre: 'Sala de servidores' },
      { nombre: 'Oficina ejecutiva' },
      { nombre: 'Laboratorio' },
      { nombre: 'Almacén' },
    ],
  })

  const tiposEvidencia = await prisma.tipoEvidencia.createMany({
    data: [
      { nombre: 'FOTO_ACCESO' },
      { nombre: 'VIDEO_ACCESO' },
      { nombre: 'FOTO_ALERTA' },
      { nombre: 'FOTO_ROSTRO' },
    ],
  })

  const canalesNotificacion = await prisma.canalNotificacion.createMany({
    data: [
      { nombre: 'Email' },
      { nombre: 'Telegram' },
      { nombre: 'SMS' },
      { nombre: 'Sistema interno' },
    ],
  })

  const modelosFaciales = await prisma.modeloFacial.createMany({
    data: [
      { nombre: 'FaceNet', version: '1.0.0' },
      { nombre: 'ArcFace', version: '1.0.0' },
      { nombre: 'DeepFace', version: '1.0.0' },
    ],
  })

  // Obtener IDs creados
  const rolAdmin = await prisma.rol.findFirst({ where: { nombre: 'Administrador' } })
  const rolEmpleado = await prisma.rol.findFirst({ where: { nombre: 'Empleado' } })
  const rolVisitante = await prisma.rol.findFirst({ where: { nombre: 'Visitante' } })

  // Hashear contraseñas
  const adminPassword = await bcrypt.hash('admin123', 10)
  const supervisorPassword = await bcrypt.hash('supervisor123', 10)
  const empleadoPassword = await bcrypt.hash('empleado123', 10)
  const visitantePassword = await bcrypt.hash('visitante123', 10)

  // Usuarios de prueba con credenciales de login hasheadas
  const usuarios = await prisma.usuario.createMany({
    data: [
      {
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        documento: '12345678',
        email: 'admin@sistema.com',
        telefono: '+57 300 123 4567',
        password: adminPassword,
        rolId: rolAdmin!.id,
        activo: true,
      },
      {
        nombre: 'María Elena',
        apellido: 'González López',
        documento: '87654321',
        email: 'supervisor@sistema.com',
        telefono: '+57 301 987 6543',
        password: supervisorPassword,
        rolId: rolEmpleado!.id,
        activo: true,
      },
      {
        nombre: 'Carlos Alberto',
        apellido: 'Rodríguez Silva',
        documento: '11223344',
        email: 'empleado@sistema.com',
        telefono: '+57 302 456 7890',
        password: empleadoPassword,
        rolId: rolEmpleado!.id,
        activo: true,
      },
      {
        nombre: 'Ana Sofía',
        apellido: 'Martínez Cruz',
        documento: '44332211',
        email: 'visitante@sistema.com',
        telefono: '+57 303 654 3210',
        password: visitantePassword,
        rolId: rolVisitante!.id,
        activo: true,
      },
    ],
  })

  // Zonas
  const zonas = await prisma.zona.createMany({
    data: [
      { nombre: 'Recepción', descripcion: 'Área de recepción y espera', activo: true },
      { nombre: 'Oficinas Administrativas', descripcion: 'Área de oficinas del personal', activo: true },
      { nombre: 'Sala de Servidores', descripcion: 'Área restringida de servidores', activo: true },
      { nombre: 'Laboratorio', descripcion: 'Laboratorio de desarrollo', activo: true },
      { nombre: 'Almacén', descripcion: 'Área de almacenamiento', activo: true },
    ],
  })

  // Obtener zonas creadas
  const zonaRecepcion = await prisma.zona.findFirst({ where: { nombre: 'Recepción' } })
  const zonaOficinas = await prisma.zona.findFirst({ where: { nombre: 'Oficinas Administrativas' } })
  const zonaServidores = await prisma.zona.findFirst({ where: { nombre: 'Sala de Servidores' } })

  const tipoEntradaPrincipal = await prisma.tipoPunto.findFirst({ where: { nombre: 'Entrada principal' } })
  const tipoSalaServidores = await prisma.tipoPunto.findFirst({ where: { nombre: 'Sala de servidores' } })

  // Puntos de control
  const puntosControl = await prisma.puntoControl.createMany({
    data: [
      {
        zonaId: zonaRecepcion!.id,
        nombre: 'Entrada Principal',
        tipoId: tipoEntradaPrincipal!.id,
        ubicacion: 'Lobby principal, puerta de vidrio',
        activo: true,
      },
      {
        zonaId: zonaOficinas!.id,
        nombre: 'Acceso Oficinas',
        tipoId: tipoEntradaPrincipal!.id,
        ubicacion: 'Pasillo segundo piso',
        activo: true,
      },
      {
        zonaId: zonaServidores!.id,
        nombre: 'Sala Servidores',
        tipoId: tipoSalaServidores!.id,
        ubicacion: 'Sótano, puerta blindada',
        activo: true,
      },
    ],
  })

  // Obtener usuarios creados
  const usuarioJuan = await prisma.usuario.findFirst({ where: { documento: '12345678' } })
  const usuarioMaria = await prisma.usuario.findFirst({ where: { documento: '87654321' } })

  // Reglas de acceso de ejemplo
  const reglasAcceso = await prisma.reglaAcceso.createMany({
    data: [
      {
        usuarioId: usuarioJuan!.id,
        zonaId: zonaRecepcion!.id,
        horaInicio: new Date('1970-01-01T00:00:00Z'),
        horaFin: new Date('1970-01-01T23:59:59Z'),
        diaSemana: null, // Todos los días
        activo: true,
      },
      {
        usuarioId: usuarioJuan!.id,
        zonaId: zonaServidores!.id,
        horaInicio: new Date('1970-01-01T08:00:00Z'),
        horaFin: new Date('1970-01-01T18:00:00Z'),
        diaSemana: null,
        activo: true,
      },
      {
        usuarioId: usuarioMaria!.id,
        zonaId: zonaRecepcion!.id,
        horaInicio: new Date('1970-01-01T07:00:00Z'),
        horaFin: new Date('1970-01-01T19:00:00Z'),
        diaSemana: 1, // Lunes
        activo: true,
      },
      {
        usuarioId: usuarioMaria!.id,
        zonaId: zonaOficinas!.id,
        horaInicio: new Date('1970-01-01T08:00:00Z'),
        horaFin: new Date('1970-01-01T17:00:00Z'),
        diaSemana: null,
        activo: true,
      },
    ],
  })

  console.log('✅ Seed completado exitosamente!')
  console.log(`📊 Datos creados:`)
  console.log(`   - ${roles.count} roles`)
  console.log(`   - ${tiposDecision.count} tipos de decisión`)
  console.log(`   - ${tiposAlerta.count} tipos de alerta`)
  console.log(`   - ${tiposPunto.count} tipos de punto`)
  console.log(`   - ${tiposEvidencia.count} tipos de evidencia`)
  console.log(`   - ${canalesNotificacion.count} canales de notificación`)
  console.log(`   - ${modelosFaciales.count} modelos faciales`)
  console.log(`   - ${usuarios.count} usuarios`)
  console.log(`   - ${zonas.count} zonas`)
  console.log(`   - ${puntosControl.count} puntos de control`)
  console.log(`   - ${reglasAcceso.count} reglas de acceso`)
  console.log('')
  console.log('🔐 Credenciales de login creadas:')
  console.log('   📧 admin@sistema.com - 🔑 admin123 (Administrador)')
  console.log('   📧 supervisor@sistema.com - 🔑 supervisor123 (Empleado)')
  console.log('   📧 empleado@sistema.com - 🔑 empleado123 (Empleado)')
  console.log('   📧 visitante@sistema.com - 🔑 visitante123 (Visitante)')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
