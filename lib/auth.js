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

/**
 * Verifies the authenticated user AND checks for admin role.
 * Throws a NextResponse (403) if the user is not an admin.
 */
export async function verifyAdmin() {
    const user = await verifyAuth();
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        throw NextResponse.json({ msg: 'Access denied. Admin only.' }, { status: 403 });
    }

    return user;
}
