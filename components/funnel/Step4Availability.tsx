'use client'

import { ArrowLeft, Check, Loader2, Phone, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DayOfWeek, FunnelData } from '@/types'

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

export default function Step6Availability({ data, update, onSubmit, onBack, loading }: Props) {
  const selected: DayOfWeek[] = (data.availability as DayOfWeek[]) ?? []

  function toggle(day: DayOfWeek) {
    const next = selected.includes(day)
      ? selected.filter(d => d !== day)
      : [...selected, day]
    update({ availability: next })
  }

  function handleSkip() {
    update({ availability: [] })
    onSubmit()
  }

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Final Step — Step 6 of 6</p>
        <h2 className="text-2xl font-bold text-white">When's a good time to speak?</h2>
        <p className="text-white/50 text-sm mt-2">
          Pick the days that suit you best — your adviser will confirm a time that works for a free
          30-minute call.
        </p>
      </div>

      {/* What to expect */}
      <div className="flex items-start gap-3 bg-gold-400/8 border border-gold-400/20 rounded-xl px-4 py-3">
        <Phone className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-white/80 text-sm font-semibold">Free 30-minute retirement review</p>
          <p className="text-white/40 text-xs mt-0.5">
            No obligation. Your FCA-regulated adviser will walk you through your results and answer any questions.
          </p>
        </div>
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
              <div className="flex items-center gap-3">
                <Calendar className={cn('w-4 h-4', isSelected ? 'text-gold-400' : 'text-white/30')} />
                <span>{day}</span>
              </div>
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
        <button onClick={onBack} disabled={loading} className="btn-outline-gold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={selected.length === 0 || loading}
          className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving your plan…</>
          ) : (
            'Book My Free Call →'
          )}
        </button>
      </div>

      {/* Skip option */}
      <button
        onClick={handleSkip}
        disabled={loading}
        className="w-full text-white/30 text-xs hover:text-white/50 transition-colors text-center py-1 disabled:opacity-40"
      >
        Skip for now — I'll arrange a call later
      </button>
    </div>
  )
}
