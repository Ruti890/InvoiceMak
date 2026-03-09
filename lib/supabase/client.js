'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase instance.
 * Uses NEXT_PUBLIC_ vars — safe to expose in the browser.
 * Import this in Client Components only.
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
}
