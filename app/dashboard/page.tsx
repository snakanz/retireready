import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type { Transaction } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch marketplace leads (unpurchased)
  const { data: marketplaceLeads } = await supabase
    .from('leads')
    .select('id, created_at, first_name, age, target_age, asset_range, target_income, availability, is_purchased')
    .eq('is_purchased', false)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch advisor's purchased leads (via transactions)
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id, created_at, lead_id, advisor_id, amount, stripe_status,
      leads (id, first_name, email, phone, age, target_age, asset_range, target_income, availability, is_purchased, created_at)
    `)
    .eq('advisor_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      user={user}
      marketplaceLeads={marketplaceLeads ?? []}
      transactions={(transactions ?? []) as unknown as Transaction[]}
    />
  )
}
