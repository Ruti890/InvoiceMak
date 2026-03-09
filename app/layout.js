import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
    title: 'Lexis ',
    description: 'Organize your processes',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="bg-[#0a0a0a] text-gray-100 antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
