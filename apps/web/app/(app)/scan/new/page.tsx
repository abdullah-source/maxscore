'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UploadDropzone } from '@/components/scan/UploadDropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Zap, Eye } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function NewScanPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const result = await api.analyzeFace(file)
      toast.success('Analysis complete!')
      router.push(`/scan/${result.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze image'
      setError(message)
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Analyze Your <span className="gradient-text">Face</span>
        </h1>
        <p className="text-muted-foreground">
          Upload a clear, front-facing photo for the most accurate analysis
        </p>
      </motion.div>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <UploadDropzone onUpload={handleUpload} isUploading={isUploading} />
      </motion.div>

      {/* Info cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-4 mt-8"
      >
        {[
          {
            icon: Zap,
            title: 'Instant Results',
            description: 'Get your analysis in seconds',
          },
          {
            icon: Eye,
            title: '468 Points',
            description: 'Precise facial landmark detection',
          },
          {
            icon: Shield,
            title: 'Private & Secure',
            description: 'Your photos are never shared',
          },
        ].map((item, index) => (
          <Card key={item.title} className="bg-card/50">
            <CardContent className="pt-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 mb-3">
                <item.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Remaining scans */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          <span className="text-purple-400 font-medium">1 free scan</span> remaining today
        </p>
      </motion.div>
    </div>
  )
}