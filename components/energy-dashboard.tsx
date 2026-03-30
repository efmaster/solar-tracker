'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import { format, getMonth, getYear, getDaysInMonth } from 'date-fns'
import { de } from 'date-fns/locale'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Save, X, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

interface EnergyYield {
  id: number
  date: string
  kwh: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ color?: string; name?: string; value?: number }>
  label?: string | number
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const monthNames: { [key: string]: string } = {
      'Jan': 'Januar', 'Feb': 'Februar', 'Mär': 'März', 'Apr': 'April',
      'Mai': 'Mai', 'Jun': 'Juni', 'Jul': 'Juli', 'Aug': 'August',
      'Sep': 'September', 'Okt': 'Oktober', 'Nov': 'November', 'Dez': 'Dezember'
    }
    
    const displayLabel =
      typeof label === 'string' ? (monthNames[label] || label) : typeof label === 'number' ? `Tag: ${label}` : ''
    
    return (
      <div className="bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-blue-400 rounded-lg shadow-2xl p-4">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{displayLabel}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-800 dark:text-gray-100">
            <span style={{ color: entry.color }} className="font-semibold">{entry.name}: </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {(typeof entry.value === 'number' ? entry.value : 0).toFixed(2)} kWh
            </span>
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
  if (value === null) return 'bg-gray-100'
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
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editMode, setEditMode] = useState(false)
  const [kwhValue, setKwhValue] = useState('')
  const [yields, setYields] = useState<EnergyYield[]>([])
  const [error, setError] = useState<string | null>(null)

  const currentYear = getYear(currentDate)
  const currentMonth = getMonth(currentDate)

  const fetchYields = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/yields?year=${currentYear}`)
      
      const contentType = response.headers.get('content-type')
      const data = (contentType && contentType.includes('application/json'))
        ? await response.json().catch(() => null)
        : null

      if (!response.ok) {
        setError(data?.error || 'Fehler beim Laden der Daten. Bitte Seite neu laden.')
        setYields([])
        return
      }

      setYields(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching yields:', error)
      setError('Fehler beim Laden der Daten. Bitte Seite neu laden.')
      setYields([])
    }
  }, [currentYear])

  useEffect(() => {
    fetchYields()
  }, [fetchYields])

  const handleSave = async () => {
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
        await fetchYields()
        setEditMode(false)
        setKwhValue('')
      }
    } catch (error) {
      console.error('Error saving yield:', error)
    }
  }

  const handleEdit = () => {
    const existingYield = yields.find(
      (y) => format(new Date(y.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )
    setKwhValue(existingYield?.kwh.toString() || '')
    setEditMode(true)
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
    type YearlyChartPoint = { day: number; [monthName: string]: number }
    const data: Record<number, YearlyChartPoint> = {}
    
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
      data[day] = data[day] ?? { day }
      data[day][monthName] = y.kwh
    })

    return Object.values(data).sort((a, b) => a.day - b.day)
  }

  const dayData = getDayData()
  const selectedDayData = dayData.find((d) => d.day === selectedDate.getDate())

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + delta)
    setCurrentDate(newDate)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Solarertrag Tracker</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme}
              className="transition-transform hover:scale-110"
              title={theme === 'dark' ? 'Hell-Modus' : 'Dunkel-Modus'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xl font-semibold min-w-[200px] text-center text-gray-900 dark:text-white">
              {format(currentDate, 'MMMM yyyy', { locale: de })}
            </span>
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Tageseingabe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Datum</label>
                <Input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              {editMode ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">kW/h Ertrag</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={kwhValue}
                      onChange={(e) => setKwhValue(e.target.value)}
                      placeholder="z.B. 25.5"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Speichern
                    </Button>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Aktueller Wert</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedDayData?.kwh?.toFixed(2) || '0.00'} kW/h
                    </p>
                  </div>
                  <Button onClick={handleEdit} className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monatsübersicht - {format(currentDate, 'MMMM yyyy', { locale: de })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {dayData.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDate(new Date(currentYear, currentMonth, d.day))}
                    className={`
                      aspect-square rounded-lg p-2 text-sm font-medium transition-all
                      ${d.color} dark:opacity-90
                      ${selectedDate.getDate() === d.day && getMonth(selectedDate) === currentMonth ? 'ring-2 ring-blue-500 dark:ring-blue-400 scale-105' : ''}
                      hover:scale-105 hover:shadow-md
                    `}
                  >
                    <div className="text-xs text-gray-700 dark:text-gray-900">{d.day}</div>
                    <div className="text-xs font-bold text-gray-900 dark:text-gray-950">
                      {d.kwh !== null ? d.kwh.toFixed(1) : '-'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs dark:text-gray-300">
                <span className="font-medium">Legende:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-200 dark:opacity-90 rounded"></div>
                  <span>Niedrig</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-yellow-200 dark:opacity-90 rounded"></div>
                  <span>Mittel</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-300 dark:opacity-90 rounded"></div>
                  <span>Hoch</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tagesertrag - {format(currentDate, 'MMMM yyyy', { locale: de })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getDailyChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="tag" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#6b7280' }} />
                <Line type="monotone" dataKey="kwh" stroke="#3b82f6" strokeWidth={2} name="kW/h" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monatsertrag {currentYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#6b7280' }} />
                <Bar dataKey="kwh" fill="#3b82f6" name="kW/h" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jahresübersicht {currentYear} - Alle Monate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={getYearlyLineChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="day" stroke="#6b7280" className="dark:stroke-gray-400" />
                <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#6b7280' }} />
                <Line type="monotone" dataKey="Januar" stroke="#1e40af" strokeWidth={1.5} />
                <Line type="monotone" dataKey="Februar" stroke="#7c3aed" strokeWidth={1.5} />
                <Line type="monotone" dataKey="März" stroke="#059669" strokeWidth={1.5} />
                <Line type="monotone" dataKey="April" stroke="#dc2626" strokeWidth={1.5} />
                <Line type="monotone" dataKey="Mai" stroke="#ea580c" strokeWidth={1.5} />
                <Line type="monotone" dataKey="Juni" stroke="#ca8a04" strokeWidth={1.5} />
                <Line type="monotone" dataKey="Juli" stroke="#16a34a" strokeWidth={1.5} />
                <Line type="monotone" dataKey="August" stroke="#0891b2" strokeWidth={1.5} />
                <Line type="monotone" dataKey="September" stroke="#4f46e5" strokeWidth={1.5} />
                <Line type="monotone" dataKey="Oktober" stroke="#be123c" strokeWidth={1.5} />
                <Line type="monotone" dataKey="November" stroke="#7c2d12" strokeWidth={1.5} />
                <Line type="monotone" dataKey="Dezember" stroke="#1e3a8a" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
