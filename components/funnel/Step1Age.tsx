'use client'

import { ArrowRight, Shield } from 'lucide-react'
import type { FunnelData } from '@/types'

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
}

export default function Step1Age({ data, update, onNext }: Props) {
  const age = data.age ?? 45
  const targetAge = data.targetAge ?? 65
  const yearsLeft = Math.max(targetAge - age, 0)

  return (
    <div className="glass-card space-y-8">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 1 of 6</p>
        <h2 className="text-2xl font-bold text-white">When are you planning to retire?</h2>
        <p className="text-white/50 text-sm mt-2">
          Tell us your timeline and we'll calculate exactly where you stand — takes 2 minutes.
        </p>
      </div>

      {/* Current age */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <label className="text-white/70 text-sm font-medium">Your current age</label>
          <span className="text-gold-400 font-bold text-2xl tabular-nums">{age}</span>
        </div>
        <input
          type="range" min={18} max={74} step={1} value={age}
          onChange={e => update({ age: +e.target.value })}
          className="w-full h-2 rounded-full appearance-none bg-white/10 accent-yellow-400 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>18</span><span>74</span>
        </div>
      </div>

      {/* Target retirement age */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <label className="text-white/70 text-sm font-medium">Target retirement age</label>
          <span className="text-gold-400 font-bold text-2xl tabular-nums">{targetAge}</span>
        </div>
        <input
          type="range" min={Math.max(age + 1, 50)} max={80} step={1} value={targetAge}
          onChange={e => update({ targetAge: +e.target.value })}
          className="w-full h-2 rounded-full appearance-none bg-white/10 accent-yellow-400 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-white/30">
          <span>{Math.max(age + 1, 50)}</span><span>80</span>
        </div>
      </div>

      {/* Summary pill */}
      <div className="bg-gold-400/10 border border-gold-400/20 rounded-xl p-4 text-center">
        <span className="text-white/60 text-sm">You have </span>
        <span className="text-gold-400 font-bold text-lg">{yearsLeft} year{yearsLeft !== 1 ? 's' : ''}</span>
        <span className="text-white/60 text-sm"> to build your retirement pot</span>
        {yearsLeft >= 15 && (
          <p className="text-emerald-400/80 text-xs mt-1.5">Great — that's plenty of time to make a real difference.</p>
        )}
        {yearsLeft > 0 && yearsLeft < 15 && (
          <p className="text-amber-400/80 text-xs mt-1.5">Every year counts — let's see where you stand.</p>
        )}
      </div>

      <button onClick={onNext} className="btn-gold w-full flex items-center justify-center gap-2 group">
        Continue
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Trust footer */}
      <div className="flex items-center justify-center gap-1.5 -mt-2">
        <Shield className="w-3.5 h-3.5 text-white/30" />
        <p className="text-white/30 text-xs text-center">No account needed · 100% free · FCA-regulated advisers</p>
      </div>
    </div>
  )
}
