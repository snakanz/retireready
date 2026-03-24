import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { FunnelData, ReadinessScore } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskName(firstName: string): string {
  if (!firstName) return '****'
  return firstName.charAt(0) + '***'
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '****@****.***'
  return local.charAt(0) + '***@' + domain
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '****'
  return phone.slice(0, 3) + ' **** ' + phone.slice(-3)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateReadinessScore(data: Partial<FunnelData>): ReadinessScore {
  const { age = 40, targetAge = 65, assetRange = '£125k–150k', targetIncome = 30000 } = data

  // Years to retirement
  const yearsLeft = Math.max(targetAge - age, 1)

  // Mid-point of asset range for calculation
  const assetMidpoints: Record<string, number> = {
    '£125k–150k': 137500,
    '£150k–175k': 162500,
    '£175k–200k': 187500,
    '£200k–250k': 225000,
    '£250k–300k': 275000,
    '£300k–400k': 350000,
    '£400k–500k': 450000,
    '£500k+': 600000,
  }

  const currentAssets = assetMidpoints[assetRange] ?? 200000
  const annualReturn = 0.06  // 6% assumed growth
  const projectedPot = currentAssets * Math.pow(1 + annualReturn, yearsLeft)
  const sustainableIncome = projectedPot * 0.04 // 4% safe withdrawal
  const incomeGap = Math.max(targetIncome - sustainableIncome, 0)

  // Score: 0–100
  const coverageRatio = Math.min(sustainableIncome / targetIncome, 1)
  const timeBonus = Math.min(yearsLeft / 30, 0.2)
  const rawScore = Math.round((coverageRatio * 0.8 + timeBonus) * 100)
  const score = Math.min(Math.max(rawScore, 12), 98)

  let label: string
  let colour: string
  if (score >= 75) { label = 'Strong';   colour = 'text-emerald-400' }
  else if (score >= 50) { label = 'On Track'; colour = 'text-gold-400' }
  else if (score >= 30) { label = 'At Risk';  colour = 'text-amber-500' }
  else { label = 'Critical'; colour = 'text-red-500' }

  return { score, label, colour, projectedPot: Math.round(projectedPot), incomeGap: Math.round(incomeGap) }
}

export function generateTimeSlots(availability: string[]): Date[] {
  const slots: Date[] = []
  const today = new Date()
  const dayMap: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5,
  }

  for (let weekOffset = 0; weekOffset < 3; weekOffset++) {
    for (const day of availability) {
      const targetDay = dayMap[day]
      if (targetDay === undefined) continue
      const date = new Date(today)
      const currentDay = date.getDay()
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7
      date.setDate(date.getDate() + daysUntil + weekOffset * 7)

      // Generate 30-min slots 9am–5pm
      for (let hour = 9; hour < 17; hour++) {
        for (const min of [0, 30]) {
          const slot = new Date(date)
          slot.setHours(hour, min, 0, 0)
          if (slot > new Date()) slots.push(slot)
        }
      }
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime())
}
