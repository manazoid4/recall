import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '../globals.css';

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
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-surface text-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
