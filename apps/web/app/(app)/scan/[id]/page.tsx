'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ScoreCard } from '@/components/scan/ScoreCard'
import { SuggestionCard } from '@/components/scan/SuggestionCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Sparkles,
  MessageSquare,
  Download,
  Share2,
  ChevronRight,
  TrendingUp,
  Crown,
} from 'lucide-react'

// Demo data - would come from API in production
const demoResults = {
  overallScore: 7.8,
  percentile: 82,
  featureScores: [
    { label: 'Symmetry', score: 8.4, percentile: 88 },
    { label: 'Jawline', score: 6.9, percentile: 72 },
    { label: 'Eye Area', score: 8.1, percentile: 85 },
    { label: 'Nose Ratio', score: 7.2, percentile: 75 },
    { label: 'Facial Thirds', score: 7.8, percentile: 80 },
    { label: 'Skin Quality', score: 8.0, percentile: 83 },
  ],
  suggestions: [
    {
      id: '1',
      feature: 'Jawline',
      title: 'Enhance Jawline Definition',
      description:
        'Your jawline scored slightly below your other features. There are several effective methods to improve jawline definition and create a more chiseled appearance.',
      tips: [
        'Practice mewing technique - maintain proper tongue posture against the roof of your mouth',
        'Incorporate jaw exercises like chin lifts and neck curls into your routine',
        'Reduce sodium intake to minimize facial water retention',
        'Consider dermal fillers for immediate, non-surgical enhancement',
      ],
      priority: 'high' as const,
      impact:
        'Improving jawline definition can increase your overall score by 0.3-0.5 points and significantly enhance your side profile.',
    },
    {
      id: '2',
      feature: 'Skin',
      title: 'Optimize Your Skincare Routine',
      description:
        'Your skin quality is good but has room for improvement. A consistent skincare routine can boost this score significantly.',
      tips: [
        'Use a gentle cleanser twice daily',
        'Apply vitamin C serum in the morning for brightness',
        'Always wear SPF 30+ sunscreen to prevent damage',
        'Consider retinol at night for texture improvement',
      ],
      priority: 'medium' as const,
      impact:
        'Clear, glowing skin can improve perception by up to 15% and adds a healthy, youthful appearance.',
    },
    {
      id: '3',
      feature: 'Eye Area',
      title: 'Maximize Eye Appeal',
      description:
        'Your eye area is one of your strongest features. Small enhancements can make it even more striking.',
      tips: [
        'Get 7-9 hours of quality sleep to reduce dark circles',
        'Stay hydrated - aim for 8 glasses of water daily',
        'Consider using an eye cream with caffeine',
        'Groom eyebrows to frame your eyes better',
      ],
      priority: 'low' as const,
      impact:
        'Eyes are the first feature people notice. Enhancing this area improves first impressions dramatically.',
    },
  ],
}

type ResultsShape = typeof demoResults

function mapApiToResults(scan: any): ResultsShape {
  const fs = scan.featureScores || {}
  const featureScores = Object.entries(fs).map(([key, v]: [string, any]) => ({
    label: v?.name || key,
    score: typeof v === 'number' ? v : (v?.score ?? 0),
    percentile: v?.percentile ?? 0,
  }))

  const suggestions = (scan.suggestions || []).map((s: any, i: number) => ({
    id: s.id || String(i),
    feature: s.feature,
    title: s.title,
    description: s.description,
    tips: s.tips || [],
    priority:
      (s.priority === 2 || s.priority === 'high') ? 'high' as const :
      (s.priority === 1 || s.priority === 'medium') ? 'medium' as const :
      'low' as const,
    impact: s.impact || '',
  }))

  return {
    overallScore: scan.overallScore ?? 0,
    percentile: scan.percentile ?? 0,
    featureScores,
    suggestions,
  }
}

export default function ScanResultsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'suggestions'>('breakdown')
  const [results, setResults] = useState<ResultsShape>(demoResults)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/scans/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(scan => {
        if (cancelled || !scan) return
        setResults(mapApiToResults(scan))
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [params.id])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Results</h1>
            <p className="text-muted-foreground">
              Analysis completed • March 31, 2026
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main score card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score display */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center animate-glow">
                  <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.3 }}
                        className="text-5xl font-bold gradient-text"
                      >
                        {results.overallScore}
                      </motion.div>
                      <p className="text-sm text-muted-foreground mt-1">out of 10</p>
                    </div>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-semibold"
                >
                  Top {100 - results.percentile}%
                </motion.div>
              </div>

              {/* Score info */}
              <div className="flex-1 text-center md:text-left">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold mb-2"
                >
                  Above Average
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground mb-4 max-w-md"
                >
                  You scored higher than {results.percentile}% of users. Your strongest
                  features are symmetry and eye area. Focus on jawline for the biggest
                  improvement.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-2 justify-center md:justify-start"
                >
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Strong symmetry
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Great eye area
                  </span>
                </motion.div>
              </div>

              {/* Chat CTA */}
              <div className="flex-shrink-0">
                <Link href="/chat">
                  <Button variant="glow" size="lg">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Ask AI Questions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['breakdown', 'suggestions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'breakdown' ? 'Feature Breakdown' : 'Suggestions'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'breakdown' ? (
        <motion.div
          key="breakdown"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {results.featureScores.map((feature, index) => (
              <ScoreCard
                key={feature.label}
                score={feature.score}
                label={feature.label}
                percentile={feature.percentile}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Radar chart placeholder */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Feature Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="font-medium mb-1">Radar Chart Available in Pro</p>
                  <p className="text-sm">Upgrade to see detailed comparisons</p>
                  <Link href="/pricing">
                    <Button variant="glow" size="sm" className="mt-4">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="suggestions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {results.suggestions.map((suggestion, index) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
          ))}

          {/* More suggestions CTA */}
          <Card className="border-dashed border-purple-500/30 bg-purple-500/5">
            <CardContent className="py-8 text-center">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Want More Personalized Advice?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pro users get unlimited AI-powered suggestions and detailed action plans
              </p>
              <Link href="/pricing">
                <Button variant="glow">
                  Upgrade to Pro <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
