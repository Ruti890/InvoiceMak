import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth.js';
import { createClient } from '@/lib/supabase/server';

// GET /api/invoices
export async function GET() {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                clients ( id, name, email ),
                invoice_items ( * )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/invoices
export async function POST(request) {
    try {
        const user = await verifyAuth();
        const supabase = await createClient();
        const { clientId, items, taxRate = 0, notes, dueDate } = await request.json();

        let subtotal = 0;
        const invoiceItemsData = [];

        for (const item of items) {
            const { data: product, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', item.productId)
                .single();

            if (productError || !product) {
                return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
                    { status: 400 }
                );
            }

            const price = parseFloat(product.price);
            const itemTotal = item.quantity * price;
            subtotal += itemTotal;

            invoiceItemsData.push({
                description: product.name,
                quantity: item.quantity,
                price,
                total: itemTotal,
                product_id: product.id,
            });

            // Decrement stock
            await supabase
                .from('products')
                .update({ stock: product.stock - item.quantity })
                .eq('id', product.id);
        }

        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;

        // Create the invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                user_id: user.id,
                client_id: clientId,
                date: new Date().toISOString().split('T')[0],
                due_date: dueDate,
                subtotal,
                tax,
                total,
                notes,
                status: 'sent',
            })
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        // Insert invoice items
        const itemsWithInvoiceId = invoiceItemsData.map(item => ({
            ...item,
            invoice_id: invoice.id,
        }));

        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;

        // Return invoice with relations
        const { data: finalInvoice, error: finalError } = await supabase
            .from('invoices')
            .select(`*, clients ( id, name, email ), invoice_items ( * )`)
            .eq('id', invoice.id)
            .single();

        if (finalError) throw finalError;
        return NextResponse.json(finalInvoice, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
