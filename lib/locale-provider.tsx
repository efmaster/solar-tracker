'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { getLocale, getLocaleFromPathname, defaultLocale, locales, type Locale } from './i18n'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale')
      if (stored && locales.includes(stored as Locale)) {
        return stored as Locale
      }
    }
    
    if (!pathname) return defaultLocale
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      return getLocaleFromPathname(pathname)
    }
    return defaultLocale
  })

  useEffect(() => {
    if (!pathname) return

    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
      const pathLocale = getLocaleFromPathname(pathname)
      setLocaleState(pathLocale)
      return
    }

    const stored = localStorage.getItem('locale')
    if (stored && locales.includes(stored as Locale)) {
      return
    }

    const browserLanguage = typeof navigator !== 'undefined' ? navigator.language : undefined
    const lang = browserLanguage?.split('-')[0]
    setLocaleState(getLocale(lang))
  }, [pathname])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  const toggleLocale = () => {
    const newLocale = locale === 'de' ? 'en' : 'de'
    setLocale(newLocale)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

export function useCurrentLocale() {
  const { locale } = useLocale()
  return locale
}
