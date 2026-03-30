'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Sun, Moon, Languages } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useTranslations } from '@/lib/use-translations'
import { getDateFnsLocale } from '@/lib/i18n'
import { useLocale } from '@/lib/locale-provider'

interface YearSummary {
  year: number
  total: number
  count: number
  monthsWithData: number
  monthlyTotals: number[] // index 0..11 (Jan..Dec)
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ color?: string; name?: string; value?: number }>
  label?: string | number
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-blue-400 rounded-lg shadow-2xl p-4">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-800 dark:text-gray-100">
            <span style={{ color: entry.color }} className="font-semibold">{entry.name}: </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {(typeof entry.value === 'number' ? entry.value : 0).toFixed(2)}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

interface YearComparisonProps {
  backHref: string
}

export default function YearComparison({ backHref }: YearComparisonProps) {
  const { theme, toggleTheme } = useTheme()
  const { locale, toggleLocale } = useLocale()
  const t = useTranslations()
  const dateFnsLocale = getDateFnsLocale(locale)
  const [yieldsSummary, setYieldsSummary] = useState<YearSummary[]>([])
  const [abschlag, setAbschlag] = useState<number>(0)
  const [einspeiseverguetung, setEinspeiseverguetung] = useState<number>(0)

  async function fetchAllYieldsSummary() {
    try {
      const response = await fetch(`/api/yields/summary`)
      
      if (response.ok) {
        const data = await response.json()
        setYieldsSummary(Array.isArray(data?.years) ? data.years : [])
      }
    } catch (error) {
      console.error('Error fetching yields:', error)
    }
  }

  useEffect(() => {
    fetchAllYieldsSummary()
    
    const savedAbschlag = localStorage.getItem('abschlag')
    const savedEinspeise = localStorage.getItem('einspeiseverguetung')
    if (savedAbschlag) setAbschlag(parseFloat(savedAbschlag))
    if (savedEinspeise) setEinspeiseverguetung(parseFloat(savedEinspeise))
  }, [])

  const handleAbschlagChange = (value: string) => {
    const num = parseFloat(value) || 0
    setAbschlag(num)
    localStorage.setItem('abschlag', num.toString())
  }

  const handleEinspeiseChange = (value: string) => {
    const num = parseFloat(value) || 0
    setEinspeiseverguetung(num)
    localStorage.setItem('einspeiseverguetung', num.toString())
  }

  const getYearlyData = () => {
    return yieldsSummary
      .map((y) => {
        const yearlyAbschlag = abschlag * y.monthsWithData
        return {
          year: y.year,
          total: y.total,
          average: y.count > 0 ? y.total / y.count : 0,
          daysWithData: y.count,
          monthsWithData: y.monthsWithData,
          einnahmen: (y.total * einspeiseverguetung) / 100,
          bilanz: ((y.total * einspeiseverguetung) / 100) - yearlyAbschlag,
        }
      })
      .sort((a, b) => a.year - b.year)
  }

  const getMonthlyComparisonData = () => {
    const months = Array.from({ length: 12 }, (_, index) =>
      format(new Date(2024, index, 1), 'MMM', { locale: dateFnsLocale })
    )
    const yearList = yieldsSummary.map((y) => y.year).sort((a, b) => a - b)
    return months.map((monthName, monthIndex) => {
      const dataPoint: Record<string, number | string> = { month: monthName }
      for (const year of yearList) {
        const yearEntry = yieldsSummary.find((y) => y.year === year)
        dataPoint[year.toString()] = yearEntry?.monthlyTotals[monthIndex] ?? 0
      }
      return dataPoint
    })
  }

  const yearlyData = getYearlyData()

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backHref} className="inline-flex">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.buttons.yearComparison}</h1>
          </div>
          <div className="flex items-center gap-3">
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

        {/* Cost Calculation Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>{t.ui.costCalculation}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t.ui.income} / {t.ui.months}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={abschlag}
                  onChange={(e) => handleAbschlagChange(e.target.value)}
                  placeholder="150.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t.chart.revenue} (Cent/kWh)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={einspeiseverguetung}
                  onChange={(e) => handleEinspeiseChange(e.target.value)}
                  placeholder="8.20"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              {t.ui.formulaDescription}
            </p>
          </CardContent>
        </Card>

        {/* Year Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t.ui.yearOverview}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                    <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">{t.ui.currentYear}</th>
                    <th className="text-right p-3 font-semibold text-gray-900 dark:text-white">{t.chart.sum}</th>
                    <th className="text-right p-3 font-semibold text-gray-900 dark:text-white">{t.chart.average}</th>
                    <th className="text-right p-3 font-semibold text-gray-900 dark:text-white">{t.ui.days}</th>
                    <th className="text-right p-3 font-semibold text-gray-900 dark:text-white">{t.ui.months}</th>
                    <th className="text-right p-3 font-semibold text-gray-900 dark:text-white">{t.chart.revenue} (€)</th>
                    <th className="text-right p-3 font-semibold text-gray-900 dark:text-white">{t.chart.balance} (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.map((data) => (
                    <tr 
                      key={data.year}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-3 font-medium text-gray-900 dark:text-white">{data.year}</td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {data.total.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {data.average.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {data.daysWithData}
                      </td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {data.monthsWithData}
                      </td>
                      <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                        {data.einnahmen.toFixed(2)}
                      </td>
                      <td className={`p-3 text-right font-semibold ${
                        data.bilanz >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {data.bilanz >= 0 ? '+' : ''}{data.bilanz.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Production Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>{t.ui.productionComparison}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="year" stroke="#6b7280" className="dark:stroke-gray-400" />
                  <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#6b7280' }} />
                  <Bar dataKey="total" fill="#3b82f6" name={t.chart.sum} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Financial Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>{t.ui.financialComparison}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="year" stroke="#6b7280" className="dark:stroke-gray-400" />
                  <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#6b7280' }} />
                  <Bar dataKey="einnahmen" fill="#10b981" name={t.chart.revenue} />
                  <Bar dataKey="bilanz" fill="#3b82f6" name={t.chart.balance} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Comparison Across Years */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t.ui.monthlyComparison}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getMonthlyComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" />
                  <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#6b7280' }} />
                  {yieldsSummary.map((y) => y.year).sort((a, b) => a - b).map((year, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
                    return (
                      <Line 
                        key={year}
                        type="monotone" 
                        dataKey={year.toString()} 
                        stroke={colors[index % colors.length]} 
                        strokeWidth={2} 
                        name={year.toString()}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
