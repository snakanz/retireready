import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ScheduleClient from '@/components/dashboard/ScheduleClient'

interface Props {
  params: { leadId: string }
}

export default async function SchedulePage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify this advisor owns this lead
  const { data: transaction } = await supabase
    .from('transactions')
    .select('id, leads (id, first_name, availability)')
    .eq('lead_id', params.leadId)
    .eq('advisor_id', user.id)
    .single()

  if (!transaction?.leads) redirect('/dashboard')

  // Fetch existing appointment if any
  const { data: existing } = await supabase
    .from('appointments')
    .select('*')
    .eq('lead_id', params.leadId)
    .eq('advisor_id', user.id)
    .maybeSingle()

  return (
    <ScheduleClient
      lead={transaction.leads as unknown as { id: string; first_name: string; availability: string[] }}
      advisorId={user.id}
      existingAppointment={existing}
    />
  )
}
