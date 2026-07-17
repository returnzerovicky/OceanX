# Ocean: Figma Parity & Design Tokens Pipeline v1.0
## Establishing a Single Source of Truth for Visual Design

To prevent styling drifts and maintain a pristine, "quiet luxury" layout across all platforms, Ocean enforces a strict **Figma-to-Code Parity pipeline**. Every visual decision must route through a single, automated, tokenized pipeline.

---

## 1. The Dynamic Sync Pipeline

We maintain a strict one-to-one mapping across our design and development lifecycles:

```
┌──────────────────────┐
│  Figma Design Spec   │  Design variables managed inside Figma's UI Library
└──────────┬───────────┘
           │
           ▼ (Export via Figma API / W3C Token Format)
┌──────────────────────┐
│  /docs/29-tokens.json│  Universal JSON dictionary of dimensions and hex codes
└──────────┬───────────┘
           │
           ├──────────────────────────────┐
           ▼                              ▼
┌──────────────────────┐       ┌──────────────────────┐
│   Tailwind Config    │       │   Storybook Spec     │
│   (index.css @theme) │       │ (Props & Controls)   │
└──────────┬───────────┘       └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│   React Components   │  Pristine, standard UI elements (Buttons, Cards, Forms)
└──────────────────────┘
```

---

## 2. 1-to-1 Naming Matrix

Designers and engineers utilize the exact same vocabulary. We prohibit hardcoding custom styling keys that are absent from this unified matrix:

| Token Category | Figma Variable Name | CSS custom variable (css @theme) | Tailwind CSS utility | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| **Surface Accent** | `surface/primary` | `--color-surface-primary` | `bg-surface-primary` | `#FCFCFC` |
| **Surface Accent** | `surface/dark` | `--color-surface-dark` | `bg-surface-dark` | `#09090B` |
| **Text Primary** | `text/primary` | `--color-text-primary` | `text-text-primary` | `#09090B` |
| **Text Muted** | `text/muted` | `--color-text-muted` | `text-text-muted` | `#71717A` |
| **Default Border** | `border/default` | `--color-border-default` | `border-border-default` | `#E4E4E7` |
| **Corner Radius** | `radius/md` | `--border-radius-md` | `rounded-md` | `8px` |
| **Spacing Unit** | `spacing/scale-md`| `--spacing-scale-md` | `p-4` or `m-4` | `16px` |
| **Drop Shadow** | `shadow/floating` | `--shadow-floating` | `shadow-floating` | `0 12px 32px -4px ...` |

---

## 3. Structural Consistency Guardrails

1. **Automated Token Compilation:** When the design system team updates Figma Variables, a CI/CD job automatically exports those changes as a newly versioned `/docs/29-tokens.json` file.
2. **Post-Processing Compilation:** Tailwind reads the CSS variables inside `src/index.css` directly. This translates style tokens into rapid, utility-based Tailwind classes at compile time.
3. **Audit Assertions:** Our frontend linters automatically scan files to flag and fail hardcoded hex codes or pixel sizing (e.g. `p-[15px]` or `bg-[#0F1C3F]`), preserving strict token adherence.
