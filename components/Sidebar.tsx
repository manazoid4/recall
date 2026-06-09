'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  Library,
  LayoutGrid,
  GitBranch,
  Upload,
  Settings,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import { UserButton, useAuth } from '@clerk/nextjs';

const navItems = [
  { href: '/library', label: 'Library', icon: Library },
  { href: '/boards', label: 'Boards', icon: LayoutGrid },
  { href: '/graph', label: 'Graph', icon: GitBranch },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-line bg-panel p-2 shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-ink" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-line bg-panel transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-ink">Recall</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 text-muted hover:bg-surface lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Add Button */}
          <div className="px-3 pt-4">
            <Link
              href="/upload"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange"
            >
              <Plus className="h-4 w-4" />
              Add Content
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-l-4 border-yellow bg-yellow/10 text-ink'
                      : 'text-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-line px-6 py-4 space-y-3">
            {isSignedIn && (
              <div className="flex items-center gap-3">
                <UserButton />
                <span className="text-sm text-muted">Account</span>
              </div>
            )}
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-yellow px-4 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-orange"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
