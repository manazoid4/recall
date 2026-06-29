import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Recall - Personal Intelligence Layer',
  description: 'A private memory graph and agent brain built from user-owned evidence.',
  openGraph: {
    title: 'Recall',
    description: 'A private memory graph and agent brain built from user-owned evidence.',
    type: 'website',
  },
};

// Inline script: restores dark/light preference before React hydrates.
// Prevents flash-of-wrong-theme on page load.
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (_) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {/* suppressHydrationWarning: avoids mismatch from .dark class set by themeScript */}
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="min-h-screen bg-surface text-ink antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
