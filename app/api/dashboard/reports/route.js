import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';

// GET /api/dashboard/reports?month=5&year=2026
export async function GET(request) {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();
        
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;
        const year = parseInt(searchParams.get('year')) || new Date().getFullYear();

        // Fetch all invoices for the user
        const { data: invoices, error: invoiceError } = await supabase
            .from('invoices')
            .select(`
                *,
                clients (*),
                invoice_items (*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (invoiceError) throw invoiceError;

        // Helper function to check if invoice is in the selected month
        const isInMonth = (dateStr) => {
            const d = new Date(dateStr);
            return d.getMonth() + 1 === month && d.getFullYear() === year;
        };

        // Filter invoices for the selected month
        const monthInvoices = invoices.filter(inv => isInMonth(inv.created_at));

        // Calculate metrics
        const totalRevenue = monthInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
        const emittedCount = monthInvoices.length;
        
        // Tasa de cobro: porcentaje de facturas pagadas vs total
        const paidCount = monthInvoices.filter(inv => inv.status?.toLowerCase() === 'paid').length;
        const collectionRate = emittedCount > 0 ? Math.round((paidCount / emittedCount) * 100) : 0;

        // Top clients for the month
        const clientStats = {};
        monthInvoices.forEach(inv => {
            const clientName = inv.clients?.name || 'Cliente Desconocido';
            if (!clientStats[clientName]) {
                clientStats[clientName] = { name: clientName, total: 0, count: 0 };
            }
            clientStats[clientName].total += parseFloat(inv.total || 0);
            clientStats[clientName].count += 1;
        });

        const topClients = Object.values(clientStats)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        // Group invoices by status
        const statusCounts = {
            paid: monthInvoices.filter(inv => inv.status?.toLowerCase() === 'paid').length,
            pending: monthInvoices.filter(inv => inv.status?.toLowerCase() === 'pending').length,
            sent: monthInvoices.filter(inv => inv.status?.toLowerCase() === 'sent').length,
            overdue: monthInvoices.filter(inv => inv.status?.toLowerCase() === 'overdue').length,
            draft: monthInvoices.filter(inv => inv.status?.toLowerCase() === 'draft').length,
        };

        // Recent invoices (last 10)
        const recentInvoices = monthInvoices.slice(0, 10);

        return NextResponse.json({
            month,
            year,
            totalRevenue,
            emittedCount,
            collectionRate,
            topClients,
            statusCounts,
            recentInvoices,
        });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error('[dashboard/reports]', err);
        return NextResponse.json({ msg: 'Server Error' }, { status: 500 });
    }
}
