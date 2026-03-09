import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';

// PUT /api/clients/[id]
export async function PUT(request, { params }) {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();
        const body = await request.json();
        const { id } = await params;

        const { data, error } = await supabase
            .from('clients')
            .update(body)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error || !data) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        return NextResponse.json(data);
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

// DELETE /api/clients/[id]
export async function DELETE(request, { params }) {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();
        const { id } = await params;

        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        return NextResponse.json({ message: 'Client deleted' });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
