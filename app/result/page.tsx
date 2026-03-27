'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp, ShieldCheck, MessageSquare, CheckCircle, Loader2 } from 'lucide-react'
import { calculateReadinessScore, formatCurrency } from '@/lib/utils'
import type { FunnelData, ReadinessScore } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────
const SCENARIOS = [
  { key: 'low',  rate: 0.02, label: 'Low (2%)',  colour: '#60a5fa' },
  { key: 'mid',  rate: 0.05, label: 'Mid (5%)',  colour: '#C9A84C' },
  { key: 'high', rate: 0.10, label: 'High (10%)', colour: '#34d399' },
]

// ─── Asset midpoints ──────────────────────────────────────────────────────────
const ASSET_MID: Record<string, number> = {
  'Under £50k':   25000,   '£50k–£150k':  100000,
  '£150k–£250k':  200000,  '£250k–£500k': 375000,
  '£500k–£750k':  625000,  '£750k–£1m':   875000,
  '£1m–£2m':      1500000, '£2m+':        2500000,
}

function assetMidpoint(range: string): number {
  return ASSET_MID[range] ?? 200000
}

// ─── Growth chart builder ─────────────────────────────────────────────────────
interface GrowthPoint {
  age: number
  low: number
  mid: number
  high: number
}

function buildGrowthData(currentAge: number, retirementAge: number, startPot: number): GrowthPoint[] {
  const points: GrowthPoint[] = []
  const years = Math.max(retirementAge - currentAge, 1)
  for (let y = 0; y <= years; y++) {
    points.push({
      age:  currentAge + y,
      low:  Math.round(startPot * Math.pow(1.02, y)),
      mid:  Math.round(startPot * Math.pow(1.05, y)),
      high: Math.round(startPot * Math.pow(1.10, y)),
    })
  }
  return points
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0B1F3A] border border-white/20 rounded-lg px-3 py-2.5 text-xs shadow-xl space-y-1">
      <p className="text-white/50 mb-1">Age {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-white/60 capitalize">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter()
  const [score,     setScore]     = useState<ReadinessScore | null>(null)
  const [funnel,    setFunnel]    = useState<Partial<FunnelData>>({})
  const [animated,  setAnimated]  = useState(false)
  const [chartData, setChartData] = useState<GrowthPoint[]>([])
  const [mounted,   setMounted]   = useState(false)
  const [notes,     setNotes]     = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [notesLoading, setNotesLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    let raw: string | null = null
    try { raw = sessionStorage.getItem('rr_funnel') } catch { /* private browsing */ }

    if (!raw) { router.replace('/funnel'); return }

    let parsed: Partial<FunnelData>
    try {
      const d = JSON.parse(raw)
      if (!d || typeof d !== 'object') { router.replace('/funnel'); return }
      parsed = d as Partial<FunnelData>
    } catch { router.replace('/funnel'); return }

    setFunnel(parsed)

    try {
      const s = calculateReadinessScore(parsed)
      setScore(s)

      const currentAge    = Math.max(Number(parsed.age) || 40, 1)
      const retirementAge = Math.max(Number(parsed.targetAge) || 65, currentAge + 1)
      const startPot      = assetMidpoint(parsed.assetRange ?? '')

      setChartData(buildGrowthData(currentAge, retirementAge, startPot))
    } catch (err) {
      console.error('[RetireReady] Results error:', err)
      setScore({ score: 50, label: 'On Track', colour: 'text-gold-400', projectedPot: 0, incomeGap: 0 })
    }

    setTimeout(() => setAnimated(true), 200)
  }, [router])

  async function saveNotes() {
    if (!funnel.email || !notes.trim()) return
    setNotesLoading(true)
    try {
      await fetch('/api/leads/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: funnel.email, notes }),
      })
      setNotesSaved(true)
    } finally {
      setNotesLoading(false)
    }
  }

  if (!score || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading your results…</div>
      </div>
    )
  }

  const safeScore     = isFinite(score.score) ? Math.min(Math.max(score.score, 0), 100) : 50
  const circumference = 2 * Math.PI * 54
  const offset        = circumference - (safeScore / 100) * circumference
  const scoreStroke   = safeScore >= 75 ? '#34d399' : safeScore >= 50 ? '#C9A84C' : safeScore >= 30 ? '#f59e0b' : '#ef4444'

  const currentAge    = Number(funnel.age) || 40
  const retirementAge = Number(funnel.targetAge) || 65
  const startPot      = assetMidpoint(funnel.assetRange ?? '')
  const yearsToRetire = Math.max(retirementAge - currentAge, 0)

  // Final pot values at retirement for each scenario
  const finalLow  = Math.round(startPot * Math.pow(1.02, yearsToRetire))
  const finalMid  = Math.round(startPot * Math.pow(1.05, yearsToRetire))
  const finalHigh = Math.round(startPot * Math.pow(1.10, yearsToRetire))

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
          <polyline points="4,28 12,16 20,22 28,10 32,14"
            stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {[4,12,20,28,32].map((x, i) => (
            <circle key={i} cx={x} cy={[28,16,22,10,14][i]} r="2.5" fill="#C9A84C"/>
          ))}
        </svg>
        <span className="font-extrabold text-white text-lg">
          Retire<span className="text-gold-400">Ready</span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-5"
      >
        {/* ── Score card ────────────────────────────────────────────────── */}
        <div className="glass-card text-center space-y-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">Retirement Readiness Score</p>
            <h1 className="text-xl font-bold text-white mt-1">
              Hi {funnel.firstName || 'there'} — here&apos;s your retirement picture
            </h1>
          </div>

          <div className="flex justify-center py-1">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                <motion.circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={scoreStroke} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: animated ? offset : circumference }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-4xl font-extrabold text-white tabular-nums"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                >
                  {safeScore}
                </motion.span>
                <span className={`text-sm font-semibold ${score.colour}`}>{score.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Current value + projected pots ───────────────────────────── */}
        <div className="glass-card space-y-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Your Investment Today</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {formatCurrency(startPot)}
              </span>
              <span className="text-white/40 text-sm">{funnel.assetRange}</span>
            </div>
            <p className="text-white/35 text-xs mt-1">{yearsToRetire} years until your target retirement age of {retirementAge}</p>
          </div>

          <div className="border-t border-white/8 pt-4">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Projected at Retirement (Age {retirementAge})</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Low (2%)',   value: finalLow,  colour: 'text-blue-400',    bg: 'bg-blue-500/8 border-blue-500/20' },
                { label: 'Mid (5%)',   value: finalMid,  colour: 'text-gold-400',    bg: 'bg-gold-400/8 border-gold-400/20' },
                { label: 'High (10%)', value: finalHigh, colour: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border rounded-xl p-3 text-center`}>
                  <p className={`font-extrabold text-sm tabular-nums ${s.colour}`}>
                    {formatCurrency(s.value)}
                  </p>
                  <p className="text-white/40 text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Growth chart ─────────────────────────────────────────────── */}
        <div className="glass-card space-y-4">
          <div>
            <h2 className="text-white font-bold text-sm">How your investment could grow</h2>
            <p className="text-white/40 text-xs mt-0.5">
              Annual growth scenarios · current pot {formatCurrency(startPot)} · no additional contributions
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {SCENARIOS.map(s => (
              <div key={s.key} className="flex items-center gap-1.5 text-xs text-white/50">
                <div className="w-3 h-0.5 rounded" style={{ background: s.colour }} />
                {s.label}
              </div>
            ))}
          </div>

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                <defs>
                  {SCENARIOS.map(s => (
                    <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={s.colour} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={s.colour} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="age"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  stroke="rgba(255,255,255,0.08)"
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  tickFormatter={v => v >= 1_000_000 ? `£${(v/1_000_000).toFixed(1)}m` : `£${(v/1000).toFixed(0)}k`}
                  stroke="rgba(255,255,255,0.08)"
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine
                  y={startPot}
                  stroke="rgba(255,255,255,0.15)" strokeDasharray="4 3"
                  label={{ value: 'Today', position: 'insideTopLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 9, dy: -4 }}
                />
                {SCENARIOS.map(s => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.colour}
                    strokeWidth={s.key === 'mid' ? 2 : 1.5}
                    fill={`url(#fill-${s.key})`}
                    dot={false}
                    activeDot={{ r: s.key === 'mid' ? 4 : 3, fill: s.colour, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-white/25 text-[10px]">
            Compound growth only. No additional contributions assumed. Past performance is not a reliable indicator.
          </p>
        </div>

        {/* ── Advisor CTA ───────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#0d2244] to-[#0B1F3A] border border-gold-400/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-400/15 border border-gold-400/30 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <p className="text-gold-400 font-bold text-sm">Your plan is ready</p>
              <p className="text-white/50 text-xs">An FCA-regulated adviser has been notified</p>
            </div>
          </div>

          <p className="text-white/75 text-sm leading-relaxed">
            One of our <span className="text-white font-semibold">licensed, experienced FCA-regulated financial advisers</span> on our panel will review your retirement picture and reach out to you directly to walk through your plan in detail — completely free, no obligation.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              'FCA authorised & regulated',
              'No obligation consultation',
              'Whole-of-market access',
              'No fees to you',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/60">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ── Notes ────────────────────────────────────────────────────── */}
        <div className="glass-card space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white/40" />
            <p className="text-white/80 text-sm font-semibold">Additional notes for your adviser</p>
          </div>
          <p className="text-white/40 text-xs">
            Is there anything specific you'd like to discuss or clarify? Your adviser will see this before they call.
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. I have a defined benefit pension I'd like to factor in, or I'm thinking of retiring early..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-gold-400/60 focus:bg-white/8 transition-all resize-none"
          />
          <button
            onClick={saveNotes}
            disabled={!notes.trim() || notesLoading || notesSaved}
            className="w-full py-2.5 bg-white/8 hover:bg-white/12 border border-white/15 rounded-xl text-sm font-semibold text-white/70 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {notesLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : notesSaved ? (
              <><CheckCircle className="w-4 h-4 text-emerald-400" /> Notes saved</>
            ) : (
              'Send notes to adviser'
            )}
          </button>
        </div>

        {/* ── FCA disclaimer ────────────────────────────────────────────── */}
        <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 space-y-2">
          <p className="text-amber-400/80 text-xs font-semibold">
            For illustrative purposes only. Not financial advice.
          </p>
          <p className="text-white/22 text-xs leading-relaxed">
            Growth projections assume 2%, 5%, and 10% annual compound returns on the current pot value with no additional contributions.
            Figures are in today&apos;s money and do not account for inflation, tax, adviser charges, or State Pension entitlement.
            Actual investment returns will vary and past performance is not a reliable indicator of future results.
            RetireReady is not an FCA-authorised financial adviser. All adviser introductions are to independently regulated firms.
            Please seek regulated financial advice before making any investment decisions.
          </p>
        </div>
      </motion.div>
    </main>
  )
}
