# Ocean: Design System Tokens v1.0
## Semantic Tokens, Spacing Scales & Core Layout Constants

This document defines the atomic tokens of Ocean's design system. All frontend styles, Tailwind classes, and component attributes must align exactly with these constants to prevent visual fragmentation and ensure immediate brand consistency.

---

## 1. Semantic Color Tokens

We reject arbitrary numeric colors (e.g., `gray-100`) in favor of task-oriented **Semantic Mapping**. This ensures seamless transitions between themes and guarantees visual readability (WCAG AA).

### A. Primary Surfaces
* **`surface-primary`**: `#FCFCFC` (Alabaster off-white). Standard background for light layouts.
* **`surface-secondary`**: `#F4F4F5` (Soft slate-zinc). Used for cards, inner sidebars, and nested modules to create depth.
* **`surface-tertiary`**: `#E4E4E7` (Structured zinc). Background for input fields and line borders.
* **`surface-dark`**: `#09090B` (Rich charcoal obsidian). Main theme for headers or immersive dark experiences.
* **`surface-brand`**: `#0C2B4E` (Deep Ocean Navy). Used selectively for primary luxury identifiers.

### B. Typography Colors
* **`text-primary`**: `#09090B` (Obsidian zinc). High-contrast reading layer.
* **`text-secondary`**: `#4B5563` (Muted cool gray). Secondary context, descriptions, and labels.
* **`text-muted`**: `#71717A` (Quiet slate). Used for Monospace SKUs, inactive states, and subtitled timestamps.
* **`text-on-dark`**: `#FAFAFA` (Pure off-white). Content overlaying dark containers or buttons.

### C. System State Flags
* **`status-success`**: `#10B981` (Emerald green). Used for successful transactions, verified reviews, and "delivered" states.
* **`status-error`**: `#EF4444` (Vibrant crimson). Used for invalid actions, processing failures, and cancelled operations.
* **`status-warning`**: `#F59E0B` (Amber gold). Used for low inventory warnings and pending disputes.
* **`status-info`**: `#3B82F6` (Ocean blue). Highlights delivery estimations and system announcements.

### D. Borders & Dividers
* **`border-default`**: `#E4E4E7` (Soft hairline division).
* **`border-focus`**: `#09090B` (High-contrast active state for fields and selected items).

---

## 2. Typography Token Scales

| Token Name | Font Family | Size (px / rem) | Line Height | Track Weight | Best Use Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`font-display-lg`** | Space Grotesk | `36px / 2.25rem` | `1.15` | `Bold (700)` | Hero Landing Headers, Main Brand Ads |
| **`font-display-md`** | Space Grotesk | `28px / 1.75rem` | `1.20` | `Medium (500)` | Category Headers, Large Card Titles |
| **`font-display-sm`** | Space Grotesk | `22px / 1.375rem` | `1.25` | `Medium (500)` | Standard Module Headers |
| **`font-body-lg`** | Inter | `18px / 1.125rem` | `1.50` | `Regular (400)` | PDP Long Descriptions, Press Release |
| **`font-body-md`** | Inter | `16px / 1.0rem` | `1.55` | `Regular (400)` | Primary UI body text, Standard lists |
| **`font-body-sm`** | Inter | `14px / 0.875rem` | `1.60` | `Regular (400)` | Table details, Metadata paragraphs |
| **`font-label-md`** | Inter | `14px / 0.875rem` | `1.00` | `Medium (500)` | Interactive Button Text, Form Headings |
| **`font-label-sm`** | Inter | `12px / 0.75rem` | `1.00` | `Medium (500)` | Field Captions, Badges, Tab bars |
| **`font-mono-md`** | JetBrains Mono | `13px / 0.8125rem` | `1.40` | `Regular (400)` | Currency Prices, SKUs, Timelines |
| **`font-mono-sm`** | JetBrains Mono | `11px / 0.6875rem` | `1.40` | `Regular (400)` | Parcel Weights, Dynamic Delivery Dates |

---

## 3. The 8-Pixel Spacing Scale

We strictly ban odd-pixel spacing (e.g., `11px`, `19px`). All components must use a rigorous 8px grid structure to align cleanly across desktop and mobile screens:

| Size Scale | Numeric Value | Tailwind Utility Class | Intended Placement Context |
| :--- | :--- | :--- | :--- |
| **`space-2xs`** | 2px | `gap-0.5` / `p-0.5` | Double-stroke lines, border separation offsets |
| **`space-xs`** | 4px | `gap-1` / `p-1` | Inline elements (Badge icon spacing, status dots) |
| **`space-sm`** | 8px | `gap-2` / `p-2` | Small padding, input inner fields, rating star groups |
| **`space-md`** | 16px | `gap-4` / `p-4` | Card inner margins, standard list rows, breadcrumbs |
| **`space-lg`** | 24px | `gap-6` / `p-6` | Main layout columns, container inner grid gaps |
| **`space-xl`** | 32px | `gap-8` / `p-8` | Outer margins for standard panels and side drawers |
| **`space-2xl`** | 48px | `gap-12` / `p-12` | Desktop structural spacing between layout rows |
| **`space-3xl`** | 64px | `gap-16` / `p-16` | Large landing section separation, major page transitions |

---

## 4. Borders & Radius System

Ocean prioritizes a sleek, geometric look with subtle roundings. Avoid overly rounded "pill-like" elements for primary structural boundaries:

* **Border Thickness:**
  - `border-hairline`: `1px`. Default split lines, table dividers, card boundaries.
  - `border-heavy`: `2px`. Focus lines, selected item boundaries, active buttons.
* **Corner Radius (Rounding):**
  - **`radius-sharp`**: `0px`. Absolute minimalist layout (used for buttons and visual structures in extreme high-fashion layout presets).
  - **`radius-sm`**: `4px` (`rounded-sm`). Small items, status badges, secondary dropdown triggers, small inline cards.
  - **`radius-md`**: `8px` (`rounded-md`). Default for Standard Cards, primary product images, address containers, inputs.
  - **`radius-lg`**: `12px` (`rounded-lg`). Large UI systems (Slide-out drawers, Modal sheets, Cart slide overlays).
  - **`radius-full`**: `9999px` (`rounded-full`). Strictly limited to User Avatars, Status dots, and multi-vendor notification badges.

---

## 5. Elevation & Shadow Scale

To prevent visual clutter, shadows should be highly diffuse, cool-toned, and used only to signify structural overlap (depth).

* **`shadow-flat`**: `0px`. default state for basic static cards. High-end brands value absolute flat layouts over dynamic layered elevations.
* **`shadow-hover`**: `0 4px 20px -2px rgba(9, 9, 11, 0.04)`. Extremely soft hover state feedback for interactive product listing cards.
* **`shadow-floating`**: `0 12px 32px -4px rgba(9, 9, 11, 0.08)`. Default for modals, slide-out carts, and active menus to lift them over the page layout.
* **`shadow-focus`**: `0 0 0 2px #FCFCFC, 0 0 0 4px #09090B`. Triple-layer contrast ring for WCAG AA keyboard focus indicators.
