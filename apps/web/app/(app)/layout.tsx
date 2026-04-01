'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Sparkles,
  LayoutDashboard,
  Camera,
  MessageSquare,
  Settings,
  Crown,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Demo user button when Clerk isn't configured
function DemoUserButton() {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <User className="w-5 h-5 text-white" />
    </div>
  )
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scan/new', label: 'New Scan', icon: Camera },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen gradient-bg">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border glass hidden lg:block">
        <div className="p-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">MaxScore</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                      isActive
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* Pro upgrade card */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Upgrade to Pro</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Unlock unlimited scans and detailed insights
            </p>
            <Button variant="glow" size="sm" className="w-full">
              Upgrade Now
            </Button>
          </div>
        </div>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <div className="flex items-center gap-3">
            <DemoUserButton />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Demo User</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border glass z-50">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold gradient-text">MaxScore</span>
          </Link>
          <DemoUserButton />
        </div>
      </header>

      {/* Mobile navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border glass z-50">
        <div className="flex items-center justify-around h-full">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive ? 'text-purple-400' : 'text-muted-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}