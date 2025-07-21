import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a Supabase client for use in Server Components and API routes
export const createClerkSupabaseClientServer = async () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      // Get the Clerk session token
      fetch: async (url, options = {}) => {
        const { getToken } = await auth()
        
        const clerkToken = await getToken({
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

// Admin client for server-side operations that need elevated permissions
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)