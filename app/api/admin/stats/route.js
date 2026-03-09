
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth.js';
import User from '@/models/User.js';
import { Invoice } from '@/models/Invoice.js';
import sequelize, { initDB } from '@/lib/db.js';

// GET /api/admin/stats
export async function GET() {
    await initDB();
    try {
        await verifyAdmin();

        const totalUsers = await User.count();
        const totalInvoices = await Invoice.count();

        const [revenueResult] = await sequelize.query('SELECT SUM(total) as total_revenue FROM "Invoices"');
        const totalRevenue = parseFloat(revenueResult[0]?.total_revenue) || 0;

        return NextResponse.json({ totalUsers, totalInvoices, totalRevenue });
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ msg: 'Server Error' }, { status: 500 });
    }
}
