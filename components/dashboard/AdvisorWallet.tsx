'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Phone, Mail, ArrowRight, Clock } from 'lucide-react'
import type { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
  advisorId: string
}

export default function AdvisorWallet({ transactions }: Props) {
  const router = useRouter()

  const upcoming = transactions.filter(t =>
    t.stripe_status === 'completed' && t.leads
  )

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-24 text-white/40">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No upcoming leads yet</p>
        <p className="text-sm mt-1">Purchase leads from the marketplace to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-xl mb-2">Your Leads</h2>

      {upcoming.map((tx, i) => {
        const lead = tx.leads!
        return (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-bold text-lg">{lead.first_name}</p>
                <p className="text-white/40 text-xs">
                  Age {lead.age} · Target retirement: {lead.target_age} · {lead.asset_range}
                </p>
              </div>
              <span className="bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30">
                Purchased
              </span>
            </div>

            {/* Contact info (unlocked) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <div>
                  <p className="text-white/40 text-xs">Email</p>
                  <p className="text-white text-xs font-medium break-all">{lead.email}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <div>
                  <p className="text-white/40 text-xs">Phone</p>
                  <p className="text-white text-xs font-medium">{lead.phone}</p>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white/40 text-xs">Available:</span>
              {(lead.availability ?? []).map(day => (
                <span key={day} className="text-xs bg-gold-400/10 text-gold-400 px-2 py-0.5 rounded-full border border-gold-400/20">
                  {day}
                </span>
              ))}
            </div>

            {/* Schedule CTA */}
            <button
              onClick={() => router.push(`/schedule/${lead.id}`)}
              className="btn-gold w-full flex items-center justify-center gap-2 text-sm group"
            >
              <Calendar className="w-4 h-4" />
              Schedule a Call
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
