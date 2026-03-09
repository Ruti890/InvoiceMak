import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ msg: 'Email and password are required' }, { status: 400 });
        }

        const supabase = await createClient();

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return NextResponse.json({ msg: 'Invalid credentials' }, { status: 400 });
        }

        return NextResponse.json({ msg: 'Login successful' });
    } catch (err) {
        console.error('[login]', err);
        return NextResponse.json({ msg: 'Server error' }, { status: 500 });
    }
}
