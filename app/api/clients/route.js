import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';

// GET /api/clients
export async function GET() {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/clients
export async function POST(request) {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();
        const body = await request.json();

        const nit = body.nit || `NIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const { data, error } = await supabase
            .from('clients')
            .insert({ ...body, nit, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
