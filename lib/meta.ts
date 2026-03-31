// ─── Meta Pixel + CAPI helpers ────────────────────────────────────────────────
// Browser-side: wraps fbq() with safety guard and deduplication event_id
// Server-side CAPI: POST to /api/meta/event

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
    _fbq: unknown
  }
}

/** Generate a unique event ID for deduplication between browser pixel and CAPI */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Fire a Meta standard or custom event via the browser pixel */
export function trackPixel(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  const options = eventId ? { eventID: eventId } : undefined
  window.fbq('track', event, params ?? {}, options)
}

/** Fire a Meta custom event via the browser pixel */
export function trackPixelCustom(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  const options = eventId ? { eventID: eventId } : undefined
  window.fbq('trackCustom', event, params ?? {}, options)
}

/**
 * Send an event to Meta via the server-side Conversions API.
 * Automatically deduplicates with the browser pixel when the same eventId is used.
 */
export async function trackCapi(payload: {
  event: string
  eventId: string
  sourceUrl?: string
  email?: string    // plain text — hashed server-side
  phone?: string    // plain text — hashed server-side
  customData?: Record<string, unknown>
}): Promise<void> {
  try {
    await fetch('/api/meta/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // CAPI failure is non-fatal — browser pixel still fired
  }
}

/**
 * Fire an event via BOTH browser pixel and CAPI simultaneously.
 * Uses the same eventId so Meta deduplicates — counts as one event.
 */
export async function track(
  event: string,
  opts?: {
    params?: Record<string, unknown>
    email?: string
    phone?: string
    customData?: Record<string, unknown>
    custom?: boolean   // use trackCustom instead of track
  },
): Promise<void> {
  const eventId = generateEventId()

  if (opts?.custom) {
    trackPixelCustom(event, opts?.params, eventId)
  } else {
    trackPixel(event, opts?.params, eventId)
  }

  await trackCapi({
    event,
    eventId,
    sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    email: opts?.email,
    phone: opts?.phone,
    customData: opts?.customData ?? opts?.params,
  })
}
