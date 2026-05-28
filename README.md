# Next.js + Supabase SaaS Starter

Bienvenido a la estructura base de tu nuevo proyecto Next.js (App Router) configurado profesionalmente con Supabase SSR, shadcn/ui y Tailwind CSS.

## 🚀 Tecnologías Principales
- **Framework**: [Next.js](https://nextjs.org/) (React 19, App Router)
- **Base de Datos / Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr`)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/)
- **Lenguaje**: TypeScript

## 📁 Estructura del Proyecto

El código fuente está ubicado enteramente dentro del directorio `src/`.

```
src/
├── actions/       # Server Actions de React (ej. auth.ts, mutaciones a DB)
├── app/           # App Router (páginas, layouts, endpoints)
├── components/    # Componentes de React
│   ├── features/  # Componentes de negocio/dominio
│   ├── layout/    # Estructura visual de la app (Header, Sidebar)
│   └── ui/        # Componentes base generados con shadcn/ui (ej. button.tsx)
├── hooks/         # Custom Hooks de React del lado del cliente (ej. useUser.ts)
├── lib/           # Utilidades sin relación directa con API/Auth (cn para Tailwind)
├── utils/         # Utilidades clave, wrappers y configuraciones
│   └── supabase/  # Helpers de Supabase:
│       ├── client.ts      - Cliente browser puro
│       ├── server.ts      - Cliente SSR con manejo de cookies en RSC
│       └── middleware.ts  - Helper para chequear/refrescar sesión en el edge
├── middleware.ts  # Redirige peticiones y protege rutas con Supabase auth
```

## 🛠️ Configuración Inicial

1. **Variables de Entorno**:
   Copia el archivo `.env.example` a `.env.local` si no existe y reemplaza los parámetros:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="tu-url-de-proyecto"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-de-proyecto"
   ```

2. **Supabase Auth**:
   Asegúrate de configurar en tu dashboard de Supabase (Authentication -> URL Configuration) la URL base para Next.js: `http://localhost:3000`.

## 🛡️ Autenticación y Protección de Rutas

Todas las peticiones son auditadas primero a través de `src/middleware.ts`. Este middleware hace uso de `src/utils/supabase/middleware.ts` el cual interfiere y lee de manera segura la sesión del cliente, refresca los tokens en background si es necesario y te permite, según tus directrices en `protectedRoutes` y `authRoutes`, bloquear el acceso de manera instantánea (Edge).

Para usar Supabase a profundidad en Server Components (`app/page.tsx`):
```tsx
import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <div>Hola {user?.email}</div>
}
```

## 🎨 Desarrollo y UI
- Ejecutar proyecto en local: `npm run dev`
- Añadir componentes shadcn: `npx shadcn@latest add <component>`
