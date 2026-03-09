
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth.js';
import User from '@/models/User.js';
import { initDB } from '@/lib/db.js';

// GET /api/admin/users
export async function GET() {
    await initDB();
    try {
        await verifyAdmin();
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt'],
        });
        return NextResponse.json(users);
    } catch (err) {
        if (err instanceof Response) return err;
        return NextResponse.json({ msg: 'Server Error' }, { status: 500 });
    }
}
