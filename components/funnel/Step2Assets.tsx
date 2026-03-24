'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssetRange, FunnelData } from '@/types'

const RANGES: AssetRange[] = [
  '£125k–150k', '£150k–175k', '£175k–200k', '£200k–250k',
  '£250k–300k', '£300k–400k', '£400k–500k', '£500k+',
]

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Assets({ data, update, onNext, onBack }: Props) {
  const selected = data.assetRange

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 2 — Current Savings</p>
        <h2 className="text-2xl font-bold text-white">What is the approximate value of your current pension & investments?</h2>
        <p className="text-white/50 text-sm mt-1">Include ISAs, pensions, and investment accounts.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {RANGES.map(range => (
          <button
            key={range}
            onClick={() => update({ assetRange: range })}
            className={cn(
              'rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-200',
              selected === range
                ? 'border-gold-400 bg-gold-400/15 text-gold-400 shadow-lg shadow-gold-400/10 scale-[1.02]'
                : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'
            )}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-outline-gold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="btn-gold flex-1 flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
