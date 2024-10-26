import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from './components/Header';
import { Providers } from '@/providers';
import { Toaster } from './components/shadcn/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pinterest Clone',
  description: 'Pinterest Clone with Next.js and Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="pt-16 min-h-screen bg-white">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
