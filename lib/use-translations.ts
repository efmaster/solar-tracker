'use client'

import { useCurrentLocale } from '@/lib/locale-provider'
import { getTranslations } from '@/lib/i18n'

export function useTranslations() {
  return getTranslations(useCurrentLocale())
}
