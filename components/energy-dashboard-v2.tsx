'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, getMonth, getYear, getDaysInMonth } from 'date-fns'
import { de } from 'date-fns/locale'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, Sun, Moon, Upload, BarChart3, Download } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

interface EnergyYield {
  id: number
  date: string
  kwh: number
}

interface ImportResult {
  imported: number
  updated: number
  errors: number
  errorDetails: string[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const monthNames: { [key: string]: string } = {
      'Jan': 'Januar', 'Feb': 'Februar', 'Mär': 'März', 'Apr': 'April',
      'Mai': 'Mai', 'Jun': 'Juni', 'Jul': 'Juli', 'Aug': 'August',
      'Sep': 'September', 'Okt': 'Oktober', 'Nov': 'November', 'Dez': 'Dezember'
    }
    
    const displayLabel = monthNames[label as string] || (typeof label === 'number' ? `Tag: ${label}` : label)
    
    return (
      <div className="bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-blue-400 rounded-lg shadow-2xl p-4">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{displayLabel}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-800 dark:text-gray-100">
            <span style={{ color: entry.color }} className="font-semibold">{entry.name}: </span>
            <span className="font-bold text-gray-900 dark:text-white">{entry.value.toFixed(2)} kWh</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

interface DayData {
  day: number
  kwh: number | null
  color: string
}

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
  const [activeTab, setActiveTab] = useState('yearly')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [yearSelectorOpen, setYearSelectorOpen] = useState(false)
  const router = useRouter()

  const currentYear = getYear(currentDate)
  const currentMonth = getMonth(currentDate)
  
  const yields = allYields.filter(y => getYear(new Date(y.date)) === currentYear)
  
  const getAvailableYears = () => {
    const years = new Set<number>()
    allYields.forEach(y => {
      years.add(getYear(new Date(y.date)))
    })
    const yearArray = Array.from(years).sort((a, b) => b - a)
    if (!yearArray.includes(currentYear)) {
      yearArray.push(currentYear)
      yearArray.sort((a, b) => b - a)
    }
    return yearArray
  }

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
    const clickedDate = new Date(currentYear, currentMonth, day)
    setSelectedDate(clickedDate)
    
    const existingYield = yields.find(
      (y) => format(new Date(y.date), 'yyyy-MM-dd') === format(clickedDate, 'yyyy-MM-dd')
    )
    setKwhValue(existingYield?.kwh.toString() || '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!selectedDate) return
    
    try {
      const response = await fetch('/api/yields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          kwh: parseFloat(kwhValue),
        }),
      })

      if (response.ok) {
        await fetchAllYields()
        setDialogOpen(false)
        setKwhValue('')
        setSelectedDate(null)
      }
    } catch (error) {
      console.error('Error saving yield:', error)
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      const data = lines.map(line => {
        const [dateStr, kwhStr] = line.split(',')
        const [day, month, year] = dateStr.trim().split('.')
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        
        return {
          date: isoDate,
          kwh: parseFloat(kwhStr.trim())
        }
      })

      const response = await fetch('/api/yields/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })

      if (response.ok) {
        const result = await response.json()
        setImportResult(result)
        await fetchAllYields()
      } else {
        setImportResult({
          imported: 0,
          updated: 0,
          errors: 1,
          errorDetails: ['Import fehlgeschlagen']
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

  const getDayData = (): DayData[] => {
    const daysInMonth = getDaysInMonth(currentDate)
    const monthYields = yields.filter((y) => {
      const yieldDate = new Date(y.date)
      return getMonth(yieldDate) === currentMonth && getYear(yieldDate) === currentYear
    })

    const values = monthYields.map((y) => y.kwh).filter((v) => v > 0)
    const min = values.length > 0 ? Math.min(...values) : 0
    const max = values.length > 0 ? Math.max(...values) : 0

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const yieldData = monthYields.find((y) => new Date(y.date).getDate() === day)
      const kwh = yieldData?.kwh || null
      return {
        day,
        kwh,
        color: getColorForValue(kwh, min, max),
      }
    })
  }

  const getMonthlyChartData = () => {
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
  }

  const getDailyChartData = () => {
    const dayData = getDayData()
    return dayData.map((d) => ({
      tag: d.day,
      kwh: d.kwh || 0,
    }))
  }

  const getYearlyLineChartData = () => {
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
  }

  const getMonthlyStatistics = () => {
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
        total: total,
        average: average,
        daysWithData: daysWithData,
        daysInMonth: daysInMonth,
        coverage: daysInMonth > 0 ? (daysWithData / daysInMonth) * 100 : 0
      }
    })
  }

  const dayData = getDayData()

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + delta)
    setCurrentDate(newDate)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors">
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
              variant="outline"
              onClick={() => setImportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              CSV Import
            </Button>
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

        {/* Main Layout: Calendar Left, Charts Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compact Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <button 
                  onClick={() => setYearSelectorOpen(true)}
                  className="text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {format(currentDate, 'MMMM yyyy', { locale: de })}
                </button>
                <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 pb-1">
                    {day}
                  </div>
                ))}
                {dayData.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => handleDayClick(d.day)}
                    className={`
                      aspect-square rounded p-1 text-xs font-medium transition-all
                      ${d.color} dark:opacity-90
                      hover:scale-110 hover:shadow-md hover:z-10
                      flex flex-col items-center justify-center
                    `}
                  >
                    <div className="text-gray-700 dark:text-gray-900 font-bold">{d.day}</div>
                    {d.kwh !== null && (
                      <div className="text-[10px] text-gray-900 dark:text-gray-950 font-semibold">
                        {d.kwh.toFixed(0)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs dark:text-gray-300">
                <span className="font-medium">Legende:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-200 rounded"></div>
                  <span>Niedrig</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <span>Mittel</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-300 rounded"></div>
                  <span>Hoch</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Charts */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="yearly">Jahresübersicht</TabsTrigger>                  
                  <TabsTrigger value="monthly">Monatsertrag</TabsTrigger>
                  <TabsTrigger value="daily">Tagesertrag</TabsTrigger>
                  <TabsTrigger value="statistics">Statistik</TabsTrigger>
                </TabsList>

                <TabsContent value="yearly" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Jahresübersicht {currentYear} - Alle Monate
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getYearlyLineChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="day" stroke="#6b7280" className="dark:stroke-gray-400" />
                      <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#6b7280' }} />
                      <Line type="monotone" dataKey="Januar" stroke="#60a5fa" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="Februar" stroke="#a78bfa" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="März" stroke="#34d399" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="April" stroke="#f87171" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="Mai" stroke="#fb923c" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="Juni" stroke="#fbbf24" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="Juli" stroke="#4ade80" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="August" stroke="#22d3ee" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="September" stroke="#818cf8" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="Oktober" stroke="#fb7185" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="November" stroke="#f97316" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="Dezember" stroke="#3b82f6" strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="statistics" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monatsstatistik {currentYear}
                  </h3>
                  
                  {/* Statistics Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                          <th className="text-left p-2 font-semibold text-gray-900 dark:text-white">Monat</th>
                          <th className="text-right p-2 font-semibold text-gray-900 dark:text-white">Summe (kWh)</th>
                          <th className="text-right p-2 font-semibold text-gray-900 dark:text-white">Durchschnitt (kWh)</th>
                          <th className="text-right p-2 font-semibold text-gray-900 dark:text-white">Tage mit Daten</th>
                          <th className="text-right p-2 font-semibold text-gray-900 dark:text-white">Abdeckung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getMonthlyStatistics().map((stat, index) => (
                          <tr 
                            key={stat.month}
                            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                              index === currentMonth ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <td className="p-2 font-medium text-gray-900 dark:text-white">{stat.month}</td>
                            <td className="p-2 text-right text-gray-700 dark:text-gray-300">
                              {stat.total.toFixed(2)}
                            </td>
                            <td className="p-2 text-right text-gray-700 dark:text-gray-300">
                              {stat.average.toFixed(2)}
                            </td>
                            <td className="p-2 text-right text-gray-700 dark:text-gray-300">
                              {stat.daysWithData} / {stat.daysInMonth}
                            </td>
                            <td className="p-2 text-right text-gray-700 dark:text-gray-300">
                              {stat.coverage.toFixed(0)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                          <td className="p-2 text-gray-900 dark:text-white">Gesamt</td>
                          <td className="p-2 text-right text-gray-900 dark:text-white">
                            {getMonthlyStatistics().reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                          </td>
                          <td className="p-2 text-right text-gray-900 dark:text-white">
                            {(getMonthlyStatistics().reduce((sum, s) => sum + s.total, 0) / 
                              Math.max(1, getMonthlyStatistics().reduce((sum, s) => sum + s.daysWithData, 0))).toFixed(2)}
                          </td>
                          <td className="p-2 text-right text-gray-900 dark:text-white">
                            {getMonthlyStatistics().reduce((sum, s) => sum + s.daysWithData, 0)}
                          </td>
                          <td className="p-2 text-right text-gray-900 dark:text-white">-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Comparison Chart */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                      Monatsvergleich: Durchschnitt vs. Summe
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getMonthlyStatistics()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280" 
                          className="dark:stroke-gray-400"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ color: '#6b7280' }} />
                        <Bar dataKey="total" fill="#3b82f6" name="Summe (kWh)" />
                        <Bar dataKey="average" fill="#10b981" name="Durchschnitt (kWh)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="monthly" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Monatsertrag {currentYear}
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={getMonthlyChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
                      <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#6b7280' }} />
                      <Bar dataKey="kwh" fill="#3b82f6" name="kWh" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="daily" className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tagesertrag - {format(currentDate, 'MMMM yyyy', { locale: de })}
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getDailyChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="tag" stroke="#6b7280" className="dark:stroke-gray-400" />
                      <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: '#6b7280' }} />
                      <Line type="monotone" dataKey="kwh" stroke="#3b82f6" strokeWidth={2} name="kWh" />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
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
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Speichern
              </Button>
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
            {getAvailableYears().map((year) => (
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

      {/* CSV Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => { setImportDialogOpen(false); setImportResult(null); }} />
          <DialogHeader>
            <DialogTitle>CSV Daten importieren</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Format: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">DD.MM.YYYY,KWH</code>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                Beispiel: 01.01.2017,25.5
              </p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileImport}
                disabled={importing}
                className="block w-full text-sm text-gray-900 dark:text-white
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900 dark:file:text-blue-300
                  dark:hover:file:bg-blue-800
                  cursor-pointer"
              />
            </div>

            {importing && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Importiere Daten...</p>
              </div>
            )}

            {importResult && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">Import Ergebnis:</h4>
                <div className="text-sm space-y-1">
                  <p className="text-green-600 dark:text-green-400">
                    ✓ {importResult.imported} neue Einträge importiert
                  </p>
                  <p className="text-blue-600 dark:text-blue-400">
                    ↻ {importResult.updated} Einträge aktualisiert
                  </p>
                  {importResult.errors > 0 && (
                    <p className="text-red-600 dark:text-red-400">
                      ✗ {importResult.errors} Fehler
                    </p>
                  )}
                </div>
                {importResult.errorDetails.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                      Fehlerdetails anzeigen
                    </summary>
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400 max-h-32 overflow-y-auto">
                      {importResult.errorDetails.map((error, i) => (
                        <div key={i}>{error}</div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => { setImportDialogOpen(false); setImportResult(null); }}
                className="flex-1"
              >
                Schließen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
