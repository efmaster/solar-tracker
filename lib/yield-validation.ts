export interface YieldPayload {
  date: Date
  kwh: number
}

export interface ParsedImportEntry {
  date: Date
  kwh: number
}

interface ValidationError {
  error: string
}

const normalizeDateToUTC = (date: Date): Date => {
  const normalized = new Date(date)
  normalized.setUTCHours(0, 0, 0, 0)
  return normalized
}

export const parseDateValue = (value: unknown): { date: Date } | ValidationError => {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: 'Datum muss als String im Format yyyy-MM-dd oder dd.MM.yyyy übergeben werden.' }
  }

  const trimmed = value.trim()
  const dmyMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)

  let dateObj: Date
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10)
    const year = parseInt(dmyMatch[3], 10)
    dateObj = new Date(Date.UTC(year, month - 1, day))

    if (
      dateObj.getUTCFullYear() !== year ||
      dateObj.getUTCMonth() !== month - 1 ||
      dateObj.getUTCDate() !== day
    ) {
      return { error: `Ungültiges Datum: ${value}` }
    }
  } else {
    dateObj = new Date(trimmed)
  }

  if (Number.isNaN(dateObj.getTime())) {
    return { error: `Ungültiges Datum: ${value}` }
  }

  return { date: normalizeDateToUTC(dateObj) }
}

export const parseKwhValue = (value: unknown): { kwh: number } | ValidationError => {
  if (value === null || value === undefined) {
    return { error: 'kWh-Wert ist erforderlich.' }
  }

  const numeric = typeof value === 'string'
    ? parseFloat(value.trim().replace(',', '.'))
    : typeof value === 'number'
      ? value
      : NaN

  if (Number.isNaN(numeric) || numeric < 0) {
    return { error: 'kWh muss eine Zahl größer oder gleich 0 sein.' }
  }

  return { kwh: numeric }
}

export const parseYieldBody = (body: unknown): YieldPayload | ValidationError => {
  if (body === null || typeof body !== 'object') {
    return { error: 'Ungültige Nutzlast.' }
  }

  const payload = body as { date?: unknown; kwh?: unknown }
  const dateResult = parseDateValue(payload.date)
  if ('error' in dateResult) {
    return dateResult
  }

  const kwhResult = parseKwhValue(payload.kwh)
  if ('error' in kwhResult) {
    return kwhResult
  }

  return {
    date: dateResult.date,
    kwh: kwhResult.kwh,
  }
}

export const parseImportEntry = (entry: unknown, index: number): ParsedImportEntry | ValidationError => {
  const result = parseYieldBody(entry)
  if ('error' in result) {
    return { error: `Zeile ${index + 1}: ${result.error}` }
  }
  return result
}

export const parseImportBody = (body: unknown): { data: unknown[] } | ValidationError => {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Ungültige Nutzlast. Erwartet ein Objekt mit dem Schlüssel data.' }
  }

  const payload = body as { data?: unknown }
  if (!('data' in payload)) {
    return { error: 'Feld data ist erforderlich.' }
  }

  if (!Array.isArray(payload.data)) {
    return { error: 'Feld data muss ein Array sein.' }
  }

  return { data: payload.data }
}

export const parseYearMonthParams = (
  year: string | null,
  month: string | null
): { startDate: Date; endDate: Date } | ValidationError => {
  if (!year) {
    return { error: 'Jahr ist erforderlich.' }
  }

  const yearNumber = parseInt(year, 10)
  if (Number.isNaN(yearNumber) || yearNumber < 1900 || yearNumber > 2100) {
    return { error: 'Ungültiges Jahr.' }
  }

  if (month === null) {
    return {
      startDate: new Date(Date.UTC(yearNumber, 0, 1, 0, 0, 0)),
      endDate: new Date(Date.UTC(yearNumber, 11, 31, 23, 59, 59)),
    }
  }

  const monthNumber = parseInt(month, 10)
  if (Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return { error: 'Ungültiger Monat.' }
  }

  return {
    startDate: new Date(Date.UTC(yearNumber, monthNumber - 1, 1, 0, 0, 0)),
    endDate: new Date(Date.UTC(yearNumber, monthNumber, 0, 23, 59, 59)),
  }
}
