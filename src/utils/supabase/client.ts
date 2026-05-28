import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente de Supabase para su uso en Client Components (del lado del navegador).
 * Este cliente ya viene preconfigurado con las variables de entorno para usar
 * los tokens de Supabase y las credenciales anónimas.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zzzzzzzzzzzzzzzzzzzz.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.key'
  )
}
