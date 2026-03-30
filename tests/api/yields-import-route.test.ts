import { describe, expect, it, vi, beforeEach, afterEach, beforeAll } from 'vitest'

type MockPrisma = {
  energyYield: {
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    energyYield: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  }

  return {
    prisma: mockPrisma,
    __mockPrisma: mockPrisma,
  }
})

let POST: any
let mockPrisma: MockPrisma

beforeAll(async () => {
  const route = await import('../../app/api/yields/import/route')
  POST = route.POST
  const prismaModule = (await import('@/lib/prisma')) as unknown as { __mockPrisma: MockPrisma }
  mockPrisma = prismaModule.__mockPrisma
})

beforeEach(() => {
  mockPrisma.energyYield.findUnique.mockReset()
  mockPrisma.energyYield.create.mockReset()
  mockPrisma.energyYield.update.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('POST /api/yields/import', () => {
  it('returns 400 when data field is missing', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ invalid: [] }),
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as Request

    const response = await POST(request as any)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json).toEqual({ error: 'Feld data ist erforderlich.' })
  })

  it('returns 400 when data is not an array', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ data: 'invalid' }),
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as Request

    const response = await POST(request as any)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json).toEqual({ error: 'Feld data muss ein Array sein.' })
  })

  it('returns 400 when request body is invalid JSON', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: '{ invalid json ',
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as Request

    const response = await POST(request as any)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json).toEqual({ error: 'Ungültiges JSON im Request-Body' })
  })

  it('returns 400 when every import entry is invalid', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ data: [{ date: 'invalid', kwh: 'abc' }] }),
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as Request

    const response = await POST(request as any)
    expect(response.status).toBe(400)

    const json = await response.json()
    expect(json.imported).toBe(0)
    expect(json.updated).toBe(0)
    expect(json.errors).toBe(1)
    expect(json.error).toBe('Kein gültiger Eintrag wurde importiert.')
    expect(json.errorDetails[0]).toContain('Zeile 1:')
  })

  it('imports a valid entry and returns created count', async () => {
    mockPrisma.energyYield.findUnique.mockResolvedValue(null)
    mockPrisma.energyYield.create.mockResolvedValue({ id: 1, kwh: 10 })

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ data: [{ date: '01.01.2025', kwh: '10.5' }] }),
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as Request

    const response = await POST(request as any)
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json.imported).toBe(1)
    expect(json.updated).toBe(0)
    expect(json.errors).toBe(0)
    expect(mockPrisma.energyYield.create).toHaveBeenCalledTimes(1)
  })

  it('updates existing entry and returns updated count', async () => {
    mockPrisma.energyYield.findUnique.mockResolvedValue({ id: 1, kwh: 8 })
    mockPrisma.energyYield.update.mockResolvedValue({ id: 1, kwh: 12 })

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ data: [{ date: '02.02.2025', kwh: 12 }] }),
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as Request

    const response = await POST(request as any)
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json.imported).toBe(0)
    expect(json.updated).toBe(1)
    expect(json.errors).toBe(0)
    expect(mockPrisma.energyYield.update).toHaveBeenCalledTimes(1)
  })
})
