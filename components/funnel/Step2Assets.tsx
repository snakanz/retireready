'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { FunnelData } from '@/types'

const MAX_VALUE = 2_500_000   // £2.5m — anything >= £2m shows as £2m+
const STEP      = 10_000
const DEFAULT   = 150_000

function formatDisplay(value: number): string {
  if (value >= 2_000_000) return '£2m+'
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    return `£${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}m`
  }
  if (value >= 1_000) return `£${Math.round(value / 1_000)}k`
  return value === 0 ? '£0' : `£${value}`
}

export function assetBracket(value: number): FunnelData['assetRange'] {
  if (value < 50_000)    return 'Under £50k'
  if (value < 150_000)   return '£50k–£150k'
  if (value < 250_000)   return '£150k–£250k'
  if (value < 500_000)   return '£250k–£500k'
  if (value < 750_000)   return '£500k–£750k'
  if (value < 1_000_000) return '£750k–£1m'
  if (value < 2_000_000) return '£1m–£2m'
  return '£2m+'
}

const TICKS: { value: number; label: string }[] = [
  { value: 0,           label: '£0'    },
  { value: 250_000,     label: '£250k' },
  { value: 500_000,     label: '£500k' },
  { value: 1_000_000,   label: '£1m'   },
  { value: 2_000_000,   label: '£2m+'  },
]

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Assets({ data, update, onNext, onBack }: Props) {
  const value = data.currentAssets ?? DEFAULT
  const pct   = Math.min(100, (value / MAX_VALUE) * 100)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const snapped = Math.round(parseInt(e.target.value) / STEP) * STEP
    update({ currentAssets: snapped, assetRange: assetBracket(snapped) })
  }

  function jumpTo(v: number) {
    update({ currentAssets: v, assetRange: assetBracket(v) })
  }

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 2 of 5</p>
        <h2 className="text-2xl font-bold text-white">How much have you saved so far?</h2>
        <p className="text-white/50 text-sm mt-2">
          Include pensions, ISAs, savings accounts — everything counts towards your future.
        </p>
      </div>

      {/* Large value display */}
      <div className="text-center py-2">
        <div className="text-5xl font-extrabold text-white tabular-nums tracking-tight transition-all duration-150">
          {formatDisplay(value)}
        </div>
        <div className="text-white/40 text-sm mt-2 font-medium">
          {assetBracket(value)}
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-4 px-1">
        <style>{`
          .rr-asset-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 9999px; outline: none; cursor: pointer; transition: opacity 0.2s; }
          .rr-asset-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; border-radius: 50%; background: #C9A84C; border: 3px solid #fff; box-shadow: 0 2px 10px rgba(201,168,76,0.5); cursor: pointer; transition: transform 0.1s; }
          .rr-asset-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
          .rr-asset-slider::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: #C9A84C; border: 3px solid #fff; box-shadow: 0 2px 10px rgba(201,168,76,0.5); cursor: pointer; border: none; }
          .rr-asset-slider:focus { outline: none; }
        `}</style>
        <input
          type="range"
          min={0}
          max={MAX_VALUE}
          step={STEP}
          value={value}
          onChange={handleChange}
          className="rr-asset-slider"
          style={{
            background: `linear-gradient(to right, #C9A84C ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
          }}
        />

        {/* Tick labels — tap to jump */}
        <div className="flex justify-between">
          {TICKS.map(({ value: tv, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => jumpTo(tv)}
              className={`text-[11px] font-medium transition-colors ${
                value === tv ? 'text-gold-400' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3">
        <p className="text-white/40 text-xs leading-relaxed">
          Drag the slider to your total savings — pensions, ISAs, property equity, investments. Rounded to the nearest £10,000 is fine.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-outline-gold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          className="btn-gold flex-1 flex items-center justify-center gap-2 group"
        >
          Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
