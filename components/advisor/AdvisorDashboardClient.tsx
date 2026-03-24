'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types'
import LeadCard from './LeadCard'

interface Props {
  user: { id: string; email: string }
  leads: Lead[]
}

type Tab = 'marketplace' | 'wallet'

export default function AdvisorDashboardClient({ user, leads }: Props) {
  const router = useRouter()
  const [tab, setTab]          = useState<Tab>('marketplace')
  const [search, setSearch]    = useState('')
  const [purchasedIds, setPurchased] = useState<Set<string>>(
    new Set(leads.filter(l => l.is_purchased).map(l => l.id))
  )

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/advisor/login')
  }

  function markPurchased(id: string) {
    setPurchased(prev => new Set([...Array.from(prev), id]))
  }

  const q = search.toLowerCase()
  const availableLeads = leads.filter(l => !purchasedIds.has(l.id))
  const purchasedLeads = leads.filter(l => purchasedIds.has(l.id))

  const displayed = (tab === 'marketplace' ? availableLeads : purchasedLeads).filter(lead =>
    !q ||
    lead.asset_range?.toLowerCase().includes(q) ||
    (lead.current_income ?? '').toLowerCase().includes(q) ||
    String(lead.age).includes(q)
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
            <polyline points="4,28 12,16 20,22 28,10 32,14"
              stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {[4,12,20,28,32].map((x, i) => (
              <circle key={i} cx={x} cy={[28,16,22,10,14][i]} r="2.5" fill="#C9A84C"/>
            ))}
          </svg>
          <span className="font-extrabold text-gray-900 text-lg">
            Retire<span className="text-amber-500">Ready</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm hidden md:block">{user.email}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Header + tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Marketplace</h1>
            <p className="text-gray-400 text-sm mt-1">
              {availableLeads.length} high-intent retirement leads available in your area.
            </p>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 shrink-0">
            {([['marketplace', 'Marketplace'], ['wallet', 'Your Wallet']] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by asset range or age…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
          />
        </div>

        {/* Grid */}
        {displayed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <p className="text-gray-400 text-sm">
              {tab === 'marketplace'
                ? 'No leads available right now — check back soon.'
                : 'You haven\'t purchased any leads yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayed.map((lead, i) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={i}
                isPurchased={purchasedIds.has(lead.id)}
                onPurchase={() => markPurchased(lead.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
