'use client'

import { Clock, MapPin, CheckCircle, CreditCard, Ban } from 'lucide-react'
import type { Lead } from '@/types'

const ASSET_MID: Record<string, number> = {
  'Under £50k':   25000,   '£50k–£150k':  100000,
  '£150k–£250k':  200000,  '£250k–£500k': 375000,
  '£500k–£750k':  625000,  '£750k–£1m':   875000,
  '£1m–£2m':      1500000, '£2m+':        2500000,
}

function calcPrice(lead: Lead): number {
  const assets = lead.asset_value ?? ASSET_MID[lead.asset_range] ?? 150_000
  return Math.max(49, Math.round(assets / 2500))
}

function formatK(amount: number): string {
  if (amount >= 1_000_000) return `£${Math.round(amount / 1_000_000)}m`
  if (amount >= 1_000)     return `£${Math.round(amount / 1_000)}k`
  return `£${amount}`
}

function parseIncomeMidpoint(rangeLabel: string | null, fallback: number): number {
  if (!rangeLabel) return fallback
  const nums = rangeLabel.replace(/[£,]/g, '').split(/[–\-]/).map(n => parseInt(n.trim()))
  if (nums.length >= 2 && !isNaN(nums[0]) && !isNaN(nums[1])) return (nums[0] + nums[1]) / 2
  return fallback
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

interface Props {
  lead: Lead
  index: number
  isPurchased: boolean  // purchased by this advisor
  isSold: boolean       // purchased by a different advisor
  onViewDetails: () => void
}

export default function LeadCard({ lead, index, isPurchased, isSold, onViewDetails }: Props) {
  const pot   = ASSET_MID[lead.asset_range] ?? 150000
  const inc   = parseIncomeMidpoint(lead.current_income, lead.target_income)
  const price = calcPrice(lead)

  const stats = [
    { label: 'POT',  value: formatK(pot) },
    { label: 'INC.', value: formatK(inc) },
    { label: 'AGE',  value: lead.age > 0 ? String(lead.age) : '—' },
  ]

  return (
    <div
      onClick={isSold ? undefined : onViewDetails}
      className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 relative transition-all
        ${isSold
          ? 'border-gray-100 opacity-55 cursor-default'
          : 'border-gray-100 hover:shadow-md hover:border-indigo-100 cursor-pointer'
        }`}
    >
      {/* Sold overlay */}
      {isSold && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 bg-gray-50/60">
          <div className="flex items-center gap-1.5 bg-gray-200 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Ban className="w-3.5 h-3.5" />
            Sold to another adviser
          </div>
        </div>
      )}

      {/* Price badge */}
      <div className="absolute top-4 right-4">
        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
          £{price}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 pr-14">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-400 font-bold text-lg">
          {isPurchased ? lead.first_name.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">
            {isPurchased ? lead.first_name : `Potential Client #${index}`}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
            <Clock className="w-3 h-3" />
            <span>{formatTime(lead.created_at)}</span>
            <span>·</span>
            <MapPin className="w-3 h-3" />
            <span>LONDON</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-gray-400 text-xs font-medium mb-0.5">{label}</p>
            <p className="text-gray-900 font-bold text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      {isPurchased ? (
        <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl py-2.5">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-700 text-sm font-semibold">Lead Purchased — View Details</span>
        </div>
      ) : !isSold ? (
        <div className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl py-3">
          <CreditCard className="w-4 h-4" />
          Unlock Lead Details
        </div>
      ) : null}
    </div>
  )
}
