import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Función encargada de mantener la consistencia de la sesión en cada Edge Request.
 * Este middleware lee la cookie, verifica su expiración y de ser necesario la refresca
 * sin interactuar manual ni intrusivamente con el enrutador si no hay errores de auth.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zzzzzzzzzzzzzzzzzzzz.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          // Regeneramos la respuesta con las nuevas cookies embebidas
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Obtener al usuario activo refresca también los tokens si estaban a punto de expirar
  let user = null;
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    // Si no hay Supabase configurado y es un dummy project, ignoramos el fallo para no romper la app entera.
  }

  // --- Lógica de Protección de Rutas (Middleware Autorización) ---
  
  // Array de rutas que consideramos requiridas para estar logueado.
  // Podrías por ejemplo validar si empieza por /dashboard
  const protectedRoutes = ['/dashboard', '/account', '/settings']
  const isProtectedRoute = protectedRoutes.some((route) => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Array de rutas públicas exclusivas para NO logueados (e.g., login, register)
  const authRoutes = ['/login', '/register', '/forgot-password']
  const isAuthRoute = authRoutes.some((route) => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Si intentan ir a una ruta privada y no están autenticados -> redirigimos a login
  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Si intentan ir a una ruta pública (login) que no necesitan estando ya autenticados -> al dashboard
  if (isAuthRoute && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // Si no se redirigió, se devuelve la respuesta principal de supabase
  return supabaseResponse
}
