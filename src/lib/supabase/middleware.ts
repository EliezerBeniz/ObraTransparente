import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/'
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth')
  const isStaticFile = request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|json|webmanifest)$/)

  // 1. Se NÃO estiver logado e NÃO estiver na login (/) ou callback
  if (!user && !isLoginPage && !isAuthCallback && !isStaticFile) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // 2. Se ESTIVER logado e estiver na login (/) e não estiver explicitamente deslogando
  if (user && isLoginPage && !request.nextUrl.searchParams.has('logout')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 3. Se ESTIVER logado mas NÃO for admin e tentar acessar /admin/*
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
      // Fast path: Check cookie first
      const roleCookie = request.cookies.get('app-user-role')?.value;
      if (roleCookie === 'admin') {
        return supabaseResponse;
      }

      // Fallback: Check database if cookie is missing or not admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      
      if (roleError) {
          console.error('[Middleware] Error fetch user_roles:', roleError)
      }
      
      if (roleData?.role !== 'admin') {
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard'
          return NextResponse.redirect(url)
      }
  }

  return supabaseResponse
}
