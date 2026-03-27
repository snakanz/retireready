export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import AdvisorDashboardClient from '@/components/advisor/AdvisorDashboardClient'
import type { Lead, WalletTransaction, LeadPurchase, LeadStatus } from '@/types'

export default async function AdvisorDashboardPage() {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/advisor/login')

  const service = createServiceClient()

  // Check approval status first
  const { data: profileCheck } = await service
    .from('advisor_profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  if (!profileCheck || profileCheck.status !== 'approved') {
    redirect('/advisor/pending')
  }

  // Fetch all leads
  const { data: leads, error: leadsError } = await service
    .from('leads')
    .select('id, created_at, first_name, email, phone, age, target_age, asset_range, current_income, desired_income, target_income, availability, is_purchased, view_count')
    .order('created_at', { ascending: false })
    .limit(200)

  if (leadsError) console.error('Error fetching leads:', leadsError)

  // Fetch advisor profile
  const { data: profile } = await service
    .from('advisor_profiles')
    .select('wallet_balance, free_leads_used, referral_code')
    .eq('id', user.id)
    .single()

  // Fetch referral stats
  const { data: referralRewards } = await service
    .from('referral_rewards')
    .select('amount')
    .eq('referrer_id', user.id)

  const referralCount  = referralRewards?.length ?? 0
  const rewardsEarned  = referralRewards?.reduce((sum, r) => sum + r.amount, 0) ?? 0

  // Fetch wallet transactions (last 20)
  const { data: transactions } = await service
    .from('wallet_transactions')
    .select('id, created_at, amount, type, description, lead_id')
    .eq('advisor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch lead purchases for this advisor
  const { data: purchases } = await service
    .from('lead_purchases')
    .select('lead_id, amount_paid, is_free')
    .eq('advisor_id', user.id)

  // Fetch lead statuses for this advisor
  const { data: statuses } = await service
    .from('lead_statuses')
    .select('lead_id, status')
    .eq('advisor_id', user.id)

  return (
    <AdvisorDashboardClient
      user={{ id: user.id, email: user.email ?? '' }}
      leads={(leads ?? []) as Lead[]}
      walletBalance={profile?.wallet_balance ?? 0}
      freeLeadsUsed={profile?.free_leads_used ?? 0}
      transactions={(transactions ?? []) as WalletTransaction[]}
      purchases={(purchases ?? []) as LeadPurchase[]}
      statuses={(statuses ?? []) as LeadStatus[]}
      referralCode={profile?.referral_code ?? ''}
      referralCount={referralCount}
      rewardsEarned={rewardsEarned}
    />
  )
}
