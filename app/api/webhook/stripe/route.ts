import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: unknown) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const leadId    = session.metadata?.lead_id
    const advisorId = session.metadata?.advisor_id
    const amount    = session.amount_total ?? 0

    if (!leadId || !advisorId) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Flip is_purchased on the lead
    const { error: leadErr } = await supabase
      .from('leads')
      .update({ is_purchased: true })
      .eq('id', leadId)

    if (leadErr) console.error('[webhook] lead update error:', leadErr)

    // 2. Ensure advisor record exists (upsert by email)
    const advisorEmail = session.customer_details?.email ?? ''
    const advisorName  = session.customer_details?.name  ?? 'Adviser'

    const { data: advisor } = await supabase
      .from('advisors')
      .upsert(
        { id: advisorId, email: advisorEmail, full_name: advisorName },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    // 3. Record the transaction
    const { error: txErr } = await supabase
      .from('transactions')
      .insert({
        lead_id:       leadId,
        advisor_id:    advisor?.id ?? advisorId,
        amount,
        stripe_status: 'completed',
      })

    if (txErr) console.error('[webhook] transaction insert error:', txErr)
  }

  return NextResponse.json({ received: true })
}
