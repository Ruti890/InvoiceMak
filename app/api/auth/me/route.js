import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/auth/me — returns the currently authenticated user
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ msg: 'Not authenticated' }, { status: 401 });
        }

        // Fetch profile for name and role
        const { data: profile } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', user.id)
            .single();

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: profile?.name ?? user.user_metadata?.name ?? '',
            role: profile?.role ?? 'user',
        });
    } catch (err) {
        console.error('[me GET]', err);
        return NextResponse.json({ msg: 'Server error' }, { status: 500 });
    }
}

// POST /api/auth/me — logout (clears session)
export async function POST() {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();
        return NextResponse.json({ msg: 'Logged out' });
    } catch (err) {
        console.error('[me POST]', err);
        return NextResponse.json({ msg: 'Server error' }, { status: 500 });
    }
}
