'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react'

type Mode = 'signin' | 'signup'

export default function AdvisorLoginPage() {
  const router = useRouter()
  const [mode, setMode]         = useState<Mode>('signin')
  const [form, setForm]         = useState({ email: '', password: '' })
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)
  const [signedUp, setSignedUp] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError(null)
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setSignedUp(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'signup') {
      const { error: authError } = await supabase.auth.signUp({
        email:    form.email.trim(),
        password: form.password,
      })
      if (authError) {
        setError(authError.message ?? 'Could not create account. Please try again.')
        setLoading(false)
        return
      }
      setSignedUp(true)
      setLoading(false)
      return
    }

    // Sign in
    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    form.email.trim(),
      password: form.password,
    })
    if (authError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }
    router.push('/advisor/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card max-w-sm w-full space-y-6"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center">
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
            <polyline points="4,28 12,16 20,22 28,10 32,14"
              stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {[4,12,20,28,32].map((x, i) => (
              <circle key={i} cx={x} cy={[28,16,22,10,14][i]} r="2.5" fill="#C9A84C"/>
            ))}
          </svg>
          <span className="font-extrabold text-white text-xl">
            Retire<span className="text-gold-400">Ready</span>
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Adviser Portal</h1>
          <p className="text-white/50 text-sm mt-1">
            {mode === 'signin' ? 'Sign in to access your lead dashboard' : 'Create your adviser account'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                mode === m
                  ? 'bg-gold-400/20 text-gold-400'
                  : 'bg-white/3 text-white/45 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {signedUp ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-4 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Check your email</p>
                <p className="text-white/50 text-sm mt-1">
                  We've sent a confirmation link to <span className="text-white/70">{form.email}</span>.
                  Click it to activate your account, then sign in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-gold-400 text-sm hover:text-gold-300 transition-colors mt-1"
              >
                Back to Sign In
              </button>
            </motion.div>
          ) : (
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-sm text-white/70 mb-1.5 font-medium">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold-400/60 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-white/70 mb-1.5 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold-400/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-2.5">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> {mode === 'signup' ? 'Creating account…' : 'Signing in…'}</>
                  : mode === 'signup' ? 'Create Account' : 'Sign In'
                }
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-white/25" />
          <p className="text-white/30 text-xs text-center">
            For authorised RetireReady advisers only. FCA registration required.
          </p>
        </div>
      </motion.div>
    </main>
  )
}
