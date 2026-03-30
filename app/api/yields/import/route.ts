import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseImportBody, parseImportEntry } from '@/lib/yield-validation'

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Ungültiges JSON im Request-Body' },
        { status: 400 }
      )
    }

    const parsedBody = parseImportBody(body)

    if ('error' in parsedBody) {
      return NextResponse.json({ error: parsedBody.error }, { status: 400 })
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: 0,
      errorDetails: [] as string[],
    }

    for (const [index, entry] of parsedBody.data.entries()) {
      const parsed = parseImportEntry(entry, index)
      if ('error' in parsed) {
        results.errors++
        results.errorDetails.push(parsed.error)
        continue
      }

      try {
        const upserted = await prisma.energyYield.upsert({
          where: { date: parsed.date },
          create: { date: parsed.date, kwh: parsed.kwh },
          update: { kwh: parsed.kwh },
        })

        // Prisma sets `updatedAt` automatically for updates.
        // On create, `createdAt` and `updatedAt` should be equal (same insert timestamp).
        const createdAtMs = upserted.createdAt?.getTime?.() ?? 0
        const updatedAtMs = upserted.updatedAt?.getTime?.() ?? 0
        if (createdAtMs !== 0 && createdAtMs === updatedAtMs) results.imported++
        else results.updated++
      } catch (error) {
        results.errors++
        results.errorDetails.push(`Error processing entry ${index + 1}: ${error}`)
      }
    }

    if (results.imported + results.updated === 0 && results.errors > 0) {
      return NextResponse.json(
        {
          ...results,
          error: 'Kein gültiger Eintrag wurde importiert.',
        },
        { status: 400 }
      )
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
