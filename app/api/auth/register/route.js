import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ msg: 'All fields are required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }, // stored in auth.users.raw_user_meta_data
            },
        });

        if (error) {
            return NextResponse.json({ msg: error.message }, { status: 400 });
        }

        // Insert a row in the profiles table using service role to bypass RLS
        const supabaseAdmin = await createClient(true);
        await supabaseAdmin.from('profiles').insert({
            id: data.user.id,
            name,
            role: 'user',
        });

        return NextResponse.json({ msg: 'User registered successfully' }, { status: 201 });
    } catch (err) {
        console.error('[register]', err);
        return NextResponse.json({ msg: 'Server error' }, { status: 500 });
    }
}
