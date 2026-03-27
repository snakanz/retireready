export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, notes } = body

  if (!email || typeof email !== 'string' || typeof notes !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('leads')
    .update({ notes: notes.trim() })
    .eq('email', email.toLowerCase().trim())

  if (error) {
    console.error('[notes API] Failed to save notes:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
