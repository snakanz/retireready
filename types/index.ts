// ============================================================
// RetireReady — Shared TypeScript Types
// ============================================================

export type AssetRange =
  | 'Under £50k'
  | '£50k–£150k'
  | '£150k–£250k'
  | '£250k–£500k'
  | '£500k–£750k'
  | '£750k–£1m'
  | '£1m–£2m'
  | '£2m+'

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'

export interface FunnelData {
  // Current age — stored as midpoint + optional display label
  age: number            // e.g. 50 (midpoint of "45–54")
  ageRange?: string      // e.g. "45–54"

  // Retirement age — exact value
  targetAge: number      // e.g. 65

  // Assets
  assetRange: AssetRange
  currentAssets?: number          // exact value in £ from slider

  // Incomes — midpoint for calculations + range label for Supabase/display
  currentIncome?: number          // midpoint, e.g. 62500
  currentIncomeRange?: string     // e.g. "£50,000–£75,000"
  targetIncome: number            // midpoint, e.g. 35000
  targetIncomeRange?: string      // e.g. "£30,000–£40,000"

  // Availability — day(s) + time preference
  availability: string[]   // e.g. ["Monday","Wednesday","Morning"]

  // Contact
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
  current_income: string | null    // e.g. "£45,000/yr"
  desired_income: string | null    // e.g. "Comfortable — £33,750/yr"
  target_income: number
  availability: string[]
  is_purchased: boolean
  view_count: number
  notes: string | null
  asset_value: number | null      // exact asset value in £ (from slider)
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

export interface WalletTransaction {
  id: string
  created_at: string
  amount: number
  type: string
  description: string
  lead_id: string | null
}

export interface LeadPurchase {
  lead_id: string
  amount_paid: number
  is_free: boolean
}

export interface LeadStatus {
  lead_id: string
  status: 'new' | 'contacted' | 'booked' | 'converted'
}
