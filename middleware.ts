import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication — and where to redirect if not authenticated
const PROTECTED: { prefix: string; loginUrl: string }[] = [
  { prefix: '/dashboard',         loginUrl: '/login'          },
  { prefix: '/schedule',          loginUrl: '/login'          },
  { prefix: '/advisor/dashboard', loginUrl: '/advisor/login'  },
]

export async function middleware(req: NextRequest) {
  const res  = NextResponse.next()
  const path = req.nextUrl.pathname

  const rule = PROTECTED.find(r => path.startsWith(r.prefix))
  if (!rule) return res

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookies.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL(rule.loginUrl, req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/schedule/:path*', '/advisor/dashboard/:path*'],
}
