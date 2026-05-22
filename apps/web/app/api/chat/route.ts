import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API = process.env.PYTHON_API_URL || 'https://maxscore.onrender.com'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const body = await request.json()

  const pyRes = await fetch(`${PYTHON_API}/api/v1/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await pyRes.json().catch(() => ({ error: 'Invalid response' }))

  if (!pyRes.ok) {
    return NextResponse.json(
      { error: data.detail || 'Chat service failed' },
      { status: pyRes.status }
    )
  }

  return NextResponse.json(data)
}
