import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente de Supabase para su uso en Server Components, Server Actions o API Routes.
 * Intercambia e inyecta las cookies necesarias para mantener la sesión de manera segura
 * en el backend.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zzzzzzzzzzzzzzzzzzzz.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Este try/catch es necesario porque a veces se puede llamar a setAll 
            // desde Server Components (lo cual lanzaría error si se llama de forma lazy), 
            // pero el Middleware debería ser el componente principal de setear/renovar 
            // las cookies.
          }
        },
      },
    }
  )
}
