'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { FunnelData } from '@/types'

import Step1Age     from './Step1Age'
import Step2Assets  from './Step2Assets'
import Step3Income  from './Step3Income'
import Step4Contact from './Step5Contact'   // file is Step5Contact, component is Step4Contact

const TOTAL_STEPS = 4

const variants = {
  enter:  (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

const STEP_LABELS = ['Your Age', 'Your Savings', 'Your Income', 'Your Details']

export default function FunnelWrapper() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState<Partial<FunnelData>>({
    age: 45,
    targetAge: 65,
    currentIncome: 65000,
    targetIncome: 40000,
    availability: [],
  })

  function next() {
    setDirection(1)
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  function back() {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 1))
  }

  function update(patch: Partial<FunnelData>) {
    setData(prev => ({ ...prev, ...patch }))
  }

  function submit(contact: Pick<FunnelData, 'firstName' | 'email' | 'phone'>) {
    const final = { ...data, ...contact }
    sessionStorage.setItem('rr_funnel', JSON.stringify(final))
    router.push('/result')
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Logo bar */}
      <div className="flex items-center gap-2 mb-10">
        <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
          <polyline points="4,28 12,16 20,22 28,10 32,14"
            stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {[4,12,20,28,32].map((x, i) => (
            <circle key={i} cx={x} cy={[28,16,22,10,14][i]} r="2.5" fill="#C9A84C"/>
          ))}
        </svg>
        <span className="font-extrabold text-white text-xl tracking-tight">
          Retire<span className="text-gold-400">Ready</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span className="font-medium text-white/60">{STEP_LABELS[step - 1]}</span>
          <span>Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gold-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between mt-2 px-0.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'bg-gold-400' : 'bg-white/15'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step cards */}
      <div className="w-full max-w-lg relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {step === 1 && <Step1Age data={data} update={update} onNext={next} />}
            {step === 2 && <Step2Assets data={data} update={update} onNext={next} onBack={back} />}
            {step === 3 && <Step3Income data={data} update={update} onNext={next} onBack={back} />}
            {step === 4 && <Step4Contact data={data} onSubmit={submit} onBack={back} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
