# Saved Brain — Design System

## Product Context
**Type:** Product (app UI, dashboard, tool)  
**Lane:** Productivity tool for knowledge workers, AI-enhanced second brain  
**Audience:** Researchers, writers, developers, marketers — people who save lots of content across platforms and never find it again  
**Voice:** Confident, minimal, no corporate speak. "Your brain, searchable" not "AI-powered knowledge management solution"  

## Anti-References
- Generic SaaS dashboard (Salesforce, Notion clone)
- Purple-blue gradients
- Cards nested in cards with 3px border-radius
- Gray text on colored backgrounds
- Rounded-square icon tiles above every heading
- Inter + Roboto for everything
- "AI-powered" hero badges
- Floating action buttons (Material Design)
- Sidebar with 20 icons

## Color Strategy
**Primary brand:** Yellow (#f59e0b) — warm, energetic, stands out  
**Dark ground:** Ink (#0f172a) — deep, focused, not pure black  
**Surface:** Panel (#ffffff) — clean, high contrast  
**Muted:** #64748b — secondary text, not gray-400  
**Line:** #e2e8f0 — borders, subtle dividers  
**Success:** Green (#22c55e) — sparingly, for states only  
**Error:** Red (#ef4444) — errors, sparingly  

## Typography
**Display:** Geist or system-ui (bold, tight tracking) — for headlines only  
**Body:** system-ui, -apple-system, sans-serif — 16px, 1.5 line-height  
**Scale:**  
- H1: 48px, font-black, -0.02em tracking  
- H2: 32px, font-bold  
- H3: 24px, font-bold  
- Body: 16px, font-normal  
- Small: 14px, text-muted  
- Caption: 12px, text-muted/70  

## Spacing
- Base: 4px grid
- Page padding: 24px (mobile), 32px (desktop)
- Section gap: 64px
- Card padding: 24px
- Component gap: 16px
- No "card in card" — one surface depth only

## Components
**Buttons:**
- Primary: bg-yellow, text-ink, rounded-lg, font-bold
- Secondary: border-line, text-ink, rounded-lg
- Ghost: transparent, text-muted, hover:text-ink

**Cards:**
- Single depth: border-line, bg-panel, rounded-xl
- Shadow: shadow-sm only on hover
- No nested cards

**Inputs:**
- bg-panel, border-line, rounded-lg
- Focus: ring-2 ring-yellow/50
- No floating labels

**Navigation:**
- Sidebar: fixed, 240px, border-r border-line
- Active: border-l-4 border-yellow, bg-yellow/10
- Mobile: slide-in overlay

## Animation
- Transitions: 150ms ease-out
- Hover: -translate-y-0.5, shadow-sm
- Page transitions: none (keep it fast)
- Loading: skeleton shimmer, no spinners

## Layout Rules
- Marketing pages (/, /pricing, /privacy, /terms): NO sidebar, full width
- App pages (/library, /boards, /graph, /settings): Sidebar + content area
- Onboarding: centered, max-w-lg, clean background
- Max content width: 1280px

## Responsive
- Mobile-first
- Sidebar collapses to hamburger on < 1024px
- Grid: 1 column mobile, 2 tablet, 3 desktop
- No horizontal scroll ever

## Performance
- No images above the fold
- Lazy load thumbnails
- Priority: content > decoration
- First paint < 1s target
