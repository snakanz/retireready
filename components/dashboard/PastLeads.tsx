'use client'

import { motion } from 'framer-motion'
import { Download, History } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
}

function exportCSV(transactions: Transaction[]) {
  const headers = ['Date', 'Lead Name', 'Age', 'Asset Range', 'Target Income', 'Amount Paid', 'Status']
  const rows = transactions.map(tx => [
    new Date(tx.created_at).toLocaleDateString('en-GB'),
    tx.leads?.first_name ?? '',
    tx.leads?.age ?? '',
    tx.leads?.asset_range ?? '',
    tx.leads?.target_income ?? '',
    `£${(tx.amount / 100).toFixed(2)}`,
    tx.stripe_status,
  ])

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `retireready-leads-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function PastLeads({ transactions }: Props) {
  const completed = transactions.filter(t => t.stripe_status === 'completed')

  if (completed.length === 0) {
    return (
      <div className="text-center py-24 text-white/40">
        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No past leads yet</p>
      </div>
    )
  }

  const totalSpend = completed.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white font-bold text-xl">Lead History</h2>
        <button
          onClick={() => exportCSV(completed)}
          className="btn-outline-gold flex items-center gap-2 text-sm py-2 px-4"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-card text-center">
          <div className="text-2xl font-extrabold text-gold-400">{completed.length}</div>
          <div className="text-white/50 text-xs mt-1">Total Leads Purchased</div>
        </div>
        <div className="glass-card text-center">
          <div className="text-2xl font-extrabold text-gold-400">{formatCurrency(totalSpend / 100)}</div>
          <div className="text-white/50 text-xs mt-1">Total Spend</div>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              {['Date', 'Lead', 'Age', 'Assets', 'Income Target', 'Paid'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {completed.map((tx, i) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <td className="px-4 py-3 text-white/50">
                  {new Date(tx.created_at).toLocaleDateString('en-GB')}
                </td>
                <td className="px-4 py-3 text-white font-medium">{tx.leads?.first_name ?? '—'}</td>
                <td className="px-4 py-3 text-white/70">{tx.leads?.age ?? '—'}</td>
                <td className="px-4 py-3 text-white/70">{tx.leads?.asset_range ?? '—'}</td>
                <td className="px-4 py-3 text-white/70">
                  {tx.leads?.target_income ? formatCurrency(tx.leads.target_income) : '—'}/yr
                </td>
                <td className="px-4 py-3 text-gold-400 font-semibold">
                  {formatCurrency(tx.amount / 100)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
