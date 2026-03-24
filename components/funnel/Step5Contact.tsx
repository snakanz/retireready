'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, ShieldCheck, Star } from 'lucide-react'
import { z } from 'zod'
import type { FunnelData } from '@/types'

const schema = z.object({
  firstName: z.string().min(2, 'Please enter your first name'),
  email:     z.string().email('Please enter a valid email address'),
  phone:     z.string().regex(/^(\+44|0)[0-9\s]{9,14}$/, 'Please enter a valid UK mobile number'),
})

interface Props {
  data: Partial<FunnelData>
  update: (patch: Partial<FunnelData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step5Contact({ data, update, onNext, onBack }: Props) {
  const [form, setForm] = useState({
    firstName: data.firstName ?? '',
    email:     data.email ?? '',
    phone:     data.phone ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(err => ({ ...err, [e.target.name]: '' }))
  }

  function handleContinue(e: React.FormEvent) {
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
    update(result.data)
    onNext()
  }

  const fields = [
    { name: 'firstName', label: 'First name',     type: 'text',  placeholder: 'e.g. James' },
    { name: 'email',     label: 'Email address',  type: 'email', placeholder: 'you@example.com' },
    { name: 'phone',     label: 'Mobile number',  type: 'tel',   placeholder: '+44 7700 900000' },
  ] as const

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 5 of 6</p>
        <h2 className="text-2xl font-bold text-white">Almost there — where should we send your report?</h2>
        <p className="text-white/50 text-sm mt-2">
          Your personalised retirement plan will be emailed to you, and an FCA-regulated adviser will
          be in touch to walk you through it.
        </p>
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
        <div className="flex -space-x-1.5">
          {['bg-blue-400','bg-emerald-400','bg-amber-400','bg-purple-400'].map((c,i) => (
            <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-navy-900 flex items-center justify-center text-white text-xs font-bold`}>
              {['J','S','M','R'][i]}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_,i) => <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />)}
        </div>
        <p className="text-white/50 text-xs">Joined by 4,200+ UK savers this year</p>
      </div>

      <form onSubmit={handleContinue} className="space-y-4">
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
            Your data is encrypted and never sold. By continuing you agree to our Privacy Policy and
            consent for an FCA-authorised adviser to contact you. No spam — unsubscribe any time.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-outline-gold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="btn-gold flex-1 flex items-center justify-center gap-2 group">
            Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  )
}
