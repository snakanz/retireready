'use client'

import { ArrowRight, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FunnelData } from '@/types'

// ─── Age range options ─────────────────────────────────────────────────────
const AGE_OPTIONS: { label: string; midpoint: number }[] = [
  { label: 'Under 25', midpoint: 22 },
  { label: '25–34',    midpoint: 30 },
  { label: '35–44',    midpoint: 40 },
  { label: '45–54',    midpoint: 50 },
  { label: '55–64',    midpoint: 60 },
  { label: '65+',      midpoint: 68 },
]

// ─── Retirement age options ────────────────────────────────────────────────
const RETIREMENT_AGES = [55, 57, 58, 60, 62, 63, 65, 67, 68, 70, 72, 75]
const RETIREMENT_LABELS: Record<number, string> = { 75: '75+' }

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
}

export default function Step1Age({ data, update, onNext }: Props) {
  const selectedAge    = data.ageRange ?? null
  const selectedRetAge = data.targetAge ?? null
  const ageMidpoint    = data.age ?? 0

  const yearsLeft = selectedRetAge && ageMidpoint
    ? Math.max(selectedRetAge - ageMidpoint, 0)
    : null

  // Filter out retirement ages that are <= current age midpoint
  const validRetirementAges = RETIREMENT_AGES.filter(a => a > ageMidpoint)

  const canContinue = !!selectedAge && !!selectedRetAge

  function selectAge(label: string, midpoint: number) {
    update({ ageRange: label, age: midpoint })
    // Reset retirement age if now invalid
    if (selectedRetAge && selectedRetAge <= midpoint) {
      update({ targetAge: undefined as unknown as number })
    }
  }

  return (
    <div className="glass-card space-y-7">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 1 of 5</p>
        <h2 className="text-2xl font-bold text-white">When are you planning to retire?</h2>
        <p className="text-white/50 text-sm mt-2">
          We'll calculate exactly where you stand — takes 2 minutes.
        </p>
      </div>

      {/* ── Current age ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <label className="text-white/80 text-sm font-semibold">How old are you?</label>
        <div className="grid grid-cols-3 gap-2.5">
          {AGE_OPTIONS.map(({ label, midpoint }) => (
            <button
              key={label}
              onClick={() => selectAge(label, midpoint)}
              className={cn(
                'rounded-xl border py-3.5 text-sm font-semibold transition-all duration-200',
                selectedAge === label
                  ? 'border-gold-400 bg-gold-400/15 text-gold-400 shadow-lg shadow-gold-400/10 scale-[1.03]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/8'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Retirement age ───────────────────────────────────────────────── */}
      <div className={cn('space-y-3 transition-opacity duration-300', selectedAge ? 'opacity-100' : 'opacity-40 pointer-events-none')}>
        <label className="text-white/80 text-sm font-semibold">When do you want to retire?</label>
        <div className="grid grid-cols-4 gap-2">
          {validRetirementAges.map(age => (
            <button
              key={age}
              onClick={() => update({ targetAge: age })}
              className={cn(
                'rounded-xl border py-3 text-sm font-semibold transition-all duration-200',
                selectedRetAge === age
                  ? 'border-gold-400 bg-gold-400/15 text-gold-400 shadow-lg shadow-gold-400/10 scale-[1.03]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/8'
              )}
            >
              {RETIREMENT_LABELS[age] ?? age}
            </button>
          ))}
        </div>
        {!selectedAge && (
          <p className="text-white/30 text-xs">Select your current age first</p>
        )}
      </div>

      {/* ── Summary pill ─────────────────────────────────────────────────── */}
      {yearsLeft !== null && (
        <div className="bg-gold-400/10 border border-gold-400/20 rounded-xl p-4 text-center">
          <span className="text-white/60 text-sm">You have </span>
          <span className="text-gold-400 font-bold text-lg">{yearsLeft} year{yearsLeft !== 1 ? 's' : ''}</span>
          <span className="text-white/60 text-sm"> to build your retirement pot</span>
          {yearsLeft >= 15 && (
            <p className="text-emerald-400/80 text-xs mt-1">
              That's plenty of time to make a real difference.
            </p>
          )}
          {yearsLeft > 0 && yearsLeft < 15 && (
            <p className="text-amber-400/80 text-xs mt-1">
              Every year counts — let's see where you stand.
            </p>
          )}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="btn-gold w-full flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="flex items-center justify-center gap-1.5 -mt-2">
        <Shield className="w-3.5 h-3.5 text-white/30" />
        <p className="text-white/30 text-xs">No account needed · 100% free · FCA-regulated advisers</p>
      </div>
    </div>
  )
}
