import type { Metadata } from 'next'
import './globals.css'
import MetaPixel from '@/components/MetaPixel'

export const metadata: Metadata = {
  title: 'RetireReady — UK Retirement Planning',
  description:
    'Discover your retirement readiness score and connect with a qualified UK financial adviser. Free personalised projection in under 2 minutes.',
  keywords: [
    'UK retirement planning',
    'pension advice',
    'financial adviser',
    'retirement calculator',
    'pension pot',
    'SIPP',
    'retirement income',
  ],
  authors: [{ name: 'RetireReady' }],
  openGraph: {
    title: 'RetireReady — Know Your Retirement Number',
    description: 'Free UK retirement readiness score in 2 minutes. Match with a regulated financial adviser.',
    type: 'website',
    locale: 'en_GB',
    siteName: 'RetireReady',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RetireReady — UK Retirement Planning',
    description: 'Free retirement readiness score. Connect with a regulated UK adviser.',
  },
  robots: { index: true, follow: true },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  )
}
