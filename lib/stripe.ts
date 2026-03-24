import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
  httpClient: Stripe.createFetchHttpClient(),
})

export const LEAD_PRICE_GBP = 4900 // £49.00 in pence
