import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { SocketProvider } from '@/context/SocketContext'
import { NotificationListener } from '@/components/NotificationListener'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chai Adda',
  description: 'Order your favourite chai and snacks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            <CartProvider>
              <NotificationListener />
              {children}
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}