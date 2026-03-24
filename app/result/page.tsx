'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, AlertTriangle, CheckCircle, Phone } from 'lucide-react'
import { calculateReadinessScore, formatCurrency } from '@/lib/utils'
import type { FunnelData, ReadinessScore } from '@/types'

export default function ResultPage() {
  const router = useRouter()
  const [score, setScore] = useState<ReadinessScore | null>(null)
  const [funnel, setFunnel] = useState<Partial<FunnelData>>({})
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('rr_funnel')
    if (raw) {
      const parsed: Partial<FunnelData> = JSON.parse(raw)
      setFunnel(parsed)
      setScore(calculateReadinessScore(parsed))
      setTimeout(() => setAnimated(true), 200)
    }
  }, [])

  if (!score) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading your results…</div>
      </div>
    )
  }

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score.score / 100) * circumference

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
          <polyline points="4,28 12,16 20,22 28,10 32,14"
            stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {[4,12,20,28,32].map((x, i) => (
            <circle key={i} cx={x} cy={[28,16,22,10,14][i]} r="2.5" fill="#C9A84C"/>
          ))}
        </svg>
        <span className="font-extrabold text-white text-lg">
          Retire<span className="text-gold-400">Ready</span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-6"
      >
        {/* Score card */}
        <div className="glass-card text-center space-y-4">
          <p className="text-white/50 text-sm uppercase tracking-widest">Your Retirement Readiness Score</p>

          {/* Animated ring */}
          <div className="flex justify-center py-4">
            <div className="relative w-40 h-40">
              <svg className="score-ring w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                <motion.circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: animated ? offset : circumference }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-4xl font-extrabold text-white tabular-nums"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {score.score}
                </motion.span>
                <span className={`text-sm font-semibold ${score.colour}`}>{score.label}</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white">
            Hi {funnel.firstName || 'there'}, here's your retirement picture
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card text-center">
            <TrendingUp className="w-6 h-6 text-gold-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{formatCurrency(score.projectedPot)}</div>
            <div className="text-white/50 text-xs mt-1">Projected retirement pot</div>
          </div>
          <div className="glass-card text-center">
            {score.incomeGap > 0
              ? <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              : <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            }
            <div className="text-xl font-bold text-white">
              {score.incomeGap > 0 ? formatCurrency(score.incomeGap) : 'On target'}
            </div>
            <div className="text-white/50 text-xs mt-1">
              {score.incomeGap > 0 ? 'Annual income shortfall' : 'Income goal met'}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card space-y-4">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">A regulated adviser will call you</p>
              <p className="text-white/50 text-xs mt-0.5">
                Based on your availability preferences. No obligation — just clarity.
              </p>
            </div>
          </div>

          <div className="bg-gold-400/10 border border-gold-400/20 rounded-xl p-4 text-sm text-white/70 leading-relaxed">
            <strong className="text-gold-400">Next step:</strong> One of our FCA-regulated advisers will review
            your profile and call you at a time that suits you to discuss your personalised retirement strategy.
          </div>

          <button
            onClick={() => router.push('/')}
            className="btn-outline-gold w-full flex items-center justify-center gap-2 text-sm"
          >
            Share with a friend <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-white/30 text-xs text-center pb-4">
          This is a projection based on assumed 6% annual growth and 4% safe withdrawal rate.
          Not financial advice. Past performance is not a guide to future results.
          RetireReady introduces clients to FCA-authorised advisers.
        </p>
      </motion.div>
    </main>
  )
}
