export const runtime = 'edge'

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Payments not yet configured' }, { status: 503 })
}
