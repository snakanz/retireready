'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, TrendingUp, Clock, Star } from 'lucide-react'

const trustPoints = [
  { icon: ShieldCheck, text: 'FCA-regulated advisers only' },
  { icon: TrendingUp, text: 'Personalised projection in 2 mins' },
  { icon: Clock,      text: 'No obligation, free to complete' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <div className="flex items-center gap-3 justify-center mb-2">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <polyline points="4,28 12,16 20,22 28,10 32,14"
              stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="4"  cy="28" r="2.5" fill="#C9A84C"/>
            <circle cx="12" cy="16" r="2.5" fill="#C9A84C"/>
            <circle cx="20" cy="22" r="2.5" fill="#C9A84C"/>
            <circle cx="28" cy="10" r="2.5" fill="#C9A84C"/>
            <circle cx="32" cy="14" r="2.5" fill="#C9A84C"/>
          </svg>
          <span className="text-4xl font-extrabold text-white tracking-tight">
            Retire<span className="text-gold-400">Ready</span>
          </span>
        </div>
        <p className="text-white/50 text-sm tracking-widest uppercase">UK Retirement Planning</p>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass-card max-w-2xl w-full text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 rounded-full px-4 py-1.5 mb-6">
          <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
          <span className="text-gold-400 text-xs font-semibold tracking-wide uppercase">
            Trusted by 4,200+ UK Savers
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
          Are you on track to
          <br />
          <span className="text-gold-400">retire comfortably?</span>
        </h1>

        <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
          Get your personalised Retirement Readiness Score in under 2 minutes and discover
          exactly how much you need — then connect with a regulated UK adviser.
        </p>

        <Link href="/funnel">
          <button className="btn-gold text-lg px-8 py-4 inline-flex items-center gap-2 group">
            Get My Free Score
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>

        <p className="text-white/30 text-xs mt-4">
          No credit card · No jargon · FCA-regulated advisers
        </p>
      </motion.div>

      {/* Trust Points */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-6"
      >
        {trustPoints.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-2 text-white/50 text-sm">
            <Icon className="w-4 h-4 text-gold-400" />
            {text}
          </div>
        ))}
      </motion.div>
    </main>
  )
}
