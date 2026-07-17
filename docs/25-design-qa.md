# Ocean: Design Quality Assurance (QA) Checklist v1.0
## Component Audits, Interaction Verification, and Styling Compliance

To maintain Ocean's design standards, this QA checklist must be passed before merging any new UI components or layouts into production.

---

## 1. Typography and Sizing Audit

- [ ] **Exact Font Match:** Heading styles must use *Space Grotesk*, UI labels and description paragraphs must use *Inter*, and data metrics or prices must use *JetBrains Mono*.
- [ ] **Strict Line Height:** Every typography size must align with its defined line-height token to prevent vertical text overlapping on narrow mobile viewports.
- [ ] **Visual Hierarchy:** Headings must use high-contrast text (`text-text-primary`) and maintain relative size hierarchies compared to body text.
- [ ] **Truncation Safety:** Long titles or product labels must gracefully truncate with an ellipsis (`truncate` or `line-clamp-2`) without pushing adjacent layout cards out of alignment.

---

## 2. Grid, Spacing & Layout Consistency

- [ ] **Strict 8px Grid Alignment:** Spacing, padding, and margins must align with the 8px grid system (`p-2`, `p-4`, `p-8` / `gap-2`, `gap-4`, `gap-8`).
- [ ] **Responsive Fluidity:** Containers must adjust fluidly from mobile (4 columns) to desktop (12 columns) using relative flex/grid layouts.
- [ ] **Aspect Ratio Rules:** Product and curated banner images must enforce a strict **4:3 aspect ratio** to maintain grid symmetry across all devices.
- [ ] **Maximum Desktop Caps:** Layouts must use a max-width wrapper (`max-w-7xl mx-auto`) to keep design elements centered on ultra-wide screens.

---

## 3. Interactive Feedback States

- [ ] **Clear Hover States:** Every button, card, and text link must have a defined hover transition (`transition-all duration-180 ease-out`).
- [ ] **Keyboard Focus Rings:** Focus rings must use high-contrast outline tokens (`focus-visible:ring-2 focus-visible:ring-neutral-900`) and be visible on all interactive components.
- [ ] **Active/Tap States:** Buttons and interactive elements must scale slightly downward on click or tap (`active:scale-98 active:translate-y-0`) to provide clear mechanical feedback.
- [ ] **Safe Touch Targets:** On mobile layouts, interactive components (buttons, links, select menus) must maintain a minimum target area of **44x44 pixels**.

---

## 4. Accessibility and Performance Benchmarks

- [ ] **Contrast Compliance:** All text components must achieve a minimum contrast ratio of **4.5:1** against the background (WCAG AA).
- [ ] **Screen Reader Labels:** Form fields must have a semantic `<label>` or an `aria-label` attribute if visually hidden.
- [ ] **Image Lazy Loading:** Every image located below the fold must use `loading="lazy"`. High-priority hero images must use `fetchpriority="high"` and omit lazy loading.
- [ ] **Layout Stability (CLS):** Dynamic skeleton placeholders must match the final loaded dimensions of images or components to eliminate layout shifting.
