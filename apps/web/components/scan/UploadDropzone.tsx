'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadDropzoneProps {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
}

export function UploadDropzone({ onUpload, isUploading = false }: UploadDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null)
      const file = acceptedFiles[0]

      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload
      try {
        await onUpload(file)
      } catch (err) {
        setError('Upload failed. Please try again.')
        setPreview(null)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  const clearPreview = () => {
    setPreview(null)
    setError(null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
              {/* Preview image */}
              <div className="relative aspect-square max-h-[500px]">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                {/* Scanning animation overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32 mb-4">
                      {/* Pulse rings */}
                      <div className="pulse-ring" style={{ width: '100%', height: '100%' }} />
                      <div className="pulse-ring" style={{ width: '100%', height: '100%', animationDelay: '0.5s' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                      </div>
                    </div>
                    <p className="text-lg font-medium">Analyzing facial features...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Detecting 468 landmark points
                    </p>
                  </div>
                )}

                {/* Scan line animation */}
                {isUploading && <div className="scan-line" />}
              </div>

              {/* Clear button */}
              {!isUploading && (
                <button
                  onClick={clearPreview}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Analyze button */}
            {!isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex justify-center"
              >
                <Button variant="glow" size="xl" onClick={() => onUpload(new File([], ''))}>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Analyze My Face
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                'relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
                'hover:border-purple-500/50 hover:bg-purple-500/5',
                isDragActive
                  ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
                  : 'border-border',
                error && 'border-red-500/50'
              )}
            >
              <input {...getInputProps()} />

              <div className="p-12 text-center">
                {/* Icon */}
                <motion.div
                  animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6"
                >
                  <Upload
                    className={cn(
                      'w-10 h-10 transition-colors',
                      isDragActive ? 'text-purple-400' : 'text-muted-foreground'
                    )}
                  />
                </motion.div>

                {/* Text */}
                <h3 className="text-xl font-semibold mb-2">
                  {isDragActive ? 'Drop your photo here' : 'Upload your photo'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  Drag and drop or click to select
                </p>

                {/* Guidelines */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                  {[
                    { icon: '💡', text: 'Good lighting' },
                    { icon: '👤', text: 'Front-facing' },
                    { icon: '😐', text: 'Neutral expression' },
                    { icon: '📸', text: 'High resolution' },
                  ].map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50"
                    >
                      <span>{item.icon}</span>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Or use camera */}
                <div className="mt-6 pt-6 border-t border-border">
                  <Button variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Use Camera
                  </Button>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}