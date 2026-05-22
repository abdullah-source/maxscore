import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const PYTHON_API = process.env.PYTHON_API_URL || 'https://maxscore.onrender.com'
const DEMO_USER_ID = 'demo-user'

async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { clerkId: DEMO_USER_ID },
    update: {},
    create: {
      clerkId: DEMO_USER_ID,
      email: 'demo@maxscore.app',
    },
  })
}

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const pythonForm = new FormData()
  pythonForm.append('file', file)

  const pyRes = await fetch(`${PYTHON_API}/api/v1/scans/analyze`, {
    method: 'POST',
    body: pythonForm,
  })

  if (!pyRes.ok) {
    const err = await pyRes.text()
    return NextResponse.json(
      { error: 'Analysis service failed', detail: err },
      { status: 502 }
    )
  }

  const analysis = await pyRes.json()
  const user = await ensureDemoUser()

  const scan = await prisma.scan.create({
    data: {
      userId: user.id,
      imageUrl: '',
      status: 'COMPLETED',
      overallScore: analysis.overall_score,
      percentile: analysis.percentile,
      featureScores: analysis.feature_scores,
    },
  })

  if (analysis.suggestions && Array.isArray(analysis.suggestions)) {
    await prisma.suggestion.createMany({
      data: analysis.suggestions.map((s: any, i: number) => ({
        scanId: scan.id,
        feature: s.feature,
        score: s.score || 0,
        title: s.title,
        description: s.description,
        tips: s.tips || [],
        impact: s.impact,
        priority: s.priority ?? i,
      })),
    })
  }

  return NextResponse.json({
    id: scan.id,
    overall_score: analysis.overall_score,
    percentile: analysis.percentile,
    feature_scores: analysis.feature_scores,
    suggestions: analysis.suggestions,
  })
}
