'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Check, ArrowLeft, Bell, Loader2 } from 'lucide-react'
import { generateTimeSlots } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  first_name: string
  availability: string[]
}

interface Props {
  lead: Lead
  advisorId: string
  existingAppointment: Record<string, unknown> | null
}

export default function ScheduleClient({ lead, advisorId, existingAppointment }: Props) {
  const router = useRouter()
  const [selected,  setSelected]  = useState<Date | null>(null)
  const [confirmed, setConfirmed] = useState(!!existingAppointment)
  const [loading,   setLoading]   = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const slots = generateTimeSlots(lead.availability)

  // Group slots by date
  const grouped: Record<string, Date[]> = {}
  slots.forEach(slot => {
    const key = slot.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(slot)
  })

  async function confirm() {
    if (!selected) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('appointments').upsert({
      lead_id:    lead.id,
      advisor_id: advisorId,
      slot_time:  selected.toISOString(),
      status:     'scheduled',
      email_sent: true,
    }, { onConflict: 'lead_id,advisor_id' })

    if (!error) {
      setConfirmed(true)
      // Mock email notification
      setNotification(`✉️ Confirmation email sent to ${lead.first_name} for ${selected.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`)
    }
    setLoading(false)
  }

  if (confirmed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Call Scheduled!</h2>
            <p className="text-white/50 text-sm mt-2">
              {existingAppointment
                ? `You have an existing appointment with ${lead.first_name}`
                : `Your call with ${lead.first_name} is confirmed`}
            </p>
          </div>
          {notification && (
            <div className="bg-gold-400/10 border border-gold-400/20 rounded-xl p-3 text-sm text-gold-400">
              {notification}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')} className="btn-gold flex-1">
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/dashboard')} className="text-white/40 hover:text-white/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl">Schedule a call with {lead.first_name}</h1>
            <p className="text-white/40 text-sm">
              Available: {lead.availability.join(', ')} · 30-minute slots
            </p>
          </div>
        </div>

        {/* Slot grid */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateSlots]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gold-400" />
                <h3 className="text-white/70 font-medium text-sm">{date}</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {dateSlots.map(slot => {
                  const isSelected = selected?.getTime() === slot.getTime()
                  return (
                    <button
                      key={slot.toISOString()}
                      onClick={() => setSelected(slot)}
                      className={cn(
                        'rounded-xl border py-2.5 text-sm font-medium transition-all',
                        isSelected
                          ? 'border-gold-400 bg-gold-400/15 text-gold-400 scale-[1.03]'
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'
                      )}
                    >
                      {slot.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Confirm */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 glass-card space-y-4"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gold-400" />
              <div>
                <p className="text-white font-medium text-sm">Confirm appointment</p>
                <p className="text-white/50 text-xs">
                  {selected.toLocaleString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long',
                    hour: '2-digit', minute: '2-digit'
                  })}
                  {' '}· A confirmation email will be sent automatically
                </p>
              </div>
            </div>
            <button
              onClick={confirm}
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                : <><Check className="w-4 h-4" /> Confirm & Send Email</>
              }
            </button>
          </motion.div>
        )}
      </div>
    </main>
  )
}
