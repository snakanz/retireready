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

const CURRENT_MIN = 20000
const CURRENT_MAX = 200000
const CURRENT_STEP = 5000

const TARGET_MIN = 20000
const TARGET_MAX = 150000
const TARGET_STEP = 5000

export default function Step3Income({ data, update, onNext, onBack }: Props) {
  const currentIncome = data.currentIncome ?? 65000
  const targetIncome = data.targetIncome ?? 40000

  const replacementRatio = Math.round((targetIncome / currentIncome) * 100)

  function getRatioContext(ratio: number): { text: string; colour: string } {
    if (ratio >= 80) return { text: 'Ambitious — equivalent to your current lifestyle', colour: 'text-purple-300/80' }
    if (ratio >= 60) return { text: 'Comfortable — typical target for a great retirement', colour: 'text-emerald-300/80' }
    if (ratio >= 40) return { text: 'Modest — covers the essentials with some flexibility', colour: 'text-gold-400/80' }
    return { text: 'Minimal — covers basic living costs', colour: 'text-blue-300/70' }
  }

  const { text: ratioText, colour: ratioColour } = getRatioContext(replacementRatio)

  return (
    <div className="glass-card space-y-8">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 3 of 4</p>
        <h2 className="text-2xl font-bold text-white">Let's talk about your income</h2>
        <p className="text-white/50 text-sm mt-2">
          We'll use these to calculate how much you need to save and whether you're on track.
        </p>
      </div>

      {/* Current income */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <label className="text-white/80 text-sm font-semibold">Current annual income</label>
            <span className="text-white font-bold text-xl tabular-nums">{formatCurrency(currentIncome)}</span>
          </div>
          <p className="text-white/40 text-xs mb-3">What you earn now — before tax</p>
          <input
            type="range"
            min={CURRENT_MIN} max={CURRENT_MAX} step={CURRENT_STEP}
            value={currentIncome}
            onChange={e => update({ currentIncome: +e.target.value })}
            className="w-full h-2 rounded-full appearance-none bg-white/10 accent-yellow-400 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>{formatCurrency(CURRENT_MIN)}</span>
            <span>{formatCurrency(CURRENT_MAX)}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/8" />

      {/* Target retirement income */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <label className="text-white/80 text-sm font-semibold">Desired retirement income</label>
            <span className="text-gold-400 font-bold text-xl tabular-nums">{formatCurrency(targetIncome)}</span>
          </div>
          <p className="text-white/40 text-xs mb-3">What you'd like each year in retirement — in today's money</p>
          <input
            type="range"
            min={TARGET_MIN} max={TARGET_MAX} step={TARGET_STEP}
            value={targetIncome}
            onChange={e => update({ targetIncome: +e.target.value })}
            className="w-full h-2 rounded-full appearance-none bg-white/10 accent-yellow-400 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>{formatCurrency(TARGET_MIN)}</span>
            <span>{formatCurrency(TARGET_MAX)}</span>
          </div>
        </div>
      </div>

      {/* Replacement ratio pill */}
      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs">Income replacement ratio</p>
          <p className={`text-sm font-medium mt-0.5 ${ratioColour}`}>{ratioText}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-white tabular-nums">{replacementRatio}%</span>
          <p className="text-white/30 text-xs">of current income</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline-gold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onNext} className="btn-gold flex-1 flex items-center justify-center gap-2 group">
          Calculate My Plan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
