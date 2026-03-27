'use client'

import { useState } from 'react'
import { Copy, Check, Users, Gift } from 'lucide-react'

interface Props {
  referralCode: string
  referralCount: number
  rewardsEarned: number  // total pence earned from referrals
}

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(0)}`
}

export default function ReferralPanel({ referralCode, referralCount, rewardsEarned }: Props) {
  const [copied, setCopied] = useState(false)

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://retireready.pages.dev'}/advisor/apply?ref=${referralCode}`

  async function copyLink() {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
        <Users className="w-3.5 h-3.5" />
        Refer an Adviser
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-br from-[#0d2244] to-[#0B1F3A] border border-gold-400/15 rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-white font-bold text-sm">Earn £300 for every adviser you refer</p>
          <p className="text-white/45 text-xs mt-1 leading-relaxed">
            Share your unique link. When the adviser applies, gets approved, and deposits £100+, you automatically receive £300 wallet credit.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2.5">
          {[
            { n: '1', text: 'Share your link with a qualified FCA-regulated adviser' },
            { n: '2', text: 'They apply, pass our verification, and get approved' },
            { n: '3', text: 'They make their first deposit of £100 or more' },
            { n: '4', text: 'You receive £300 credit — automatically, instantly' },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gold-400/20 border border-gold-400/30 flex items-center justify-center shrink-0 text-gold-400 text-xs font-bold mt-0.5">
                {n}
              </div>
              <p className="text-white/55 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your referral link */}
      <div className="space-y-2">
        <p className="text-white/50 text-xs uppercase tracking-widest">Your referral link</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/4 border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-xs font-mono truncate">
            {referralUrl}
          </div>
          <button
            onClick={copyLink}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all shrink-0 ${
              copied
                ? 'bg-emerald-400/15 border-emerald-400/30 text-emerald-400'
                : 'bg-gold-400/15 border-gold-400/30 text-gold-400 hover:bg-gold-400/25'
            }`}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>
        <p className="text-white/25 text-xs">
          Your code: <span className="text-white/50 font-mono font-bold">{referralCode}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-4 h-4 text-white/40" />
          </div>
          <p className="text-2xl font-extrabold text-white tabular-nums">{referralCount}</p>
          <p className="text-white/40 text-xs mt-0.5">Advisers referred</p>
        </div>
        <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Gift className="w-4 h-4 text-gold-400" />
          </div>
          <p className="text-2xl font-extrabold text-gold-400 tabular-nums">
            {rewardsEarned > 0 ? formatPence(rewardsEarned) : '£0'}
          </p>
          <p className="text-white/40 text-xs mt-0.5">Referral credit earned</p>
        </div>
      </div>

      <p className="text-white/20 text-xs leading-relaxed">
        Referral rewards are only issued once per referred adviser. The referred adviser must be independently approved by RetireReady and make a qualifying deposit. Reward credited within minutes of qualifying deposit.
      </p>
    </div>
  )
}
