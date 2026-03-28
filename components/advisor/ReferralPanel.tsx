'use client'

import { useState } from 'react'
import { Copy, Check, Users, Gift, Mail, Share2, MessageCircle } from 'lucide-react'

interface Props {
  referralCode: string
  referralCount: number
  rewardsEarned: number  // total pence earned from referrals
}

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(0)}`
}

// LinkedIn SVG icon (not in lucide)
function LinkedInIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

export default function ReferralPanel({ referralCode, referralCount, rewardsEarned }: Props) {
  const [copied, setCopied] = useState(false)

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://retireready.pages.dev'}/advisor/apply?ref=${referralCode}`

  const shareText = `I'm using RetireReady to connect with high-intent retirement planning clients. Join with my link and get started — use my referral and you'll be on your way to your first leads: ${referralUrl}`

  async function copyLink() {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  async function shareNative() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: 'Join RetireReady — retirement lead marketplace',
        text: shareText,
        url: referralUrl,
      }).catch(() => {/* user cancelled */})
    }
  }

  function shareEmail() {
    const subject = encodeURIComponent('Join me on RetireReady — high-quality retirement leads')
    const body    = encodeURIComponent(
      `Hi,\n\nI've been using RetireReady to connect with high-intent retirement planning clients and thought you'd find it valuable too.\n\nSign up with my referral link: ${referralUrl}\n\nWhen you make your first deposit of £100+, I also receive £300 credit — so we both benefit.\n\nBest,`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  function shareLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
      '_blank', 'noopener,noreferrer'
    )
  }

  function shareWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank', 'noopener,noreferrer'
    )
  }

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

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

      {/* Share buttons */}
      <div className="space-y-2">
        <p className="text-white/50 text-xs uppercase tracking-widest">Share via</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={shareEmail}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm font-medium transition-all"
          >
            <Mail className="w-4 h-4 text-white/50" />
            Email
          </button>
          <button
            onClick={shareLinkedIn}
            className="flex items-center justify-center gap-2 bg-[#0077b5]/20 hover:bg-[#0077b5]/30 border border-[#0077b5]/30 rounded-xl px-4 py-3 text-[#5fb8d9] text-sm font-medium transition-all"
          >
            <LinkedInIcon />
            LinkedIn
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/20 rounded-xl px-4 py-3 text-[#25d366] text-sm font-medium transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          {hasNativeShare ? (
            <button
              onClick={shareNative}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm font-medium transition-all"
            >
              <Share2 className="w-4 h-4 text-white/50" />
              More…
            </button>
          ) : (
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm font-medium transition-all"
            >
              <Copy className="w-4 h-4 text-white/50" />
              Copy Link
            </button>
          )}
        </div>
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
