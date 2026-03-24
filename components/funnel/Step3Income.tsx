'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { FunnelData } from '@/types'

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
  onBack: () => void
}

const MIN = 20000
const MAX = 150000
const STEP = 5000

export default function Step3Income({ data, update, onNext, onBack }: Props) {
  const income = data.targetIncome ?? 40000

  // Lifestyle descriptors
  function getLifestyleLabel(val: number): string {
    if (val <= 25000) return 'Essential — covers basics comfortably'
    if (val <= 40000) return 'Comfortable — holidays & hobbies included'
    if (val <= 70000) return 'Affluent — frequent travel & dining out'
    if (val <= 100000) return 'Luxury — premium lifestyle'
    return 'High Net Worth — significant wealth required'
  }

  return (
    <div className="glass-card space-y-8">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 3 — Income Goal</p>
        <h2 className="text-2xl font-bold text-white">What annual income do you want in retirement?</h2>
        <p className="text-white/50 text-sm mt-1">In today's money, before tax.</p>
      </div>

      {/* Big income display */}
      <div className="text-center py-4">
        <div className="text-5xl font-extrabold text-gold-400 tabular-nums">
          {formatCurrency(income)}
        </div>
        <div className="text-white/50 text-sm mt-2">per year</div>
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <input
          type="range"
          min={MIN} max={MAX} step={STEP}
          value={income}
          onChange={e => update({ targetIncome: +e.target.value })}
          className="w-full h-2 rounded-full appearance-none bg-white/10 accent-yellow-400 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>{formatCurrency(MIN)}</span>
          <span>{formatCurrency(MAX)}</span>
        </div>
      </div>

      {/* Lifestyle pill */}
      <div className="bg-navy-500/40 border border-white/10 rounded-xl p-3 text-center">
        <span className="text-white/70 text-sm">{getLifestyleLabel(income)}</span>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline-gold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onNext} className="btn-gold flex-1 flex items-center justify-center gap-2 group">
          Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
