'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function AdvisorLoginPage() {
  const router = useRouter()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)

  // Handle PKCE auth code exchange when Supabase redirects back with ?code=xxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code   = params.get('code')
    if (!code) return

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error: authError }) => {
      if (!authError) {
        router.replace('/advisor/dashboard')
      } else {
        setError('Email confirmation failed. Please try signing in again.')
      }
    })
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError(null)
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
          <p className="text-white/50 text-sm mt-1">Sign in to access your lead dashboard</p>
        </div>

        <motion.form
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
                    autoComplete="current-password"
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
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  : 'Sign In'
                }
              </button>
            </motion.form>

        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-white/25" />
          <p className="text-white/30 text-xs text-center">
            For authorised RetireReady advisers only. FCA registration required.
          </p>
        </div>

        <p className="text-center text-white/35 text-xs">
          Want to join?{' '}
          <Link href="/advisor/apply" className="text-amber-400 hover:text-amber-300 transition-colors">
            Apply for access →
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
