'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import type { WalletTransaction } from '@/types'

interface Props {
  advisorId: string
  balance: number
  freeLeadsUsed: number
  transactions: WalletTransaction[]
}

const TOP_UP_AMOUNTS = [
  { label: '£50', pence: 5000 },
  { label: '£100', pence: 10000 },
  { label: '£250', pence: 25000 },
  { label: '£500', pence: 50000 },
]

function formatPence(pence: number): string {
  return `£${(Math.abs(pence) / 100).toFixed(2)}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function WalletPanel({ balance, freeLeadsUsed, transactions }: Props) {
  const [loadingAmount, setLoadingAmount] = useState<number | null>(null)

  async function handleTopUp(pence: number) {
    setLoadingAmount(pence)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: pence }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('[WalletPanel] No checkout URL returned', data)
      }
    } catch (err) {
      console.error('[WalletPanel] Top-up error:', err)
    } finally {
      setLoadingAmount(null)
    }
  }

  const freeLeadsRemaining = Math.max(0, 3 - freeLeadsUsed)
  const progressPct = Math.min(100, (freeLeadsUsed / 3) * 100)

  return (
    <div className="space-y-6">

      {/* ── Balance card ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#0d2244] to-[#0B1F3A] border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
          <Wallet className="w-3.5 h-3.5" />
          Wallet Balance
        </div>

        <div className="flex items-end gap-3">
          <span className="text-5xl font-extrabold text-white tabular-nums">
            {formatPence(balance)}
          </span>
          <span className="text-white/30 text-sm mb-1.5">GBP</span>
        </div>

        {/* Free leads progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">{freeLeadsUsed} of 3 free leads used</span>
            <span className="text-gold-400 font-semibold">{freeLeadsRemaining} remaining</span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Top-up buttons ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
          <CreditCard className="w-3.5 h-3.5" />
          Top Up Wallet
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOP_UP_AMOUNTS.map(({ label, pence }) => (
            <button
              key={pence}
              onClick={() => handleTopUp(pence)}
              disabled={loadingAmount !== null}
              className={`
                relative flex flex-col items-center justify-center gap-1 py-4 rounded-xl border font-bold text-sm transition-all
                ${loadingAmount === pence
                  ? 'bg-gold-400/10 border-gold-400/40 text-gold-400 cursor-not-allowed'
                  : 'bg-white/4 border-white/10 text-white hover:bg-white/8 hover:border-white/20 active:scale-95'
                }
              `}
            >
              {loadingAmount === pence ? (
                <svg className="w-4 h-4 animate-spin text-gold-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-gold-400" />
                  {label}
                </>
              )}
            </button>
          ))}
        </div>
        <p className="text-white/25 text-xs">Secure payment via Stripe. Funds available immediately after checkout.</p>
      </div>

      {/* ── Transaction history ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
          Transaction History
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white/3 border border-white/8 rounded-xl py-10 text-center text-white/30 text-sm">
            No transactions yet.
          </div>
        ) : (
          <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-3 text-white/35 font-medium text-xs">Date</th>
                  <th className="text-left px-4 py-3 text-white/35 font-medium text-xs">Description</th>
                  <th className="text-right px-4 py-3 text-white/35 font-medium text-xs">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const isCredit = tx.amount >= 0
                  return (
                    <tr
                      key={tx.id}
                      className={i < transactions.length - 1 ? 'border-b border-white/5' : ''}
                    >
                      <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        <div className="flex items-center gap-2">
                          {isCredit
                            ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            : <ArrowDownLeft className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          }
                          {tx.description}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${isCredit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isCredit ? '+' : '-'}{formatPence(tx.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
