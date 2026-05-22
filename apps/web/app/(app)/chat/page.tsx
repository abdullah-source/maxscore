'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Send,
  Sparkles,
  User,
  Loader2,
  Lightbulb,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Suggested prompts - psychologically optimized for positive engagement
const suggestedPrompts = [
  {
    icon: '💪',
    title: 'Maximize my strengths',
    prompt: 'What are my best features and how can I enhance them further?',
  },
  {
    icon: '🎯',
    title: 'Quick wins',
    prompt: 'What are 3 easy changes I can make today to look better?',
  },
  {
    icon: '✨',
    title: 'Skincare routine',
    prompt: 'Create a personalized skincare routine based on my skin analysis',
  },
  {
    icon: '💈',
    title: 'Grooming advice',
    prompt: 'What hairstyle and grooming changes would suit my face shape?',
  },
]

// Demo responses - psychologically optimized language
const demoResponses: Record<string, string> = {
  default: `Based on your latest analysis, I can see you have several standout features to be proud of!

**Your Strengths:**
- Your facial symmetry is in the top 12% - this is one of the most important factors in attractiveness
- Your eye area scored exceptionally well, with great proportions

**Personalized Recommendations:**

1. **Jawline Enhancement** (Highest Impact)
   Your jawline is your biggest opportunity for improvement. Here's what I suggest:
   - Practice mewing for 10-15 minutes daily
   - Try facial exercises like chin tucks
   - Stay hydrated to reduce facial puffiness

2. **Skin Optimization**
   Your skin quality is good but can be elevated:
   - Morning: Vitamin C serum + SPF 30
   - Evening: Gentle retinol 2-3x per week

3. **Subtle Enhancements**
   - Consider eyebrow grooming to frame your eyes better
   - Adequate sleep (7-9 hours) for that natural glow

Would you like me to elaborate on any of these suggestions?`,
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await api.chat(userMessage.content)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setRemainingMessages(response.remaining_messages)
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err instanceof Error
          ? `Sorry, something went wrong: ${err.message}`
          : 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          AI Beauty Advisor
        </h1>
        <p className="text-muted-foreground">
          Ask me anything about your analysis and get personalized advice
        </p>
      </motion.div>

      {/* Chat container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-8"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                How can I help you look your best?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                I've analyzed your facial features and I'm ready to provide
                personalized advice. Ask me anything!
              </p>

              {/* Suggested prompts */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={prompt.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSuggestedPrompt(prompt.prompt)}
                    className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary text-left transition-colors group"
                  >
                    <span className="text-2xl mb-2 block">{prompt.icon}</span>
                    <p className="font-medium text-sm group-hover:text-purple-400 transition-colors">
                      {prompt.title}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        message.role === 'user'
                          ? 'bg-purple-500'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      )}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl p-4',
                        message.role === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-secondary'
                      )}
                    >
                      <div className="prose prose-sm prose-invert max-w-none">
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className={line.startsWith('**') ? 'font-semibold' : ''}>
                            {line.replace(/\*\*/g, '')}
                          </p>
                        ))}
                      </div>

                      {/* Message actions */}
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                          <button className="p-1.5 rounded-lg hover:bg-secondary-foreground/10 transition-colors">
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-secondary-foreground/10 transition-colors">
                            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-secondary-foreground/10 transition-colors">
                            <ThumbsDown className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-secondary-foreground/10 transition-colors">
                            <RefreshCw className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-secondary rounded-2xl p-4">
                    <div className="typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Ask me anything about improving your appearance..."
                className="w-full px-4 py-3 rounded-xl bg-secondary border-0 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none"
                rows={1}
              />
            </div>
            <Button
              type="submit"
              variant="glow"
              size="icon"
              className="h-12 w-12"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            <span className="text-purple-400">
              {remainingMessages !== null ? `${remainingMessages} messages` : '3 messages'}
            </span> remaining (Free tier)
          </p>
        </div>
      </Card>
    </div>
  )
}
