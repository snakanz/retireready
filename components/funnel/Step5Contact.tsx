'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, ShieldCheck, Star } from 'lucide-react'
import { z } from 'zod'
import type { FunnelData } from '@/types'

const schema = z.object({
  firstName: z.string().min(2, 'Please enter your first name'),
  email:     z.string().email('Please enter a valid email address'),
  phone:     z.string().regex(/^(\+44|0)[0-9\s]{9,14}$/, 'Please enter a valid UK mobile number'),
  consent:   z.boolean().refine(v => v === true, 'You must consent to continue'),
})

interface Props {
  data: Partial<FunnelData>
  onSubmit: (contact: Pick<FunnelData, 'firstName' | 'email' | 'phone'>) => void
  onBack: () => void
}

export default function Step4Contact({ data, onSubmit, onBack }: Props) {
  const [form, setForm] = useState({
    firstName: data.firstName ?? '',
    email:     data.email ?? '',
    phone:     data.phone ?? '',
    consent:   false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [e.target.name]: value }))
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
        consent:   flat.consent?.[0] ?? '',
      })
      return
    }
    onSubmit({ firstName: result.data.firstName, email: result.data.email, phone: result.data.phone })
  }

  const textFields = [
    { name: 'firstName', label: 'First name',    type: 'text',  placeholder: 'e.g. James' },
    { name: 'email',     label: 'Email address', type: 'email', placeholder: 'you@example.com' },
    { name: 'phone',     label: 'Mobile number', type: 'tel',   placeholder: '+44 7700 900000' },
  ] as const

  return (
    <div className="glass-card space-y-6">
      <div>
        <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Step 4 of 4 — Final Step</p>
        <h2 className="text-2xl font-bold text-white">Where should we send your retirement report?</h2>
        <p className="text-white/50 text-sm mt-2">
          Your personalised results are ready. An FCA-regulated adviser will review your profile and
          be in touch to walk you through your plan.
        </p>
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-2.5 bg-white/3 border border-white/8 rounded-xl px-4 py-3">
        <div className="flex -space-x-1.5 shrink-0">
          {['bg-blue-400','bg-emerald-400','bg-amber-400','bg-purple-400'].map((c, i) => (
            <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-navy-900 flex items-center justify-center text-white text-xs font-bold`}>
              {['J','S','M','R'][i]}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {[...Array(5)].map((_,i) => <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />)}
        </div>
        <p className="text-white/50 text-xs">Joined by 4,200+ UK savers this year</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {textFields.map(({ name, label, type, placeholder }) => (
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
            {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
          </div>
        ))}

        {/* Consent checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative shrink-0 mt-0.5">
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                form.consent
                  ? 'border-gold-400 bg-gold-400'
                  : 'border-white/30 bg-white/5 group-hover:border-white/50'
              }`}>
                {form.consent && (
                  <svg className="w-3 h-3 text-navy-900" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-white/60 text-xs leading-relaxed">
              I consent to being contacted by a qualified adviser to discuss my retirement plan.
              I understand this is a free, no-obligation consultation.
            </span>
          </label>
          {errors.consent && <p className="text-red-400 text-xs mt-1 ml-8">{errors.consent}</p>}
        </div>

        <div className="flex items-start gap-2 pt-1">
          <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
          <p className="text-white/35 text-xs leading-relaxed">
            Your data is encrypted and never sold to third parties. FCA-regulated advisers only.
            Unsubscribe any time via our Privacy Policy.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-outline-gold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button type="submit" className="btn-gold flex-1 flex items-center justify-center gap-2 group">
            See My Retirement Plan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  )
}
