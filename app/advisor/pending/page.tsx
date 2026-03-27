export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdvisorPendingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/advisor/login')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('advisor_profiles')
    .select('status, full_name')
    .eq('id', user.id)
    .single()

  // If approved, send to dashboard
  if (profile?.status === 'approved') redirect('/advisor/dashboard')

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card max-w-sm w-full space-y-6 text-center">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center">
          <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
            <polyline points="4,28 12,16 20,22 28,10 32,14"
              stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {[4,12,20,28,32].map((x, i) => (
              <circle key={i} cx={x} cy={[28,16,22,10,14][i]} r="2.5" fill="#C9A84C"/>
            ))}
          </svg>
          <span className="font-extrabold text-white text-lg">
            Retire<span className="text-amber-400">Ready</span>
          </span>
        </div>

        <div className="space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">
            Application under review
          </h1>
          <p className="text-white/55 text-sm leading-relaxed">
            Hi{profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''} — we&apos;re verifying your FCA credentials and reviewing your application. You&apos;ll receive an email once your account is approved, typically within 1 business day.
          </p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 space-y-2 text-left">
          {[
            { step: '1', label: 'Application received',    done: true  },
            { step: '2', label: 'FCA credentials verified', done: false },
            { step: '3', label: 'Account approved',         done: false },
            { step: '4', label: '£300 credit added',        done: false },
          ].map(({ step, label, done }) => (
            <div key={step} className="flex items-center gap-3 text-sm">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                done ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-white/5 text-white/30 border border-white/10'
              }`}>
                {done ? '✓' : step}
              </div>
              <span className={done ? 'text-emerald-400' : 'text-white/40'}>{label}</span>
            </div>
          ))}
        </div>

        <form action="/api/auth/signout" method="post">
          <Link href="/advisor/login"
            className="block text-white/35 text-xs hover:text-white/55 transition-colors">
            Sign out and return to login
          </Link>
        </form>
      </div>
    </main>
  )
}
