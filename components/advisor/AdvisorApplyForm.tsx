'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, ShieldCheck, Mail, Lock, Eye, EyeOff, User, Phone, Building2, BadgeCheck, Briefcase } from 'lucide-react'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const SPECIALTIES = [
  'Retirement Planning',
  'Pension Transfers & Drawdown',
  'Investment & Wealth Management',
  'Inheritance Tax & Estate Planning',
  'Long-term Care Planning',
  'Protection & Life Insurance',
  'General Financial Planning',
]

const schema = z.object({
  fullName:   z.string().min(2, 'Enter your full name'),
  email:      z.string().email('Enter a valid email address'),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
  phone:      z.string().regex(/^(\+44|0)[0-9\s]{9,14}$/, 'Enter a valid UK phone number'),
  firmName:   z.string().min(2, 'Enter your firm name'),
  fcaNumber:  z.string().regex(/^\d{6,7}$/, 'FCA number is 6 or 7 digits'),
  specialty:  z.string().min(1, 'Select your primary speciality'),
})

export default function AdvisorApplyForm() {
  const router = useRouter()

  // Capture referral code from URL (?ref=XXXXXXXX)
  const referralCode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('ref') ?? ''
    : ''

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    firmName: '', fcaNumber: '', specialty: '',
  })
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(err => ({ ...err, [e.target.name]: '' }))
    setGlobalError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = schema.safeParse(form)
    if (!result.success) {
      const flat: Record<string, string> = {}
      Object.entries(result.error.flatten().fieldErrors).forEach(([k, v]) => {
        if (v?.[0]) flat[k] = v[0]
      })
      setErrors(flat)
      return
    }

    setLoading(true)
    setGlobalError(null)

    // 1. Create Supabase auth user
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email:    form.email.trim(),
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/advisor/login`,
      },
    })

    if (authError || !authData.user) {
      setGlobalError(authError?.message ?? 'Could not create account. Email may already be registered.')
      setLoading(false)
      return
    }

    // 2. Create advisor_profiles row via API route
    const res = await fetch('/api/advisor/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId:       authData.user.id,
        fullName:     form.fullName.trim(),
        email:        form.email.trim().toLowerCase(),
        phone:        form.phone.trim(),
        firmName:     form.firmName.trim(),
        fcaNumber:    form.fcaNumber.trim(),
        specialty:    form.specialty,
        referralCode: referralCode || null,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      setGlobalError('Application submitted but profile setup failed. Please contact support.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-5 py-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Application submitted!</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            We&apos;re reviewing your application and FCA credentials. You&apos;ll hear from us within 1 business day.
          </p>
          <p className="text-white/40 text-xs mt-2">
            Check your inbox — we&apos;ve sent a confirmation email to <span className="text-white/60">{form.email}</span>. Please confirm it while we review your account.
          </p>
        </div>
        <button
          onClick={() => router.push('/advisor/login')}
          className="btn-gold mt-2"
        >
          Go to Sign In
        </button>
      </motion.div>
    )
  }

  const fields = [
    { name: 'fullName',  label: 'Full name',             icon: User,        type: 'text',     placeholder: 'Jane Smith' },
    { name: 'email',     label: 'Work email address',    icon: Mail,        type: 'email',    placeholder: 'jane@yourfirm.co.uk' },
    { name: 'phone',     label: 'Phone number',          icon: Phone,       type: 'tel',      placeholder: '+44 7700 900000' },
    { name: 'firmName',  label: 'Firm / company name',   icon: Building2,   type: 'text',     placeholder: 'Smith Financial Ltd' },
    { name: 'fcaNumber', label: 'FCA registration number', icon: BadgeCheck, type: 'text',    placeholder: '123456' },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(({ name, label, icon: Icon, type, placeholder }) => (
        <div key={name}>
          <label className="block text-sm text-white/70 mb-1.5 font-medium">{label}</label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              name={name}
              type={type}
              placeholder={placeholder}
              value={form[name]}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold-400/60 focus:bg-white/8 transition-all text-sm"
            />
          </div>
          {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
        </div>
      ))}

      {/* Password */}
      <div>
        <label className="block text-sm text-white/70 mb-1.5 font-medium">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            name="password"
            type={showPw ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/25 focus:outline-none focus:border-gold-400/60 transition-all text-sm"
          />
          <button type="button" onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Specialty dropdown */}
      <div>
        <label className="block text-sm text-white/70 mb-1.5 font-medium">Primary speciality</label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <select
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white/80 focus:outline-none focus:border-gold-400/60 transition-all text-sm appearance-none"
          >
            <option value="" className="bg-[#0B1F3A]">Select your speciality…</option>
            {SPECIALTIES.map(s => (
              <option key={s} value={s} className="bg-[#0B1F3A]">{s}</option>
            ))}
          </select>
        </div>
        {errors.specialty && <p className="text-red-400 text-xs mt-1">{errors.specialty}</p>}
      </div>

      {globalError && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-2.5">
          <p className="text-red-400 text-sm">{globalError}</p>
        </div>
      )}

      {/* Referral banner */}
      {referralCode && (
        <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="text-xl">🤝</div>
          <div>
            <p className="text-emerald-400 font-semibold text-sm">You were referred!</p>
            <p className="text-white/45 text-xs">Your colleague gets £300 credit when you deposit £100+.</p>
          </div>
        </div>
      )}

      {/* £300 credit callout */}
      <div className="bg-gold-400/8 border border-gold-400/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="text-xl">🎁</div>
        <div>
          <p className="text-gold-400 font-semibold text-sm">£300 free credit on approval</p>
          <p className="text-white/45 text-xs">Enough to unlock your first 3–6 leads at no cost.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting application…</> : 'Submit Application'}
      </button>

      <div className="flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-white/25" />
        <p className="text-white/30 text-xs text-center">
          All applications are manually reviewed. FCA registration is verified before approval.
        </p>
      </div>
    </form>
  )
}
