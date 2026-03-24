export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import AdvisorDashboardClient from '@/components/advisor/AdvisorDashboardClient'
import type { Lead } from '@/types'

export default async function AdvisorDashboardPage() {
  // Auth check — middleware already redirects unauthenticated users, but double-check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/advisor/login')

  // Fetch all leads via service role (bypasses RLS — advisors see everything in prototype)
  const service = createServiceClient()
  const { data: leads, error } = await service
    .from('leads')
    .select('id, created_at, first_name, email, phone, age, target_age, asset_range, current_income, desired_income, target_income, availability, is_purchased')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) console.error('Error fetching leads:', error)

  return (
    <AdvisorDashboardClient
      user={{ id: user.id, email: user.email ?? '' }}
      leads={(leads ?? []) as Lead[]}
    />
  )
}
