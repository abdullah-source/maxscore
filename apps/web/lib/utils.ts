import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 7.5) return 'text-green-400'
  if (score >= 5) return 'text-yellow-400'
  return 'text-red-400'
}

export function getScoreGradient(score: number): string {
  if (score >= 7.5) return 'from-green-500 to-emerald-500'
  if (score >= 5) return 'from-yellow-500 to-orange-500'
  return 'from-red-500 to-rose-500'
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return 'Exceptional'
  if (score >= 8) return 'Outstanding'
  if (score >= 7) return 'Above Average'
  if (score >= 6) return 'Average'
  if (score >= 5) return 'Below Average'
  return 'Needs Improvement'
}

export function formatPercentile(percentile: number): string {
  return `Top ${100 - percentile}%`
}