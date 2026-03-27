'use client'

import { ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FunnelData } from '@/types'

export const ASSET_RANGES: { label: string; midpoint: number }[] = [
  { label: 'Under £50k',    midpoint: 25000   },
  { label: '£50k–£150k',   midpoint: 100000  },
  { label: '£150k–£250k',  midpoint: 200000  },
  { label: '£250k–£500k',  midpoint: 375000  },
  { label: '£500k–£750k',  midpoint: 625000  },
  { label: '£750k–£1m',    midpoint: 875000  },
  { label: '£1m–£2m',      midpoint: 1500000 },
  { label: '£2m+',         midpoint: 2500000 },
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
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 2 of 5</p>
        <h2 className="text-2xl font-bold text-white">How much have you saved so far?</h2>
        <p className="text-white/50 text-sm mt-2">
          Include pensions, ISAs, savings accounts — everything counts towards your future.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ASSET_RANGES.map(({ label }) => (
          <button
            key={label}
            onClick={() => update({ assetRange: label as FunnelData['assetRange'] })}
            className={cn(
              'rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-200',
              selected === label
                ? 'border-gold-400 bg-gold-400/15 text-gold-400 shadow-lg shadow-gold-400/10 scale-[1.02]'
                : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
        <p className="text-white/40 text-xs leading-relaxed">
          A rough estimate is fine — this helps us give you a realistic projection. You can refine the details with your adviser.
        </p>
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
