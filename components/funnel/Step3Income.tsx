'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { FunnelData } from '@/types'

const INCOME_LEVELS = [
  { pct: 0.25, label: 'Essential',         desc: 'Cover the basics — modest but secure' },
  { pct: 0.50, label: 'Comfortable',       desc: 'Day-to-day comfort with some flexibility' },
  { pct: 0.75, label: 'Good Life',         desc: 'Maintain most of your current lifestyle' },
  { pct: 1.00, label: 'Match Current',     desc: 'Keep your exact standard of living' },
  { pct: 1.25, label: 'Luxury',            desc: 'Upgrade your lifestyle in retirement' },
]

function formatGBP(val: number): string {
  return `£${Math.round(val).toLocaleString('en-GB')}`
}

function parseRawInput(raw: string): number {
  return parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0
}

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3Income({ data, update, onNext, onBack }: Props) {
  const currentIncome  = data.currentIncome ?? 0
  const displayValue   = currentIncome > 0 ? currentIncome.toLocaleString('en-GB') : ''

  // Find slider index from stored targetIncome
  const storedPct   = currentIncome > 0 && data.targetIncome ? data.targetIncome / currentIncome : 0.75
  const sliderIndex = INCOME_LEVELS.reduce((best, l, i) =>
    Math.abs(l.pct - storedPct) < Math.abs(INCOME_LEVELS[best].pct - storedPct) ? i : best, 2)

  const selectedLevel = INCOME_LEVELS[sliderIndex]
  const targetIncome  = Math.round(currentIncome * selectedLevel.pct)

  function handleIncomeInput(raw: string) {
    const val = parseRawInput(raw)
    update({ currentIncome: val, currentIncomeRange: val > 0 ? `${formatGBP(val)}/yr` : undefined })
  }

  function handleSlider(idx: number) {
    const level = INCOME_LEVELS[idx]
    const tgt   = Math.round(currentIncome * level.pct)
    update({
      targetIncome:      tgt,
      targetIncomeRange: `${level.label} — ${formatGBP(tgt)}/yr`,
    })
  }

  function handleNext() {
    // Ensure targetIncome is committed
    if (currentIncome > 0) {
      const tgt = Math.round(currentIncome * selectedLevel.pct)
      update({
        targetIncome:      tgt,
        targetIncomeRange: `${selectedLevel.label} — ${formatGBP(tgt)}/yr`,
      })
    }
    onNext()
  }

  const canContinue = currentIncome > 0

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 3 of 5</p>
        <h2 className="text-2xl font-bold text-white">Let's talk about your income</h2>
        <p className="text-white/50 text-sm mt-2">
          Enter your current income to see your retirement options.
        </p>
      </div>

      {/* ── Current income input ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-white/80 text-sm font-semibold">
          Your current annual income <span className="text-white/40 font-normal">(before tax)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold text-lg">£</span>
          <input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={e => handleIncomeInput(e.target.value)}
            placeholder="e.g. 45,000"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-gold-400/60 focus:bg-white/8 transition-all font-semibold text-lg"
          />
        </div>
        {currentIncome > 0 && (
          <p className="text-white/40 text-xs">{formatGBP(currentIncome)} per year</p>
        )}
      </div>

      {/* ── Retirement income slider ─────────────────────────────────────── */}
      <div className={`space-y-4 transition-opacity duration-300 ${currentIncome > 0 ? 'opacity-100' : 'opacity-35 pointer-events-none'}`}>
        <div>
          <label className="text-white/80 text-sm font-semibold">Your desired retirement lifestyle</label>
          <p className="text-white/40 text-xs mt-0.5">Slide to select your target</p>
        </div>

        {/* Level labels above slider */}
        <div className="flex justify-between text-[10px] text-white/40 px-0.5">
          {INCOME_LEVELS.map((l, i) => (
            <span
              key={i}
              className={`text-center leading-tight ${i === sliderIndex ? 'text-gold-400 font-bold' : ''}`}
              style={{ width: '18%' }}
            >
              {l.label}
            </span>
          ))}
        </div>

        <input
          type="range"
          min={0} max={4} step={1}
          value={sliderIndex}
          onChange={e => handleSlider(Number(e.target.value))}
          style={{ accentColor: '#C9A84C', width: '100%', cursor: 'pointer' }}
        />

        {/* Selected level summary */}
        {currentIncome > 0 && (
          <div className="bg-gold-400/10 border border-gold-400/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gold-400 font-bold text-sm">{selectedLevel.label}</span>
              <span className="text-white font-extrabold text-xl tabular-nums">
                {formatGBP(targetIncome)}<span className="text-white/40 text-sm font-normal">/yr</span>
              </span>
            </div>
            <p className="text-white/45 text-xs">{selectedLevel.desc}</p>
            <p className="text-white/30 text-xs mt-0.5">
              {Math.round(selectedLevel.pct * 100)}% of your current income
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline-gold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canContinue}
          className="btn-gold flex-1 flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Calculate My Plan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
