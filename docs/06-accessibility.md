# Ocean: Accessibility Guidelines & ARIA Specifications v1.0
## WCAG 2.1 AA Compliance Framework

Ocean is committed to creating an e-commerce platform that is highly usable and accessible to all buyers, regardless of physical or cognitive ability. This document establishes strict development specifications to achieve full **WCAG 2.1 AA compliance** across all marketplace channels.

---

## 1. Contrast Ratios & Visual Independence

To accommodate users with low vision, color blindness, or varying device environments, Ocean prohibits using color alone to convey system status.

* **Contrast Ratios:**
  - Standard Body Typography (`font-body-md`, `font-body-sm`) must maintain a minimum contrast ratio of **4.5:1** against the background.
  - Large headings and Display titles (`font-display-lg`, `font-display-md`) must maintain a minimum contrast ratio of **3:1**.
  - All critical icons and interface states (borders around active inputs) must achieve a **3:1** contrast ratio.
* **Secondary Visual Cues:**
  - Status messages, form validations, and empty states must couple color changes with inline text alerts or high-contrast icons.
  - Links must feature a visible bottom underline by default rather than relying solely on blue or bold styling.

---

## 2. Comprehensive Keyboard Navigation

The entire application—from homepage search to checkout payment completion—must be completely navigable using only a keyboard.

### A. Focus Rings (Interactive Outlines)
* Avoid using generic visual overrides like `focus:outline-none`.
* Implement a high-contrast focus ring on all interactive components (buttons, links, inputs, checkboxes):
  - Tailwind template: `focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none`.
  - The focus ring must contrast with both the component and the page background.

### B. Keyboard Navigation Mapping
* **Tab:** Move focus linearly forward between interactive elements.
* **Shift + Tab:** Move focus linearly backward.
* **Enter / Space:** Activate focused buttons, open select dropdowns, or toggle state checkboxes.
* **Escape:** Close open dialog modals, slide-out cart drawers, overlay search results, or floating dropdown lists.
* **Arrow Keys:** Navigate between options inside select menus, active layout tabs, and image carousels.

### C. Active Focus Traps
* Modals, slide-out Cart Drawers, and checkout detail panels must lock keyboard focus inside their container boundary when open.
* On opening, focus must instantly transition to the primary closure element or the first logical input.
* On close, keyboard focus must be gracefully returned to the original launching trigger component.

---

## 3. ARIA Landmarks, Roles & Accessible Forms

Screen readers rely on clean markup and semantic ARIA structural markers to interpret page layouts.

### A. Core Page Structure
* All main pages must be wrapped in structural HTML landmarks:
  - `<header>`: The primary search and navigation header.
  - `<nav>`: The category icon rails and bottom navigation sheets.
  - `<main>`: The primary content module of the page layout.
  - `<footer>`: General brand declarations, navigation directories, and trust badges.

### B. Dynamic Components
Every rich-UI component must use semantic ARIA attributes to announce states to screen readers:

| Component Type | Required ARIA Pattern | Functional Purpose |
| :--- | :--- | :--- |
| **Cart Drawer / Modal** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="title_id"` | Informs the user of a distinct overlay interface. |
| **Primary Navigation** | `aria-label="Global navigation bar"` | Distinguishes the header navigation from footer directories. |
| **Cart Notification** | `role="status"`, `aria-live="polite"` | Announces when an item is successfully added to the cart. |
| **Quantity Input** | `aria-label="Quantity of [Product Name]"`, `type="number"` | Links the quantity field directly to the specific product item. |
| **Wishlist Heart Icon** | `role="button"`, `aria-pressed="false" / "true"` | Announces state changes when saving or removing items. |
| **Category Tab Bars** | `role="tablist"`, `role="tab"`, `aria-selected="true" / "false"` | Grouping and indicating active category views. |

### C. Form Field Labeling
* Every input field, checkbox, and select dropdown must have a semantic `<label>` linked via the `htmlFor` attribute.
* Placeholder text is **NOT** a label substitute. If design demands a minimalist input, hide the label visually using `sr-only` (screen-reader only CSS) so that screen readers still find the field description.

---

## 4. Touch Targets & Mobile Usability

To assist users with motor impairments or those shopping on mobile, Ocean enforces strict touch boundary minimums:

* **Target Sizing:** All interactive elements (buttons, link labels, custom icons, checkout selectors) must feature a minimum clickable target area of **44 x 44 pixels** on screens `< 768px`.
* **Structural Padding:** Ensure adjacent action buttons (e.g., "Add to Wishlist" next to "Buy Now") have at least `8px` of separation margin to prevent accidental clicks.

---

## 5. Reduced Motion Standards

Animations in Ocean are designed to communicate state changes, not to decorate. We respect the user's OS-level motion choices:

* **Adaptive Styling:** CSS and framer-motion setups must query OS preferences using `prefers-reduced-motion: reduce`.
* **Motion Fallbacks:** When a user requests reduced motion, active layout transformations, parallax effects, and scale-up hovers must automatically scale back to clean, instantaneous opacity fades (`transition-opacity duration-100`).
