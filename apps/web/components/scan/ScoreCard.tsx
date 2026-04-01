'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScoreCardProps {
  score: number
  label: string
  percentile?: number
  previousScore?: number
  delay?: number
}

export function ScoreCard({
  score,
  label,
  percentile,
  previousScore,
  delay = 0,
}: ScoreCardProps) {
  const getScoreColor = () => {
    if (score >= 8) return 'from-green-500 to-emerald-500'
    if (score >= 6) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-rose-500'
  }

  const getScoreLabel = () => {
    if (score >= 9) return 'Exceptional'
    if (score >= 8) return 'Outstanding'
    if (score >= 7) return 'Above Average'
    if (score >= 6) return 'Average'
    if (score >= 5) return 'Below Average'
    return 'Needs Work'
  }

  const getTrend = () => {
    if (!previousScore) return null
    const diff = score - previousScore
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-400', value: `+${diff.toFixed(1)}` }
    if (diff < 0) return { icon: TrendingDown, color: 'text-red-400', value: diff.toFixed(1) }
    return { icon: Minus, color: 'text-muted-foreground', value: '0' }
  }

  const trend = getTrend()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="relative"
    >
      <div className="p-6 rounded-2xl bg-card border border-border hover:border-purple-500/30 transition-colors">
        {/* Score circle */}
        <div className="relative flex items-center justify-center mb-4">
          <svg className="w-24 h-24 -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary"
            />
            {/* Progress circle */}
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={cn('stroke-current', score >= 8 ? 'text-green-500' : score >= 6 ? 'text-yellow-500' : 'text-red-500')}
              initial={{ strokeDasharray: '0 251.2' }}
              animate={{
                strokeDasharray: `${(score / 10) * 251.2} 251.2`,
              }}
              transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.5 }}
              className="text-2xl font-bold"
            >
              {score.toFixed(1)}
            </motion.span>
          </div>
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">{getScoreLabel()}</p>

          {/* Percentile */}
          {percentile && (
            <p className="text-xs text-purple-400 mt-2">
              Top {100 - percentile}%
            </p>
          )}

          {/* Trend */}
          {trend && (
            <div className={cn('flex items-center justify-center gap-1 mt-2', trend.color)}>
              <trend.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{trend.value}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
