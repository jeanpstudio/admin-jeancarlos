'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Ejemplo de Server Action para cerrar sesión de usuario.
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Limpia el caché en el servidor y redirige a la página de login
  revalidatePath('/', 'layout')
  redirect('/login')
}
