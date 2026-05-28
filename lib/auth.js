import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Verifies the authenticated user from the Supabase session cookie.
 * Returns the user object { id, email, ... }
 * OR throws a NextResponse (401) if not authenticated.
 *
 * Use in API route handlers (Server-side only).
 */
export async function verifyAuth() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw NextResponse.json({ msg: 'Not authenticated' }, { status: 401 });
    }

    return user; // { id, email, ... }
}
