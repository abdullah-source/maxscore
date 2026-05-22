'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-2">
          Simple <span className="gradient-text">Pricing</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start free, upgrade when you need more
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-muted-foreground mb-6">Perfect for trying out</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                '1 scan per day',
                'Basic feature breakdown',
                'Top 3 suggestions',
                'Limited chat (3 messages)',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        <Card className="relative border-purple-500/50 glow-purple">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-semibold">
              MOST POPULAR
            </div>
          </div>
          <CardContent className="pt-8">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h3 className="text-2xl font-bold">Pro</h3>
            </div>
            <p className="text-muted-foreground mb-6">For serious self-improvement</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited scans',
                'Detailed metrics & percentiles',
                'Full suggestion breakdown',
                'Unlimited AI chat',
                'Progress tracking',
                'Priority support',
                'No ads',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-purple-400" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="glow" className="w-full" disabled>
              Coming Soon
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Stripe integration in progress
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
