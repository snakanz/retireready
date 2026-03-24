'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  LogOut, Users, TrendingUp, Search,
  Calendar, Phone, Mail, Clock, ShoppingCart, LayoutGrid,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatCurrency } from '@/lib/utils'
import type { Lead } from '@/types'
import LeadCard from './LeadCard'

interface Props {
  user: { id: string; email: string }
  leads: Lead[]
}

type Filter = 'all' | 'new' | 'purchased'

export default function AdvisorDashboardClient({ user, leads }: Props) {
  const router   = useRouter()
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState<Filter>('all')
  const [purchasedIds, setPurchased]  = useState<Set<string>>(new Set(
    leads.filter(l => l.is_purchased).map(l => l.id)
  ))

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/advisor/login')
  }

  function markPurchased(id: string) {
    setPurchased(prev => {
      const next = new Set(Array.from(prev))
      next.add(id)
      return next
    })
  }

  // Derived
  const q = search.toLowerCase()
  const filtered = leads.filter(lead => {
    const matchesSearch =
      !q ||
      lead.first_name.toLowerCase().includes(q) ||
      (lead.email ?? '').toLowerCase().includes(q) ||
      (lead.asset_range ?? '').toLowerCase().includes(q)

    const matchesFilter =
      filter === 'all'       ? true :
      filter === 'purchased' ? purchasedIds.has(lead.id) :
      /* new */                !purchasedIds.has(lead.id)

    return matchesSearch && matchesFilter
  })

  const totalLeads     = leads.length
  const purchasedCount = purchasedIds.size
  const newCount       = totalLeads - purchasedCount

  const stats = [
    { label: 'Total leads',      value: totalLeads,     icon: Users      },
    { label: 'New / available',  value: newCount,       icon: TrendingUp },
    { label: 'Purchased',        value: purchasedCount, icon: ShoppingCart },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <header className="bg-white/3 border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
            <polyline points="4,28 12,16 20,22 28,10 32,14"
              stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {[4,12,20,28,32].map((x, i) => (
              <circle key={i} cx={x} cy={[28,16,22,10,14][i]} r="2.5" fill="#C9A84C"/>
            ))}
          </svg>
          <span className="font-extrabold text-white text-lg">
            Retire<span className="text-gold-400">Ready</span>
          </span>
          <span className="hidden md:block text-white/30 text-sm ml-2 border-l border-white/10 pl-3">
            Adviser Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm hidden md:block">{user.email}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-8 space-y-6 flex-1">

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold-400/15 border border-gold-400/25 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
                <div className="text-white/45 text-xs">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, email or asset range…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-gold-400/50 transition-all"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex rounded-xl border border-white/10 overflow-hidden shrink-0">
            {(['all', 'new', 'purchased'] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2.5 text-xs font-semibold capitalize transition-all',
                  filter === f
                    ? 'bg-gold-400/20 text-gold-400'
                    : 'bg-white/3 text-white/45 hover:text-white/70 hover:bg-white/5'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Lead grid ─────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="glass-card text-center py-16">
            <LayoutGrid className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50">No leads match your search.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden:  {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {filtered.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isPurchased={purchasedIds.has(lead.id)}
                onPurchase={() => markPurchased(lead.id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
