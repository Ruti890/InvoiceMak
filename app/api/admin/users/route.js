import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/users
export async function GET() {
    try {
        await verifyAdmin();
        const supabase = await createClient();

        const { data: users, error } = await supabase
            .from('profiles')
            .select('id, name, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(users);
    } catch (err) {
        if (err instanceof Response) return err;
        console.error('[admin/users]', err);
        return NextResponse.json({ msg: 'Server Error' }, { status: 500 });
    }
}
