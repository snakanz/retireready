export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let amount: number
  try {
    const body = await req.json()
    amount = Number(body.amount)
    if (!Number.isInteger(amount) || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'gbp',
          unit_amount: amount,
          product_data: {
            name: 'RetireReady Wallet Top-Up',
            description: `Add £${(amount / 100).toFixed(2)} to your advisor wallet`,
          },
        },
      },
    ],
    metadata: {
      advisor_id: user.id,
      amount: String(amount),
      type: 'wallet_topup',
    },
    success_url: `${siteUrl}/advisor/dashboard?wallet=success`,
    cancel_url: `${siteUrl}/advisor/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
