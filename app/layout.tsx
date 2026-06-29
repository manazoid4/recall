import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Recall', description: 'Private memory import for saved posts' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
