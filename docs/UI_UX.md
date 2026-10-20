# Vaultwise — UI/UX Design System & Guidelines

## 1. Core Visual Principles & Design Philosophy

Vaultwise implements a signature visual aesthetic blending **Neumorphism + Flat Design + Neo-Brutalism**:

1. **Solid Colours Only — ABSOLUTELY NO GRADIENTS**:
   - Every background, card, button, border, badge, and chart fill uses flat, solid, high-contrast colors.
   - Linear gradients, radial gradients, mesh gradients, and glassmorphic blur overlays that distort contrast are strictly prohibited.
2. **Neo-Brutalist Outer Foundations**:
   - Crisp 2px solid outlines (`border-2 border-slate-900 dark:border-slate-800`).
   - Hard, unblurred drop shadows (`shadow-[4px_4px_0px_#0f172a]`).
   - Tactile interactive state changes: on hover elements lift (`hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#0f172a]`), and on click elements press down (`active:translate-x-1 active:translate-y-1 active:shadow-none`).
   - High-contrast, uppercase badge chips with 2px solid dark borders.
3. **Neumorphic Inward Depth**:
   - Inset debossed shadow wells for form inputs, search bars, and progress tracks (`neu-input`).
   - Tactile depression for form interaction without using gradients.
4. **Flat Design Cleanliness**:
   - Crisp solid fills, vibrant functional status colors, zero visual clutter, and instant typographic clarity.

---

## 2. Design Tokens & Color Palette

### 2.1 Color Tokens (Tailwind & Dart)

| Token Name | Hex Code | Purpose |
|---|---|---|
| `bg-primary` | `#F8FAFC` (Slate 50) / `#F1F5F9` (Slate 100) | Main application background (Clean Light Mode) |
| `card-surface` | `#FFFFFF` (Pure White) | Neo-Brutalist card and modal surface container |
| `border-main`  | `#0F172A` (Slate 900) | 2px solid outlines & tactile hard shadows |
| `text-primary` | `#0F172A` (Slate 900) | Primary titles, monetary metrics |
| `text-muted`   | `#64748B` (Slate 500) | Labels, timestamps, secondary notes |
| `accent-primary`| `#2563EB` (Royal Blue) | Primary action buttons, active navigation pills |
| `status-income`| `#10B981` (Emerald 500) | Income badges, positive savings, surplus |
| `status-expense`| `#EF4444` (Red 500) | Expense figures, overspending alerts |
| `status-warning`| `#F59E0B` (Amber 500) | Approaching budget threshold (80-99%) |

### 2.2 Category Color Palette (Solid Swatches)
- Groceries: `#10B981`
- Food & Dining: `#F59E0B`
- Transportation: `#3B82F6`
- Housing: `#6366F1`
- Utilities: `#8B5CF6`
- Healthcare: `#EC4899`
- Shopping: `#14B8A6`
- Entertainment: `#F97316`
- Education: `#06B6D4`
- Personal Care: `#84CC16`
- Other: `#64748B`

---

## 3. Typography Hierarchy

- **Font Family**: Inter, Roboto, or system sans-serif (`font-sans`).
- **Metric Cards (KPIs)**: Bold, tabular numbers (`font-mono` or `font-semibold text-2xl`).
- **Section Headers**: `text-lg font-semibold tracking-tight`.
- **Form Labels**: `text-xs font-medium uppercase tracking-wider text-muted`.

---

## 4. Accessibility & Interaction

1. **Contrast Ratio**: All text and interactive controls maintain at least WCAG AA 4.5:1 contrast against their solid backgrounds.
2. **Keyboard Navigation**:
   - Modals trap focus, open with autofocus on first action, and dismiss with `Escape`.
   - Tables support arrow-key navigation or clear tab-stops.
3. **Form Validation**:
   - Explicit inline error labels associated via `aria-describedby`.
   - Never rely exclusively on color to convey status (include text prefixes like `+$`, `-$`, or explicit badges).

---

## 5. Responsive Breakpoints

- Mobile (`< 768px`): Single column KPI stack, collapsible filter bottom-sheet, horizontal scrolling data tables.
- Tablet (`768px - 1024px`): 2-column KPI grid, compact sidebar.
- Desktop (`> 1024px`): Persistent sidebar navigation, 4-column KPI cards, side-by-side charts and transaction tables.
