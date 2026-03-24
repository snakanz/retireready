'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  TrendingUp, AlertTriangle, CheckCircle, Phone,
  ArrowRight, Clock, ShieldCheck, Users, ChevronRight,
} from 'lucide-react'
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

  const scoreColourStroke =
    score.score >= 75 ? '#34d399'
    : score.score >= 50 ? '#C9A84C'
    : score.score >= 30 ? '#f59e0b'
    : '#ef4444'

  const sustainableIncome = score.projectedPot * 0.04
  const yearsLeft = Math.max((funnel.targetAge ?? 65) - (funnel.age ?? 45), 0)

  const contextMessage = score.incomeGap > 0
    ? `Based on your current savings, you're projected to fall short by ${formatCurrency(score.incomeGap)} per year. The good news: there's still time to close this gap with the right plan.`
    : `Great news — based on current projections, your savings are on track to fund the retirement lifestyle you want.`

  const nextSteps = [
    {
      icon: Phone,
      title: 'Your adviser will call you',
      detail: funnel.availability && (funnel.availability as string[]).length > 0
        ? `Expected on one of your preferred days: ${(funnel.availability as string[]).join(', ')}`
        : 'We\'ll find a convenient time — look out for our call within 1 business day.',
    },
    {
      icon: ShieldCheck,
      title: 'Your report will be emailed',
      detail: funnel.email
        ? `A copy of this report is being sent to ${funnel.email}`
        : 'A copy of this report has been sent to your email.',
    },
    {
      icon: Users,
      title: 'No pressure — just clarity',
      detail: 'Your adviser is there to help you understand your options. There\'s no obligation to take any action.',
    },
  ]

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
        className="w-full max-w-lg space-y-5"
      >
        {/* Score card */}
        <div className="glass-card text-center space-y-4">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Your Retirement Readiness Score</p>
            <h1 className="text-xl font-bold text-white">
              Hi {funnel.firstName || 'there'} — here's your retirement picture
            </h1>
          </div>

          {/* Animated ring */}
          <div className="flex justify-center py-2">
            <div className="relative w-40 h-40">
              <svg className="score-ring w-full h-full -rotate-90" viewBox="0 0 120 120">
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

          <p className="text-white/60 text-sm leading-relaxed px-2">{contextMessage}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card text-center space-y-1">
            <TrendingUp className="w-6 h-6 text-gold-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{formatCurrency(score.projectedPot)}</div>
            <div className="text-white/40 text-xs">Projected retirement pot</div>
            <div className="text-white/30 text-xs">at age {funnel.targetAge ?? 65}</div>
          </div>
          <div className="glass-card text-center space-y-1">
            {score.incomeGap > 0
              ? <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              : <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            }
            <div className={`text-xl font-bold ${score.incomeGap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {score.incomeGap > 0 ? formatCurrency(score.incomeGap) : 'On target'}
            </div>
            <div className="text-white/40 text-xs">
              {score.incomeGap > 0 ? 'Annual shortfall' : 'Income goal met'}
            </div>
            <div className="text-white/30 text-xs">
              {score.incomeGap > 0
                ? `vs ${formatCurrency(funnel.targetIncome ?? 40000)} goal`
                : `${formatCurrency(Math.round(sustainableIncome))} /yr projected`}
            </div>
          </div>
        </div>

        {/* Extra detail */}
        <div className="glass-card space-y-3">
          <h3 className="text-white font-semibold text-sm">Your projection breakdown</h3>
          <div className="space-y-2">
            {[
              { label: 'Years to retirement', value: `${yearsLeft} year${yearsLeft !== 1 ? 's' : ''}` },
              { label: 'Projected annual income from pot', value: formatCurrency(Math.round(sustainableIncome)) },
              { label: 'Target annual income', value: formatCurrency(funnel.targetIncome ?? 40000) },
              {
                label: score.incomeGap > 0 ? 'Annual shortfall to bridge' : 'Annual surplus',
                value: score.incomeGap > 0 ? formatCurrency(score.incomeGap) : formatCurrency(Math.round(sustainableIncome - (funnel.targetIncome ?? 40000))),
                highlight: true,
              },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`flex justify-between text-sm ${highlight ? 'pt-2 border-t border-white/10' : ''}`}>
                <span className="text-white/50">{label}</span>
                <span className={highlight ? (score.incomeGap > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold') : 'text-white font-medium'}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="glass-card space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-400" />
            <h3 className="text-white font-semibold text-sm">What happens next</h3>
          </div>

          <div className="space-y-3">
            {nextSteps.map(({ icon: Icon, title, detail }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-gold-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/')}
            className="btn-outline-gold w-full flex items-center justify-center gap-2 text-sm mt-2"
          >
            Share with a friend <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-white/25 text-xs text-center pb-4 leading-relaxed">
          Projections assume 6% annual growth and 4% safe withdrawal rate. For illustrative purposes only — not
          financial advice. Past performance is not a guide to future results.
          RetireReady introduces clients to FCA-authorised advisers.
        </p>
      </motion.div>
    </main>
  )
}
