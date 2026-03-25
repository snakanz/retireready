export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { metadata } = session

    if (metadata?.type === 'wallet_topup') {
      const advisorId = metadata.advisor_id
      const amount = parseInt(metadata.amount, 10)
      const sessionId = session.id

      if (advisorId && Number.isFinite(amount) && sessionId) {
        const supabase = createServiceClient()
        const { error } = await supabase.rpc('credit_wallet', {
          p_advisor_id: advisorId,
          p_amount: amount,
          p_session_id: sessionId,
        })
        if (error) {
          console.error('[Stripe Webhook] credit_wallet RPC error:', error)
          return NextResponse.json({ error: 'Failed to credit wallet' }, { status: 500 })
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
