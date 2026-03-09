import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';

// GET /api/invoices/[id]
export async function GET(request, { params }) {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();
        const { id } = await params;

        const { data, error } = await supabase
            .from('invoices')
            .select(`*, clients ( id, name, email ), invoice_items ( * )`)
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error || !data) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        return NextResponse.json(data);
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT /api/invoices/[id]
export async function PUT(request, { params }) {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();
        const { id } = await params;
        const { clientId, items, taxRate = 0, notes, dueDate } = await request.json();

        // Verify ownership & get existing items
        const { data: existingInvoice, error: fetchError } = await supabase
            .from('invoices')
            .select(`*, invoice_items (*)`)
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingInvoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Restore stock from old items
        for (const oldItem of existingInvoice.invoice_items) {
            if (oldItem.product_id) {
                const { data: prod } = await supabase.from('products').select('stock').eq('id', oldItem.product_id).single();
                if (prod) {
                    await supabase.from('products').update({ stock: prod.stock + oldItem.quantity }).eq('id', oldItem.product_id);
                }
            }
        }

        // Delete old items
        await supabase.from('invoice_items').delete().eq('invoice_id', id);

        // Build new items
        let subtotal = 0;
        const invoiceItemsData = [];

        for (const item of items) {
            const { data: product } = await supabase.from('products').select('*').eq('id', item.productId).single();
            if (!product) return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
            if (product.stock < item.quantity) {
                return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
            }

            const price = parseFloat(product.price);
            const itemTotal = item.quantity * price;
            subtotal += itemTotal;

            invoiceItemsData.push({ invoice_id: id, description: product.name, quantity: item.quantity, price, total: itemTotal, product_id: product.id });
            await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', product.id);
        }

        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;

        await supabase.from('invoices').update({ client_id: clientId, due_date: dueDate, subtotal, tax, total, notes }).eq('id', id);
        await supabase.from('invoice_items').insert(invoiceItemsData);

        const { data: finalInvoice } = await supabase
            .from('invoices').select(`*, clients (id, name, email), invoice_items (*)`).eq('id', id).single();

        return NextResponse.json(finalInvoice);
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

// DELETE /api/invoices/[id]
export async function DELETE(request, { params }) {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();
        const { id } = await params;

        // invoice_items are cascade-deleted by the DB foreign key constraint
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
        return NextResponse.json({ message: 'Invoice deleted' });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
