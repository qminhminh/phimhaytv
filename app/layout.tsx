import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import QueryProvider from '@/components/providers/QueryProvider';

export const runtime = 'edge';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PhimHayTV - Phim HD chất lượng cao',
  description: 'PhimHayTV là nơi để bạn tìm kiếm và xem phim HD chất lượng cao.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-[#121212] text-[#EAEAEA]">
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
          </div>
        </QueryProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}