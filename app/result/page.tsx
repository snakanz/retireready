'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { calculateReadinessScore, formatCurrency } from '@/lib/utils'
import type { FunnelData, ReadinessScore } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────
const LIFE_EXPECTANCY    = 90
const RETIREMENT_GROWTH  = 0.03   // 3% real return in retirement (conservative)

// ─── Chart helpers ────────────────────────────────────────────────────────────
interface PotPoint { age: number; pot: number }

function buildPotData(projectedPot: number, targetIncome: number, retirementAge: number): PotPoint[] {
  // Guard against NaN / Infinity / nonsensical values
  if (!isFinite(projectedPot) || !isFinite(targetIncome) || !isFinite(retirementAge)) return []
  if (retirementAge >= LIFE_EXPECTANCY) return []
  const out: PotPoint[] = []
  let pot = projectedPot
  for (let age = Math.floor(retirementAge); age <= LIFE_EXPECTANCY; age++) {
    out.push({ age, pot: Math.round(Math.max(pot, 0)) })
    pot = pot * (1 + RETIREMENT_GROWTH) - targetIncome
  }
  return out
}

function ChartTooltip({
  active, payload, label,
}: { active?: boolean; payload?: { value: number }[]; label?: number }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0B1F3A] border border-white/20 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/50 mb-0.5">Age {label}</p>
      <p className="text-gold-400 font-bold">{formatCurrency(payload[0].value)}</p>
      <p className="text-white/30 text-[10px]">remaining in pot</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter()
  const [score,     setScore]     = useState<ReadinessScore | null>(null)
  const [funnel,    setFunnel]    = useState<Partial<FunnelData>>({})
  const [animated,  setAnimated]  = useState(false)
  const [chartData, setChartData] = useState<PotPoint[]>([])
  const [runOutAge, setRunOutAge] = useState<number | null>(null)
  // Prevents recharts from attempting to render during SSR pre-pass
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => {
    setMounted(true)

    let raw: string | null = null
    try {
      raw = sessionStorage.getItem('rr_funnel')
    } catch {
      // sessionStorage unavailable (private browsing edge case)
    }

    if (!raw) {
      router.replace('/funnel')
      return
    }

    let parsed: Partial<FunnelData>
    try {
      const maybeData = JSON.parse(raw)
      // JSON.parse can return null, a number, boolean etc — guard for object
      if (!maybeData || typeof maybeData !== 'object') {
        router.replace('/funnel')
        return
      }
      parsed = maybeData as Partial<FunnelData>
    } catch {
      router.replace('/funnel')
      return
    }

    setFunnel(parsed)

    try {
      const s = calculateReadinessScore(parsed)
      setScore(s)

      // Use Number() so null/undefined both coerce to 0, then fall to sensible default
      const retirementAge = Math.max(Number(parsed.targetAge) || 65, 1)
      const targetIncome  = Math.max(Number(parsed.targetIncome) || 40000, 1)

      const data = buildPotData(s.projectedPot, targetIncome, retirementAge)
      setChartData(data)
      setRunOutAge(data.find(d => d.pot === 0)?.age ?? null)
    } catch (err) {
      console.error('[RetireReady] Results calculation error:', err)
      // Provide a fallback score so the page renders rather than staying blank
      setScore({ score: 45, label: 'On Track', colour: 'text-gold-400', projectedPot: 0, incomeGap: 0 })
      setChartData([])
    }

    setTimeout(() => setAnimated(true), 200)
  }, [router])

  // Show nothing until client-side data is ready
  if (!score || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading your results…</div>
      </div>
    )
  }

  const safeScore     = isFinite(score.score) ? score.score : 45
  const circumference = 2 * Math.PI * 54
  const offset        = circumference - (safeScore / 100) * circumference
  const scoreStroke   =
    safeScore >= 75 ? '#34d399' : safeScore >= 50 ? '#C9A84C' :
    safeScore >= 30 ? '#f59e0b' : '#ef4444'

  const retirementAge     = Number(funnel.targetAge) || 65
  const targetIncome      = Number(funnel.targetIncome) || 40000
  const projectedPot      = isFinite(score.projectedPot) ? score.projectedPot : 0
  const sustainableIncome = Math.round(projectedPot * 0.04)
  const yearsLeft         = Math.max(retirementAge - (Number(funnel.age) || 45), 0)
  const fundedYears       = runOutAge ? runOutAge - retirementAge : LIFE_EXPECTANCY - retirementAge
  const unfundedYears     = runOutAge ? LIFE_EXPECTANCY - runOutAge : 0
  const monthlyIncome     = Math.round(sustainableIncome / 12)
  const incomeGap         = isFinite(score.incomeGap) ? score.incomeGap : 0

  // Prefer the range label if available, else format the number
  const targetIncomeDisplay = funnel.targetIncomeRange ?? formatCurrency(targetIncome)

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
        {/* ── Score card ────────────────────────────────────────────────────── */}
        <div className="glass-card text-center space-y-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">Retirement Readiness Score</p>
            <h1 className="text-xl font-bold text-white mt-1">
              Hi {funnel.firstName || 'there'} — here's your retirement picture
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

        {/* ── Key numbers ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card text-center space-y-1">
            <TrendingUp className="w-5 h-5 text-gold-400 mx-auto mb-1.5" />
            <div className="text-lg font-bold text-white">{formatCurrency(projectedPot)}</div>
            <div className="text-white/40 text-xs">Pot at retirement</div>
          </div>
          <div className="glass-card text-center space-y-1">
            <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
            <div className="text-lg font-bold text-white">{formatCurrency(monthlyIncome)}</div>
            <div className="text-white/40 text-xs">Monthly income from pot</div>
          </div>
          <div className="glass-card text-center space-y-1">
            {runOutAge
              ? <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              : <CheckCircle  className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            }
            <div className={`text-lg font-bold ${runOutAge ? 'text-amber-400' : 'text-emerald-400'}`}>
              {fundedYears} yrs
            </div>
            <div className="text-white/40 text-xs">Years funded</div>
          </div>
          <div className="glass-card text-center space-y-1">
            {incomeGap > 0
              ? <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
              : <CheckCircle  className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
            }
            <div className={`text-lg font-bold ${incomeGap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {incomeGap > 0 ? formatCurrency(incomeGap) : 'On target'}
            </div>
            <div className="text-white/40 text-xs">
              {incomeGap > 0 ? 'Annual shortfall' : 'Income goal met'}
            </div>
          </div>
        </div>

        {/* ── Pot depletion chart ───────────────────────────────────────────── */}
        <div className="glass-card space-y-4">
          <div>
            <h2 className="text-white font-bold text-sm">How long will your money last?</h2>
            <p className="text-white/40 text-xs mt-0.5">
              {formatCurrency(projectedPot)} pot · {targetIncomeDisplay}/yr drawn · life expectancy {LIFE_EXPECTANCY}
            </p>
          </div>

          {runOutAge ? (
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-2.5 text-sm">
              <span className="text-amber-400 font-semibold">Pot runs out at age {runOutAge}</span>
              <span className="text-white/50"> — that's {unfundedYears} unfunded years.</span>
            </div>
          ) : (
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm">
              <span className="text-emerald-400 font-semibold">Great — </span>
              <span className="text-white/50">your pot is projected to last beyond age {LIFE_EXPECTANCY}.</span>
            </div>
          )}

          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="potFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.04} />
                  </linearGradient>
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
                  tickFormatter={v => `£${(v / 1000).toFixed(0)}k`}
                  stroke="rgba(255,255,255,0.08)"
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<ChartTooltip />} />
                {runOutAge && (
                  <ReferenceArea
                    x1={runOutAge} x2={LIFE_EXPECTANCY}
                    fill="rgba(239,68,68,0.10)"
                    stroke="rgba(239,68,68,0.25)"
                    strokeDasharray="4 3"
                  />
                )}
                {runOutAge && (
                  <ReferenceLine
                    x={runOutAge}
                    stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5}
                    label={{ value: `Empty at ${runOutAge}`, position: 'insideTopRight', fill: '#ef4444', fontSize: 9, dy: -4 }}
                  />
                )}
                <ReferenceLine
                  x={LIFE_EXPECTANCY}
                  stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3"
                  label={{ value: `Age ${LIFE_EXPECTANCY}`, position: 'insideTopLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 9, dy: -4 }}
                />
                <Area type="monotone" dataKey="pot" stroke="#C9A84C" strokeWidth={2} fill="url(#potFill)" dot={false} activeDot={{ r: 4, fill: '#C9A84C', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-white/30 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-gold-400 rounded" />
              <span>Pot value over retirement</span>
            </div>
            {runOutAge && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/40" />
                <span>Unfunded gap</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-white/22 text-xs text-center pb-4 leading-relaxed">
          Projections assume 6% pre-retirement growth, 3% real return in retirement, and a 4% safe withdrawal rate.
          Illustrative only — not financial advice.
        </p>
      </motion.div>
    </main>
  )
}
