import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EnergyDashboardCalendar } from '../components/energy-dashboard-calendar'

vi.mock('@/lib/locale-provider', () => ({
  useCurrentLocale: () => 'de',
  useLocale: () => ({ locale: 'de', setLocale: vi.fn(), toggleLocale: vi.fn() }),
}))

describe('EnergyDashboardCalendar', () => {
  it('calls handleDayClick when a calendar day is clicked', () => {
    const handleDayClick = vi.fn()
    const changeMonth = vi.fn()
    const setYearSelectorOpen = vi.fn()

    const calendarCells = [
      null,
      { day: 1, kwh: null, color: 'bg-gray-100' },
      { day: 2, kwh: 15, color: 'bg-green-300' },
      { day: 3, kwh: 120, color: 'bg-red-200' },
    ]

    const { container } = render(
      <EnergyDashboardCalendar
        currentDate={new Date('2025-03-01')}
        calendarCells={calendarCells}
        handleDayClick={handleDayClick}
        changeMonth={changeMonth}
        yearSelectorOpen={false}
        setYearSelectorOpen={setYearSelectorOpen}
        availableYears={[2024, 2025]}
        currentMonth={2}
        currentYear={2025}
        setCurrentDate={() => {}}
      />
    )

    const dayButton = within(container).getByText('2').closest('button')
    expect(dayButton).toBeTruthy()
    if (dayButton) {
      fireEvent.click(dayButton)
    }

    expect(handleDayClick).toHaveBeenCalledWith(2)
  })

  it('calls changeMonth when navigation buttons are clicked', () => {
    const handleDayClick = vi.fn()
    const changeMonth = vi.fn()
    const setYearSelectorOpen = vi.fn()

    const calendarCells = [
      { day: 1, kwh: 5, color: 'bg-green-300' }
    ]

    render(
      <EnergyDashboardCalendar
        currentDate={new Date('2025-03-01')}
        calendarCells={calendarCells}
        handleDayClick={handleDayClick}
        changeMonth={changeMonth}
        yearSelectorOpen={false}
        setYearSelectorOpen={setYearSelectorOpen}
        availableYears={[2025]}
        currentMonth={2}
        currentYear={2025}
        setCurrentDate={() => {}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Vorheriger Monat' }))
    fireEvent.click(screen.getByRole('button', { name: 'Nächster Monat' }))

    expect(changeMonth).toHaveBeenCalledTimes(2)
    expect(changeMonth).toHaveBeenCalledWith(-1)
    expect(changeMonth).toHaveBeenCalledWith(1)
  })

  it('opens year selector when year button is clicked', () => {
    const handleDayClick = vi.fn()
    const changeMonth = vi.fn()
    const setYearSelectorOpen = vi.fn()

    const calendarCells = [
      { day: 1, kwh: 5, color: 'bg-green-300' }
    ]

    render(
      <EnergyDashboardCalendar
        currentDate={new Date('2025-03-01')}
        calendarCells={calendarCells}
        handleDayClick={handleDayClick}
        changeMonth={changeMonth}
        yearSelectorOpen={false}
        setYearSelectorOpen={setYearSelectorOpen}
        availableYears={[2025]}
        currentMonth={2}
        currentYear={2025}
        setCurrentDate={() => {}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Jahr auswählen/ }))
    expect(setYearSelectorOpen).toHaveBeenCalledWith(true)
  })
})
