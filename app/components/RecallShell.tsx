import Link from 'next/link';
import type { ReactNode } from 'react';

const navItems = [
  ['Dashboard', '/dashboard'],
  ['Capture', '/capture'],
  ['Instagram Inbox', '/instagram-inbox'],
  ['Signal OS', '/signal-os'],
  ['Inbox', '/inbox'],
  ['Profile', '/profile'],
  ['Personality', '/personality'],
  ['Taste', '/taste'],
  ['Patterns', '/patterns'],
  ['Intent', '/intent'],
  ['Memory', '/memory'],
  ['Graph', '/graph'],
  ['Projects', '/projects'],
  ['Prompts', '/prompts'],
  ['Ask', '/ask'],
  ['Export', '/export'],
  ['Settings', '/settings'],
];

export function RecallShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">R</span>
          <span>
            <strong>Recall</strong>
            <small>Agent memory OS</small>
          </span>
        </Link>
        <nav className="nav-list" aria-label="Recall navigation">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-surface">{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <div className="header-action">{action}</div> : null}
    </header>
  );
}

export function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

export function Section({ title, children, eyebrow }: { title: string; children: ReactNode; eyebrow?: string }) {
  return (
    <section className="section-block">
      <div className="section-title">
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function PillList({ items }: { items: string[] }) {
  return (
    <div className="pill-list">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export function EvidenceList({ ids }: { ids: string[] }) {
  return (
    <div className="evidence-list">
      <small>Profile Evidence</small>
      <div>
        {ids.map((id) => (
          <code key={id}>{id}</code>
        ))}
      </div>
    </div>
  );
}
