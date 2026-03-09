import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';

// GET /api/dashboard/stats
export async function GET() {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();

        const [
            { count: totalInvoices },
            { count: totalClients },
            { count: totalProducts },
            { data: revenueData },
            { data: recentInvoices },
        ] = await Promise.all([
            supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('invoices').select('total').eq('user_id', user.id),
            supabase.from('invoices')
                .select(`*, clients ( name )`)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5),
        ]);

        const totalRevenue = revenueData?.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0) ?? 0;

        return NextResponse.json({
            totalInvoices: totalInvoices ?? 0,
            totalClients: totalClients ?? 0,
            totalProducts: totalProducts ?? 0,
            totalRevenue,
            recentInvoices: recentInvoices ?? [],
        });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
