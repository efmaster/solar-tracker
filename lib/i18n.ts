import { de, enUS } from 'date-fns/locale'

export const locales = ['de', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'de'

export const translations = {
  de: {
    appTitle: 'Solarertrag Tracker',
    appDescription: 'Verfolge deinen täglichen Solarertrag und CO₂-Einsparung',
    buttons: {
      save: 'Speichern',
      delete: 'Löschen',
      deleting: 'Löschen...',
      import: 'Import',
      export: 'Export',
      csvExport: 'CSV Export',
      pdfExport: 'PDF Export (Drucken)',
      close: 'Schließen',
      yearComparison: 'Jahresvergleich',
      heatmap: 'Heatmap',
      switchToEnglish: 'EN',
      switchToGerman: 'DE',
      previousMonth: 'Vorheriger Monat',
      nextMonth: 'Nächster Monat',
      selectYear: 'Jahr auswählen',
      lightMode: 'Hell-Modus',
      darkMode: 'Dunkel-Modus',
    },
    errors: {
      loadData: 'Fehler beim Laden der Daten. Bitte Seite neu laden.',
      save: 'Fehler beim Speichern des Ertrags.',
      delete: 'Fehler beim Löschen des Ertrags.',
      invalidDate: 'Bitte wählen Sie zuerst ein Datum aus.',
      invalidKwh: 'Bitte geben Sie eine gültige kWh-Zahl größer oder gleich 0 ein.',
      importFailed: 'Import fehlgeschlagen',
      invalidJson: 'Ungültiges JSON im Request-Body',
      fileReadError: 'Fehler beim Lesen der Datei',
      noValidData: 'Keine gültigen Daten gefunden',
      noImportedEntry: 'Kein gültiger Eintrag wurde importiert.',
    },
    ui: {
      uploadHint: 'CSV Dateien importieren',
      formatHint: 'Format: DD.MM.YYYY,KWH',
      exampleHint: 'Beispiel: 01.01.2017,25.5',
      imported: 'Importiert',
      updated: 'Aktualisiert',
      errors: 'Fehler',
      errorDetails: 'Fehlerdetails anzeigen',
      legend: 'Legende',
      low: 'Niedrig',
      medium: 'Mittel',
      high: 'Hoch',
      missing: 'Fehlend',
      unusual: 'Ungewöhnlich',
      missingData: 'Keine Daten',
      invalidFormat: 'Ungültiges Format',
      invalidDate: 'Ungültiges Datum',
      invalidKwh: 'Ungültiger kWh-Wert',
      exportTitle: 'Solarertrag Export',
      exportDate: 'Datum',
      exportKwh: 'kWh',
      summary: 'Zusammenfassung',
      missingDays: 'Fehlende Tage in',
      yearSelectTitle: 'Jahr auswählen',
      currentYear: 'Jahr',
      monthlyComparison: 'Monatsvergleich über alle Jahre',
      yearOverview: 'Jahresübersicht',
      monthlyOverview: 'Monatsertrag',
      dailyOverview: 'Tagesertrag',
      statistics: 'Statistik',
      dayLabel: 'Tag',
      daysWithData: 'Tage mit Daten',
      coverage: 'Abdeckung',
      total: 'Gesamt',
      treesEquivalent: 'Bäume-Äquivalent',
      treesPlanted: 'Bäume gepflanzt',
      produced: 'produziert',
      enterYield: 'Ertrag eingeben',
      cancel: 'Abbrechen',
      show: 'An',
      hide: 'Aus',
      loading: 'Lade Daten...',
      co2Title: 'CO₂-Einsparung',
      monthlyStatistics: 'Monatsstatistik',
      missingDataLegend: 'Keine Daten',
      importDialogTitle: 'CSV Daten importieren',
      importHint: 'Format: DD.MM.YYYY,KWH',
      importing: 'Importiere Daten...',
      importResultTitle: 'Import Ergebnis',
      importedEntries: 'neue Einträge importiert',
      updatedEntries: 'Einträge aktualisiert',
      importErrors: 'Fehler',
      showErrorDetails: 'Fehlerdetails anzeigen',
      close: 'Schließen',
      noData: 'Keine Daten',
      unusualValue: 'Ungewöhnlicher Wert!',
      fileNameSuffix: 'solarertrag_export',
      pdfTitle: 'Solarertrag Export',
      heatmapTitle: 'Jahres-Heatmap',
      days: 'Tage',
      months: 'Monate',
      income: 'Einnahmen',
      revenue: 'Einnahmen',
      balance: 'Bilanz',
      costCalculation: 'Kostenberechnung',
      formulaDescription: 'Formel: Bilanz = Einnahmen - Vorauszahlung | Positiv = Gewinn (Rückzahlung an dich) | Negativ = Nachzahlung (du zahlst)',
      productionComparison: 'Jahresproduktion Vergleich',
      financialComparison: 'Finanzvergleich',
      positive: 'Positiv',
      negative: 'Negativ',
    },
    chart: {
      sum: 'Summe (kWh)',
      average: 'Durchschnitt (kWh)',
      kwh: 'kWh',
      revenue: 'Einnahmen (€)',
      balance: 'Bilanz (€)',
    },
    csv: {
      fileName: 'solarertrag_export',
      pdfTitle: 'Solarertrag Export',
    },
  },
  en: {
    appTitle: 'Solar Yield Tracker',
    appDescription: 'Track your daily solar yield and CO₂ savings',
    buttons: {
      save: 'Save',
      delete: 'Delete',
      deleting: 'Deleting...',
      import: 'Import',
      export: 'Export',
      csvExport: 'CSV Export',
      pdfExport: 'PDF Export (Print)',
      close: 'Close',
      yearComparison: 'Year Comparison',
      heatmap: 'Heatmap',
      switchToEnglish: 'EN',
      switchToGerman: 'DE',
      previousMonth: 'Previous Month',
      nextMonth: 'Next Month',
      selectYear: 'Select Year',
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
    },
    errors: {
      loadData: 'Error loading data. Please refresh the page.',
      save: 'Error saving yield.',
      delete: 'Error deleting yield.',
      invalidDate: 'Please select a date first.',
      invalidKwh: 'Please enter a valid kWh value greater than or equal to 0.',
      importFailed: 'Import failed',
      invalidJson: 'Invalid JSON in request body',
      fileReadError: 'Failed to read file',
      noValidData: 'No valid data found',
      noImportedEntry: 'No valid entry was imported.',
    },
    ui: {
      uploadHint: 'Import CSV data',
      formatHint: 'Format: DD.MM.YYYY,KWH',
      imported: 'Imported',
      updated: 'Updated',
      errors: 'Errors',
      errorDetails: 'Show error details',
      legend: 'Legend',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      missing: 'Missing',
      unusual: 'Unusual',
      missingData: 'No data',
      invalidFormat: 'Invalid format',
      invalidDate: 'Invalid date',
      invalidKwh: 'Invalid kWh value',
      exportTitle: 'Solar Yield Export',
      exportDate: 'Date',
      exportKwh: 'kWh',
      summary: 'Summary',
      missingDays: 'Missing days in',
      yearSelectTitle: 'Select year',
      currentYear: 'Year',
      monthlyComparison: 'Monthly comparison across years',
      yearOverview: 'Year overview',
      monthlyOverview: 'Monthly yield',
      dailyOverview: 'Daily yield',
      statistics: 'Statistics',
      dayLabel: 'Day',
      daysWithData: 'Days with data',
      coverage: 'Coverage',
      total: 'Total',
      treesEquivalent: 'Trees equivalent',
      treesPlanted: 'trees planted',
      produced: 'produced',
      enterYield: 'Enter yield',
      cancel: 'Cancel',
      show: 'On',
      hide: 'Off',
      loading: 'Loading data...',
      co2Title: 'CO₂ Savings',
      monthlyStatistics: 'Monthly statistics',
      missingDataLegend: 'No data',
      importDialogTitle: 'Import CSV data',
      importHint: 'Format: DD.MM.YYYY,KWH',
      exampleHint: 'Example: 01.01.2017,25.5',
      importing: 'Importing data...',
      importResultTitle: 'Import result',
      importedEntries: 'new entries imported',
      updatedEntries: 'entries updated',
      importErrors: 'errors',
      showErrorDetails: 'Show error details',
      close: 'Close',
      noData: 'No data',
      unusualValue: 'Unusual value!',
      fileNameSuffix: 'solar_yield_export',
      pdfTitle: 'Solar Yield Export',
      heatmapTitle: 'Year heatmap',
      days: 'Days',
      months: 'Months',
      income: 'Income',
      revenue: 'Revenue',
      balance: 'Balance',
      costCalculation: 'Cost calculation',
      formulaDescription: 'Formula: Balance = Income - Prepayment | Positive = Profit (refund to you) | Negative = Additional payment (you owe)',
      productionComparison: 'Year production comparison',
      financialComparison: 'Financial comparison',
      positive: 'Positive',
      negative: 'Negative',
    },
    chart: {
      sum: 'Total (kWh)',
      average: 'Average (kWh)',
      kwh: 'kWh',
      revenue: 'Revenue (€)',
      balance: 'Balance (€)',
    },
    csv: {
      fileName: 'solar_yield_export',
      pdfTitle: 'Solar Yield Export',
    },
  },
} as const

export type Translations = typeof translations.de

export const getLocale = (locale: string | undefined): Locale => {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale
}

export const getLocaleFromPathname = (pathname: string | undefined): Locale => {
  if (!pathname) return defaultLocale
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  return getLocale(firstSegment)
}

export const stripLocaleFromPathname = (pathname: string | undefined): string => {
  if (!pathname) return '/'
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return '/'
  if (locales.includes(segments[0] as Locale)) {
    segments.shift()
  }
  return '/' + segments.join('/')
}

export const buildLocalePath = (pathname: string | undefined, locale: Locale): string => {
  const stripped = stripLocaleFromPathname(pathname)
  return locale === defaultLocale ? stripped || '/' : `/${locale}${stripped === '/' ? '' : stripped}`
}

export const getTranslations = (locale: string | undefined): Translations => {
  const localeKey = getLocale(locale)
  return translations[localeKey] as Translations
}

export const getDateFnsLocale = (locale: string | undefined) => {
  return locale === 'en' ? enUS : de
}
