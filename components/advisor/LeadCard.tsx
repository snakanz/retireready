'use client'

import { useState } from 'react'
import { CreditCard, Clock, MapPin, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import type { Lead } from '@/types'

// Asset range → midpoint in £
const ASSET_MID: Record<string, number> = {
  '£125k–150k': 137500, '£150k–175k': 162500, '£175k–200k': 187500,
  '£200k–250k': 225000, '£250k–300k': 275000, '£300k–400k': 350000,
  '£400k–500k': 450000, '£500k+': 600000,
}

function projectedPot(lead: Lead): number {
  return ASSET_MID[lead.asset_range] ?? 150000
}

function calcPrice(lead: Lead): number {
  return Math.max(49, Math.round(projectedPot(lead) / 2500))
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
  isPurchased: boolean
  onPurchase: (price: number) => Promise<{ ok: boolean; reason?: string; is_free?: boolean }>
  onViewDetails: () => void
  onGoToWallet: () => void
}

export default function LeadCard({ lead, index, isPurchased, onPurchase, onViewDetails, onGoToWallet }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const pot   = projectedPot(lead)
  const inc   = parseIncomeMidpoint(lead.current_income, lead.target_income)
  const price = calcPrice(lead)

  const stats = [
    { label: 'POT',  value: formatK(pot) },
    { label: 'INC.', value: formatK(inc) },
    { label: 'AGE',  value: lead.age > 0 ? String(lead.age) : '—' },
  ]

  async function handleConfirm() {
    setLoading(true)
    setError(null)
    const result = await onPurchase(price)
    setLoading(false)
    if (result.ok) {
      setShowModal(false)
    } else if (result.reason === 'insufficient_funds') {
      setError('insufficient_funds')
    } else {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 relative">

        {/* Price badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
            £{price}
          </span>
        </div>

        {/* Header — click to open detail panel */}
        <div className="flex items-center gap-3 pr-14 cursor-pointer" onClick={onViewDetails}>
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

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-gray-400 text-xs font-medium mb-0.5">{label}</p>
              <p className="text-gray-900 font-bold text-sm">{value}</p>
            </div>
          ))}
        </div>

        {/* Unlocked contact details */}
        {isPurchased && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 space-y-1">
            <p className="text-green-700 text-xs font-semibold">Contact Details</p>
            <p className="text-gray-700 text-xs">{lead.email}</p>
            <p className="text-gray-700 text-xs">{lead.phone}</p>
          </div>
        )}

        {/* CTA */}
        {isPurchased ? (
          <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl py-2.5">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm font-semibold">Lead Purchased</span>
          </div>
        ) : (
          <button
            onClick={() => { setError(null); setShowModal(true) }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl py-3 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Unlock Lead Details
          </button>
        )}
      </div>

      {/* Purchase modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !loading && setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-7 h-7 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Unlock Lead Details</h2>
              <p className="text-gray-500 text-sm mt-1">
                Get the full contact details for Potential Client #{index}.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              {[
                { label: 'Lead',  value: `Potential Client #${index}` },
                { label: 'Age',   value: lead.age > 0 ? `${lead.age} yrs` : '—' },
                { label: 'Pot',   value: formatK(pot) },
                { label: 'Price', value: `£${price}`, highlight: true },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className={highlight ? 'text-indigo-600 font-bold' : 'text-gray-900 font-medium'}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Error states */}
            {error === 'insufficient_funds' ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 text-red-700 text-sm font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  Insufficient wallet balance
                </div>
                <p className="text-red-600 text-xs">You need at least £{price} in your wallet to unlock this lead.</p>
                <button
                  onClick={() => { setShowModal(false); onGoToWallet() }}
                  className="w-full mt-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Top up wallet
                </button>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              {error !== 'insufficient_funds' && (
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
