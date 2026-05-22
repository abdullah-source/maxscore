import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  const user = await ensureDemoUser()

  const scans = await prisma.scan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      status: true,
      overallScore: true,
      percentile: true,
      featureScores: true,
      thumbnailUrl: true,
    },
  })

  return NextResponse.json(scans)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = await ensureDemoUser()

  const scan = await prisma.scan.create({
    data: {
      userId: user.id,
      imageUrl: body.imageUrl || '',
      thumbnailUrl: body.thumbnailUrl,
      status: body.status || 'COMPLETED',
      overallScore: body.overallScore,
      percentile: body.percentile,
      featureScores: body.featureScores,
      rawMetrics: body.rawMetrics,
    },
  })

  if (body.suggestions && Array.isArray(body.suggestions)) {
    await prisma.suggestion.createMany({
      data: body.suggestions.map((s: any, i: number) => ({
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

  return NextResponse.json(scan)
}
