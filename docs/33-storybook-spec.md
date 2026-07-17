# Ocean: Storybook Specification v1.0
## Reusable Component Isolation, Interaction Tests, and Accessibility Benchmarks

To ensure high visual quality and standard interactivity across all portal modules, every reusable UI element in Ocean must be registered, tested, and documented inside **Storybook**.

---

## 1. Unified Component Registration Template

Every registered component story must provide explicit configurations defining its variants, mock properties, and test conditions:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

// Metadata configuration
const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'dark', 'outline'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Standard primary button story
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Proceed to Checkout',
  },
};
```

---

## 2. Mandatory Testing Suites

Every component submitted to the design system must pass five integrated evaluation pipelines:

### A. Dynamic Documentation
- Must include descriptive documentation explaining the component's exact purpose, spacing rules, and usage contexts.
- All properties (arguments) must include descriptions and default values.

### B. Dynamic Controls & Variant Matrix
- Storybook must exhibit all component variants (e.g. active, hovering, focused, loading, disabled, error states).
- Consumers must be able to modify component properties on the fly using standard visual knobs and controls.

### C. Automated Accessibility Audits (axe-core)
- The component must undergo automatic accessibility evaluations via `@storybook/addon-a11y`.
- Must achieve **100% WCAG AA compliance** (strict contrast, ARIA landmarks, screen reader labels) prior to release.

### D. Automated Interaction & Focus Tests
- Stories must use Storybook's `play` function to run automated clicks, key presses, and focus validation tests:
```typescript
export const InteractiveClick: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button');
    await userEvent.click(btn);
    await expect(btn).toHaveFocus();
  },
};
```

### E. Responsive Viewport Audits
- Stories must be evaluated against standard viewport sizes (Mobile: 360px, Tablet: 768px, Desktop: 1024px, Ultra-wide: 1440px) to verify fluid scaling and text wrap boundaries.
