import type { Metadata } from 'next'
import FunnelWrapper from '@/components/funnel/FunnelWrapper'

export const metadata: Metadata = {
  title: 'Get Your Retirement Score | RetireReady',
  description: 'Answer 5 quick questions to get your personalised UK Retirement Readiness Score.',
}

export default function FunnelPage() {
  return <FunnelWrapper />
}
