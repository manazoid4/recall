'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  Library,
  LayoutGrid,
  GitBranch,
  Mic,
  Upload,
  Settings,
  Menu,
  X,
  Plus,
  Crown,
  Route,
} from 'lucide-react';
import { useState } from 'react';
import { UserButton, useAuth } from '@clerk/nextjs';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { href: '/library',  label: 'Library',  icon: Library    },
  { href: '/boards',   label: 'Boards',   icon: LayoutGrid  },
  { href: '/capture',  label: 'Capture',  icon: Mic         },
  { href: '/router',    label: 'Router',   icon: Route       },
  { href: '/graph',    label: 'Graph',    icon: GitBranch   },
  { href: '/upload',   label: 'Upload',   icon: Upload      },
  { href: '/settings', label: 'Settings', icon: Settings    },
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
        className="fixed left-4 top-4 z-50 rounded-lg border border-line bg-panel p-2 shadow-card lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-muted" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
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

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow shadow-sm transition-transform group-hover:scale-105">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-ink">
                Recall
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-overlay hover:text-ink lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Quick Add ──────────────────────────────────────────────────── */}
          <div className="px-3 pt-3">
            <Link
              href="/upload"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg bg-yellow px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange hover:shadow-glow-amber active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Content
            </Link>
          </div>

          {/* ── Navigation ─────────────────────────────────────────────────── */}
          <nav className="flex-1 space-y-0.5 px-2 py-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-yellow/10 text-yellow'
                      : 'text-muted hover:bg-overlay hover:text-ink'
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${isActive ? 'text-yellow' : ''}`}
                  />
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-yellow" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          <div className="space-y-2 border-t border-line px-3 py-3">
            {isSignedIn && (
              <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                <UserButton />
                <span className="text-sm text-muted">Account</span>
              </div>
            )}

            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg border border-yellow/30 bg-yellow/5 px-3 py-2 text-sm font-semibold text-yellow transition-all hover:border-yellow/50 hover:bg-yellow/10"
            >
              <Crown className="h-4 w-4 shrink-0" />
              Upgrade to Pro
            </Link>
          </div>

        </div>
      </aside>
    </>
  );
}
