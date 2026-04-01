'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Camera,
  TrendingUp,
  Calendar,
  Sparkles,
  ChevronRight,
  Zap,
  Clock,
} from 'lucide-react'

// Demo data
const recentScans = [
  { id: '1', date: 'Today', score: 7.8, change: '+0.3' },
  { id: '2', date: 'Yesterday', score: 7.5, change: '+0.2' },
  { id: '3', date: 'Mar 28', score: 7.3, change: '-0.1' },
]

const quickStats = [
  { label: 'Total Scans', value: '12', icon: Camera },
  { label: 'Avg Score', value: '7.6', icon: TrendingUp },
  { label: 'Best Score', value: '8.4', icon: Sparkles },
  { label: 'This Month', value: '4', icon: Calendar },
]

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back! <span className="wave">👋</span>
        </h1>
        <p className="text-muted-foreground">
          Track your progress and unlock your potential
        </p>
      </motion.div>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {quickStats.map((stat, index) => (
          <Card key={stat.label} className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* New scan CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Ready for a New Scan?</h2>
                      <p className="text-muted-foreground">
                        You have <span className="text-purple-400 font-medium">1 free scan</span> remaining today
                      </p>
                    </div>
                  </div>
                  <Link href="/scan/new">
                    <Button variant="glow" size="lg">
                      <Zap className="w-5 h-5 mr-2" />
                      Start Scan
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recent scans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Scans</CardTitle>
                  <Button variant="ghost" size="sm">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentScans.map((scan, index) => (
                    <Link key={scan.id} href={`/scan/${scan.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium">Face Analysis</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {scan.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{scan.score}</p>
                          <p className={`text-sm ${
                            scan.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {scan.change}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Progress card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold gradient-text mb-1">+0.5</div>
                  <p className="text-sm text-muted-foreground">Score improvement this month</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Symmetry', value: 85 },
                    { label: 'Jawline', value: 68 },
                    { label: 'Skin', value: 78 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Daily Tip</h3>
                    <p className="text-sm text-muted-foreground">
                      Consistent sleep (7-9 hours) can improve your skin quality score by up to 15%.
                      Try maintaining a regular sleep schedule this week!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
