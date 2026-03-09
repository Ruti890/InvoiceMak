import PDFDocument from 'pdfkit';

/**
 * Generates an invoice PDF and returns it as a Buffer.
 * In Express, the doc was piped directly to res.
 * In Next.js Route Handlers, we collect chunks into a Buffer and return it as a Response.
 */
export function generateInvoicePDFBuffer(invoice) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // --- Header ---
        doc
            .fontSize(20)
            .text('INVOICE', { align: 'right' })
            .fontSize(10)
            .text(`Invoice Number: ${invoice.number}`, { align: 'right' })
            .text(`Date: ${invoice.date}`, { align: 'right' })
            .text(`Due Date: ${invoice.due_date || 'N/A'}`, { align: 'right' })
            .moveDown();

        // --- Company Info ---
        doc
            .fontSize(14)
            .text('InvoiceMaker Pro', { align: 'left' })
            .fontSize(10)
            .text('123 Business Street', { align: 'left' })
            .text('City, Country', { align: 'left' })
            .text('Phone: +1 234 567 890', { align: 'left' })
            .moveDown();

        // --- Client Info ---
        doc
            .fontSize(12)
            .text('Bill To:', { underline: true })
            .fontSize(10)
            .text(invoice.clients?.name || 'Unknown Client')
            .text(invoice.clients?.email || '')
            .text(invoice.clients?.address || '')
            .moveDown();

        // --- Table Header ---
        const tableTop = 250;
        const itemX = 50;
        const quantityX = 300;
        const priceX = 370;
        const totalX = 450;

        doc
            .font('Helvetica-Bold')
            .text('Description', itemX, tableTop)
            .text('Qty', quantityX, tableTop)
            .text('Price', priceX, tableTop)
            .text('Total', totalX, tableTop);

        doc
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();

        // --- Items ---
        let y = tableTop + 25;
        doc.font('Helvetica');

        const items = invoice.invoice_items || [];
        items.forEach((item) => {
            doc
                .text(item.description || 'Item', itemX, y)
                .text(item.quantity?.toString() || '1', quantityX, y)
                .text(`$${parseFloat(item.price || 0).toFixed(2)}`, priceX, y)
                .text(`$${parseFloat(item.total || 0).toFixed(2)}`, totalX, y);
            y += 20;
        });

        doc.moveTo(50, y).lineTo(550, y).stroke();

        // --- Totals ---
        y += 20;
        doc
            .font('Helvetica-Bold')
            .text('Subtotal:', 350, y, { width: 90, align: 'right' })
            .text(`$${parseFloat(invoice.subtotal).toFixed(2)}`, 440, y, { align: 'right' });

        y += 15;
        doc
            .text('Tax:', 350, y, { width: 90, align: 'right' })
            .text(`$${parseFloat(invoice.tax).toFixed(2)}`, 440, y, { align: 'right' });

        y += 15;
        doc
            .fontSize(12)
            .text('Total:', 350, y, { width: 90, align: 'right' })
            .text(`$${parseFloat(invoice.total).toFixed(2)}`, 440, y, { align: 'right' });

        // --- Footer ---
        doc
            .fontSize(10)
            .text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });

        doc.end();
    });
}
