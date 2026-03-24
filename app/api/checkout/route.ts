export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { stripe, LEAD_PRICE_GBP } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json()
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch lead to verify it exists and is not already purchased
    const { data: lead } = await supabase
      .from('leads')
      .select('id, is_purchased, first_name, age, asset_range')
      .eq('id', leadId)
      .single()

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    if (lead.is_purchased) return NextResponse.json({ error: 'Lead already purchased' }, { status: 409 })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency: 'gbp',
      line_items: [{
        price_data: {
          currency: 'gbp',
          unit_amount: LEAD_PRICE_GBP,
          product_data: {
            name: `RetireReady Lead — ${lead.first_name[0]}***, Age ${lead.age}`,
            description: `Asset range: ${lead.asset_range}. Exclusive retirement lead.`,
          },
        },
        quantity: 1,
      }],
      metadata: {
        lead_id:    leadId,
        advisor_id: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?purchase=success`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?purchase=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
