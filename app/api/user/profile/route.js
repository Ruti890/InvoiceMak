export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';

// POST /api/user/profile
export async function POST(request) {
    try {
        const user = await verifyAuth();
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Update or insert the profiles table
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, name })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ msg: 'Profile updated successfully', user: data });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error('[profile update]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
