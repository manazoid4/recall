import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Recall — Capture everything. Find anything. Think faster.',
  description:
    'Your AI-powered knowledge layer — save from social, capture with voice, find anything with semantic search.',
  openGraph: {
    title: 'Recall',
    description: 'Capture everything. Find anything. Think faster.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-surface text-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
