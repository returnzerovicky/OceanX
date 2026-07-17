# Ocean: Component Library Specification v1.0
## Reusable Component Mechanics & UI Patterns

This document defines the visual layout, structural composition, interactive feedback states, and structural guidelines for Ocean's reusable components.

---

## 1. Action Components (Buttons)

Buttons drive conversions and establish brand weight. Ocean maintains a highly disciplined button layout.

### A. The Primary Button (High-End Contrast)
* **Visual Styling:** Solid black background (`bg-surface-dark`), white text (`text-text-on-dark`), crisp edges (`rounded-md`), and spacious padding (`px-6 py-3`).
* **Hover State:** Micro-scale background shift to deep navy or dark slate (`hover:bg-neutral-800`), with a subtle upward movement (`-translate-y-0.5`).
* **Active State:** Direct downward pressure (`active:translate-y-0`), soft scaling (`active:scale-98`).
* **Disabled State:** Desaturated gray background, white text (`bg-zinc-300 text-zinc-500 cursor-not-allowed`).

### B. The Secondary Button (The Outline Choice)
* **Visual Styling:** Transparent background, hairline border (`border border-border-default`), and primary text color (`text-text-primary`).
* **Hover State:** Subtle grey fill background (`hover:bg-surface-secondary`), border shifts to obsidian (`border-text-primary`).
* **Interactive Timing:** Smooth color/border transition (`transition-all duration-180 ease-out`).

### C. The Tertiary Text Link
* **Visual Styling:** Inline typography with no background or borders. Features a quiet, razor-thin underline (`underline underline-offset-4 decoration-zinc-300`).
* **Hover State:** Underline color shifts to matching text color (`decoration-text-primary`), driving a clear indication of clickability.

---

## 2. Information Containers (Cards)

Cards organize elements into logical grids.

### A. The Product Display Card
* **Structure:** A vertical grid block consisting of:
  - Container element (`group cursor-pointer border border-border-default hover:border-text-primary transition-all duration-300 bg-surface-primary rounded-md p-4`).
  - Image container with fixed **4:3 aspect ratio** and overflow hiding (`relative aspect-[4/3] bg-surface-secondary overflow-hidden rounded-sm mb-4`).
  - Actual product image inside (`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out`).
  - Title and vendor row (`text-text-primary font-display-sm tracking-tight mb-1`).
  - Monospace pricing row and short delivery metadata label (`text-text-secondary font-mono-md`).

### B. The Mini Cart Card
* **Structure:** Horizontal split container (`flex items-center gap-4 py-3 border-b border-border-default`).
  - Left: Compact 4:3 product thumbnail (`w-16 h-12 object-cover bg-surface-secondary rounded-sm`).
  - Center: Product title, active variants (e.g., "Silver / 256GB"), and quantities (`flex-1 min-w-0`).
  - Right: Mono-spaced price block and a quiet delete trigger (icon-only button with a red hover state).

---

## 3. Data Entry Fields (Inputs & Forms)

Forms must prioritize high usability and clear error states.

* **Default State:** Off-white background (`bg-surface-secondary`), thin zinc border (`border border-border-default`), text color (`text-text-primary`), placeholder (`text-text-muted`), and standard padding (`px-4 py-2.5 rounded-md transition-all`).
* **Hover State:** Background lightens slightly, border darkens.
* **Focus State:** Background shifts to pure white (`bg-surface-primary`), border transitions to solid black (`border-border-focus`), and a soft shadow appears.
* **Error State:** Border transitions to solid crimson (`border-status-error`), and a supporting warning label appears directly below the input field in matching crimson.

---

## 4. Selection Elements (Dropdowns & Selectors)

* **Trigger:** Horizontal container displaying the active choice, paired with an outline Chevron icon that rotates 180 degrees upon activation.
* **Dropdown Option Panel:** Positioned using absolute CSS, layered over elements via floating elevation (`shadow-floating z-50 rounded-md border border-border-default bg-surface-primary py-1 mt-1`).
* **Item States:** Option items display a light grey background on hover (`hover:bg-surface-secondary`), and a bold label with a checking indicator if active.

---

## 5. Segment Controllers (Tabs, Badges & Chips)

### A. The Tab Switcher (Flat Segment Controller)
* Used to change views in portal pages (e.g., switching between Inventory, Orders, and Settings).
* Displays a horizontal row of text labels (`font-label-md py-3 px-1 border-b-2`).
* Inactive state: Soft gray text, transparent bottom border.
* Active state: Solid black text, matching high-contrast bottom border, moving with a fluid exit-entry animation on transition.

### B. Status Badges
* Compact labels displaying platform states (`rounded-sm font-mono-sm font-medium px-2 py-0.5 flex items-center gap-1.5`).
* **Success Badge:** Soft green fill background (`bg-emerald-50 text-emerald-700`).
* **Pending Badge:** Soft amber fill background (`bg-amber-50 text-amber-700`).
* **Error/Cancelled Badge:** Soft red fill background (`bg-red-50 text-red-700`).
