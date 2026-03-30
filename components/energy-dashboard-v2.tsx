'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { format, getMonth, getYear, getDaysInMonth } from 'date-fns'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Sun, Moon, Upload, BarChart3, Download, FileText, File, Languages } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useTranslations } from '@/lib/use-translations'
import { getDateFnsLocale } from '@/lib/i18n'
import { useLocale } from '@/lib/locale-provider'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { EnergyDashboardCalendar } from '@/components/energy-dashboard-calendar'
import { EnergyDashboardHeatmap } from '@/components/energy-dashboard-heatmap'
import { EnergyDashboardCharts } from '@/components/energy-dashboard-charts'
import { EnergyDashboardImportDialog } from '@/components/energy-dashboard-import-dialog'
import { type DayData, type EnergyYield, type ImportResult } from '@/components/energy-dashboard-types'

const getColorForValue = (value: number | null, min: number, max: number): string => {
  if (value === null) return 'bg-gray-100 dark:bg-gray-700'
  if (max === min) return 'bg-green-300'
  
  const normalized = (value - min) / (max - min)
  
  if (normalized < 0.2) return 'bg-red-200'
  if (normalized < 0.4) return 'bg-orange-200'
  if (normalized < 0.6) return 'bg-yellow-200'
  if (normalized < 0.8) return 'bg-lime-200'
  return 'bg-green-300'
}

export default function EnergyDashboard() {
  const { theme, toggleTheme } = useTheme()
  const { locale, toggleLocale } = useLocale()
  const t = useTranslations()
  const dateFnsLocale = getDateFnsLocale(locale)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [kwhValue, setKwhValue] = useState('')
  const [allYields, setAllYields] = useState<EnergyYield[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedYield, setSelectedYield] = useState<EnergyYield | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('yearly')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [yearSelectorOpen, setYearSelectorOpen] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)

  const currentYear = useMemo(() => getYear(currentDate), [currentDate])
  const currentMonth = useMemo(() => getMonth(currentDate), [currentDate])

  const yields = useMemo(
    () => allYields.filter((y) => getYear(new Date(y.date)) === currentYear),
    [allYields, currentYear]
  )

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    allYields.forEach((y) => {
      years.add(getYear(new Date(y.date)))
    })
    const yearArray = Array.from(years).sort((a, b) => b - a)
    if (!yearArray.includes(currentYear)) {
      yearArray.push(currentYear)
      yearArray.sort((a, b) => b - a)
    }
    return yearArray
  }, [allYields, currentYear])

  const fetchAllYields = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/yields`)
      
      const contentType = response.headers.get('content-type')
      const data = (contentType && contentType.includes('application/json'))
        ? await response.json().catch(() => null)
        : null

      if (!response.ok) {
        setError(data?.error || t.errors.loadData)
        setAllYields([])
        return
      }

      setAllYields(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching all yields:', error)
      setError(t.errors.loadData)
      setAllYields([])
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchAllYields()
  }, [fetchAllYields])

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(Date.UTC(currentYear, currentMonth, day))
    setSelectedDate(clickedDate)
    setFormError(null)
    
    const existingYield = yields.find(
      (y) => format(new Date(y.date), 'yyyy-MM-dd') === format(clickedDate, 'yyyy-MM-dd')
    )
    setSelectedYield(existingYield ?? null)
    setKwhValue(existingYield?.kwh.toString() || '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedDate) {
      setFormError(t.errors.invalidDate)
      return
    }

    const kwh = parseFloat(kwhValue.replace(',', '.'))
    if (Number.isNaN(kwh) || kwh < 0) {
      setFormError(t.errors.invalidKwh)
      return
    }

    try {
      setFormError(null)
      const response = await fetch('/api/yields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          kwh,
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok) {
        setFormError(result?.error || t.errors.save)
        return
      }

      await fetchAllYields()
      setDialogOpen(false)
      setKwhValue('')
      setSelectedDate(null)
      setSelectedYield(null)
      setError(null)
    } catch (error) {
      console.error('Error saving yield:', error)
      setFormError(t.errors.save)
    }
  }

  const handleDelete = async () => {
    if (!selectedYield) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/yields?date=${encodeURIComponent(selectedYield.date)}`, {
        method: 'DELETE',
      })

      const result = await response.json().catch(() => null)
      if (!response.ok) {
        setFormError(result?.error || t.errors.delete)
        return
      }

      await fetchAllYields()
      setDialogOpen(false)
      setKwhValue('')
      setSelectedDate(null)
      setSelectedYield(null)
      setError(null)
    } catch (error) {
      console.error('Error deleting yield:', error)
      setFormError(t.errors.delete)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      const parsed: { date: string; kwh: number }[] = []
      const errors: string[] = []

      lines.forEach((line, index) => {
        const [dateStr, kwhStr] = line.split(',')
        if (!dateStr || !kwhStr) {
          errors.push(`${locale === 'de' ? 'Zeile' : 'Line'} ${index + 1}: ${t.ui.invalidFormat}`)
          return
        }

        const [day, month, year] = dateStr.trim().split('.')
        if (!day || !month || !year) {
          errors.push(`${locale === 'de' ? 'Zeile' : 'Line'} ${index + 1}: ${t.ui.invalidDate}`)
          return
        }

        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        const kwh = parseFloat(kwhStr.replace(',', '.').trim())
        const dateObj = new Date(isoDate)

        if (isNaN(dateObj.getTime())) {
          errors.push(`${locale === 'de' ? 'Zeile' : 'Line'} ${index + 1}: ${t.ui.invalidDate} ${dateStr}`)
          return
        }

        if (Number.isNaN(kwh) || kwh < 0) {
          errors.push(`${locale === 'de' ? 'Zeile' : 'Line'} ${index + 1}: ${t.errors.invalidKwh}`)
          return
        }

        parsed.push({ date: isoDate, kwh })
      })

      if (parsed.length === 0) {
        setImportResult({
          imported: 0,
          updated: 0,
          errors: errors.length || 1,
          errorDetails: errors.length > 0 ? errors : [t.errors.noValidData]
        })
        return
      }

      const response = await fetch('/api/yields/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsed }),
      })

      const result = await response.json().catch(() => null)
      if (response.ok) {
        setImportResult({
          imported: result?.imported ?? 0,
          updated: result?.updated ?? 0,
          errors: (result?.errors ?? 0) + errors.length,
          errorDetails: [...(result?.errorDetails ?? []), ...errors],
        })
        await fetchAllYields()
      } else if (result?.errorDetails) {
        setImportResult({
          imported: result.imported ?? 0,
          updated: result.updated ?? 0,
          errors: (result.errors ?? 0) + errors.length,
          errorDetails: [...result.errorDetails, ...errors],
        })
      } else {
        setImportResult({
          imported: 0,
          updated: 0,
          errors: 1 + errors.length,
          errorDetails: [result?.error || t.errors.importFailed, ...errors],
        })
      }
    } catch (error) {
      console.error('Error importing file:', error)
      setImportResult({
        imported: 0,
        updated: 0,
        errors: 1,
        errorDetails: [t.errors.fileReadError],
      })
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const handleExportCSV = () => {
    const sortedYields = [...allYields].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const csvContent = sortedYields.map(y => {
      const date = new Date(y.date)
      const formattedDate = format(date, 'dd.MM.yyyy')
      return `${formattedDate},${y.kwh}`
    }).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${t.csv.fileName}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    const sortedYields = [...allYields].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    let html = `
      <html>
        <head>
          <title>${t.ui.exportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .summary { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${t.ui.exportTitle}</h1>
          <div class="summary">
            <h3>${t.ui.summary}</h3>
            <p><strong>${t.ui.total} kWh:</strong> ${co2Savings.totalKwh.toFixed(2)} kWh</p>
            <p><strong>${t.ui.co2Title}:</strong> ${co2Savings.co2Saved.toFixed(2)} kg</p>
            <p><strong>${t.ui.treesEquivalent ?? 'Bäume-Äquivalent'}:</strong> ${co2Savings.treesEquivalent.toFixed(1)} ${locale === 'de' ? 'Bäume' : 'trees'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>${t.ui.exportDate}</th>
                <th>${t.ui.exportKwh}</th>
              </tr>
            </thead>
            <tbody>
    `
    
    sortedYields.forEach(y => {
      const date = new Date(y.date)
      const formattedDate = format(date, 'dd.MM.yyyy')
      html += `<tr><td>${formattedDate}</td><td>${y.kwh}</td></tr>`
    })
    
    html += `
            </tbody>
          </table>
        </body>
      </html>
    `
    
    const printWindow = window.open('', '', 'height=600,width=800')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const monthYields = useMemo(() => {
    return yields.filter((y) => {
      const yieldDate = new Date(y.date)
      return getMonth(yieldDate) === currentMonth && getYear(yieldDate) === currentYear
    })
  }, [yields, currentMonth, currentYear])

  const dayData = useMemo<DayData[]>(() => {
    const daysInMonth = getDaysInMonth(currentDate)
    const values = monthYields.map((y) => y.kwh).filter((v) => v > 0)
    const min = values.length > 0 ? Math.min(...values) : 0
    const max = values.length > 0 ? Math.max(...values) : 0

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const yieldData = monthYields.find((y) => new Date(y.date).getDate() === day)
      const kwh = yieldData?.kwh ?? null
      return {
        day,
        kwh,
        color: getColorForValue(kwh, min, max),
      }
    })
  }, [monthYields, currentDate])

  const calendarCells = useMemo<(DayData | null)[]>(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const startOffset = (firstDayOfMonth + 6) % 7 // Monday-first week
    const blankCells: (DayData | null)[] = Array.from({ length: startOffset }, () => null)
    return blankCells.concat(dayData)
  }, [currentYear, currentMonth, dayData])

  const monthlyChartData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) =>
      format(new Date(currentYear, index, 1), 'MMM', { locale: dateFnsLocale })
    )

    return months.map((month, index) => {
      const monthYields = yields.filter((y) => {
        const yieldDate = new Date(y.date)
        return getMonth(yieldDate) === index && getYear(yieldDate) === currentYear
      })
      const total = monthYields.reduce((sum, y) => sum + y.kwh, 0)
      return { month, kwh: total }
    })
  }, [yields, currentYear, dateFnsLocale])

  const dailyChartData = useMemo(
    () => dayData.map((d) => ({ tag: d.day, kwh: d.kwh || 0 })),
    [dayData]
  )

  const yearlyLineChartData = useMemo(() => {
    const data: Record<number, { day: number; [key: string]: number }> = {}

    for (let month = 0; month < 12; month++) {
      const daysInMonth = getDaysInMonth(new Date(currentYear, month))
      for (let day = 1; day <= daysInMonth; day++) {
        data[day] = data[day] || { day }
      }
    }

    yields.forEach((y) => {
      const yieldDate = new Date(y.date)
      const day = yieldDate.getDate()
      const monthName = format(yieldDate, 'MMMM', { locale: dateFnsLocale })
      data[day][monthName] = y.kwh
    })

    return Object.values(data).sort((a, b) => a.day - b.day)
  }, [yields, currentYear, dateFnsLocale])

  const monthlyStatistics = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) =>
      format(new Date(currentYear, index, 1), 'MMMM', { locale: dateFnsLocale })
    )

    return months.map((month, index) => {
      const monthYields = yields.filter((y) => {
        const yieldDate = new Date(y.date)
        return getMonth(yieldDate) === index && getYear(yieldDate) === currentYear
      })

      const total = monthYields.reduce((sum, y) => sum + y.kwh, 0)
      const daysWithData = monthYields.length
      const average = daysWithData > 0 ? total / daysWithData : 0
      const daysInMonth = getDaysInMonth(new Date(currentYear, index))

      return {
        month,
        monthIndex: index,
        total,
        average,
        daysWithData,
        daysInMonth,
        coverage: daysInMonth > 0 ? (daysWithData / daysInMonth) * 100 : 0,
      }
    })
  }, [yields, currentYear, dateFnsLocale])

  const co2Savings = useMemo(() => {
    const totalKwh = yields.reduce((sum, y) => sum + y.kwh, 0)
    const co2PerKwh = 0.485
    const co2Saved = totalKwh * co2PerKwh
    const treesEquivalent = co2Saved / 22

    return {
      totalKwh,
      co2Saved,
      treesEquivalent,
    }
  }, [yields])

  const yearHeatmapData = useMemo(() => {
    const heatmapData: { month: string; days: { day: number; kwh: number | null; color: string; date: string }[] }[] = []
    const yearYields = yields

    const yieldMap = new Map<string, number>()
    yearYields.forEach((y) => {
      const dateKey = format(new Date(y.date), 'yyyy-MM-dd')
      yieldMap.set(dateKey, y.kwh)
    })

    const values = yearYields.map((y) => y.kwh).filter((v) => v > 0)
    const min = values.length > 0 ? Math.min(...values) : 0
    const max = values.length > 0 ? Math.max(...values) : 0

    for (let month = 0; month < 12; month++) {
      const daysInMonth = getDaysInMonth(new Date(currentYear, month))
      const monthData = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day)
        const dateKey = format(date, 'yyyy-MM-dd')
        const kwh = yieldMap.get(dateKey) ?? null

        let color = 'bg-gray-100 dark:bg-gray-700'
        if (kwh !== null) {
          const normalized = max > min ? (kwh - min) / (max - min) : 0.5
          if (normalized < 0.2) color = 'bg-red-200'
          else if (normalized < 0.4) color = 'bg-orange-200'
          else if (normalized < 0.6) color = 'bg-yellow-200'
          else if (normalized < 0.8) color = 'bg-lime-200'
          else color = 'bg-green-300'
        }

        monthData.push({ day, kwh, color, date: dateKey })
      }

      heatmapData.push({
        month: format(new Date(currentYear, month), 'MMM', { locale: dateFnsLocale }),
        days: monthData,
      })
    }

    return heatmapData
  }, [yields, currentYear, dateFnsLocale])

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + delta)
    setCurrentDate(newDate)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.appTitle}</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/vergleich"
              className={buttonVariants({ variant: 'outline', className: 'flex items-center gap-2' })}
            >
              <BarChart3 className="h-4 w-4" />
              {t.buttons.yearComparison}
            </Link>
            <Button 
              variant={showHeatmap ? 'default' : 'outline'}
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="flex items-center gap-2"
            >
              {t.buttons.heatmap} {showHeatmap ? t.ui.hide : t.ui.show}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {t.buttons.import}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t.buttons.export}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <File className="h-4 w-4 mr-2 inline" />
                  {t.buttons.csvExport}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2 inline" />
                  {t.buttons.pdfExport}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleLocale}
              className="transition-transform hover:scale-110"
              title={locale === 'de' ? t.buttons.switchToEnglish : t.buttons.switchToGerman}
            >
              <Languages className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme}
              className="transition-transform hover:scale-110"
              title={theme === 'dark' ? t.buttons.lightMode : t.buttons.darkMode}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <EnergyDashboardCalendar
            currentDate={currentDate}
            calendarCells={calendarCells}
            handleDayClick={handleDayClick}
            changeMonth={changeMonth}
            yearSelectorOpen={yearSelectorOpen}
            setYearSelectorOpen={setYearSelectorOpen}
            availableYears={availableYears}
            currentMonth={currentMonth}
            currentYear={currentYear}
            setCurrentDate={setCurrentDate}
          />
          <div className="space-y-6">
            <EnergyDashboardCharts
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentYear={currentYear}
              currentMonth={currentMonth}
              yearlyLineChartData={yearlyLineChartData}
              monthlyStatistics={monthlyStatistics}
              monthlyChartData={monthlyChartData}
              dailyChartData={dailyChartData}
            />
            <EnergyDashboardHeatmap
              showHeatmap={showHeatmap}
              yearHeatmapData={yearHeatmapData}
              currentYear={currentYear}
            />
          </div>
        </div>

        {loading && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-800 dark:text-blue-200">
            {t.ui.loading}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Missing Days Warning */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🌱</div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">{t.ui.co2Title} {currentYear}</h3>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {co2Savings.co2Saved.toFixed(0)} kg
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  ≈ {co2Savings.treesEquivalent.toFixed(1)} {t.ui.treesPlanted} | {co2Savings.totalKwh.toFixed(0)} kWh {t.ui.produced}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{t.ui.enterYield}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.ui.exportDate}</label>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {selectedDate && format(selectedDate, 'dd. MMMM yyyy', { locale: dateFnsLocale })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.chart.kwh}</label>
              <Input
                type="number"
                step="0.01"
                value={kwhValue}
                onChange={(e) => setKwhValue(e.target.value)}
                placeholder="25.5"
                className="mt-1"
                autoFocus
              />
            </div>
            {formError && (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
                {formError}
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={!selectedDate || Number.isNaN(parseFloat(kwhValue.replace(',', '.')))}
                className="flex-1"
              >
                {t.buttons.save}
              </Button>
              {selectedYield && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? t.buttons.deleting : t.buttons.delete}
                </Button>
              )}
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                {t.buttons.close}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Year Selector Dialog */}
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
                className={`
                  w-full p-3 rounded-lg text-left font-semibold transition-all
                  ${year === currentYear 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {year}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <EnergyDashboardImportDialog
        importDialogOpen={importDialogOpen}
        setImportDialogOpen={setImportDialogOpen}
        handleFileImport={handleFileImport}
        importing={importing}
        importResult={importResult}
        setImportResult={setImportResult}
      />
    </div>
  )
}
