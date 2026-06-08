import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Saved Brain — Turn your saved posts into a searchable AI knowledge base',
  description:
    'Pull everything you\'ve saved across Instagram, YouTube, X, TikTok, Reddit. AI-enrich it. Search by meaning. Share boards. Export to Obsidian.',
  openGraph: {
    title: 'Saved Brain',
    description: 'Turn your saved posts into a searchable AI knowledge base',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
