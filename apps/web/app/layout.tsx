import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
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

// Wrapper component to conditionally use Clerk
function AuthWrapper({ children }: { children: React.ReactNode }) {
  // Check if Clerk is configured
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isClerkConfigured = clerkKey && !clerkKey.includes('demo')

  if (isClerkConfigured) {
    // Dynamic import to avoid errors when Clerk isn't configured
    const { ClerkProvider } = require('@clerk/nextjs')
    return <ClerkProvider>{children}</ClerkProvider>
  }

  // Demo mode - no auth
  return <>{children}</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <AuthWrapper>
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
        </AuthWrapper>
      </body>
    </html>
  )
}