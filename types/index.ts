// ============================================================
// RetireReady — Shared TypeScript Types
// ============================================================

export type AssetRange =
  | '£125k–150k'
  | '£150k–175k'
  | '£175k–200k'
  | '£200k–250k'
  | '£250k–300k'
  | '£300k–400k'
  | '£400k–500k'
  | '£500k+'

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'

export interface FunnelData {
  age: number
  targetAge: number
  assetRange: AssetRange
  currentIncome: number
  targetIncome: number
  availability: string[]   // DayOfWeek values + time preference e.g. ["Monday","Wednesday","Morning"]
  firstName: string
  email: string
  phone: string
}

export interface Lead {
  id: string
  created_at: string
  first_name: string
  email: string
  phone: string
  age: number
  target_age: number
  asset_range: string
  target_income: number
  availability: string[]
  is_purchased: boolean
}

export interface MaskedLead {
  id: string
  created_at: string
  first_name: string  // "J*** S***" format
  age: number
  target_age: number
  asset_range: string
  target_income: number
  availability: string[]
  is_purchased: boolean
  // email & phone ONLY present if is_purchased === true
  email?: string
  phone?: string
}

export interface Advisor {
  id: string
  created_at: string
  email: string
  full_name: string
  stripe_customer_id: string | null
}

export interface Transaction {
  id: string
  created_at: string
  lead_id: string
  advisor_id: string
  amount: number
  stripe_status: string
  leads?: Lead
}

export interface Appointment {
  id: string
  created_at: string
  lead_id: string
  advisor_id: string
  slot_time: string
  status: string
  email_sent: boolean
  leads?: Lead
}

export type ReadinessScore = {
  score: number        // 0–100
  label: string        // e.g. "Strong"
  colour: string       // Tailwind colour class
  projectedPot: number // estimated retirement pot in £
  incomeGap: number    // £ gap between target and projected
}
