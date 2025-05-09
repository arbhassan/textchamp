import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import AdminLink from './components/AdminLink'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: {
    template: '%s | Text Champ',
    default: 'Text Champ',
  },
  description: 'Text Champ',
  generator: 'Text Champ',
  icons: {
    icon: '/icon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <AdminLink />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
