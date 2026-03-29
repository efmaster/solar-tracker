'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface MonthlyStatistic {
  month: string
  monthIndex: number
  total: number
  average: number
  daysWithData: number
  daysInMonth: number
  coverage: number
}

interface ChartData {
  [key: string]: string | number
}

interface EnergyDashboardChartsProps {
  activeTab: string
  setActiveTab: (value: string) => void
  currentYear: number
  currentMonth: number
  yearlyLineChartData: ChartData[]
  monthlyStatistics: MonthlyStatistic[]
  monthlyChartData: { month: string; kwh: number }[]
  dailyChartData: { tag: number; kwh: number }[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string | number }) => {
  if (active && payload && payload.length) {
    const monthNames: { [key: string]: string } = {
      Jan: 'Januar',
      Feb: 'Februar',
      Mär: 'März',
      Apr: 'April',
      Mai: 'Mai',
      Jun: 'Juni',
      Jul: 'Juli',
      Aug: 'August',
      Sep: 'September',
      Okt: 'Oktober',
      Nov: 'November',
      Dez: 'Dezember',
    }
    const displayLabel = monthNames[label as string] || (typeof label === 'number' ? `Tag: ${label}` : label)

    return (
      <div className="bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-blue-400 rounded-lg shadow-2xl p-4">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{displayLabel}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-800 dark:text-gray-100">
            <span style={{ color: entry.color }} className="font-semibold">
              {entry.name}: 
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{entry.value?.toFixed?.(2) ?? entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function EnergyDashboardCharts({
  activeTab,
  setActiveTab,
  currentYear,
  currentMonth,
  yearlyLineChartData,
  monthlyStatistics,
  monthlyChartData,
  dailyChartData,
}: EnergyDashboardChartsProps) {
  return (
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
              <LineChart data={yearlyLineChartData}>
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
                  {monthlyStatistics.map((stat, index) => (
                    <tr
                      key={stat.month}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        index === currentMonth ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="p-2 font-medium text-gray-900 dark:text-white">{stat.month}</td>
                      <td className="p-2 text-right text-gray-700 dark:text-gray-300">{stat.total.toFixed(2)}</td>
                      <td className="p-2 text-right text-gray-700 dark:text-gray-300">{stat.average.toFixed(2)}</td>
                      <td className="p-2 text-right text-gray-700 dark:text-gray-300">{stat.daysWithData} / {stat.daysInMonth}</td>
                      <td className="p-2 text-right text-gray-700 dark:text-gray-300">{stat.coverage.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                    <td className="p-2 text-gray-900 dark:text-white">Gesamt</td>
                    <td className="p-2 text-right text-gray-900 dark:text-white">{monthlyStatistics.reduce((sum, s) => sum + s.total, 0).toFixed(2)}</td>
                    <td className="p-2 text-right text-gray-900 dark:text-white">{(monthlyStatistics.reduce((sum, s) => sum + s.total, 0) / Math.max(1, monthlyStatistics.reduce((sum, s) => sum + s.daysWithData, 0))).toFixed(2)}</td>
                    <td className="p-2 text-right text-gray-900 dark:text-white">{monthlyStatistics.reduce((sum, s) => sum + s.daysWithData, 0)}</td>
                    <td className="p-2 text-right text-gray-900 dark:text-white">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Monatsvergleich: Durchschnitt vs. Summe</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStatistics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monatsertrag {currentYear}</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyChartData}>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tagesertrag - {currentMonth + 1}</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyChartData}>
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
  )
}
