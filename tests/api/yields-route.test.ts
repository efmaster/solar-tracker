// @vitest-environment node
import { describe, expect, it, vi, beforeEach, beforeAll, afterEach } from 'vitest'
import type { NextRequest } from 'next/server'

type MockPrisma = {
  energyYield: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
}

vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    energyYield: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  }

  return {
    prisma: mockPrisma,
    __mockPrisma: mockPrisma,
  }
})

let GET: typeof import('../../app/api/yields/route').GET
let POST: typeof import('../../app/api/yields/route').POST
let DELETE: typeof import('../../app/api/yields/route').DELETE
let mockPrisma: MockPrisma

beforeAll(async () => {
  const route = (await import('../../app/api/yields/route')) as typeof import('../../app/api/yields/route')
  GET = route.GET
  POST = route.POST
  DELETE = route.DELETE
  const prismaModule = (await import('@/lib/prisma')) as unknown as { __mockPrisma: MockPrisma }
  mockPrisma = prismaModule.__mockPrisma
})

beforeEach(() => {
  mockPrisma.energyYield.findMany.mockReset()
  mockPrisma.energyYield.findUnique.mockReset()
  mockPrisma.energyYield.create.mockReset()
  mockPrisma.energyYield.update.mockReset()
  mockPrisma.energyYield.delete.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('GET /api/yields', () => {
  it('returns yields without filters', async () => {
    mockPrisma.energyYield.findMany.mockResolvedValue([
      { id: 1, date: new Date('2025-03-01'), kwh: 5 },
      { id: 2, date: new Date('2025-03-02'), kwh: 8 },
    ])

    const nextRequest = { nextUrl: new URL('http://localhost/') } as unknown as NextRequest
    const response = await GET(nextRequest)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toHaveLength(2)
    expect(mockPrisma.energyYield.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { date: 'asc' },
    })
  })

  it('returns 400 for invalid month filter', async () => {
    const nextRequest = { nextUrl: new URL('http://localhost/?year=2025&month=13') } as unknown as NextRequest
    const response = await GET(nextRequest)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json).toEqual({ error: 'Ungültiger Monat.' })
  })
})

describe('POST /api/yields', () => {
  it('creates a new yield when none exists', async () => {
    mockPrisma.energyYield.findUnique.mockResolvedValue(null)
    mockPrisma.energyYield.create.mockResolvedValue({ id: 1, date: new Date('2025-03-02'), kwh: 10 })

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ date: '02.03.2025', kwh: 10 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const nextRequest = request as unknown as NextRequest
    const response = await POST(nextRequest)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ id: 1, date: '2025-03-02T00:00:00.000Z', kwh: 10 })
    expect(mockPrisma.energyYield.create).toHaveBeenCalledTimes(1)
  })

  it('updates an existing yield when found', async () => {
    mockPrisma.energyYield.findUnique.mockResolvedValue({ id: 1, date: new Date('2025-03-02'), kwh: 8 })
    mockPrisma.energyYield.update.mockResolvedValue({ id: 1, date: new Date('2025-03-02'), kwh: 12 })

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ date: '2025-03-02', kwh: 12 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const nextRequest = request as unknown as NextRequest
    const response = await POST(nextRequest)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ id: 1, date: '2025-03-02T00:00:00.000Z', kwh: 12 })
    expect(mockPrisma.energyYield.update).toHaveBeenCalledTimes(1)
  })
})

describe('DELETE /api/yields', () => {
  it('returns 400 for invalid delete date', async () => {
    const nextRequest = { nextUrl: new URL('http://localhost/?date=invalid') } as unknown as NextRequest
    const response = await DELETE(nextRequest)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json).toEqual({ error: 'Ungültiges Datum: invalid' })
  })

  it('deletes a yield with a valid date', async () => {
    mockPrisma.energyYield.delete.mockResolvedValue({ id: 1, date: new Date('2025-03-02'), kwh: 10 })

    const nextRequest = { nextUrl: new URL('http://localhost/?date=02.03.2025') } as unknown as NextRequest
    const response = await DELETE(nextRequest)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({ deleted: { id: 1, date: '2025-03-02T00:00:00.000Z', kwh: 10 } })
    expect(mockPrisma.energyYield.delete).toHaveBeenCalledWith({ where: { date: new Date('2025-03-02T00:00:00.000Z') } })
  })
})
