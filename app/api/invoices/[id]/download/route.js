export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';
import { generateInvoicePDFBuffer } from '@/services/pdfService.js';

// GET /api/invoices/[id]/download
export async function GET(request, { params }) {
    try {
        const user = await verifyAuth();
        const { id } = await params;

        const supabase = await createClient();

        // Fetch invoice with client and items using Supabase foreign key nested queries
        const { data: invoice, error } = await supabase
            .from('invoices')
            .select(`
                *,
                clients (*),
                invoice_items (*)
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const pdfBuffer = await generateInvoicePDFBuffer(invoice);

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
