import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '../globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Saved Brain — Your Knowledge Base',
  description: 'Search, organize, and enrich your saved content.',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-surface text-ink antialiased">
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-64">
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
