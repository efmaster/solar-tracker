'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getLocale, getLocaleFromPathname, defaultLocale, locales } from './i18n'

export function useCurrentLocale() {
  const pathname = usePathname()
  const [locale, setLocale] = useState(() => {
    if (!pathname) return defaultLocale
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0 && locales.includes(segments[0] as typeof locales[number])) {
      return getLocaleFromPathname(pathname)
    }
    return defaultLocale
  })

  useEffect(() => {
    if (!pathname) return

    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0 && locales.includes(segments[0] as typeof locales[number])) {
      setLocale(getLocaleFromPathname(pathname))
      return
    }

    const browserLanguage = typeof navigator !== 'undefined' ? navigator.language : undefined
    const lang = browserLanguage?.split('-')[0]
    setLocale(getLocale(lang))
  }, [pathname])

  return locale
}
