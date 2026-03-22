import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    let whereClause = {}

    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      }
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1)
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59)
      whereClause = {
        date: {
          gte: startDate,
          lte: endDate,
        },
      }
    }

    const yields = await prisma.energyYield.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
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
    const { date, kwh } = body

    if (!date || kwh === undefined) {
      return NextResponse.json(
        { error: 'Date and kwh are required' },
        { status: 400 }
      )
    }

    const dateObj = new Date(date)
    dateObj.setUTCHours(0, 0, 0, 0)

    const existingYield = await prisma.energyYield.findUnique({
      where: { date: dateObj },
    })

    let result
    if (existingYield) {
      result = await prisma.energyYield.update({
        where: { date: dateObj },
        data: { kwh: parseFloat(kwh) },
      })
    } else {
      result = await prisma.energyYield.create({
        data: {
          date: dateObj,
          kwh: parseFloat(kwh),
        },
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving yield:', error)
    return NextResponse.json(
      { error: 'Failed to save yield' },
      { status: 500 }
    )
  }
}
