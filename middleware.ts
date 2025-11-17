import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Rutas que NO requieren autenticación
const publicRoutes = ['/login', '/api/auth/login', '/api/auth/logout']

// Rutas de API que requieren autenticación
const protectedApiRoutes = ['/api/dashboard', '/api/usuarios', '/api/acceso', '/api/alertas']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acceso a rutas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Permitir acceso a archivos estáticos
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Verificar token para rutas protegidas
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.headers.get('x-auth-token')

  if (!token) {
    // Si es una ruta de API, devolver 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Token de autenticación requerido' },
        { status: 401 }
      )
    }
    
    // Si es una ruta de página, redirigir a login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura') as any
    
    // Agregar información del usuario a los headers para uso en las rutas
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId.toString())
    requestHeaders.set('x-user-email', decoded.email)
    requestHeaders.set('x-user-role', decoded.rol)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Token inválido
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      )
    }
    
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
