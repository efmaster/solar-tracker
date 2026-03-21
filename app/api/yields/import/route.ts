import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: 0,
      errorDetails: [] as string[]
    }

    for (const entry of data) {
      try {
        const { date, kwh } = entry
        
        if (!date || kwh === undefined) {
          results.errors++
          results.errorDetails.push(`Invalid entry: ${JSON.stringify(entry)}`)
          continue
        }

        const dateObj = new Date(date)
        if (isNaN(dateObj.getTime())) {
          results.errors++
          results.errorDetails.push(`Invalid date: ${date}`)
          continue
        }

        dateObj.setHours(0, 0, 0, 0)

        const existingYield = await prisma.energyYield.findUnique({
          where: { date: dateObj },
        })

        if (existingYield) {
          await prisma.energyYield.update({
            where: { date: dateObj },
            data: { kwh: parseFloat(kwh) },
          })
          results.updated++
        } else {
          await prisma.energyYield.create({
            data: {
              date: dateObj,
              kwh: parseFloat(kwh),
            },
          })
          results.imported++
        }
      } catch (error) {
        results.errors++
        results.errorDetails.push(`Error processing entry: ${error}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error importing yields:', error)
    return NextResponse.json(
      { error: 'Failed to import yields' },
      { status: 500 }
    )
  }
}
