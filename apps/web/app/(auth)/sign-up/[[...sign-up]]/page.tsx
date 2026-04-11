'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Check if Clerk is properly configured
const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live') ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test')

export default function SignUpPage() {
  const router = useRouter()
  const [SignUp, setSignUp] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isClerkConfigured) {
      import('@clerk/nextjs').then((mod) => {
        setSignUp(() => mod.SignUp)
      }).catch(() => {
        // Clerk not available
      })
    }
  }, [])

  if (!mounted) return null

  // Demo mode when Clerk isn't configured
  if (!isClerkConfigured || !SignUp) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">MaxScore</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Demo Mode - No authentication required</p>
          </div>

          <div className="glass rounded-2xl p-6 border border-border">
            <p className="text-center text-muted-foreground mb-4">
              Authentication is not configured. Click below to enter demo mode.
            </p>
            <Button
              variant="glow"
              className="w-full"
              onClick={() => router.push('/dashboard')}
            >
              Enter Demo Mode
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              To enable authentication, add Clerk API keys to your environment variables.
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-purple-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">MaxScore</span>
          </Link>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'glass border border-border',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              formButtonPrimary: 'bg-purple-500 hover:bg-purple-600',
            }
          }}
        />
      </div>
    </div>
  )
}
