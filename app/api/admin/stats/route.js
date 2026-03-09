import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/stats
export async function GET() {
    try {
        await verifyAdmin();
        const supabase = await createClient();

        // Get total users
        const { count: totalUsers, error: userError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (userError) throw userError;

        // Get total invoices and total revenue
        const { data: invoices, error: invoiceError } = await supabase
            .from('invoices')
            .select('total');

        if (invoiceError) throw invoiceError;

        const totalInvoices = invoices.length;
        const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);

        return NextResponse.json({ totalUsers, totalInvoices, totalRevenue });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error('[admin/stats]', err);
        return NextResponse.json({ msg: 'Server Error' }, { status: 500 });
    }
}
