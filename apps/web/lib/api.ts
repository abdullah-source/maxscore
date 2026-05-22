/**
 * MaxScore API Client
 * Connects frontend to the FastAPI backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://maxscore.onrender.com'

interface ScanResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  overallScore?: number
  percentile?: number
  featureScores?: {
    symmetry: number
    jawline: number
    eyes: number
    nose: number
    lips: number
    skin: number
  }
  suggestions?: Suggestion[]
  errorMessage?: string
}

interface Suggestion {
  id: string
  feature: string
  score: number
  title: string
  description: string
  tips: string[]
  impact: string
  priority: number
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  reply: string
  remaining_messages: number
  tokens_used?: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || 'Request failed')
    }

    return response.json()
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health')
  }

  // Upload and analyze a face image
  async analyzeFace(file: File): Promise<ScanResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/api/v1/scans/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
      throw new Error(error.detail || 'Upload failed')
    }

    return response.json()
  }

  // Get scan by ID
  async getScan(scanId: string): Promise<ScanResponse> {
    return this.request(`/api/v1/scans/${scanId}`)
  }

  // Get user's scan history
  async getScanHistory(): Promise<ScanResponse[]> {
    return this.request('/api/v1/scans')
  }

  // Chat with AI about a scan
  async chat(message: string, scanId?: string): Promise<ChatResponse> {
    return this.request(`/api/v1/chat/`, {
      method: 'POST',
      body: JSON.stringify({ message, scan_id: scanId }),
    })
  }

  // Get chat history for a scan
  async getChatHistory(scanId?: string): Promise<{ messages: ChatMessage[]; remaining_messages: number }> {
    const query = scanId ? `?scan_id=${scanId}` : ''
    return this.request(`/api/v1/chat/history${query}`)
  }
}

export const api = new ApiClient(API_URL)
export type { ScanResponse, Suggestion, ChatMessage, ChatResponse }
