# Ocean: Engineering Standards & Style Guide v1.0
## Folder Architecture, Component Design, and Code Writing Best Practices

This document establishes Ocean's strict engineering standards, naming conventions, coding practices, and commit workflows to ensure code quality and maintainability.

---

## 1. Directory Structure

All files inside the codebase must align with this standardized layout schema:

```
/src
├── components
│   ├── common       -> Shared primitive UI elements (Buttons, Inputs, Badges)
│   ├── layout       -> Global templates (Header, Footer, Cart drawers)
│   └── portals      -> Specialized portal blocks (Buyer, Seller, Admin, etc.)
├── hooks            -> Reusable React custom state engines (`useCart`, `useAuth`)
├── lib              -> Third-party integrations and initializations (Stripe, Maps)
├── services         -> Pure data fetching and API proxy helper functions
├── types.ts         -> Centralized TypeScript declarations and interfaces
├── App.tsx          -> Core routing template and top-level page controllers
└── main.tsx         -> Core React entry point
```

---

## 2. Naming & Case Conventions

- **React Components:** PascalCase. Components must reside inside their matching dedicated file (e.g., `ProductCard.tsx`).
- **Custom Hooks:** camelCase with a `use` prefix (e.g., `useNetworkStatus.ts`).
- **Files & Directories:** kebab-case. Directories and support files must use lowercase, hyphenated naming (e.g., `error-boundary.tsx`).
- **TypeScript Types & Interfaces:** PascalCase. Types must describe structure explicitly (e.g., `interface BuyerProfile`).
- **CSS Class Mapping:** All styling must use standard Tailwind CSS utility classes. Custom inline styles (`style={{ ... }}`) are prohibited.

---

## 3. React Best Practices & Coding Standards

- **Functional Components:** All layouts must use React functional components with explicit typing. Standard arrow functions are preferred:
```typescript
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div className="p-4 border border-zinc-200 rounded-md bg-white">
      <h3 className="font-display text-lg">{product.title}</h3>
    </div>
  );
};
```
- **Custom Hooks for Shared Logic:** Components should focus exclusively on rendering and styling. Complex logic (e.g., data fetching, state validation, API orchestration) must be extracted into custom hooks.
- **TypeScript Strict Mode:** We strictly forbid the use of the `any` keyword. All components, API responses, and function signatures must be explicitly typed.
- **Destructured Imports:** Use named imports for React hooks and components rather than importing entire packages.

---

## 4. Git Workflows & Commit Standards

- **Branch Naming Conventions:**
  - Feature branch: `feature/short-description`
  - Hotfix branch: `hotfix/short-description`
  - Refactoring branch: `refactor/short-description`
- **Structured Commit Messages:** Commits must follow semantic conventions to ensure automated changelog generation remains clean and readable:
  - `feat: add slide-out cart drawer` (Adds a new feature)
  - `fix: resolve checkout idempotency error` (Fixes a bug)
  - `docs: update performance budgets` (Modifies documentation files)
  - `refactor: extract checkout form logic` (Improves code structure without changing functionality)
  - `style: format payment container layout` (Fixes layout, spacing, or visual styles)
