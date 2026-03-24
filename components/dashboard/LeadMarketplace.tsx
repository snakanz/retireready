'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, ShoppingCart, Loader2, CheckCircle } from 'lucide-react'
import { maskName, formatCurrency } from '@/lib/utils'

interface Props {
  leads: Record<string, unknown>[]
}

export default function LeadMarketplace({ leads }: Props) {
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [purchased,  setPurchased]  = useState<Set<string>>(new Set())

  async function handlePurchase(leadId: string) {
    setPurchasing(leadId)
    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ leadId }),
      })
      const json = await res.json()
      if (json.url) window.location.href = json.url
    } catch (err) {
      console.error(err)
    } finally {
      setPurchasing(null)
    }
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-24 text-white/40">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No leads available right now</p>
        <p className="text-sm mt-1">New leads appear here within minutes of submitting the funnel</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white font-bold text-xl">Lead Marketplace</h2>
        <span className="text-white/40 text-sm">{leads.length} available</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {leads.map((lead, i) => {
          const id = lead.id as string
          const isPurchased = purchased.has(id)

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-lg">{maskName(lead.first_name as string)}</p>
                  <p className="text-white/40 text-xs">
                    Age {lead.age as number} · Retiring at {lead.target_age as number}
                  </p>
                </div>
                <span className="bg-gold-400/15 text-gold-400 text-xs font-semibold px-3 py-1 rounded-full border border-gold-400/30">
                  NEW
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs mb-0.5">Assets</p>
                  <p className="text-white font-semibold text-sm">{lead.asset_range as string}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs mb-0.5">Income Goal</p>
                  <p className="text-white font-semibold text-sm">{formatCurrency(lead.target_income as number)}/yr</p>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-3.5 h-3.5 text-white/40" />
                {((lead.availability as string[]) ?? []).map(day => (
                  <span key={day} className="text-xs bg-white/8 text-white/60 px-2 py-0.5 rounded-full border border-white/10">
                    {day.slice(0, 3)}
                  </span>
                ))}
              </div>

              {/* Blurred contact preview */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs w-12">Email</span>
                  <span className="blurred-text text-white/70 text-xs bg-white/5 rounded px-2 py-0.5">
                    unlock@example.co.uk
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs w-12">Phone</span>
                  <span className="blurred-text text-white/70 text-xs bg-white/5 rounded px-2 py-0.5">
                    +44 7700 000000
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => handlePurchase(id)}
                disabled={!!purchasing || isPurchased}
                className="btn-gold w-full flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {isPurchased ? (
                  <><CheckCircle className="w-4 h-4" /> Purchased</>
                ) : purchasing === id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Unlock Lead — £49</>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
