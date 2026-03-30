import { describe, expect, it } from 'vitest'
import {
  parseDateValue,
  parseKwhValue,
  parseYieldBody,
  parseImportEntry,
  parseImportBody,
  parseYearMonthParams,
} from '../lib/yield-validation'

describe('yield validation', () => {
  it('parses ISO dates and normalizes them to UTC midnight', () => {
    const result = parseDateValue('2025-03-02')
    expect('error' in result).toBe(false)
    if ('date' in result) {
      expect(result.date.toISOString()).toBe('2025-03-02T00:00:00.000Z')
    }
  })

  it('parses German date strings correctly', () => {
    const result = parseDateValue('02.03.2025')
    expect('error' in result).toBe(false)
    if ('date' in result) {
      expect(result.date.toISOString()).toBe('2025-03-02T00:00:00.000Z')
    }
  })

  it('rejects invalid dates', () => {
    const result = parseDateValue('31.02.2024')
    expect(result).toHaveProperty('error')
  })

  it('parses kWh values with decimals and commas', () => {
    expect(parseKwhValue('12.5')).toEqual({ kwh: 12.5 })
    expect(parseKwhValue('12,5')).toEqual({ kwh: 12.5 })
  })

  it('rejects negative kWh values', () => {
    const result = parseKwhValue('-1')
    expect(result).toHaveProperty('error')
  })

  it('validates yield payload body', () => {
    const result = parseYieldBody({ date: '2025-03-02', kwh: '10.2' })
    expect('error' in result).toBe(false)
    if ('date' in result) {
      expect(result.date.toISOString()).toBe('2025-03-02T00:00:00.000Z')
      expect(result.kwh).toBe(10.2)
    }
  })

  it('reports line index for invalid import entries', () => {
    const result = parseImportEntry({ date: 'not-a-date', kwh: 10 }, 2)
    expect(result).toHaveProperty('error')
    if ('error' in result) {
      expect(result.error).toContain('Zeile 3:')
    }
  })

  it('validates import payload body', () => {
    const result = parseImportBody({ data: [{ date: '01.01.2025', kwh: 3.5 }] })
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.data).toHaveLength(1)
    }
  })

  it('rejects import payload with missing data field', () => {
    const result = parseImportBody({})
    expect(result).toHaveProperty('error')
  })

  it('rejects import payload when data is not an array', () => {
    const result = parseImportBody({ data: 'invalid' })
    expect(result).toHaveProperty('error')
  })

  it('parses year and month query parameters', () => {
    const result = parseYearMonthParams('2025', '3')
    expect('error' in result).toBe(false)
    if ('startDate' in result) {
      expect(result.startDate.toISOString()).toBe('2025-03-01T00:00:00.000Z')
      expect(result.endDate.toISOString()).toBe('2025-03-31T23:59:59.000Z')
    }
  })

  it('rejects invalid month query parameters', () => {
    const result = parseYearMonthParams('2025', '13')
    expect(result).toHaveProperty('error')
  })
})
