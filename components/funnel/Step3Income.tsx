'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FunnelData } from '@/types'

// ─── Shared income range config ────────────────────────────────────────────
export const INCOME_RANGES: { label: string; midpoint: number }[] = [
  { label: 'Under £20,000',         midpoint: 15000   },
  { label: '£20,000–£30,000',       midpoint: 25000   },
  { label: '£30,000–£40,000',       midpoint: 35000   },
  { label: '£40,000–£50,000',       midpoint: 45000   },
  { label: '£50,000–£75,000',       midpoint: 62500   },
  { label: '£75,000–£100,000',      midpoint: 87500   },
  { label: '£100,000–£150,000',     midpoint: 125000  },
  { label: '£150,000–£200,000',     midpoint: 175000  },
  { label: '£200,000–£300,000',     midpoint: 250000  },
  { label: '£300,000–£500,000',     midpoint: 400000  },
  { label: '£500,000–£1,000,000',   midpoint: 750000  },
  { label: '£1,000,000+',           midpoint: 1500000 },
]

// Export midpoint lookup for use in calculations
export const INCOME_MIDPOINTS: Record<string, number> = Object.fromEntries(
  INCOME_RANGES.map(r => [r.label, r.midpoint])
)

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
  onBack: () => void
}

function IncomeGrid({
  selected,
  onSelect,
}: {
  selected: string | undefined
  onSelect: (label: string, midpoint: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {INCOME_RANGES.map(({ label, midpoint }) => (
        <button
          key={label}
          onClick={() => onSelect(label, midpoint)}
          className={cn(
            'rounded-xl border px-3 py-2.5 text-xs font-semibold text-left transition-all duration-200 leading-tight',
            selected === label
              ? 'border-gold-400 bg-gold-400/15 text-gold-400 shadow-md shadow-gold-400/10 scale-[1.02]'
              : 'border-white/10 bg-white/5 text-white/65 hover:border-white/25 hover:bg-white/8'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function Step3Income({ data, update, onNext, onBack }: Props) {
  const currentIncomeRange = data.currentIncomeRange
  const targetIncomeRange  = data.targetIncomeRange

  const replacementRatio = currentIncomeRange && targetIncomeRange
    ? Math.round((INCOME_MIDPOINTS[targetIncomeRange] / INCOME_MIDPOINTS[currentIncomeRange]) * 100)
    : null

  function getRatioContext(ratio: number): { text: string; colour: string } {
    if (ratio >= 80) return { text: 'Ambitious — equivalent to your current lifestyle', colour: 'text-purple-300/80' }
    if (ratio >= 60) return { text: 'Comfortable — typical target for a great retirement', colour: 'text-emerald-300/80' }
    if (ratio >= 40) return { text: 'Modest — covers essentials with some flexibility', colour: 'text-gold-400/80' }
    return { text: 'Minimal — covers basic living costs', colour: 'text-blue-300/70' }
  }

  const canContinue = !!currentIncomeRange && !!targetIncomeRange

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 3 of 5</p>
        <h2 className="text-2xl font-bold text-white">Let's talk about your income</h2>
        <p className="text-white/50 text-sm mt-2">
          We'll use these to calculate how much you need and whether you're on track.
        </p>
      </div>

      {/* ── Current income ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <label className="text-white/80 text-sm font-semibold">Your current annual income</label>
          <p className="text-white/40 text-xs mt-0.5">Before tax — include salary and regular income</p>
        </div>
        <IncomeGrid
          selected={currentIncomeRange}
          onSelect={(label, midpoint) => update({ currentIncomeRange: label, currentIncome: midpoint })}
        />
      </div>

      <div className="border-t border-white/8" />

      {/* ── Target retirement income ─────────────────────────────────────── */}
      <div className={cn('space-y-3 transition-opacity duration-300', currentIncomeRange ? 'opacity-100' : 'opacity-50')}>
        <div>
          <label className="text-white/80 text-sm font-semibold">Desired retirement income</label>
          <p className="text-white/40 text-xs mt-0.5">Per year in today's money — what would make you comfortable?</p>
        </div>
        <IncomeGrid
          selected={targetIncomeRange}
          onSelect={(label, midpoint) => update({ targetIncomeRange: label, targetIncome: midpoint })}
        />
      </div>

      {/* ── Replacement ratio pill ─────────────────────────────────────── */}
      {replacementRatio !== null && (
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs">Income replacement ratio</p>
            <p className={`text-sm font-medium mt-0.5 ${getRatioContext(replacementRatio).colour}`}>
              {getRatioContext(replacementRatio).text}
            </p>
          </div>
          <div className="text-right ml-4 shrink-0">
            <span className="text-2xl font-extrabold text-white tabular-nums">{replacementRatio}%</span>
            <p className="text-white/30 text-xs">of current income</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline-gold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="btn-gold flex-1 flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Calculate My Plan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
