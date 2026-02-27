# Decora UI Skills Guide

A living reference for building UI in this project. All components are built on **shadcn/ui** and styled with the project's existing color system. The visual language is **clean, feminine, cute, and intuitive**.

---

## 1. Design Philosophy

| Principle | How it shows up |
|---|---|
| **Clean** | Generous whitespace, clear hierarchy, no decorative clutter |
| **Feminine** | Soft edges, pill shapes, gentle gradients, light backgrounds |
| **Cute** | Rounded corners (`rounded-2xl`, `rounded-full`), subtle hover animations |
| **Intuitive** | Obvious affordances, consistent status feedback, predictable layouts |

---

## 2. Color System

All colors derive from the variables defined in `src/app/globals.css`. Never hardcode hex values — always reference the CSS custom properties via Tailwind utilities.

```css
/* src/app/globals.css */
--background:          #ffffff   /* Page backgrounds */
--foreground:          #171717   /* Body text */
--primary:             #7fa095   /* Sage green — buttons, badges, accents */
--primary-foreground:  #ffffff   /* Text on primary backgrounds */
--primary-soft:        #eef4f2   /* Very light sage — subtle backgrounds, chips */
```

### Tailwind Utility Mapping

| Token | Tailwind class |
|---|---|
| Primary fill | `bg-primary` |
| Primary text | `text-primary` |
| Soft background | `bg-primary-soft` |
| Primary border | `border-primary/20` |
| Primary hover | `hover:bg-primary/90` |
| Subtle tint | `bg-primary/5` to `bg-primary/10` |
| Focus ring | `focus:ring-4 focus:ring-primary/15` |

### Status Color Convention

Status colors use Tailwind semantic palettes that complement the sage primary. These are already used in `InquiryStatusBadge.tsx` and should remain consistent across the entire app.

| Status | Background | Text | Border |
|---|---|---|---|
| `NEW` | `bg-primary/10` | `text-primary` | `border-primary/20` |
| `QUOTED_WAITING` / `WAITING_ON_CLIENT` | `bg-amber-50` | `text-amber-700` | `border-amber-200` |
| `BOOKED` / `ACCEPTED_NOT_BOOKED` | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` |
| `LOST` / `DISQUALIFIED` | `bg-stone-100` | `text-stone-500` | `border-stone-200` |
| `EXPIRED` | `bg-stone-50` | `text-stone-400` | `border-stone-200` |

---

## 3. shadcn/ui Setup

This project uses **Tailwind v4**. Initialize shadcn with the `canary` tag to ensure compatibility:

```bash
npx shadcn@canary init
```

During init:
- Style: **Default**
- Base color: **Stone** (closest neutral to the existing palette)
- CSS variables: **Yes**

After init, override the generated `--primary` in `globals.css` with the project values — do not let shadcn replace them.

### Components to Install

Install these as needed:

```bash
npx shadcn@canary add badge button card dialog form input label select skeleton table tabs
```

---

## 4. Component Conventions

### Buttons

```tsx
// Primary action
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
  Save
</Button>

// Ghost / secondary
<Button variant="ghost" className="text-primary hover:bg-primary/10 rounded-full">
  Cancel
</Button>

// Destructive (use sparingly)
<Button variant="destructive" className="rounded-full">
  Delete
</Button>
```

### Cards

```tsx
<Card className="rounded-2xl border border-primary/15 bg-white/75 backdrop-blur shadow-sm">
  <CardHeader>
    <CardTitle className="text-stone-800 text-lg font-semibold">Title</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Status Badges

Always use the `InquiryStatusBadge` component (or extend it) — never inline raw status strings.

```tsx
// src/components/inquiries/InquiryStatusBadge.tsx
// Pattern: pill shape, soft background, colored text, thin border
<span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border bg-primary/10 text-primary border-primary/20">
  New
</span>
```

---

## 5. Table Design

Tables use the shadcn `Table` component. Every data table in the app must follow this structure:

```
┌─ Filter Tabs ────────────────────────────────────────────────┐
│  [ All ]  [ New ]  [ Quoted ]  [ Booked ]  [ Lost ]          │
└──────────────────────────────────────────────────────────────┘
┌─ Table ──────────────────────────────────────────────────────┐
│  Client         Event Type    Date       Status    Actions   │
│  ─────────────────────────────────────────────────────────── │
│  Jane Doe       Wedding       Mar 2026   ● New     View Edit │
│  Maria Smith    Quinceañera   Apr 2026   ⏳ Quoted  View Edit │
└──────────────────────────────────────────────────────────────┘
```

### Rules

- **Status** column is always a `Badge` — never plain text
- **Actions** column is always rightmost, using icon buttons or text links
- **Hover**: `hover:bg-primary/5` on each row
- **Empty state**: centered illustration/icon + friendly message
- **Loading state**: `Skeleton` rows with the same column widths
- **Overflow**: wrap the table in `overflow-x-auto` for mobile

---

## 6. WhatsApp-Style Filter Tabs

Every table page has a horizontal row of pill-shaped filter tabs above the table. Clicking a pill filters the rows in-place — no page reload, no URL change unless explicitly required.

### Visual Spec

```
Active pill   → bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-sm font-medium
Inactive pill → bg-transparent text-stone-500 border border-stone-200 rounded-full px-4 py-1.5 text-sm
               hover: border-primary/30 text-primary
```

The tab bar is horizontally scrollable on mobile (`overflow-x-auto`, `flex-nowrap`).

### Implementation Pattern

```tsx
'use client'

import { useState, useMemo } from 'react'

type Filter = 'ALL' | 'NEW' | 'QUOTED_WAITING' | 'BOOKED' | 'LOST'

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',    value: 'ALL' },
  { label: 'New',    value: 'NEW' },
  { label: 'Quoted', value: 'QUOTED_WAITING' },
  { label: 'Booked', value: 'BOOKED' },
  { label: 'Lost',   value: 'LOST' },
]

export function InquiriesTableWithFilter({ inquiries }) {
  const [activeFilter, setActiveFilter] = useState<Filter>('ALL')

  const filtered = useMemo(() =>
    activeFilter === 'ALL'
      ? inquiries
      : inquiries.filter((i) => i.status === activeFilter),
    [inquiries, activeFilter]
  )

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={
              activeFilter === value
                ? 'rounded-full px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground shrink-0'
                : 'rounded-full px-4 py-1.5 text-sm font-medium border border-stone-200 text-stone-500 hover:border-primary/30 hover:text-primary shrink-0 transition-colors'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <InquiriesTable inquiries={filtered} />
    </div>
  )
}
```

---

## 7. Forms

Forms use shadcn `Form` (built on `react-hook-form` + `zod`). Conventions:

- Labels: `text-sm font-medium text-stone-700`
- Inputs: `rounded-xl border-primary/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/15`
- Helper text / errors: `text-xs text-stone-500` / `text-xs text-red-500`
- Section dividers inside long forms: `<hr className="border-primary/10" />`
- Submit button: always primary, right-aligned, `rounded-full`

---

## 8. Page Layout

Every protected page follows this shell:

```
DashboardShell
└── main (flex-1, overflow-y-auto, p-6 lg:p-8)
    ├── Page Header
    │   ├── Title (text-2xl font-semibold text-stone-800)
    │   └── Primary action button (top-right)
    ├── Filter Tabs   ← only on list pages
    └── Content (Card or Table)
```

Spacing between sections: `space-y-6`.

---

## 9. Typography

| Role | Class |
|---|---|
| Page title | `text-2xl font-semibold text-stone-800` |
| Section heading | `text-lg font-semibold text-stone-700` |
| Label / caption | `text-sm font-medium text-stone-600` |
| Body / table cell | `text-sm text-stone-700` |
| Muted / helper | `text-xs text-stone-400` |

Font family inherits from the root layout (Geist Sans).

---

## 10. Do's and Don'ts

### Do
- Use `rounded-2xl` or `rounded-full` — never `rounded` or `rounded-sm` alone
- Use `bg-primary/soft` for subtle section backgrounds
- Keep status always visible as a colored badge
- Use `transition-colors duration-150` on interactive elements

### Don't
- Don't introduce new brand colors — extend `--primary` with opacity only
- Don't use hard `border-gray-*` — use `border-primary/15` or `border-stone-200`
- Don't show raw status strings (e.g. `QUOTED_WAITING`) to the user — always map to a readable label
- Don't stack more than 4–5 filter tabs without making the bar scrollable
