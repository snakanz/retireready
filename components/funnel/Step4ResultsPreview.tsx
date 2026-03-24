'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, TrendingUp, AlertTriangle, CheckCircle, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { calculateReadinessScore, formatCurrency } from '@/lib/utils'
import type { FunnelData } from '@/types'

interface Props {
  data: Partial<FunnelData>
  onNext: () => void
  onBack: () => void
}

export default function Step4ResultsPreview({ data, onNext, onBack }: Props) {
  const [animated, setAnimated] = useState(false)
  const score = calculateReadinessScore(data)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score.score / 100) * circumference

  const scoreColourStroke =
    score.score >= 75 ? '#34d399'
    : score.score >= 50 ? '#C9A84C'
    : score.score >= 30 ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="glass-card space-y-6">
      <div className="text-center">
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 4 of 6 — Your Preview</p>
        <h2 className="text-2xl font-bold text-white">Here's a snapshot of your retirement picture</h2>
        <p className="text-white/50 text-sm mt-2">
          Enter your details on the next screen to unlock your full personalised report.
        </p>
      </div>

      {/* Score ring */}
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={scoreColourStroke}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: animated ? offset : circumference }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-extrabold text-white tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: animated ? 1 : 0 }}
              transition={{ delay: 0.8 }}
            >
              {score.score}
            </motion.span>
            <span className={`text-xs font-semibold ${score.colour}`}>{score.label}</span>
          </div>
        </div>
        <p className="text-white/40 text-xs">Retirement Readiness Score</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-gold-400 mx-auto mb-1.5" />
          <div className="text-lg font-bold text-white">{formatCurrency(score.projectedPot)}</div>
          <div className="text-white/40 text-xs mt-0.5">Projected pot at retirement</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          {score.incomeGap > 0
            ? <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            : <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
          }
          <div className={`text-lg font-bold ${score.incomeGap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {score.incomeGap > 0 ? formatCurrency(score.incomeGap) : 'On target'}
          </div>
          <div className="text-white/40 text-xs mt-0.5">
            {score.incomeGap > 0 ? 'Annual income shortfall' : 'Income goal met'}
          </div>
        </div>
      </div>

      {/* Unlock prompt */}
      <div className="bg-gold-400/8 border border-gold-400/25 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-gold-400 shrink-0" />
          <p className="text-white font-semibold text-sm">Unlock your full retirement report</p>
        </div>
        <p className="text-white/50 text-xs leading-relaxed">
          Get your complete breakdown, personalised action plan, and a free no-obligation call with an
          FCA-regulated adviser who can actually help you close the gap.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline-gold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onNext} className="btn-gold flex-1 flex items-center justify-center gap-2 group">
          Get My Full Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
