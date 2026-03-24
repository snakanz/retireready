'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2, Phone, Calendar, Sun, Sunset, Moon, CheckCircle2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { FunnelData } from '@/types'

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
type TimeSlot = 'Morning' | 'Afternoon' | 'Evening'

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

const TIME_OPTIONS: { value: TimeSlot; label: string; sub: string; icon: React.ElementType }[] = [
  { value: 'Morning',   label: 'Morning',   sub: '9am – 12pm',  icon: Sun    },
  { value: 'Afternoon', label: 'Afternoon', sub: '12pm – 5pm',  icon: Sunset },
  { value: 'Evening',   label: 'Evening',   sub: '5pm – 7pm',   icon: Moon   },
]

export default function AvailabilityPage() {
  const router = useRouter()
  const [funnel, setFunnel] = useState<Partial<FunnelData> | null>(null)
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([])
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('rr_funnel')
    if (!raw) {
      router.replace('/funnel')
      return
    }
    setFunnel(JSON.parse(raw))
  }, [router])

  function toggleDay(day: DayOfWeek) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit() {
    if (!funnel || selectedDays.length === 0 || !timeSlot) return
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // availability stored as array of days + time preference
    const availability = [...selectedDays, timeSlot]

    const { error: dbError } = await supabase.from('leads').insert({
      first_name:    funnel.firstName,
      email:         funnel.email,
      phone:         funnel.phone,
      age:           funnel.age,
      target_age:    funnel.targetAge,
      asset_range:   funnel.assetRange,
      target_income: funnel.targetIncome,
      availability,
    })

    if (dbError) {
      console.error(dbError)
      setError('Something went wrong — please try again.')
      setLoading(false)
      return
    }

    // Update sessionStorage so result page can still read it
    sessionStorage.setItem('rr_funnel', JSON.stringify({ ...funnel, availability }))
    setSubmitted(true)
    setLoading(false)
  }

  const canSubmit = selectedDays.length > 0 && timeSlot !== null

  if (!funnel) return null   // redirect in progress

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Logo />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg glass-card text-center space-y-5 mt-10"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">You're all set, {funnel.firstName}!</h1>
            <p className="text-white/55 text-sm mt-2 leading-relaxed">
              An FCA-regulated adviser will call you on one of your preferred days —
              <span className="text-gold-400 font-medium"> {selectedDays.join(', ')}</span> —
              in the <span className="text-gold-400 font-medium">{timeSlot?.toLowerCase()}</span>.
            </p>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3 text-left">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">What to expect</p>
            {[
              { step: '1', text: 'A 30-minute free, no-obligation call' },
              { step: '2', text: 'Your adviser reviews your retirement numbers' },
              { step: '3', text: 'You get a clear plan — what to do next and why' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center shrink-0">
                  <span className="text-gold-400 text-xs font-bold">{step}</span>
                </div>
                <span className="text-white/65 text-sm">{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/result')}
            className="btn-outline-gold w-full flex items-center justify-center gap-2 text-sm"
          >
            Back to my results
          </button>
        </motion.div>
      </main>
    )
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      <Logo />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg space-y-5 mt-8"
      >
        {/* Header */}
        <div className="glass-card space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <Phone className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Book your free adviser call
              </h1>
              <p className="text-white/50 text-sm mt-1 leading-relaxed">
                Pick the days and time that work best for you. Your adviser will confirm a 30-minute slot
                and walk you through exactly what can be done to improve your retirement outlook.
              </p>
            </div>
          </div>
        </div>

        {/* Day picker */}
        <div className="glass-card space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-400" />
            <h2 className="text-white font-semibold text-sm">Which days work for you?</h2>
            <span className="text-white/35 text-xs ml-auto">Select all that apply</span>
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
        <div className="glass-card space-y-4">
          <h2 className="text-white font-semibold text-sm">What time of day suits you best?</h2>

          <div className="grid grid-cols-3 gap-3">
            {TIME_OPTIONS.map(({ value, label, sub, icon: Icon }) => {
              const isSelected = timeSlot === value
              return (
                <button
                  key={value}
                  onClick={() => setTimeSlot(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm transition-all duration-200',
                    isSelected
                      ? 'border-gold-400 bg-gold-400/15 text-gold-400'
                      : 'border-white/10 bg-white/5 text-white/55 hover:border-white/25 hover:bg-white/8'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isSelected ? 'text-gold-400' : 'text-white/35')} />
                  <span className="font-semibold">{label}</span>
                  <span className={cn('text-xs', isSelected ? 'text-gold-400/70' : 'text-white/30')}>{sub}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Submit */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="btn-gold w-full flex items-center justify-center gap-2 py-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Booking your call…</>
            ) : (
              <><Phone className="w-4 h-4" /> Confirm My Booking</>
            )}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-1.5 text-white/30 text-xs hover:text-white/50 transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to my results
          </button>
        </div>

        <p className="text-white/25 text-xs text-center pb-4">
          Free · No obligation · FCA-regulated advisers only
        </p>
      </motion.div>
    </main>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
        <polyline points="4,28 12,16 20,22 28,10 32,14"
          stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {([4,12,20,28,32] as number[]).map((x, i) => (
          <circle key={i} cx={x} cy={([28,16,22,10,14] as number[])[i]} r="2.5" fill="#C9A84C"/>
        ))}
      </svg>
      <span className="font-extrabold text-white text-lg">
        Retire<span className="text-gold-400">Ready</span>
      </span>
    </div>
  )
}
