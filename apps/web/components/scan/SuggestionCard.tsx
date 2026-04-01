'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Lightbulb, ExternalLink, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Suggestion {
  id: string
  feature: string
  title: string
  description: string
  tips: string[]
  priority: 'high' | 'medium' | 'low'
  impact: string
}

interface SuggestionCardProps {
  suggestion: Suggestion
  index: number
}

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const priorityColors = {
    high: 'border-red-500/30 bg-red-500/5',
    medium: 'border-yellow-500/30 bg-yellow-500/5',
    low: 'border-green-500/30 bg-green-500/5',
  }

  const priorityLabels = {
    high: { text: 'High Impact', color: 'text-red-400' },
    medium: { text: 'Medium Impact', color: 'text-yellow-400' },
    low: { text: 'Quick Win', color: 'text-green-400' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div
        className={cn(
          'rounded-xl border transition-all duration-300 overflow-hidden',
          priorityColors[suggestion.priority],
          isExpanded && 'ring-1 ring-purple-500/30'
        )}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-start gap-4 text-left"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-purple-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {suggestion.feature}
              </span>
              <span className={cn('text-xs font-medium', priorityLabels[suggestion.priority].color)}>
                • {priorityLabels[suggestion.priority].text}
              </span>
            </div>
            <h3 className="font-semibold">{suggestion.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {suggestion.description}
            </p>
          </div>

          <ChevronDown
            className={cn(
              'w-5 h-5 text-muted-foreground transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 pb-4 pt-0 border-t border-border/50">
                {/* Tips */}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-3">Action Steps:</p>
                  <ul className="space-y-2">
                    {suggestion.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Star className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expected impact */}
                <div className="mt-4 p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Expected Impact</p>
                  <p className="text-sm">{suggestion.impact}</p>
                </div>

                {/* Learn more button */}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Learn More
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    Ask AI About This
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
