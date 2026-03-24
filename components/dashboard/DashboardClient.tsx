'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User } from '@supabase/supabase-js'
import { LayoutGrid, Clock, History, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types'
import LeadMarketplace from './LeadMarketplace'
import AdvisorWallet   from './AdvisorWallet'
import PastLeads       from './PastLeads'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Tab = 'marketplace' | 'upcoming' | 'past'

interface Props {
  user: User
  marketplaceLeads: Record<string, unknown>[]
  transactions: Transaction[]
}

export default function DashboardClient({ user, marketplaceLeads, transactions }: Props) {
  const [tab, setTab] = useState<Tab>('marketplace')
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const tabs = [
    { id: 'marketplace' as Tab, label: 'Marketplace',  icon: LayoutGrid },
    { id: 'upcoming'    as Tab, label: 'Upcoming',     icon: Clock      },
    { id: 'past'        as Tab, label: 'Past Leads',   icon: History    },
  ]

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
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
          <span className="hidden md:block text-white/30 text-sm ml-2">Adviser Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden md:block">{user.email}</span>
          <button onClick={signOut} className="text-white/40 hover:text-white/80 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab nav */}
      <div className="border-b border-white/8 px-6">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-all',
                tab === id
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-white/50 hover:text-white/80'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'marketplace' && (
            <LeadMarketplace leads={marketplaceLeads} />
          )}
          {tab === 'upcoming' && (
            <AdvisorWallet transactions={transactions} advisorId={user.id} />
          )}
          {tab === 'past' && (
            <PastLeads transactions={transactions} />
          )}
        </motion.div>
      </div>
    </main>
  )
}
