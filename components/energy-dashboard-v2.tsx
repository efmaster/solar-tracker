'use client'

import { useState, useEffect, useMemo, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { format, getMonth, getYear, getDaysInMonth } from 'date-fns'
import { de } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Sun, Moon, Upload, BarChart3, Download, FileText, File } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
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
  const router = useRouter()

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

  useEffect(() => {
    fetchAllYields()
  }, [])

  const fetchAllYields = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/yields`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API returned non-JSON response, initializing empty data')
        setAllYields([])
        return
      }
      
      const data = await response.json()
      setAllYields(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching all yields:', error)
      setError('Fehler beim Laden der Daten. Bitte Seite neu laden.')
      setAllYields([])
    } finally {
      setLoading(false)
    }
  }

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
      setFormError('Bitte wählen Sie zuerst ein Datum aus.')
      return
    }

    const kwh = parseFloat(kwhValue.replace(',', '.'))
    if (Number.isNaN(kwh) || kwh < 0) {
      setFormError('Bitte geben Sie eine gültige kWh-Zahl größer oder gleich 0 ein.')
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
        setFormError(result?.error || 'Fehler beim Speichern des Ertrags.')
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
      setFormError('Fehler beim Speichern des Ertrags.')
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
        setFormError(result?.error || 'Fehler beim Löschen des Ertrags.')
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
      setFormError('Fehler beim Löschen des Ertrags.')
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
          errors.push(`Zeile ${index + 1}: Ungültiges Format`) 
          return
        }

        const [day, month, year] = dateStr.trim().split('.')
        if (!day || !month || !year) {
          errors.push(`Zeile ${index + 1}: Ungültiges Datum`) 
          return
        }

        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        const kwh = parseFloat(kwhStr.replace(',', '.').trim())
        const dateObj = new Date(isoDate)

        if (isNaN(dateObj.getTime())) {
          errors.push(`Zeile ${index + 1}: Ungültiges Datum ${dateStr}`)
          return
        }

        if (Number.isNaN(kwh) || kwh < 0) {
          errors.push(`Zeile ${index + 1}: Ungültiger kWh-Wert`)
          return
        }

        parsed.push({ date: isoDate, kwh })
      })

      if (parsed.length === 0) {
        setImportResult({
          imported: 0,
          updated: 0,
          errors: errors.length || 1,
          errorDetails: errors.length > 0 ? errors : ['Keine gültigen Daten gefunden']
        })
        return
      }

      const response = await fetch('/api/yields/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsed }),
      })

      if (response.ok) {
        const result = await response.json()
        setImportResult({
          imported: result.imported,
          updated: result.updated,
          errors: result.errors + errors.length,
          errorDetails: [...(result.errorDetails || []), ...errors],
        })
        await fetchAllYields()
      } else {
        const result = await response.json().catch(() => null)
        setImportResult({
          imported: 0,
          updated: 0,
          errors: 1,
          errorDetails: [result?.error || 'Import fehlgeschlagen', ...errors],
        })
      }
    } catch (error) {
      console.error('Error importing file:', error)
      setImportResult({
        imported: 0,
        updated: 0,
        errors: 1,
        errorDetails: ['Fehler beim Lesen der Datei']
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
    link.setAttribute('download', `solarertrag_export_${format(new Date(), 'yyyy-MM-dd')}.csv`)
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
          <title>Solarertrag Export</title>
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
          <h1>Solarertrag Export</h1>
          <div class="summary">
            <h3>Zusammenfassung</h3>
            <p><strong>Gesamt kWh:</strong> ${co2Savings.totalKwh.toFixed(2)} kWh</p>
            <p><strong>CO₂-Einsparung:</strong> ${co2Savings.co2Saved.toFixed(2)} kg</p>
            <p><strong>Bäume-Äquivalent:</strong> ${co2Savings.treesEquivalent.toFixed(1)} Bäume</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>kWh</th>
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
    const months = [
      'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
      'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
    ]

    return months.map((month, index) => {
      const monthYields = yields.filter((y) => {
        const yieldDate = new Date(y.date)
        return getMonth(yieldDate) === index && getYear(yieldDate) === currentYear
      })
      const total = monthYields.reduce((sum, y) => sum + y.kwh, 0)
      return { month, kwh: total }
    })
  }, [yields, currentYear])

  const dailyChartData = useMemo(
    () => dayData.map((d) => ({ tag: d.day, kwh: d.kwh || 0 })),
    [dayData]
  )

  const yearlyLineChartData = useMemo(() => {
    const data: { [key: string]: any } = {}

    for (let month = 0; month < 12; month++) {
      const daysInMonth = getDaysInMonth(new Date(currentYear, month))
      for (let day = 1; day <= daysInMonth; day++) {
        data[day] = data[day] || { day }
      }
    }

    yields.forEach((y) => {
      const yieldDate = new Date(y.date)
      const day = yieldDate.getDate()
      const monthName = format(yieldDate, 'MMMM', { locale: de })
      data[day][monthName] = y.kwh
    })

    return Object.values(data).sort((a: any, b: any) => a.day - b.day)
  }, [yields, currentYear])

  const monthlyStatistics = useMemo(() => {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ]

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
  }, [yields, currentYear])

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

  const missingDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate)
    const existingDays = new Set(monthYields.map((y) => new Date(y.date).getDate()))
    const missing: number[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      if (!existingDays.has(day)) {
        missing.push(day)
      }
    }

    return missing
  }, [monthYields, currentDate])

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
        month: format(new Date(currentYear, month), 'MMM', { locale: de }),
        days: monthData,
      })
    }

    return heatmapData
  }, [yields, currentYear])

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Solarertrag Tracker</h1>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => router.push('/vergleich')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Jahresvergleich
            </Button>
            <Button 
              variant={showHeatmap ? "default" : "outline"}
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="flex items-center gap-2"
            >
              Heatmap {showHeatmap ? 'Aus' : 'An'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <File className="h-4 w-4 mr-2 inline" />
                  CSV Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2 inline" />
                  PDF Export (Drucken)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme}
              className="transition-transform hover:scale-110"
              title={theme === 'dark' ? 'Hell-Modus' : 'Dunkel-Modus'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Missing Days Warning */}
        {missingDays.length > 0 && (
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300">Fehlende Tage in {format(currentDate, 'MMMM', { locale: de })}</h3>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {missingDays.length} Tage
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                    {missingDays.slice(0, 5).join(', ')}{missingDays.length > 5 ? '...' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <EnergyDashboardHeatmap
          showHeatmap={showHeatmap}
          yearHeatmapData={yearHeatmapData}
          currentYear={currentYear}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </div>

        {/* CO2 Savings Card */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🌱</div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">CO₂-Einsparung {currentYear}</h3>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {co2Savings.co2Saved.toFixed(0)} kg
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  ≈ {co2Savings.treesEquivalent.toFixed(1)} Bäume gepflanzt | {co2Savings.totalKwh.toFixed(0)} kWh produziert
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
            <DialogTitle>Ertrag eingeben</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Datum</label>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {selectedDate && format(selectedDate, 'dd. MMMM yyyy', { locale: de })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">kWh Ertrag</label>
              <Input
                type="number"
                step="0.01"
                value={kwhValue}
                onChange={(e) => setKwhValue(e.target.value)}
                placeholder="z.B. 25.5"
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
                Speichern
              </Button>
              {selectedYield && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Löschen...' : 'Löschen'}
                </Button>
              )}
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Abbrechen
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
            <DialogTitle>Jahr auswählen</DialogTitle>
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
