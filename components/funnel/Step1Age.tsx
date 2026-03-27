'use client'

import { ArrowRight, Shield } from 'lucide-react'
import type { FunnelData } from '@/types'

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
}

export default function Step1Age({ data, update, onNext }: Props) {
  const currentAge = data.age && data.age > 0 ? data.age : 40
  const targetAge  = data.targetAge && data.targetAge > currentAge ? data.targetAge : Math.min(currentAge + 25, 65)
  const yearsLeft  = Math.max(targetAge - currentAge, 0)

  function handleCurrentAge(val: number) {
    const safeTarget = targetAge <= val ? val + 1 : targetAge
    update({ age: val, ageRange: String(val), targetAge: safeTarget })
  }

  function handleTargetAge(val: number) {
    update({ targetAge: val })
  }

  return (
    <div className="glass-card space-y-7">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 1 of 5</p>
        <h2 className="text-2xl font-bold text-white">Before we match you with an adviser</h2>
        <p className="text-white/55 text-sm mt-2 leading-relaxed">
          Let&apos;s understand your circumstances in detail — takes less than 1 minute and is completely free.
        </p>
      </div>

      {/* ── Current age slider ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white/80 text-sm font-semibold">How old are you?</label>
          <span className="text-gold-400 font-extrabold text-3xl tabular-nums">{currentAge}</span>
        </div>
        <input
          type="range"
          min={18} max={75} step={1}
          value={currentAge}
          onChange={e => handleCurrentAge(Number(e.target.value))}
          style={{ accentColor: '#C9A84C', width: '100%', cursor: 'pointer' }}
        />
        <div className="flex justify-between text-white/25 text-xs px-0.5">
          <span>18</span><span>75</span>
        </div>
      </div>

      {/* ── Retirement age slider ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white/80 text-sm font-semibold">When do you want to retire?</label>
          <span className="text-gold-400 font-extrabold text-3xl tabular-nums">{targetAge}</span>
        </div>
        <input
          type="range"
          min={currentAge + 1} max={100} step={1}
          value={targetAge}
          onChange={e => handleTargetAge(Number(e.target.value))}
          style={{ accentColor: '#C9A84C', width: '100%', cursor: 'pointer' }}
        />
        <div className="flex justify-between text-white/25 text-xs px-0.5">
          <span>{currentAge + 1}</span><span>100</span>
        </div>
      </div>

      {/* ── Summary pill ─────────────────────────────────────────────────── */}
      <div className="bg-gold-400/10 border border-gold-400/20 rounded-xl p-4 text-center">
        <span className="text-white/60 text-sm">You have </span>
        <span className="text-gold-400 font-bold text-xl">{yearsLeft} year{yearsLeft !== 1 ? 's' : ''}</span>
        <span className="text-white/60 text-sm"> to build your retirement pot</span>
        {yearsLeft >= 15 && (
          <p className="text-emerald-400/80 text-xs mt-1">That's plenty of time to make a real difference.</p>
        )}
        {yearsLeft > 0 && yearsLeft < 15 && (
          <p className="text-amber-400/80 text-xs mt-1">Every year counts — let's see where you stand.</p>
        )}
      </div>

      <button
        onClick={onNext}
        className="btn-gold w-full flex items-center justify-center gap-2 group"
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
