'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { z } from 'zod'
import type { FunnelData } from '@/types'

const schema = z.object({
  firstName: z.string().min(2, 'Please enter your name'),
  email:     z.string().email('Please enter a valid email'),
  phone:     z.string().regex(/^(\+44|0)[0-9\s]{9,14}$/, 'Please enter a valid UK phone number'),
})

interface Props {
  data: Partial<FunnelData>
  onSubmit: (contact: Pick<FunnelData, 'firstName' | 'email' | 'phone'>) => void
  onBack: () => void
  loading: boolean
}

export default function Step5Contact({ onSubmit, onBack, loading }: Props) {
  const [form, setForm] = useState({ firstName: '', email: '', phone: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(err => ({ ...err, [e.target.name]: '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = schema.safeParse(form)
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors({
        firstName: flat.firstName?.[0] ?? '',
        email:     flat.email?.[0] ?? '',
        phone:     flat.phone?.[0] ?? '',
      })
      return
    }
    onSubmit(result.data)
  }

  const fields = [
    { name: 'firstName', label: 'First name',    type: 'text',  placeholder: 'e.g. James' },
    { name: 'email',     label: 'Email address', type: 'email', placeholder: 'you@example.com' },
    { name: 'phone',     label: 'Mobile number', type: 'tel',   placeholder: '+44 7700 900000' },
  ] as const

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Final Step — Your Details</p>
        <h2 className="text-2xl font-bold text-white">Where shall we send your Retirement Report?</h2>
        <p className="text-white/50 text-sm mt-1">Your results are ready — we just need to know who to send them to.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ name, label, type, placeholder }) => (
          <div key={name}>
            <label className="block text-sm text-white/70 mb-1.5 font-medium">{label}</label>
            <input
              name={name}
              type={type}
              placeholder={placeholder}
              value={form[name]}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold-400/60 focus:bg-white/8 transition-all"
            />
            {errors[name] && (
              <p className="text-red-400 text-xs mt-1">{errors[name]}</p>
            )}
          </div>
        ))}

        <div className="flex items-start gap-2 pt-1">
          <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
          <p className="text-white/40 text-xs leading-relaxed">
            Your data is encrypted and never sold. By continuing you agree to our Privacy Policy.
            A regulated adviser may contact you within 24 hours.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-outline-gold flex items-center gap-2" disabled={loading}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="btn-gold flex-1 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</>
            ) : (
              'See My Score →'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
