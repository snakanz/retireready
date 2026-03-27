export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const WEBHOOK_SECRET          = process.env.STRIPE_WEBHOOK_SECRET!
const REFERRAL_REWARD_PENCE   = 30000  // £300 to referrer
const REFERRAL_MIN_DEPOSIT    = 10000  // referred advisor must deposit £100+

export async function POST(req: NextRequest) {
  const body      = await req.text()
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
    const session      = event.data.object as Stripe.Checkout.Session
    const { metadata } = session

    if (metadata?.type === 'wallet_topup') {
      const advisorId = metadata.advisor_id
      const amount    = parseInt(metadata.amount, 10)
      const sessionId = session.id

      if (!advisorId || !Number.isFinite(amount) || !sessionId) {
        return NextResponse.json({ received: true })
      }

      const supabase = createServiceClient()

      // 1. Credit the advisor's wallet
      const { error: creditError } = await supabase.rpc('credit_wallet', {
        p_advisor_id: advisorId,
        p_amount:     amount,
        p_session_id: sessionId,
      })
      if (creditError) {
        console.error('[Stripe Webhook] credit_wallet error:', creditError)
        return NextResponse.json({ error: 'Failed to credit wallet' }, { status: 500 })
      }

      // 2. Referral reward — only if deposit >= £100
      if (amount >= REFERRAL_MIN_DEPOSIT) {
        const { data: profile } = await supabase
          .from('advisor_profiles')
          .select('referred_by')
          .eq('id', advisorId)
          .single()

        if (profile?.referred_by) {
          // Insert reward row first — unique constraint on referee_id blocks duplicates
          const { error: rewardInsertError } = await supabase
            .from('referral_rewards')
            .insert({
              referrer_id: profile.referred_by,
              referee_id:  advisorId,
              amount:      REFERRAL_REWARD_PENCE,
              session_id:  sessionId,
            })

          if (!rewardInsertError) {
            await supabase.rpc('credit_wallet', {
              p_advisor_id: profile.referred_by,
              p_amount:     REFERRAL_REWARD_PENCE,
              p_session_id: `ref_${sessionId}`,
            })
            console.log(`[Referral] £300 credited to ${profile.referred_by}`)
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
