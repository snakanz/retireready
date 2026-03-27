import { Metadata } from 'next'
import Link from 'next/link'
import AdvisorApplyForm from '@/components/advisor/AdvisorApplyForm'

export const metadata: Metadata = { title: 'Join RetireReady — Adviser Application' }

export default function AdvisorApplyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="glass-card max-w-md w-full space-y-6">
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
            Retire<span className="text-amber-400">Ready</span>
          </span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Join RetireReady</h1>
          <p className="text-white/50 text-sm mt-1 leading-relaxed">
            Apply to access high-intent retirement leads. We review every application and verify your FCA credentials before granting access.
          </p>
        </div>

        <AdvisorApplyForm />

        <p className="text-center text-white/35 text-xs">
          Already have an account?{' '}
          <Link href="/advisor/login" className="text-amber-400 hover:text-amber-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
