import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toUTCYear(date: Date): number {
  return date.getUTCFullYear()
}

function toUTCMonthIndex(date: Date): number {
  return date.getUTCMonth()
}

export async function GET(request: NextRequest) {
  void request
  try {
    const yields = await prisma.energyYield.findMany({
      select: { date: true, kwh: true },
      orderBy: { date: 'asc' },
    })

    // Aggregate per year, and keep month totals (0..11) for charting.
    const byYear = new Map<
      number,
      {
        year: number
        total: number
        count: number
        monthsSet: Set<number>
        monthlyTotals: number[]
      }
    >()

    for (const y of yields) {
      const year = toUTCYear(y.date)
      const monthIndex = toUTCMonthIndex(y.date)

      let entry = byYear.get(year)
      if (!entry) {
        entry = {
          year,
          total: 0,
          count: 0,
          monthsSet: new Set<number>(),
          monthlyTotals: Array.from({ length: 12 }, () => 0),
        }
        byYear.set(year, entry)
      }

      entry.total += y.kwh
      entry.count += 1
      entry.monthsSet.add(monthIndex)
      entry.monthlyTotals[monthIndex] += y.kwh
    }

    const years = Array.from(byYear.values()).sort((a, b) => a.year - b.year)
    const responseYears = years.map((y) => ({
      year: y.year,
      total: y.total,
      count: y.count,
      monthsWithData: y.monthsSet.size,
      monthlyTotals: y.monthlyTotals,
    }))

    return NextResponse.json({ years: responseYears })
  } catch (error) {
    console.error('Error fetching yields summary:', error)
    return NextResponse.json({ error: 'Failed to fetch yields summary' }, { status: 500 })
  }
}

