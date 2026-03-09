import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client for API Route Handlers and Server Components.
 * Uses anonymous key by default (respects RLS).
 * Pass useServiceRole=true only in trusted server-side admin operations.
 *
 * IMPORTANT: SUPABASE_SERVICE_ROLE_KEY must NEVER be sent to the browser.
 * It is only used here on the server when useServiceRole is explicitly true.
 */
export async function createClient(useServiceRole = false) {
    const cookieStore = await cookies();

    const supabaseKey = useServiceRole
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // In Server Components, cookies() is read-only.
                        // This is safe to ignore since the middleware handles refreshing.
                    }
                },
            },
        }
    );
}
