import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Extend Window interface to include Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: (options: { template: string }) => Promise<string | null>
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client for use in Client Components
export const createClerkSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      // Get the Clerk session token
      fetch: async (url, options = {}) => {
        const clerkToken = await window.Clerk?.session?.getToken({
          template: 'supabase',
        })

        // Insert the Clerk Supabase token into the headers
        const headers = new Headers(options?.headers)
        headers.set('Authorization', `Bearer ${clerkToken}`)

        // Pass the modified fetch request to Supabase
        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  })
}

// For server-side operations that require elevated permissions
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Basic client for non-authenticated operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)