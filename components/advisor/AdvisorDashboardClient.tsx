'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Search, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lead, WalletTransaction, LeadPurchase, LeadStatus } from '@/types'
import LeadCard from './LeadCard'
import LeadDetailPanel from './LeadDetailPanel'
import WalletPanel from './WalletPanel'
import ReferralPanel from './ReferralPanel'

interface Props {
  user: { id: string; email: string }
  leads: Lead[]
  walletBalance: number
  freeLeadsUsed: number
  transactions: WalletTransaction[]
  purchases: LeadPurchase[]
  statuses: LeadStatus[]
  referralCode: string
  referralCount: number
  rewardsEarned: number
}

type Tab = 'marketplace' | 'wallet' | 'refer'

const STATUS_OPTIONS: LeadStatus['status'][] = ['new', 'contacted', 'booked', 'converted']

const STATUS_COLOURS: Record<LeadStatus['status'], string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  contacted: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  booked: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  converted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
}

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

export default function AdvisorDashboardClient({
  user, leads, walletBalance, freeLeadsUsed, transactions, purchases, statuses,
  referralCode, referralCount, rewardsEarned,
}: Props) {
  const router = useRouter()
  const [tab, setTab]           = useState<Tab>('marketplace')
  const [search, setSearch]     = useState('')
  const [openLead, setOpenLead] = useState<{ lead: Lead; index: number } | null>(null)

  // Build purchased set from lead_purchases table
  const [purchasedIds, setPurchased] = useState<Set<string>>(
    new Set(purchases.map(p => p.lead_id))
  )

  // Lead statuses — mutable local state so dropdown updates are instant
  const [leadStatuses, setLeadStatuses] = useState<Map<string, LeadStatus['status']>>(
    new Map(statuses.map(s => [s.lead_id, s.status]))
  )

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/advisor/login')
  }

  function markPurchased(id: string) {
    setPurchased(prev => new Set([...Array.from(prev), id]))
  }

  async function handlePurchase(leadId: string, pricePounds: number): Promise<{ ok: boolean; reason?: string; is_free?: boolean }> {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('purchase_lead', {
      p_advisor_id: user.id,
      p_lead_id:    leadId,
      p_price:      pricePounds * 100, // convert to pence
    })
    if (error) {
      console.error('[AdvisorDashboard] purchase_lead error:', error)
      return { ok: false, reason: 'error' }
    }
    if (data?.ok) {
      markPurchased(leadId)
      router.refresh() // re-fetch wallet balance from server
    }
    return data as { ok: boolean; reason?: string; is_free?: boolean }
  }

  async function updateLeadStatus(leadId: string, status: LeadStatus['status']) {
    // Optimistic update
    setLeadStatuses(prev => new Map(prev).set(leadId, status))

    const supabase = createClient()
    const { error } = await supabase
      .from('lead_statuses')
      .upsert({
        advisor_id: user.id,
        lead_id: leadId,
        status,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'advisor_id,lead_id' })

    if (error) {
      console.error('[AdvisorDashboard] Failed to update lead status:', error)
    }
  }

  const q = search.toLowerCase()
  const availableLeads = leads.filter(l => !purchasedIds.has(l.id))
  const purchasedLeads = leads.filter(l => purchasedIds.has(l.id))

  const displayed = (tab === 'wallet' || tab === 'refer' ? purchasedLeads : availableLeads).filter(lead =>
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
          {/* Wallet balance chip */}
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-sm font-semibold text-amber-700">
            <Wallet className="w-3.5 h-3.5" />
            {formatPence(walletBalance)}
          </div>
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
            {([['marketplace', 'Marketplace'], ['wallet', 'Your Wallet'], ['refer', 'Refer & Earn']] as [Tab, string][]).map(([t, label]) => (
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

        {tab === 'refer' ? (
          <div className="bg-[#0B1F3A] rounded-2xl p-6">
            <ReferralPanel
              referralCode={referralCode}
              referralCount={referralCount}
              rewardsEarned={rewardsEarned}
            />
          </div>
        ) : tab === 'wallet' ? (
          /* ── Wallet tab ──────────────────────────────────────────────── */
          <div className="space-y-8">
            {/* WalletPanel in dark container */}
            <div className="bg-[#0B1F3A] rounded-2xl p-6">
              <WalletPanel
                advisorId={user.id}
                balance={walletBalance}
                freeLeadsUsed={freeLeadsUsed}
                transactions={transactions}
              />
            </div>

            {/* Purchased leads with status */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Purchased Leads ({purchasedLeads.length})
              </h2>
              {purchasedLeads.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                  <p className="text-gray-400 text-sm">You haven&apos;t purchased any leads yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchasedLeads.map(lead => {
                    const status = leadStatuses.get(lead.id) ?? 'new'
                    return (
                      <div
                        key={lead.id}
                        className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-gray-900 text-sm">{lead.first_name}</div>
                          <div className="text-gray-400 text-xs">
                            Age {lead.age} · {lead.asset_range} · {lead.email ?? '—'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLOURS[status]}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          <select
                            value={status}
                            onChange={e => updateLeadStatus(lead.id, e.target.value as LeadStatus['status'])}
                            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-indigo-400 transition-colors"
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Marketplace tab ─────────────────────────────────────────── */
          <>
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
                <p className="text-gray-400 text-sm">No leads available right now — check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayed.map((lead, i) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    index={i}
                    isPurchased={purchasedIds.has(lead.id)}
                    onPurchase={(price) => handlePurchase(lead.id, price)}
                    onViewDetails={() => setOpenLead({ lead, index: i })}
                    onGoToWallet={() => setTab('wallet')}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <LeadDetailPanel
        lead={openLead?.lead ?? null}
        index={openLead?.index ?? 0}
        isPurchased={openLead ? purchasedIds.has(openLead.lead.id) : false}
        onPurchase={(price) => openLead ? handlePurchase(openLead.lead.id, price) : Promise.resolve({ ok: false })}
        onGoToWallet={() => { setOpenLead(null); setTab('wallet') }}
        onClose={() => setOpenLead(null)}
      />
    </div>
  )
}
