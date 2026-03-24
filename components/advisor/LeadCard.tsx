'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail, Phone, Calendar, TrendingUp, Clock,
  ShoppingCart, CheckCircle, User, Briefcase,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Lead } from '@/types'

const LEAD_PRICE = 49   // £ — stub price

interface Props {
  lead: Lead
  isPurchased: boolean
  onPurchase: () => void
}

// Parse the availability array into days + time preference
function parseAvailability(availability: string[]): { days: string[]; time: string | null } {
  const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening']
  const days = availability.filter(a => !TIME_SLOTS.includes(a))
  const time = availability.find(a => TIME_SLOTS.includes(a)) ?? null
  return { days, time }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Colour avatar based on first letter
function avatarColour(name: string) {
  const colours = [
    'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-purple-500', 'bg-rose-500', 'bg-cyan-500',
  ]
  return colours[name.charCodeAt(0) % colours.length]
}

export default function LeadCard({ lead, isPurchased, onPurchase }: Props) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const { days, time } = parseAvailability(lead.availability ?? [])
  const initials = lead.first_name.charAt(0).toUpperCase()

  return (
    <>
      <motion.div
        variants={{
          hidden:  { opacity: 0, y: 16 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        }}
        className={cn(
          'glass-card flex flex-col gap-4 relative overflow-hidden',
          isPurchased && 'ring-1 ring-emerald-400/30'
        )}
      >
        {/* New badge */}
        {!isPurchased && (
          <div className="absolute top-4 right-4">
            <span className="bg-gold-400/20 border border-gold-400/40 text-gold-400 text-xs font-semibold px-2 py-0.5 rounded-full">
              New
            </span>
          </div>
        )}

        {/* ── Header: name + contact ─────────────────────────────────────── */}
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0',
            avatarColour(lead.first_name)
          )}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base truncate">{lead.first_name}</p>
            {isPurchased ? (
              <div className="space-y-0.5 mt-0.5">
                <div className="flex items-center gap-1.5 text-white/55 text-xs">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{lead.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/55 text-xs">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>{lead.phone}</span>
                </div>
              </div>
            ) : (
              <p className="text-white/35 text-xs mt-0.5">Contact details unlocked on purchase</p>
            )}
          </div>
        </div>

        {/* ── Details grid ──────────────────────────────────────────────── */}
        <div className="space-y-2.5 text-sm">
          {/* Age */}
          <Row icon={User} label="Age">
            <span className="text-white font-medium">
              {lead.age > 0 ? `${lead.age} yrs` : '—'}
            </span>
            {lead.target_age > 0 && (
              <span className="text-white/45 text-xs ml-1">→ retiring at {lead.target_age}</span>
            )}
          </Row>

          {/* Assets */}
          <Row icon={Briefcase} label="Assets">
            <span className="text-white font-medium">{lead.asset_range ?? '—'}</span>
          </Row>

          {/* Current income */}
          <Row icon={TrendingUp} label="Current income">
            <span className="text-white font-medium">{lead.current_income ?? '—'}</span>
          </Row>

          {/* Target income */}
          <Row icon={TrendingUp} label="Retirement goal">
            <span className="text-white font-medium">
              {lead.desired_income ?? (lead.target_income ? formatCurrency(lead.target_income) + '/yr' : '—')}
            </span>
          </Row>

          {/* Availability */}
          <Row icon={Calendar} label="Available">
            {days.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {days.map(d => (
                  <span key={d} className="bg-white/8 border border-white/12 rounded-md px-1.5 py-0.5 text-white/70 text-xs">
                    {d.slice(0, 3)}
                  </span>
                ))}
                {time && (
                  <span className="bg-gold-400/12 border border-gold-400/20 rounded-md px-1.5 py-0.5 text-gold-400/80 text-xs">
                    {time}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-white/35">Not specified</span>
            )}
          </Row>

          {/* Date submitted */}
          <Row icon={Clock} label="Submitted">
            <span className="text-white/65 font-medium">{formatDate(lead.created_at)}</span>
          </Row>
        </div>

        {/* ── Purchase button ───────────────────────────────────────────── */}
        {isPurchased ? (
          <div className="flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/25 rounded-xl px-4 py-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 text-sm font-semibold">Lead Purchased</span>
          </div>
        ) : (
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="btn-gold w-full flex items-center justify-center gap-2 text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Purchase Lead — £{LEAD_PRICE}
          </button>
        )}
      </motion.div>

      {/* ── Purchase modal (stub) ────────────────────────────────────────── */}
      {showPurchaseModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPurchaseModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-sm w-full space-y-5 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-7 h-7 text-gold-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Purchase this lead</h2>
              <p className="text-white/50 text-sm mt-1">
                You'll receive full contact details and be able to reach out directly.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-left space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Lead</span>
                <span className="text-white font-medium">{lead.first_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Price</span>
                <span className="text-gold-400 font-bold">£{LEAD_PRICE}</span>
              </div>
            </div>

            <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-2.5">
              <p className="text-amber-400/90 text-xs">
                🚧 Payment integration coming soon. Click Confirm to stub this purchase.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="btn-outline-gold flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onPurchase()
                  setShowPurchaseModal(false)
                }}
                className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" /> Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

// ─── Small helper row ─────────────────────────────────────────────────────────
function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" />
      <span className="text-white/40 text-xs w-28 shrink-0">{label}</span>
      <div className="flex-1 flex items-center flex-wrap gap-1">{children}</div>
    </div>
  )
}
