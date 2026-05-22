import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const scan = await prisma.scan.findUnique({
    where: { id: params.id },
    include: {
      suggestions: {
        orderBy: { priority: 'desc' },
      },
    },
  })

  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
  }

  return NextResponse.json(scan)
}
