'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, TrendingUp, AlertTriangle, CheckCircle,
  CreditCard, Calendar, User, Briefcase, Clock, Eye, Loader2, AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateReadinessScore, formatCurrency } from '@/lib/utils'
import type { Lead } from '@/types'

// ─── helpers ──────────────────────────────────────────────────────────────────

const ASSET_MID: Record<string, number> = {
  '£125k–150k': 137500, '£150k–175k': 162500, '£175k–200k': 187500,
  '£200k–250k': 225000, '£250k–300k': 275000, '£300k–400k': 350000,
  '£400k–500k': 450000, '£500k+': 600000,
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  const weeks = Math.floor(days / 7)
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 7)   return `${days}d ago`
  if (weeks < 5)   return `${weeks}w ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function parseDays(availability: string[]): string[] {
  const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening']
  return availability.filter(a => !TIME_SLOTS.includes(a))
}

function parseTime(availability: string[]): string | null {
  return availability.find(a => ['Morning', 'Afternoon', 'Evening'].includes(a)) ?? null
}

// ─── component ────────────────────────────────────────────────────────────────

function calcPrice(lead: Lead): number {
  return Math.max(49, Math.round((ASSET_MID[lead.asset_range] ?? 150000) / 2500))
}

interface Props {
  lead: Lead | null
  index: number
  isPurchased: boolean
  onPurchase: (price: number) => Promise<{ ok: boolean; reason?: string; is_free?: boolean }>
  onGoToWallet: () => void
  onClose: () => void
}

export default function LeadDetailPanel({ lead, index, isPurchased, onPurchase, onGoToWallet, onClose }: Props) {
  const [viewCount, setViewCount] = useState(lead?.view_count ?? 0)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  async function handleUnlock() {
    if (!lead) return
    setPurchasing(true)
    setPurchaseError(null)
    const result = await onPurchase(calcPrice(lead))
    setPurchasing(false)
    if (!result.ok) {
      setPurchaseError(result.reason === 'insufficient_funds' ? 'insufficient_funds' : 'error')
    }
  }

  // Increment view count when panel opens
  useEffect(() => {
    if (!lead) return
    setPurchaseError(null)
    const supabase = createClient()
    supabase.rpc('increment_lead_views', { lead_id: lead.id }).then(() => {
      setViewCount(c => c + 1)
    })
  }, [lead?.id])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Compute score projection from lead data
  const score = lead ? calculateReadinessScore({
    age:          lead.age,
    targetAge:    lead.target_age,
    assetRange:   lead.asset_range as never,
    targetIncome: lead.target_income,
  }) : null

  const projectedPot      = score ? score.projectedPot : 0
  const sustainableIncome = Math.round(projectedPot * 0.04)
  const monthlyIncome     = Math.round(sustainableIncome / 12)
  const incomeGap         = score ? score.incomeGap : 0
  const LIFE_EXPECTANCY   = 90
  const fundedYears       = lead
    ? Math.min(
        lead.target_income > 0
          ? Math.floor(projectedPot / lead.target_income)
          : LIFE_EXPECTANCY - lead.target_age,
        LIFE_EXPECTANCY - lead.target_age,
      )
    : 0

  const safeScore     = score ? Math.min(Math.max(score.score, 0), 100) : 0
  const circumference = 2 * Math.PI * 40
  const offset        = circumference - (safeScore / 100) * circumference
  const strokeColour  =
    safeScore >= 75 ? '#34d399' : safeScore >= 50 ? '#C9A84C' :
    safeScore >= 30 ? '#f59e0b' : '#ef4444'

  const days = lead ? parseDays(lead.availability ?? []) : []
  const time = lead ? parseTime(lead.availability ?? []) : null

  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                  {isPurchased ? lead.first_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {isPurchased ? lead.first_name : `Potential Client #${index}`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Completed {timeAgo(lead.created_at)}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {viewCount} advisor{viewCount !== 1 ? 's' : ''} viewed
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* Score projection */}
              <section className="bg-gray-50 rounded-2xl p-4 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Retirement Projection
                </p>

                <div className="flex items-center gap-5">
                  {/* Score ring */}
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                      <circle cx="44" cy="44" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="44" cy="44" r="40" fill="none"
                        stroke={strokeColour} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-gray-900">{safeScore}</span>
                      <span className="text-xs font-semibold" style={{ color: strokeColour }}>
                        {score?.label}
                      </span>
                    </div>
                  </div>

                  {/* Key numbers */}
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {[
                      { label: 'Projected pot',    value: formatCurrency(projectedPot),  icon: TrendingUp,    ok: true  },
                      { label: 'Monthly income',   value: formatCurrency(monthlyIncome), icon: TrendingUp,    ok: true  },
                      { label: 'Years funded',     value: `${fundedYears} yrs`,          icon: CheckCircle,   ok: fundedYears >= (LIFE_EXPECTANCY - (lead.target_age || 65)) },
                      { label: 'Annual shortfall', value: incomeGap > 0 ? formatCurrency(incomeGap) : 'On target', icon: incomeGap > 0 ? AlertTriangle : CheckCircle, ok: incomeGap === 0 },
                    ].map(({ label, value, icon: Icon, ok }) => (
                      <div key={label} className="bg-white rounded-xl p-2.5 text-center">
                        <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${ok ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <p className="text-gray-900 font-bold text-xs">{value}</p>
                        <p className="text-gray-400 text-[10px] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Profile info */}
              <section className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Profile</p>

                <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
                  {[
                    { icon: User,      label: 'Current age',     value: lead.age > 0 ? `${lead.age} years old` : '—' },
                    { icon: User,      label: 'Target retire',   value: lead.target_age > 0 ? `Age ${lead.target_age}` : '—' },
                    { icon: Briefcase, label: 'Current assets',  value: lead.asset_range ?? '—' },
                    { icon: TrendingUp,label: 'Current income',  value: lead.current_income ?? '—' },
                    { icon: TrendingUp,label: 'Retirement goal', value: lead.desired_income ?? (lead.target_income ? `${formatCurrency(lead.target_income)}/yr` : '—') },
                    {
                      icon: Calendar,
                      label: 'Availability',
                      value: days.length > 0
                        ? `${days.join(', ')}${time ? ` · ${time}` : ''}`
                        : '—',
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 px-4 py-3">
                      <Icon className="w-4 h-4 text-gray-300 shrink-0" />
                      <span className="text-gray-400 text-sm w-32 shrink-0">{label}</span>
                      <span className="text-gray-800 text-sm font-medium flex-1 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contact (purchased only) */}
              {isPurchased && (
                <section className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Details</p>
                  <div className="bg-green-50 border border-green-100 rounded-2xl divide-y divide-green-100">
                    {[
                      { label: 'Name',  value: lead.first_name },
                      { label: 'Email', value: lead.email      },
                      { label: 'Phone', value: lead.phone      },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-green-600/60 text-sm w-16 shrink-0">{label}</span>
                        <span className="text-gray-800 text-sm font-medium flex-1">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Footer CTA */}
            {!isPurchased && (
              <div className="px-5 py-4 border-t border-gray-100 shrink-0 space-y-3">
                {purchaseError === 'insufficient_funds' ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2 text-red-700 text-sm font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      Insufficient wallet balance
                    </div>
                    <p className="text-red-600 text-xs">
                      You need at least £{lead ? calcPrice(lead) : '—'} in your wallet to unlock this lead.
                    </p>
                    <button
                      onClick={onGoToWallet}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Top up wallet
                    </button>
                  </div>
                ) : purchaseError === 'error' ? (
                  <p className="text-red-600 text-sm text-center">Something went wrong. Please try again.</p>
                ) : null}

                {purchaseError !== 'insufficient_funds' && (
                  <button
                    onClick={handleUnlock}
                    disabled={purchasing}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3.5 transition-colors disabled:opacity-70"
                  >
                    {purchasing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><CreditCard className="w-4 h-4" /> Unlock Lead Details</>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
