# Copilot Instructions - React Vite Boilerplate

## Architecture Overview

This is a React 19 + Vite boilerplate using TanStack Router for file-based routing with authentication middleware. The project uses shadcn/ui components with Tailwind CSS v4 and supports both REST API and WebSocket connections.

## Key Patterns & Conventions

### Routing Structure

- Uses TanStack Router with file-based routing in `src/routes/`
- Route definitions in `src/routes/routers/` (auth.routes.ts, dash.routes.ts, root.route.ts)
- Authentication middleware (`authMiddleware.ts`) runs on protected routes via `beforeLoad`
- Layout routes (`/auth`, `/dashboard`) wrap child routes with QueryClient providers

### Authentication Flow

- JWT tokens stored via `useToken()` hook, injected into API requests via xior interceptors
- Session validation via `/auth/session` endpoint in `authMiddleware.ts`
- 401 responses trigger automatic redirect to login with return path
- API calls use Bearer token + custom `api-key` header

### Component Architecture

- **UI Components**: shadcn/ui components in `src/components/ui/`
- **App Components**: Custom components in `src/components/app/`
- **Page Components**: Feature pages in `src/app/(auth)/`, `src/app/(dashboard)/`, `src/app/(root)/`
- Uses `cn()` utility from `lib/utils.ts` for className merging (clsx + tailwind-merge)

### State Management

- TanStack Query for server state (configured in `TanstackProvider.tsx` with 5min stale time)
- WebSocket state via `WSProvider` context (`src/contexts/WSProvoder.tsx`)
- Form validation using react-hook-form + Zod schemas

### API & Data Layer

- HTTP client: xior (axios alternative) configured in `src/http/xior.ts`
- API definitions in `src/db/api/` (e.g., `auth.api.ts`)
- Type definitions exported from validators (`src/types/app/auth.type.ts` re-exports from `validators/`)
- Zod schemas for validation and TypeScript inference

### WebSocket Integration

- Socket.io client with auto-reconnection in `src/lib/socket.ts`
- Connection managed via `WSProvider` with manual connect/disconnect controls
- Automatic reconnection on window focus

## Development Commands

- `npm run dev` - Start dev server
- `npm run build` - TypeScript check + Vite build
- `npm run lint` - ESLint (flat config with React Compiler support)
- `npm run preview` - Preview build on port 37462

## Environment Variables

- `VITE_BACKEND_BASE_URL` - REST API base URL
- `VITE_BACKEND_WS_BASE_URL` - WebSocket server URL
- `VITE_API_KEY` - API key for backend requests
- `PROD_SERVER_HOST` / `PROD_SERVER_ALLOWED_HOST` - Production server config

## Project Structure & Code Principles

### Directory Organization

```
src/
├── app/                    # Page components organized by route groups
│   ├── (auth)/            # Auth pages (Login.tsx, Register.tsx)
│   ├── (dashboard)/       # Dashboard pages
│   └── (root)/            # Public pages (Home.tsx)
├── components/
│   ├── ui/                # shadcn/ui components (button.tsx, input.tsx, etc.)
│   └── app/               # Custom application components
├── contexts/              # React context providers
│   ├── TanstackProvider.tsx    # Query client config (5min stale time)
│   └── WSProvoder.tsx          # WebSocket connection management
├── db/
│   ├── api/               # API service functions (auth.api.ts)
│   └── queries/           # TanStack Query hooks (useAuth.ts)
├── hooks/                 # Custom React hooks (useToken.ts, use-mobile.ts)
├── http/                  # HTTP client configuration (xior.ts)
├── lib/                   # Utility functions and external service configs
│   ├── socket.ts          # Socket.io client setup
│   └── utils.ts           # cn() className utility
├── middleware/            # Route middleware (authMiddleware.ts)
├── routes/                # TanStack Router configuration
│   ├── routers/           # Route definitions by feature
│   └── _root.tsx          # Route tree and layout definitions
├── types/                 # TypeScript type definitions
│   ├── app/               # Re-exports from validators
│   └── lib-defs/          # Environment and library types
└── validators/            # Zod schemas (source of truth for types)
```

### Core Principles

**Type-First Development**

- Zod schemas in `validators/` define validation AND TypeScript types
- Types in `types/app/` re-export from validators (single source of truth)
- Environment variables strongly typed in `types/lib-defs/env.d.ts`

**Route-Based Architecture**

- File-based routing with grouped layouts: `(auth)`, `(dashboard)`, `(root)`
- Route definitions in `routes/routers/` import page components from `app/`
- Authentication middleware runs in `beforeLoad` hooks
- Each layout provides its own QueryClient instance

**API Layer Pattern**

- Service functions in `db/api/` handle HTTP calls
- TanStack Query hooks in `db/queries/` wrap services with caching
- xior client in `http/` handles auth injection and base config
- Mutations invalidate related query keys for cache consistency

**Component Hierarchy**

- `components/ui/` for pure UI components (shadcn/ui)
- `components/app/` for business logic components
- `app/(group)/` for page-level components
- Use `cn()` utility for conditional className merging

**State Management Strategy**

- Server state via TanStack Query with consistent cache keys
- WebSocket state via context with manual connection control
- Token storage via `useToken()` hook with js-cookie
- Form state via react-hook-form + Zod validation

### 1. Component Creation Workflow

**Step 1: Create the Base Component Structure**

```tsx
import React from 'react';

const ComponentName = () => {
  return <div>ComponentName</div>;
};

export default ComponentName;
```

**Step 2: Add TypeScript Props Interface**

```tsx
import React from 'react';

interface ComponentNameProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const ComponentName = ({ title, children, className }: ComponentNameProps) => {
  return (
    <div className={cn('base-styles', className)}>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
};

export default ComponentName;
```

**Step 3: Add shadcn/ui Component Patterns (for UI components)**

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

function ComponentName({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="component-name"
      className={cn(
        'bg-background text-foreground border-border rounded-md',
        className
      )}
      {...props}
    />
  );
}

export { ComponentName };
```

### 2. Form Implementation Pattern

**Step 1: Create Zod Validator**

```typescript
// src/validators/feature.validator.ts
import { z } from 'zod';

export const featureRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type FeatureRequest = z.infer<typeof featureRequestSchema>;
```

**Step 2: Export Types**

```typescript
// src/types/app/feature.type.ts
export {
  type FeatureRequest,
  featureRequestSchema,
} from '../../validators/feature.validator';
```

**Step 3: Create API Service**

```typescript
// src/db/api/feature.api.ts
import api from '@/http/xior';
import type { FeatureRequest } from '@/types/app/feature.type';

export const featureApi = {
  submit: async (data: FeatureRequest): Promise<any> => {
    try {
      const response = await api.post('/feature/submit', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
```

**Step 4: Create TanStack Query Hook**

```typescript
// src/db/queries/useFeature.ts
import { featureApi } from '../api/feature.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useFeature = () => {
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationKey: ['feature', 'submit'],
    mutationFn: featureApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature'] });
    },
  });

  return {
    submitMutation,
  };
};
```

**Step 5: Implement Form Component**

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFeature } from '@/db/queries/useFeature';
import {
  featureRequestSchema,
  type FeatureRequest,
} from '@/types/app/feature.type';

const FeatureForm = () => {
  const { submitMutation } = useFeature();

  const form = useForm<FeatureRequest>({
    resolver: zodResolver(featureRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = (data: FeatureRequest) => {
    submitMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitMutation.isPending}>
          {submitMutation.isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
};

export default FeatureForm;
```

### 3. Route Creation Workflow

**Step 1: Create Page Component**

```tsx
// src/app/(dashboard)/Settings.tsx
import React from 'react';

const Settings = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {/* Page content */}
    </div>
  );
};

export default Settings;
```

**Step 2: Create Route Definition**

```typescript
// src/routes/routers/dash.routes.ts
import { DashboardLayout } from '../_root';
import Dashboard from '@/app/(dashboard)/Dashboard';
import Settings from '@/app/(dashboard)/Settings';
import { createRoute } from '@tanstack/react-router';

export const DashboardRoute = createRoute({
  getParentRoute: () => DashboardLayout,
  path: '/',
  component: Dashboard,
});

export const SettingsRoute = createRoute({
  getParentRoute: () => DashboardLayout,
  path: '/settings',
  component: Settings,
});
```

**Step 3: Add to Route Tree**

```typescript
// src/routes/_root.tsx
export const routerTree = rootRoute.addChildren([
  DashboardLayout.addChildren([
    DashboardRoute,
    SettingsRoute, // Add new route
  ]),
  // ... other routes
]);
```

### 4. Custom Hook Creation Pattern

```typescript
// src/hooks/useCustomHook.ts
import * as React from 'react';

export function useCustomHook(initialValue?: boolean) {
  const [state, setState] = React.useState<boolean>(initialValue ?? false);

  React.useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, []);

  const toggleState = React.useCallback(() => {
    setState((prev) => !prev);
  }, []);

  return {
    state,
    setState,
    toggleState,
  };
}
```

### 5. Error Handling Pattern

```typescript
// In API calls
try {
  const response = await api.post('/endpoint', data);
  return response.data;
} catch (error) {
  throw error; // Let TanStack Query handle it
}

// In components with TanStack Query
const { mutate, isPending, error } = useMutation({
  mutationFn: apiCall,
  onError: (error) => {
    console.error('API Error:', error);
  },
});

if (error) {
  return <div className="text-destructive">Error: {error.message}</div>;
}
```

### 6. Environment Variable Usage

```typescript
// src/types/lib-defs/env.d.ts
interface ImportMetaEnv {
  readonly VITE_NEW_VARIABLE: string;
}

// Usage in code
const apiUrl = import.meta.env.VITE_BACKEND_BASE_URL;
```

## Code Style Guidelines

- TypeScript strict mode enabled
- Path alias `@/*` points to `src/*`
- React Compiler enabled via Babel plugin
- Prefer function declarations over arrow functions for components
- Use mutation keys that align with API endpoints for cache invalidation
- Environment variables prefixed with `VITE_` for client-side access
- Always use `cn()` utility for className merging
- Prefer `React.ComponentProps<"element">` for component prop types
- Use `data-slot` attributes for component identification
- Follow shadcn/ui semantic class naming conventions

#### Required Semantic Components

- **Layout**: `PageLayout`, `MainContent`, `Section`, `Article`, `Header`, `Navigation`
- **Forms**: `Form`, `FormFieldset`, `FormGroup`, `FormActions`, `Label`, `ErrorMessage`, `SuccessMessage`
- **Content**: `Heading`, `Paragraph`, `Container`, `Grid`, `Flex`, `Spacer`
- **Accessibility**: `ScreenReaderText`, `LoadingSpinner`

#### **Avoid Generic Divs**

- **Instead of**: `<div className="header">` → **Use**: `<header>`
- **Instead of**: `<div className="navigation">` → **Use**: `<nav>`
- **Instead of**: `<div className="main-content">` → **Use**: `<main>`
- **Instead of**: `<div className="section">` → **Use**: `<section>`
- **Instead of**: `<div className="article">` → **Use**: `<article>`

#### Content Structure Elements

- **Headings**: `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>` for content hierarchy
- **Text content**: `<p>` for paragraphs, `<blockquote>` for quotes
- **Lists**: `<ul>`, `<ol>`, `<li>` for navigation and content lists
- **Media**: `<figure>` and `<figcaption>` for images with captions
- **Form elements**: `<form>`, `<fieldset>`, `<legend>`, `<label>`, `<input>`, `<button>`

## NO `any` TYPES RULE

**MANDATORY**: Never use `any` types in TypeScript code

### FORBIDDEN

`````typescript
// NEVER DO THIS - TypeScript
const data: any = response.data;
const user: any = getUser();
const config: any = getConfig();

### ✅ **REQUIRED**

````typescript
// ALWAYS DO THIS - TypeScript
interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const data: ApiResponse<User> = response.data;
const user: User = getUser();
const config: Config = getConfig();
`````
