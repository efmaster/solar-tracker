import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import EnergyDashboard from '../components/energy-dashboard-v2'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}))

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockReset()
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('EnergyDashboard integration', () => {
  it('saves a new yield entry and reloads data', async () => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    mockFetch
      .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, date: new Date(currentYear, currentMonth, 1).toISOString(), kwh: 12.5 }) })
      .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => [{ id: 1, date: new Date(currentYear, currentMonth, 1).toISOString(), kwh: 12.5 }] })

    render(<EnergyDashboard />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/yields')
    })

    const dayElement = screen.getAllByText('1').find((element) => element.closest('button'))
    expect(dayElement).toBeDefined()
    if (!dayElement) throw new Error('Day button not found')
    fireEvent.click(dayElement.closest('button')!)

    const input = await screen.findByPlaceholderText('z.B. 25.5')
    fireEvent.change(input, { target: { value: '12.5' } })

    const saveButton = screen.getByRole('button', { name: 'Speichern' })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/yields', expect.objectContaining({ method: 'POST' }))
    })

    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('deletes an existing yield entry when delete is clicked', async () => {
    const existingDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const existingIso = existingDate.toISOString()

    mockFetch
      .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => [{ id: 1, date: existingIso, kwh: 8 }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ deleted: { id: 1, date: existingIso, kwh: 8 } } ) })
      .mockResolvedValueOnce({ ok: true, headers: { get: () => 'application/json' }, json: async () => [] })

    render(<EnergyDashboard />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/yields')
    })

    const dayElement = screen.getAllByText('1').find((element) => element.closest('button'))
    expect(dayElement).toBeDefined()
    if (!dayElement) throw new Error('Day button not found')
    fireEvent.click(dayElement.closest('button')!)

    const deleteButton = await screen.findByRole('button', { name: /Löschen/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/yields?date='), expect.objectContaining({ method: 'DELETE' }))
    })

    expect(mockFetch).toHaveBeenCalledTimes(3)
  })
})
