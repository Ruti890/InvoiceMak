import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

/**
 * Next.js middleware — runs on every request.
 * Refreshes the Supabase session cookie so it never expires mid-session.
 * Protects /dashboard/* routes by redirecting unauthenticated users to /login.
 */
export async function middleware(request) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: do not add any logic between createServerClient and getUser().
    // This refresh keeps the session alive.
    const { data: { user } } = await supabase.auth.getUser();

    const { pathname, searchParams } = request.nextUrl;

    // --- AUTOMATIC CALLBACK BRIDGE ---
    // If the URL has a 'code' from Supabase email, redirect to our callback handler
    const code = searchParams.get('code');
    if (code && pathname === '/') {
        const callbackUrl = request.nextUrl.clone();
        callbackUrl.pathname = '/auth/callback';
        // We preserve the code and set our success page as the final destination
        callbackUrl.searchParams.set('next', '/auth/success');
        return NextResponse.redirect(callbackUrl);
    }

    // Redirect unauthenticated users away from protected routes
    const isProtected = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/clients') ||
        pathname.startsWith('/products') ||
        pathname.startsWith('/invoices') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/admin');

    if (isProtected && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if ((pathname === '/login' || pathname === '/register') && user) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/dashboard';
        return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/).*)',
    ],
};
