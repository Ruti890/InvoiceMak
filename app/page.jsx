import { redirect } from 'next/navigation';

// Root page: redirect to dashboard (middleware handles auth guard)
export default function Home() {
    redirect('/dashboard');
}
