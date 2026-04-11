import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import dynamic from 'next/dynamic'

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

// Conditionally load ClerkProvider only when keys are configured
const ClerkProviderWrapper = dynamic(
  () => {
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    if (clerkKey && clerkKey.startsWith('pk_')) {
      return import('@clerk/nextjs').then((mod) => mod.ClerkProvider)
    }
    // Return a passthrough component when Clerk isn't configured
    return Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>)
  },
  { ssr: false }
)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <ClerkProviderWrapper>
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
        </ClerkProviderWrapper>
      </body>
    </html>
  )
}
