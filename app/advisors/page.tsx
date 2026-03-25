'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, ArrowRight, Users, PoundSterling, Clock } from 'lucide-react'

// ─── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut', delay: i * 0.1 },
  }),
}

// ─── Logo ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
        <polyline
          points="4,28 12,16 20,22 28,10 32,14"
          stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
        {[4, 12, 20, 28, 32].map((x, i) => (
          <circle key={i} cx={x} cy={[28, 16, 22, 10, 14][i]} r="2.5" fill="#C9A84C" />
        ))}
      </svg>
      <span className="font-extrabold text-white text-lg">
        Retire<span className="text-gold-400">Ready</span>
      </span>
    </div>
  )
}

// ─── Comparison data ───────────────────────────────────────────────────────────
type CellVal = 'yes' | 'no' | 'partial'

interface CompRow {
  label: string
  retireready: CellVal
  unbiased: CellVal
  linkedin: CellVal
  agencies: CellVal
}

const compRows: CompRow[] = [
  { label: 'Pay per lead', retireready: 'yes', unbiased: 'partial', linkedin: 'no', agencies: 'no' },
  { label: 'No upfront cost', retireready: 'yes', unbiased: 'no', linkedin: 'no', agencies: 'no' },
  { label: 'Lead quality control', retireready: 'yes', unbiased: 'partial', linkedin: 'no', agencies: 'no' },
  { label: 'Speed to lead', retireready: 'yes', unbiased: 'partial', linkedin: 'no', agencies: 'no' },
  { label: 'Financial profiling depth', retireready: 'yes', unbiased: 'no', linkedin: 'no', agencies: 'no' },
]

function CellIcon({ val }: { val: CellVal }) {
  if (val === 'yes') return <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
  if (val === 'partial') return <AlertCircle className="w-5 h-5 text-amber-400 mx-auto" />
  return <XCircle className="w-5 h-5 text-red-400/70 mx-auto" />
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdvisorsLandingPage() {
  return (
    <div className="min-h-screen bg-[#071527] text-white">

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#071527]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/advisor/login"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/advisor/login"
              className="btn-gold text-sm px-4 py-2 rounded-xl font-semibold"
            >
              Get 3 Free Leads
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pt-24 pb-20 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gold-400 font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
          New leads available this week
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6"
        >
          Qualified Retirement Leads.
          <br />
          <span className="text-gold-400">On Demand.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="text-white/55 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          No retainers. No wasted spend. Only high-intent, pre-profiled clients ready to talk retirement planning.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/advisor/login" className="btn-gold px-7 py-3.5 rounded-xl font-bold text-base flex items-center gap-2">
            Claim Your 3 Free Leads <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#how-it-works" className="text-white/60 hover:text-white text-sm font-medium transition-colors underline underline-offset-4">
            See How It Works
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16"
        >
          {[
            { icon: Users, label: '4,200+ leads generated' },
            { icon: PoundSterling, label: '£49 avg lead price' },
            { icon: Clock, label: '2 min avg completion time' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/50 text-sm">
              <Icon className="w-4 h-4 text-gold-400" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Comparison table ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">How We Compare</h2>
          <p className="text-white/45 text-sm">See why advisors choose RetireReady over the alternatives.</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={1}
          className="glass-card overflow-x-auto p-0"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-6 py-4 text-white/40 font-medium w-1/3">Feature</th>
                <th className="px-6 py-4 text-gold-400 font-bold">RetireReady</th>
                <th className="px-6 py-4 text-white/40 font-medium">Unbiased</th>
                <th className="px-6 py-4 text-white/40 font-medium">LinkedIn</th>
                <th className="px-6 py-4 text-white/40 font-medium">Ad Agencies</th>
              </tr>
            </thead>
            <tbody>
              {compRows.map((row, i) => (
                <tr key={row.label} className={i < compRows.length - 1 ? 'border-b border-white/5' : ''}>
                  <td className="px-6 py-4 text-white/70">{row.label}</td>
                  <td className="px-6 py-4"><CellIcon val={row.retireready} /></td>
                  <td className="px-6 py-4"><CellIcon val={row.unbiased} /></td>
                  <td className="px-6 py-4"><CellIcon val={row.linkedin} /></td>
                  <td className="px-6 py-4"><CellIcon val={row.agencies} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>

      {/* ── Why our leads convert ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">Why Our Leads Convert</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">
            Every lead has completed a detailed financial profiling funnel before reaching you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Deep financial profile',
              desc: 'Age, pension assets, income, target retirement age, and monthly goals — all captured before you ever see the lead.',
              emoji: '📊',
            },
            {
              title: 'Pre-qualified intent',
              desc: 'Leads have actively requested financial advice and confirmed they are seeking a professional adviser.',
              emoji: '✅',
            },
            {
              title: 'Instant delivery',
              desc: 'No waiting for a matchmaking system. Unlock a lead and you have their contact details in seconds.',
              emoji: '⚡',
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              className="glass-card space-y-3"
            >
              <div className="text-3xl">{card.emoji}</div>
              <h3 className="font-bold text-white text-lg">{card.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Free trial section ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0}
          className="glass-card text-center space-y-5 py-14"
        >
          <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/20 rounded-full px-4 py-1.5 text-xs text-gold-400 font-semibold">
            Free Trial
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
            Your first 3 leads under £100<br />are completely free.
          </h2>
          <p className="text-white/50 text-base max-w-md mx-auto">
            No card required to start. Browse the marketplace, unlock 3 leads at zero cost. Cancel any time.
          </p>
          <Link href="/advisor/login" className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-5 pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-white/45 text-sm">Three steps to your first client.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Create your account', desc: 'Sign up in under 2 minutes. No contract, no commitment.' },
            { step: '2', title: 'Browse verified leads', desc: 'See anonymised lead profiles — age, asset range, retirement goals, availability.' },
            { step: '3', title: 'Unlock and connect', desc: 'Purchase the leads that match your target client. Get full contact details instantly.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              className="text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/25 flex items-center justify-center mx-auto">
                <span className="text-gold-400 font-extrabold text-lg">{item.step}</span>
              </div>
              <h3 className="font-bold text-white text-lg">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-6 text-white/35 text-xs">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <span>&copy; {new Date().getFullYear()} RetireReady</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
