export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const PIXEL_ID    = process.env.META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const API_VERSION = 'v19.0'

/** SHA-256 hash a string using Web Crypto (edge-compatible) */
async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value.trim().toLowerCase())
  const buf     = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(req: NextRequest) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    // Silently succeed if not configured (e.g. local dev without credentials)
    return NextResponse.json({ ok: true })
  }

  const body = await req.json() as {
    event: string
    eventId: string
    sourceUrl?: string
    email?: string
    phone?: string
    customData?: Record<string, unknown>
  }

  const { event, eventId, sourceUrl, email, phone, customData } = body

  // Build user_data with Advanced Matching — all fields must be hashed
  const user_data: Record<string, string> = {}

  // Always include client IP and user agent for better match quality
  const clientIp  = req.headers.get('cf-connecting-ip') ??
                    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
                    req.headers.get('x-real-ip') ?? ''
  const userAgent = req.headers.get('user-agent') ?? ''

  if (clientIp)  user_data['client_ip_address'] = clientIp
  if (userAgent) user_data['client_user_agent']  = userAgent

  if (email) user_data['em'] = await sha256(email)
  if (phone) {
    // Normalise: strip spaces, dashes, and leading +44 → 44
    const normPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '')
    user_data['ph'] = await sha256(normPhone)
  }

  const payload = {
    data: [
      {
        event_name:       event,
        event_time:       Math.floor(Date.now() / 1000),
        event_id:         eventId,
        event_source_url: sourceUrl ?? '',
        action_source:    'website',
        user_data,
        custom_data:      customData ?? {},
      },
    ],
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[MetaCAPI] Error:', err)
    }
  } catch (err) {
    console.error('[MetaCAPI] Fetch failed:', err)
  }

  return NextResponse.json({ ok: true })
}
