# RFC-003: High-Contrast Dark Mode Integration
## Author: Design Systems Lead & Lead Frontend Engineer

### 1. Abstract / Problem Statement
Ocean is built with a default, light "Quiet Luxury" aesthetic. While beautiful, many of our curators, sellers, and active nighttime shoppers have requested an eye-safe Dark Mode. 

This RFC proposes a standardized, system-synced Dark Mode integration that preserves our elegant styling. It leverages our Semantic Design Tokens to implement a zero-flash toggle mechanism.

---

### 2. Technical System Design

#### A. Theme Variable Declarations
We will declare our dark mode theme tokens inside `src/index.css` under the `@media (prefers-color-scheme: dark)` or a `.dark` HTML class prefix. This allows Tailwind to swap background values dynamically:

```css
@theme {
  /* Light Theme Values (Default) */
  --color-surface-primary: #FCFCFC;
  --color-surface-secondary: #F4F4F5;
  --color-text-primary: #09090B;
  --color-text-secondary: #4B5563;
  --color-border-default: #E4E4E7;

  /* Dark Theme Values */
  .dark {
    --color-surface-primary: #09090B;
    --color-surface-secondary: #121214;
    --color-text-primary: #FAFAFA;
    --color-text-secondary: #A1A1AA;
    --color-border-default: #27272A;
  }
}
```

#### B. Zero-Flash System Synchronization
To prevent "dark-mode flashing" (where a bright white screen momentarily loads before the user's preferred dark mode finishes rendering), we will execute an inline theme script at the very top of `index.html`:

```html
<script>
  (function() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
</script>
```

---

### 3. Developer Controls & Layout Rules

* **Class Constraints:** Hardcoding native color classes (e.g. using `bg-white` or `text-black` directly in markup) is **strictly forbidden**. Engineers must use our semantic variables (`bg-surface-primary`, `text-text-primary`) to ensure color transitions resolve correctly.
* **Image Adaptations:** Complex graphical assets or maps must adjust opacity or utilize dark mode asset layers to preserve readability:
```html
<img src="/assets/map-light.png" className="block dark:hidden" />
<img src="/assets/map-dark.png" className="hidden dark:block" />
```
