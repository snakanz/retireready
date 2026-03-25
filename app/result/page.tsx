'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { calculateReadinessScore, formatCurrency } from '@/lib/utils'
import type { FunnelData, ReadinessScore } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────
const LIFE_EXPECTANCY    = 90
const RETIREMENT_GROWTH  = 0.03   // 3% real return in retirement (conservative)

// Pre-retirement growth scenarios
const SCENARIO_CONSERVATIVE = 0.04  // 4%
const SCENARIO_EXPECTED     = 0.06  // 6%
const SCENARIO_OPTIMISTIC   = 0.08  // 8%

// ─── Chart helpers ────────────────────────────────────────────────────────────
interface PotPoint {
  age: number
  conservative: number
  expected: number
  optimistic: number
}

/**
 * Project retirement pot using a given annual pre-retirement growth rate,
 * then simulate drawdown during retirement.
 */
function projectPot(
  currentAge: number,
  retirementAge: number,
  assetRangeMidpoint: number,
  annualSavings: number,
  growthRate: number,
): number {
  const years = Math.max(retirementAge - currentAge, 0)
  let pot = assetRangeMidpoint
  for (let y = 0; y < years; y++) {
    pot = pot * (1 + growthRate) + annualSavings
  }
  return Math.round(Math.max(pot, 0))
}

function buildMultiScenarioData(
  currentAge: number,
  retirementAge: number,
  assetRangeMidpoint: number,
  annualSavings: number,
  targetIncome: number,
): PotPoint[] {
  if (!isFinite(retirementAge) || retirementAge >= LIFE_EXPECTANCY) return []

  const conservativePot = projectPot(currentAge, retirementAge, assetRangeMidpoint, annualSavings, SCENARIO_CONSERVATIVE)
  const expectedPot     = projectPot(currentAge, retirementAge, assetRangeMidpoint, annualSavings, SCENARIO_EXPECTED)
  const optimisticPot   = projectPot(currentAge, retirementAge, assetRangeMidpoint, annualSavings, SCENARIO_OPTIMISTIC)

  const out: PotPoint[] = []
  let cPot = conservativePot
  let ePot = expectedPot
  let oPot = optimisticPot

  for (let age = Math.floor(retirementAge); age <= LIFE_EXPECTANCY; age++) {
    out.push({
      age,
      conservative: Math.round(Math.max(cPot, 0)),
      expected:     Math.round(Math.max(ePot, 0)),
      optimistic:   Math.round(Math.max(oPot, 0)),
    })
    cPot = cPot * (1 + RETIREMENT_GROWTH) - targetIncome
    ePot = ePot * (1 + RETIREMENT_GROWTH) - targetIncome
    oPot = oPot * (1 + RETIREMENT_GROWTH) - targetIncome
  }
  return out
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({
  active, payload, label,
}: {
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

// ─── Asset range midpoint helper ──────────────────────────────────────────────
function assetMidpoint(range: string): number {
  const map: Record<string, number> = {
    '£125k–150k': 137500,
    '£150k–175k': 162500,
    '£175k–200k': 187500,
    '£200k–250k': 225000,
    '£250k–300k': 275000,
    '£300k–400k': 350000,
    '£400k–500k': 450000,
    '£500k+':     600000,
  }
  return map[range] ?? 200000
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter()
  const [score,     setScore]     = useState<ReadinessScore | null>(null)
  const [funnel,    setFunnel]    = useState<Partial<FunnelData>>({})
  const [animated,  setAnimated]  = useState(false)
  const [chartData, setChartData] = useState<PotPoint[]>([])
  const [runOutAge, setRunOutAge] = useState<number | null>(null)
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

      const retirementAge = Math.max(Number(parsed.targetAge) || 65, 1)
      const currentAge    = Math.max(Number(parsed.age) || 45, 1)
      const targetIncome  = Math.max(Number(parsed.targetIncome) || 40000, 1)
      const currentIncome = Number(parsed.currentIncome) || 50000
      const annualSavings = Math.max(currentIncome * 0.1, 0) // rough 10% savings assumption

      const assetMid = assetMidpoint(parsed.assetRange ?? '')

      const data = buildMultiScenarioData(currentAge, retirementAge, assetMid, annualSavings, targetIncome)
      setChartData(data)

      // Run-out age based on expected scenario
      setRunOutAge(data.find(d => d.expected === 0)?.age ?? null)
    } catch (err) {
      console.error('[RetireReady] Results calculation error:', err)
      setScore({ score: 45, label: 'On Track', colour: 'text-gold-400', projectedPot: 0, incomeGap: 0 })
      setChartData([])
    }

    setTimeout(() => setAnimated(true), 200)
  }, [router])

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
  const fundedYears       = runOutAge ? runOutAge - retirementAge : LIFE_EXPECTANCY - retirementAge
  const unfundedYears     = runOutAge ? LIFE_EXPECTANCY - runOutAge : 0
  const monthlyIncome     = Math.round(sustainableIncome / 12)
  const incomeGap         = isFinite(score.incomeGap) ? score.incomeGap : 0

  const targetIncomeDisplay = funnel.targetIncomeRange ?? formatCurrency(targetIncome)

  // Latest expected pot value at retirement from chart
  const expectedAtRetirement = chartData[0]?.expected ?? projectedPot

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

        {/* ── Key numbers ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card text-center space-y-1">
            <TrendingUp className="w-5 h-5 text-gold-400 mx-auto mb-1.5" />
            <div className="text-lg font-bold text-white">{formatCurrency(expectedAtRetirement)}</div>
            <div className="text-white/40 text-xs">Expected pot at retirement</div>
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
            <div className="text-white/40 text-xs">Years funded (expected)</div>
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

        {/* ── Three-scenario chart ──────────────────────────────────────── */}
        <div className="glass-card space-y-4">
          <div>
            <h2 className="text-white font-bold text-sm">How long will your money last?</h2>
            <p className="text-white/40 text-xs mt-0.5">
              Three growth scenarios · {targetIncomeDisplay}/yr drawn · life expectancy {LIFE_EXPECTANCY}
            </p>
          </div>

          {/* Scenario legend pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'conservative', colour: '#60a5fa', label: 'Conservative (4%)' },
              { key: 'expected',     colour: '#C9A84C', label: 'Expected (6%)' },
              { key: 'optimistic',   colour: '#34d399', label: 'Optimistic (8%)' },
            ].map(s => (
              <div key={s.key} className="flex items-center gap-1.5 text-xs text-white/50">
                <div className="w-3 h-0.5 rounded" style={{ background: s.colour }} />
                {s.label}
              </div>
            ))}
          </div>

          {runOutAge ? (
            <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-2.5 text-sm">
              <span className="text-amber-400 font-semibold">Expected pot runs out at age {runOutAge}</span>
              <span className="text-white/50"> — that&apos;s {unfundedYears} unfunded years.</span>
            </div>
          ) : (
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm">
              <span className="text-emerald-400 font-semibold">Great — </span>
              <span className="text-white/50">your pot is projected to last beyond age {LIFE_EXPECTANCY} in all scenarios.</span>
            </div>
          )}

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillConservative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="fillOptimistic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
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
                  <ReferenceLine
                    x={runOutAge}
                    stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5}
                    label={{ value: `Empty at ${runOutAge}`, position: 'insideTopRight', fill: '#f59e0b', fontSize: 9, dy: -4 }}
                  />
                )}
                <ReferenceLine
                  x={LIFE_EXPECTANCY}
                  stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3"
                  label={{ value: `Age ${LIFE_EXPECTANCY}`, position: 'insideTopLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 9, dy: -4 }}
                />
                <Area
                  type="monotone" dataKey="conservative" name="conservative"
                  stroke="#60a5fa" strokeWidth={1.5} fill="url(#fillConservative)"
                  dot={false} activeDot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }}
                />
                <Area
                  type="monotone" dataKey="expected" name="expected"
                  stroke="#C9A84C" strokeWidth={2} fill="url(#fillExpected)"
                  dot={false} activeDot={{ r: 4, fill: '#C9A84C', strokeWidth: 0 }}
                />
                <Area
                  type="monotone" dataKey="optimistic" name="optimistic"
                  stroke="#34d399" strokeWidth={1.5} fill="url(#fillOptimistic)"
                  dot={false} activeDot={{ r: 3, fill: '#34d399', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FCA disclaimers */}
        <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 space-y-2">
          <p className="text-amber-400/80 text-xs font-semibold">
            For illustrative purposes only. Actual returns will vary. Not financial advice.
          </p>
          <p className="text-white/22 text-xs leading-relaxed">
            Conservative scenario assumes 4% annual pre-retirement growth, expected 6%, optimistic 8%.
            All scenarios assume 3% real return in retirement and income drawn at your target rate.
            Figures are in today&apos;s money and do not account for inflation, tax, charges, or State Pension.
            Past performance is not a reliable indicator of future results. RetireReady is not an FCA-authorised
            financial adviser. Please seek regulated financial advice before making any decisions.
          </p>
        </div>
      </motion.div>
    </main>
  )
}
