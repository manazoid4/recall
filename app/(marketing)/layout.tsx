import type { Metadata } from 'next';

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

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
