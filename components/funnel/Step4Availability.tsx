'use client'

import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DayOfWeek, FunnelData } from '@/types'

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step4Availability({ data, update, onNext, onBack }: Props) {
  const selected: DayOfWeek[] = (data.availability as DayOfWeek[]) ?? []

  function toggle(day: DayOfWeek) {
    const next = selected.includes(day)
      ? selected.filter(d => d !== day)
      : [...selected, day]
    update({ availability: next })
  }

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 4 — Availability</p>
        <h2 className="text-2xl font-bold text-white">When are you available for a call?</h2>
        <p className="text-white/50 text-sm mt-1">Select all days that work for you. We'll arrange a 30-min call.</p>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-1 gap-3">
        {DAYS.map(day => {
          const isSelected = selected.includes(day)
          return (
            <button
              key={day}
              onClick={() => toggle(day)}
              className={cn(
                'flex items-center justify-between rounded-xl border px-5 py-4 text-sm font-semibold transition-all duration-200',
                isSelected
                  ? 'border-gold-400 bg-gold-400/15 text-gold-400'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'
              )}
            >
              <span>{day}</span>
              <div className={cn(
                'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                isSelected ? 'border-gold-400 bg-gold-400' : 'border-white/30'
              )}>
                {isSelected && <Check className="w-3 h-3 text-navy-900 stroke-[3]" />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-outline-gold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={selected.length === 0}
          className="btn-gold flex-1 flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
