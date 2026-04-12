import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Check if Clerk is properly configured with a real key (not placeholder)
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
const isClerkConfigured =
  (clerkKey.startsWith('pk_live') || clerkKey.startsWith('pk_test')) &&
  clerkKey.length > 30 // Real Clerk keys are 40+ characters

// Use Clerk middleware only if properly configured
export default isClerkConfigured
  ? clerkMiddleware()
  : function middleware(request: NextRequest) {
      return NextResponse.next()
    }

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
