import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Seguridad con Reconocimiento Facial',
  description: 'Sistema integral de seguridad con reconocimiento facial para control de acceso',
  keywords: 'seguridad, reconocimiento facial, control de acceso, biometría',
  authors: [{ name: 'Sistema de Seguridad Facial' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
