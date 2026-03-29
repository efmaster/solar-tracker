export interface EnergyYield {
  id: number
  date: string
  kwh: number
}

export interface ImportResult {
  imported: number
  updated: number
  errors: number
  errorDetails: string[]
}

export interface DayData {
  day: number
  kwh: number | null
  color: string
}
