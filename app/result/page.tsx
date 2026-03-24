'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'
import {
  TrendingUp, AlertTriangle, CheckCircle,
  Phone, ShieldCheck, Clock, ChevronRight,
} from 'lucide-react'
import { calculateReadinessScore, formatCurrency } from '@/lib/utils'
import type { FunnelData, ReadinessScore } from '@/types'

// ─── Constants ───────────────────────────────────────────────────────────────
const LIFE_EXPECTANCY = 90
const RETIREMENT_GROWTH = 0.03   // 3% real return in retirement (conservative)

// ─── Chart data ──────────────────────────────────────────────────────────────
interface PotPoint { age: number; pot: number; label: string }

function buildPotData(projectedPot: number, targetIncome: number, retirementAge: number): PotPoint[] {
  const data: PotPoint[] = []
  let pot = projectedPot
  for (let age = retirementAge; age <= LIFE_EXPECTANCY; age++) {
    data.push({ age, pot: Math.round(Math.max(pot, 0)), label: `Age ${age}` })
    pot = pot * (1 + RETIREMENT_GROWTH) - targetIncome
  }
  return data
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: {value:number}[]; label?: number }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0B1F3A] border border-white/20 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white/50 mb-0.5">Age {label}</p>
      <p className="text-gold-400 font-bold">{formatCurrency(payload[0].value)}</p>
      <p className="text-white/30 text-[10px]">remaining in pot</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter()
  const [score, setScore] = useState<ReadinessScore | null>(null)
  const [funnel, setFunnel] = useState<Partial<FunnelData>>({})
  const [animated, setAnimated] = useState(false)
  const [chartData, setChartData] = useState<PotPoint[]>([])
  const [runOutAge, setRunOutAge] = useState<number | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('rr_funnel')
    if (raw) {
      const parsed: Partial<FunnelData> = JSON.parse(raw)
      setFunnel(parsed)
      const s = calculateReadinessScore(parsed)
      setScore(s)

      const retirementAge = parsed.targetAge ?? 65
      const targetIncome  = parsed.targetIncome ?? 40000
      const data = buildPotData(s.projectedPot, targetIncome, retirementAge)
      setChartData(data)

      // Find age when pot first hits 0
      const empty = data.find(d => d.pot === 0)
      setRunOutAge(empty?.age ?? null)

      setTimeout(() => setAnimated(true), 200)
    }
  }, [])

  if (!score) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading your results…</div>
      </div>
    )
  }

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score.score / 100) * circumference
  const scoreStroke =
    score.score >= 75 ? '#34d399' : score.score >= 50 ? '#C9A84C' : score.score >= 30 ? '#f59e0b' : '#ef4444'

  const retirementAge = funnel.targetAge ?? 65
  const targetIncome  = funnel.targetIncome ?? 40000
  const sustainableIncome = Math.round(score.projectedPot * 0.04)
  const yearsLeft = Math.max(retirementAge - (funnel.age ?? 45), 0)
  const fundedYears = runOutAge ? runOutAge - retirementAge : LIFE_EXPECTANCY - retirementAge
  const unfundedYears = runOutAge ? LIFE_EXPECTANCY - runOutAge : 0

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
        {/* Score card */}
        <div className="glass-card text-center space-y-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">Your Retirement Readiness Score</p>
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
                  {score.score}
                </motion.span>
                <span className={`text-sm font-semibold ${score.colour}`}>{score.label}</span>
              </div>
            </div>
          </div>

          <p className="text-white/55 text-sm leading-relaxed px-2">
            {score.incomeGap > 0
              ? `Based on your current savings, you're projected to fall ${formatCurrency(score.incomeGap)} short of your ${formatCurrency(targetIncome)}/yr retirement goal. The good news: there's still time — with the right plan.`
              : `Great news — your current savings are on track to fund the ${formatCurrency(targetIncome)}/yr retirement lifestyle you want.`
            }
          </p>
        </div>

        {/* ── Pot depletion chart ────────────────────────────────────────── */}
        <div className="glass-card space-y-4">
          <div>
            <h2 className="text-white font-bold text-base">How long will your money last?</h2>
            <p className="text-white/45 text-xs mt-0.5">
              Your {formatCurrency(score.projectedPot)} pot at retirement, drawn down at {formatCurrency(targetIncome)}/yr
              with 3% real growth. Life expectancy assumed: age {LIFE_EXPECTANCY}.
            </p>
          </div>

          {/* Summary pills */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl border px-3 py-2.5 text-center ${
              runOutAge
                ? 'border-amber-500/30 bg-amber-500/8'
                : 'border-emerald-500/30 bg-emerald-500/8'
            }`}>
              {runOutAge ? (
                <>
                  <div className="text-amber-400 font-bold text-lg tabular-nums">{fundedYears} yrs</div>
                  <div className="text-white/45 text-xs mt-0.5">Funded in retirement</div>
                  <div className="text-amber-400/70 text-xs mt-0.5">Pot empty at age {runOutAge}</div>
                </>
              ) : (
                <>
                  <div className="text-emerald-400 font-bold text-lg">{fundedYears}+ yrs</div>
                  <div className="text-white/45 text-xs mt-0.5">Funded in retirement</div>
                  <div className="text-emerald-400/70 text-xs mt-0.5">Lasts beyond {LIFE_EXPECTANCY}</div>
                </>
              )}
            </div>

            <div className={`rounded-xl border px-3 py-2.5 text-center ${
              unfundedYears > 0
                ? 'border-red-500/30 bg-red-500/8'
                : 'border-emerald-500/30 bg-emerald-500/8'
            }`}>
              {unfundedYears > 0 ? (
                <>
                  <div className="text-red-400 font-bold text-lg tabular-nums">{unfundedYears} yrs</div>
                  <div className="text-white/45 text-xs mt-0.5">Unfunded gap</div>
                  <div className="text-red-400/70 text-xs mt-0.5">
                    {formatCurrency(targetIncome * unfundedYears)} total shortfall
                  </div>
                </>
              ) : (
                <>
                  <div className="text-emerald-400 font-bold text-lg">£0</div>
                  <div className="text-white/45 text-xs mt-0.5">Funding gap</div>
                  <div className="text-emerald-400/70 text-xs mt-0.5">On track to {LIFE_EXPECTANCY}</div>
                </>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="w-full" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                  tickFormatter={a => `${a}`}
                  stroke="rgba(255,255,255,0.08)"
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                  tickFormatter={v => `£${(v / 1000).toFixed(0)}k`}
                  stroke="rgba(255,255,255,0.08)"
                  tickLine={false}
                  width={46}
                />

                <Tooltip content={<ChartTooltip />} />

                {/* Red zone: unfunded years */}
                {runOutAge && (
                  <ReferenceArea
                    x1={runOutAge}
                    x2={LIFE_EXPECTANCY}
                    fill="rgba(239,68,68,0.10)"
                    stroke="rgba(239,68,68,0.25)"
                    strokeDasharray="4 3"
                  />
                )}

                {/* Vertical line where pot empties */}
                {runOutAge && (
                  <ReferenceLine
                    x={runOutAge}
                    stroke="#ef4444"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{
                      value: `Empty at ${runOutAge}`,
                      position: 'insideTopRight',
                      fill: '#ef4444',
                      fontSize: 10,
                      dy: -4,
                    }}
                  />
                )}

                {/* Life expectancy line */}
                <ReferenceLine
                  x={LIFE_EXPECTANCY}
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="3 3"
                  label={{
                    value: `Age ${LIFE_EXPECTANCY}`,
                    position: 'insideTopLeft',
                    fill: 'rgba(255,255,255,0.3)',
                    fontSize: 10,
                    dy: -4,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="pot"
                  stroke="#C9A84C"
                  strokeWidth={2}
                  fill="url(#potFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#C9A84C', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart legend */}
          <div className="flex items-center justify-between text-xs text-white/35 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-gold-400 rounded" />
              <span>Retirement pot value</span>
            </div>
            {runOutAge && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/40" />
                <span>Unfunded gap ({unfundedYears} yrs)</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card text-center">
            <TrendingUp className="w-5 h-5 text-gold-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{formatCurrency(score.projectedPot)}</div>
            <div className="text-white/40 text-xs mt-0.5">Projected pot at {retirementAge}</div>
          </div>
          <div className="glass-card text-center">
            {score.incomeGap > 0
              ? <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              : <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            }
            <div className={`text-lg font-bold ${score.incomeGap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {score.incomeGap > 0 ? formatCurrency(score.incomeGap) : 'On target'}
            </div>
            <div className="text-white/40 text-xs mt-0.5">
              {score.incomeGap > 0 ? 'Annual shortfall' : 'Income goal met'}
            </div>
          </div>
        </div>

        {/* ── Prominent CTA ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="glass-card border border-gold-400/25 bg-gold-400/5 space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-400/15 border border-gold-400/30 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-snug">
                Book a Free Call with a Qualified Adviser
              </h3>
              <p className="text-white/55 text-sm mt-1 leading-relaxed">
                {runOutAge
                  ? `An FCA-regulated adviser can show you exactly what steps to take to close your ${unfundedYears}-year funding gap — and make your money work much harder.`
                  : `An FCA-regulated adviser can help you lock in your strong position and make sure you stay on track — protecting what you've built.`
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Clock, text: '30 min call' },
              { icon: ShieldCheck, text: 'FCA regulated' },
              { icon: CheckCircle, text: 'No obligation' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1">
                <Icon className="w-4 h-4 text-gold-400/70" />
                <span className="text-white/45 text-xs">{text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/availability')}
            className="btn-gold w-full flex items-center justify-center gap-2 group text-sm py-4"
          >
            <Phone className="w-4 h-4 shrink-0" />
            See What Can Be Done to Improve This
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Projection breakdown */}
        <div className="glass-card space-y-3">
          <h3 className="text-white font-semibold text-sm">Projection breakdown</h3>
          <div className="space-y-2">
            {[
              { label: 'Current age',               value: `${funnel.age ?? 45}` },
              { label: 'Retirement age',             value: `${retirementAge}` },
              { label: 'Years to retirement',        value: `${yearsLeft} year${yearsLeft !== 1 ? 's' : ''}` },
              { label: 'Projected pot at retirement',value: formatCurrency(score.projectedPot) },
              { label: 'Pot income (4% withdrawal)', value: `${formatCurrency(sustainableIncome)}/yr` },
              { label: 'Your retirement income goal',value: `${formatCurrency(targetIncome)}/yr` },
              {
                label: score.incomeGap > 0 ? 'Annual shortfall' : 'Annual surplus',
                value: score.incomeGap > 0
                  ? formatCurrency(score.incomeGap)
                  : formatCurrency(sustainableIncome - targetIncome),
                highlight: true,
              },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className={`flex justify-between text-sm ${highlight ? 'pt-2 border-t border-white/10' : ''}`}
              >
                <span className="text-white/45">{label}</span>
                <span className={highlight
                  ? score.incomeGap > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'
                  : 'text-white font-medium'
                }>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/25 text-xs text-center pb-4 leading-relaxed">
          Projections assume 6% pre-retirement growth, 3% real return in retirement, and a 4% safe
          withdrawal rate. For illustrative purposes only — not financial advice. Past performance is
          not indicative of future results. RetireReady introduces clients to FCA-authorised advisers.
        </p>
      </motion.div>
    </main>
  )
}
