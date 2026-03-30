'use client'

import { format } from 'date-fns'
import { useCurrentLocale } from '@/lib/locale-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from '@/lib/use-translations'
import { getDateFnsLocale } from '@/lib/i18n'
import { type DayData } from '@/components/energy-dashboard-types'

interface EnergyDashboardCalendarProps {
  currentDate: Date
  calendarCells: (DayData | null)[]
  handleDayClick: (day: number) => void
  changeMonth: (delta: number) => void
  yearSelectorOpen: boolean
  setYearSelectorOpen: (open: boolean) => void
  availableYears: number[]
  currentMonth: number
  currentYear: number
  setCurrentDate: (date: Date) => void
}

export function EnergyDashboardCalendar({
  currentDate,
  calendarCells,
  handleDayClick,
  changeMonth,
  yearSelectorOpen,
  setYearSelectorOpen,
  availableYears,
  currentMonth,
  currentYear,
  setCurrentDate,
}: EnergyDashboardCalendarProps) {
  const locale = useCurrentLocale()
  const t = useTranslations()
  const dateFnsLocale = getDateFnsLocale(locale)
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    format(new Date(2024, 0, 1 + index), 'EE', { locale: dateFnsLocale })
  )

  return (
    <>
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button aria-label={t.buttons.previousMonth} variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              aria-label={t.ui.yearSelectTitle}
              onClick={() => setYearSelectorOpen(true)}
              className="text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              {format(currentDate, 'MMMM yyyy', { locale: dateFnsLocale })}
            </button>
            <Button aria-label={t.buttons.nextMonth} variant="ghost" size="icon" onClick={() => changeMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 pb-1">
                {day}
              </div>
            ))}
            {calendarCells.map((d, idx) => {
              if (d === null) {
                return (
                  <div key={`empty-${idx}`} className="aspect-square rounded p-1 bg-transparent" />
                )
              }

              const isUnusual = d.kwh !== null && (d.kwh > 100 || d.kwh < 0)
              const isMissing = d.kwh === null

              return (
                <button
                  key={d.day}
                  onClick={() => handleDayClick(d.day)}
                  className={
                    `aspect-square rounded p-1 text-xs font-medium transition-all ${
                      isMissing
                        ? 'bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 dark:border-gray-500'
                        : d.color
                    } ${isUnusual ? 'ring-2 ring-red-500 dark:ring-red-400' : ''} dark:opacity-90 hover:scale-110 hover:shadow-md hover:z-10 active:scale-95 touch-manipulation flex flex-col items-center justify-center relative`
                  }
                  title={isMissing ? t.ui.noData : isUnusual ? t.ui.unusualValue : ''}
                >
                  <div className={`font-bold ${isMissing ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-900'}`}>
                    {d.day}
                  </div>
                  {d.kwh !== null && (
                    <div className="text-[10px] text-gray-900 dark:text-gray-950 font-semibold">
                      {d.kwh.toFixed(0)}
                      {isUnusual && <span className="text-red-600">!</span>}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs dark:text-gray-300">
              <span className="font-medium">{t.ui.legend}:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-200 rounded" />
                <span>{t.ui.low}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-200 rounded" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-200 rounded" />
                <span>{t.ui.medium}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-lime-200 rounded" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-300 rounded" />
                <span>{t.ui.high}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs dark:text-gray-300">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 rounded" />
                <span>{t.ui.missing}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-200 ring-2 ring-red-500 rounded" />
                <span>{t.ui.unusual}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={yearSelectorOpen} onOpenChange={setYearSelectorOpen}>
        <DialogContent>
          <DialogClose onClose={() => setYearSelectorOpen(false)} />
          <DialogHeader>
            <DialogTitle>{t.ui.yearSelectTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => {
                  setCurrentDate(new Date(year, currentMonth, 1))
                  setYearSelectorOpen(false)
                }}
                className={
                  `w-full p-3 rounded-lg text-left font-semibold transition-all ${
                    year === currentYear
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`
                }
              >
                {year}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
