import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseYieldBody, parseYearMonthParams, parseDateValue } from '@/lib/yield-validation'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    let whereClause = {}

    if (year || month) {
      const parsedParams = parseYearMonthParams(year, month)
      if ('error' in parsedParams) {
        return NextResponse.json({ error: parsedParams.error }, { status: 400 })
      }

      whereClause = {
        date: {
          gte: parsedParams.startDate,
          lte: parsedParams.endDate,
        },
      }
    }

    const yields = await prisma.energyYield.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      select: { id: true, date: true, kwh: true },
    })

    return NextResponse.json(yields)
  } catch (error) {
    console.error('Error fetching yields:', error)
    return NextResponse.json(
      { error: 'Failed to fetch yields' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = parseYieldBody(body)

    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const existingYield = await prisma.energyYield.findUnique({
      where: { date: parsed.date },
      select: { id: true },
    })

    const result = existingYield
      ? await prisma.energyYield.update({
          where: { date: parsed.date },
          data: { kwh: parsed.kwh },
          select: { id: true, date: true, kwh: true },
        })
      : await prisma.energyYield.create({
          data: {
            date: parsed.date,
            kwh: parsed.kwh,
          },
          select: { id: true, date: true, kwh: true },
        })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving yield:', error)
    return NextResponse.json(
      { error: 'Failed to save yield' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get('date')
    const parsed = parseDateValue(dateParam)

    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const deleted = await prisma.energyYield.delete({
      where: { date: parsed.date },
      select: { id: true, date: true, kwh: true },
    })

    return NextResponse.json({ deleted })
  } catch (error) {
    console.error('Error deleting yield:', error)
    return NextResponse.json(
      { error: 'Failed to delete yield' },
      { status: 500 }
    )
  }
}
