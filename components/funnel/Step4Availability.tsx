'use client'

import { ArrowLeft, Check, Loader2, Phone, Calendar, Sun, Sunset, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FunnelData } from '@/types'

type DayOfWeek   = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
type TimeSlot    = 'Morning' | 'Afternoon' | 'Evening'

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const TIME_OPTIONS: { value: TimeSlot; label: string; sub: string; icon: React.ElementType }[] = [
  { value: 'Morning',   label: 'Morning',   sub: '9am – 12pm', icon: Sun    },
  { value: 'Afternoon', label: 'Afternoon', sub: '12pm – 5pm', icon: Sunset },
  { value: 'Evening',   label: 'Evening',   sub: '5pm – 7pm',  icon: Moon   },
]

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

export default function Step5Availability({ data, update, onSubmit, onBack, loading }: Props) {
  const availability = (data.availability ?? []) as string[]
  const selectedDays = availability.filter(a => DAYS.includes(a as DayOfWeek)) as DayOfWeek[]
  const selectedTime = availability.find(a =>
    (['Morning', 'Afternoon', 'Evening'] as string[]).includes(a)
  ) as TimeSlot | undefined

  function toggleDay(day: DayOfWeek) {
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day]
    update({ availability: selectedTime ? [...nextDays, selectedTime] : nextDays })
  }

  function selectTime(t: TimeSlot) {
    update({ availability: [...selectedDays, t] })
  }

  const canSubmit = selectedDays.length > 0 && !!selectedTime

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">
          Final Step — Step 5 of 5
        </p>
        <h2 className="text-2xl font-bold text-white">When's a good time to speak?</h2>
        <p className="text-white/50 text-sm mt-2">
          Your adviser will use this to schedule a free 30-minute call.
          Select your preferred days and time — we'll confirm a slot that works.
        </p>
      </div>

      {/* What to expect */}
      <div className="flex items-start gap-3 bg-gold-400/8 border border-gold-400/20 rounded-xl px-4 py-3">
        <Phone className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-white/80 text-sm font-semibold">Free 30-minute retirement review</p>
          <p className="text-white/40 text-xs mt-0.5">
            No obligation. Your FCA-regulated adviser walks you through your results
            and helps you understand exactly what to do next.
          </p>
        </div>
      </div>

      {/* Day picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-400" />
            <span className="text-white/80 text-sm font-semibold">Which days suit you?</span>
          </div>
          <span className="text-white/35 text-xs">Select all that apply</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {DAYS.map(day => {
            const isSelected = selectedDays.includes(day)
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-200',
                  isSelected
                    ? 'border-gold-400 bg-gold-400/15 text-gold-400'
                    : 'border-white/10 bg-white/5 text-white/65 hover:border-white/25 hover:bg-white/8'
                )}
              >
                <span>{day}</span>
                <div className={cn(
                  'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                  isSelected ? 'border-gold-400 bg-gold-400' : 'border-white/25'
                )}>
                  {isSelected && <Check className="w-3 h-3 text-navy-900 stroke-[3]" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time preference */}
      <div className="space-y-3">
        <span className="text-white/80 text-sm font-semibold">What time of day suits you best?</span>
        <div className="grid grid-cols-3 gap-3">
          {TIME_OPTIONS.map(({ value, label, sub, icon: Icon }) => {
            const isSelected = selectedTime === value
            return (
              <button
                key={value}
                onClick={() => selectTime(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border px-2 py-3.5 text-sm transition-all duration-200',
                  isSelected
                    ? 'border-gold-400 bg-gold-400/15 text-gold-400'
                    : 'border-white/10 bg-white/5 text-white/55 hover:border-white/25 hover:bg-white/8'
                )}
              >
                <Icon className={cn('w-5 h-5', isSelected ? 'text-gold-400' : 'text-white/30')} />
                <span className="font-semibold text-xs">{label}</span>
                <span className={cn('text-xs', isSelected ? 'text-gold-400/70' : 'text-white/25')}>{sub}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Validation hint */}
      {!canSubmit && (
        <p className="text-white/40 text-xs text-center">
          {selectedDays.length === 0
            ? 'Please select at least one day to continue'
            : 'Please select a preferred time to continue'}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="btn-outline-gold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving your plan…</>
            : 'See My Retirement Results →'
          }
        </button>
      </div>
    </div>
  )
}
