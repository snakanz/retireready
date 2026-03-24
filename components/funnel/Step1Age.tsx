'use client'

import { ArrowRight } from 'lucide-react'
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
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 1 — Your Age</p>
        <h2 className="text-2xl font-bold text-white">How old are you, and when do you want to retire?</h2>
      </div>

      {/* Current age */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <label className="text-white/70">Current age</label>
          <span className="text-gold-400 font-bold text-lg">{age}</span>
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
        <div className="flex justify-between text-sm">
          <label className="text-white/70">Target retirement age</label>
          <span className="text-gold-400 font-bold text-lg">{targetAge}</span>
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
      <div className="bg-navy-500/40 border border-white/10 rounded-xl p-4 text-center">
        <span className="text-white/60 text-sm">You have </span>
        <span className="text-gold-400 font-bold text-lg">{yearsLeft} years</span>
        <span className="text-white/60 text-sm"> to grow your retirement pot</span>
      </div>

      <button onClick={onNext} className="btn-gold w-full flex items-center justify-center gap-2 group">
        Continue
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}
