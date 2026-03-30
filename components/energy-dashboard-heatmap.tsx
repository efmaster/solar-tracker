'use client'

import { useTranslations } from '@/lib/use-translations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HeatmapDay {
  day: number
  kwh: number | null
  color: string
  date: string
}

interface EnergyDashboardHeatmapProps {
  showHeatmap: boolean
  yearHeatmapData: {
    month: string
    days: HeatmapDay[]
  }[]
  currentYear: number
}

export function EnergyDashboardHeatmap({ showHeatmap, yearHeatmapData, currentYear }: EnergyDashboardHeatmapProps) {
  const t = useTranslations()

  if (!showHeatmap) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.ui.heatmapTitle} {currentYear}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {yearHeatmapData.map((monthData, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-12 text-xs font-semibold text-gray-600 dark:text-gray-400">
                {monthData.month}
              </div>
              <div className="flex-1 flex gap-1 flex-wrap">
                {monthData.days.map((dayData, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 rounded-sm ${dayData.color} cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all`}
                    title={`${dayData.date}: ${dayData.kwh !== null ? dayData.kwh.toFixed(2) + ' kWh' : t.ui.noData}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">{t.ui.legend}:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-sm border border-gray-300 dark:border-gray-600" />
            <span>{t.ui.noData}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-200 rounded-sm" />
            <span>{t.ui.low}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-200 rounded-sm" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-200 rounded-sm" />
            <span>{t.ui.medium}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-lime-200 rounded-sm" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-300 rounded-sm" />
            <span>{t.ui.high}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
