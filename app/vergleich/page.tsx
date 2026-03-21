'use client'

import { useRouter } from 'next/navigation'
import YearComparison from '@/components/year-comparison'

export default function VergleichPage() {
  const router = useRouter()

  return <YearComparison onBack={() => router.push('/')} />
}
