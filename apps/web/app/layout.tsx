import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'MaxScore | AI Face Analysis & Looksmaxxing',
  description: 'Get objective attractiveness scores and personalized improvement recommendations powered by AI. Unlock your full potential with data-driven insights.',
  keywords: ['face analysis', 'looksmaxxing', 'attractiveness', 'AI', 'beauty', 'self-improvement'],
  openGraph: {
    title: 'MaxScore | AI Face Analysis',
    description: 'Unlock your full potential with AI-powered face analysis',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <ClerkProvider>
          <div className="noise" />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(0 0% 6%)',
                border: '1px solid hsl(0 0% 14%)',
                color: 'hsl(0 0% 98%)',
              },
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  )
}
