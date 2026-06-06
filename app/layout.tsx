import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CarGo — Saudi\'s Peer-to-Peer Car Rental Platform',
  description: 'CarGo connects vehicle owners and renters through a managed hub model in Riyadh. Seamless bookings, verified vehicles, and secure payments.',
  keywords: 'car rental, Saudi Arabia, Riyadh, peer-to-peer, CarGo, Flutter app',
  openGraph: {
    title: 'CarGo — Rent Smarter',
    description: 'Saudi Arabia\'s first peer-to-peer car rental platform with a managed hub model.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '8px', fontSize: '14px' },
              success: { iconTheme: { primary: '#004B09', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
