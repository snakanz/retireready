export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, fullName, email, phone, firmName, fcaNumber, specialty } = body

  if (!userId || !fullName || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase.from('advisor_profiles').insert({
    id:             userId,
    full_name:      fullName,
    email:          email,
    phone:          phone ?? null,
    firm_name:      firmName ?? null,
    fca_number:     fcaNumber ?? null,
    specialty:      specialty ?? null,
    status:         'pending',
    wallet_balance: 0,   // set to 30000 (£300) on approval by admin
  })

  if (error) {
    console.error('[advisor/apply] Failed to create profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
