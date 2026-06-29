import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recall - Personal Intelligence Layer',
  description: 'A private memory graph and agent brain built from user-owned evidence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
