# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Holocron Dashboard is a React/TypeScript-based metrics dashboard application for software delivery and cost metrics. It visualizes data for organizations, value streams, teams, and team views with support for delivery metrics, cost tracking, and various quality indicators.

## Build and Development Commands

### Setup
```bash
npm i
```

### Development
```bash
npm start                    # Start Vite dev server on http://localhost:3000 with mock data
npm run start:docker         # Start Vite dev server accessible from Docker (host 0.0.0.0)
npm run preview              # Preview production build locally
```

### Testing
```bash
npm test                     # Run unit tests with coverage
npm run test:unit            # Alias for npm test
npm run coverage             # Run Jest with coverage report
npm run test:ci              # Run tests in CI mode (watch mode)
npm run cypress:open         # Open Cypress for e2e testing
npm run cypress:run          # Run Cypress tests headless
npm run test:e2e-ci          # Run e2e tests in CI (requires baseUrl=http://localhost)
```

### Linting and Formatting
```bash
npm run lint                 # Run ESLint on all JS/JSX/TS/TSX files
npm run lint:fix             # Run ESLint fix and format with Prettier
npm run lint:js              # Run ESLint with --fix flag
npm run format:fix           # Run Prettier on all files
```

### Building
```bash
npm run build                # Build production bundle with Vite (outputs to build/)
```

### Pre-commit Hooks
```bash
npm run precommit-hook       # Runs lint:js and test:unit (used by Husky)
npm run prepare              # Initialize Husky (runs automatically after npm install)
```

**Note**: Husky v9 is configured with the `prepare` script, which automatically initializes hooks after `npm install`.

## Code Architecture

### Directory Structure

The codebase follows strict organizational rules:

- **`src/`** - Top-level application code
  - **`api/`** - All API-related code (flat structure, no subdirectories)
    - Everything exports through `index.ts`
    - Import all API code from `api` index only
    - Contains: API calls (`api.ts`), hooks (`hooks.ts`), context providers, HOCs

  - **`ui/`** - UI components rendered directly to screen (depth 1 only)
    - Each component has its own directory
    - Main component is always `index.tsx` or `index.ts`
    - Import UI code only from the component's `index.ts/tsx`
    - No nested folders (strictly depth 1)
    - Examples: `Main`, `HeaderBar`, `Sidebar`, `DeliveryMetricsDashboard`

  - **`utils/`** - Helper utilities, hooks, reusable components (depth 1 only)
    - Each utility has its own directory
    - Main code is always `index.ts/tsx`
    - Import utils code only from the utility's `index.ts/tsx`
    - No nested folders (strictly depth 1)
    - Examples: `hooks`, `ThemeWrapper`, `DashboardWidgetWrapper`, `icons`

  - **`__mocks__/`** - Mock data and mock server setup
    - Uses `miragejs` to create local mock server
    - Mock server defined in `mockServer.ts`
    - Only runs when `NODE_ENV === 'development'` and `!REACT_APP_IN_DOCKER`

### Key Architecture Patterns

1. **Module Resolution**: Uses TypeScript path mapping with `baseUrl: "./"` and paths `"*": ["src/*"]`
   - Import from `src/` directories directly: `import Foo from 'ui/Foo'`
   - Never use relative imports for top-level directories

2. **Component Hierarchy**: To understand how components connect, start with `src/ui/Main/index.tsx`
   - Main sets up routing, context providers (QueryClient, API, CollectorTargets)
   - Routes map to dashboard pages, admin pages, and cost metrics

3. **Data Flow**:
   - React Query for data fetching and caching
   - API Context Provider wraps the app
   - CollectorTargets Context for collector configuration
   - Custom hooks in `api/hooks.ts` for data operations

4. **Routing**: Uses React Router v6
   - Hierarchical routes for organizations → value streams → teams → team views
   - Separate route structures for `/delivery-metrics/` and `/costs/`
   - Admin routes under `/admin/`

5. **Mock Server**:
   - Configured in `src/__mocks__/mockServer.ts`
   - Intercepts API calls to `/api/v3/*` endpoints
   - Add new mock endpoints in the `routes()` function

### Testing

- **Unit Tests**: Jest with React Testing Library
  - Test files: `*.test.ts(x)` or `__tests__/*`
  - Setup: `jestSetup.ts` and `src/setupTests.ts`
  - Run with `npm test` or `npm run coverage`

- **E2E Tests**: Cypress
  - Config: `cypress/config/config.config.ts`
  - Requires base URL configuration
  - Run with `npm run cypress:open` or `npm run cypress:run`

### Code Quality Tools

- **ESLint**: Airbnb config with TypeScript support
  - Config: `.eslintrc.js`
  - Includes React, a11y, testing-library, jest-dom plugins
  - Custom rules for import ordering and TypeScript

- **Prettier**: Configured with no semicolons
  - Config: `.prettierrc`
  - Integrated with ESLint via `eslint-plugin-prettier`

- **TypeScript**:
  - Config: `tsconfig.json` (main), `tsconfig.node.json` (for Vite config)
  - Target: ES2020, Module: ESNext
  - Module resolution: bundler (Vite)
  - No implicit any disabled

### Vite Configuration

- **Version**: Vite 6.4.1
- Entry: `src/index.tsx` (referenced in `index.html`)
- Dev server: Port 3000, supports Docker with host `0.0.0.0`
- Plugins:
  - `@vitejs/plugin-react@5` - React Fast Refresh and JSX support
  - `vite-tsconfig-paths@5` - TypeScript path mapping support
  - `vite-plugin-svgr` - SVG as React components
  - Custom `rawLoader` - Imports `.md` files as raw strings
- Build output: `build/` directory
- Environment variables: Use `import.meta.env` instead of `process.env`
- Global polyfill: `global` is mapped to `globalThis` for Node.js package compatibility
- Security: Does NOT expose `process.env` to avoid leaking environment variables

## Common Patterns

### Adding a New UI Component
1. Create directory in `src/ui/ComponentName/`
2. Create `index.tsx` as the main export
3. Keep all related files in that directory (no subdirectories)
4. Export everything through `index.tsx`

### Adding a New Mock Endpoint
1. Create mock data file in `src/__mocks__/`
2. Import it in `src/__mocks__/mockServer.ts`
3. Add route handler in the `routes()` function
4. Use `addNextPageHeader()` wrapper for pagination support

### Creating Custom Hooks
- Add to `src/api/hooks.ts` for API-related hooks
- Add to `src/utils/hooks/` for general-purpose hooks
- Export through respective `index.ts` files

## Important Notes

- **No nested directories** in `ui/`, `utils/`, or `api/` - strictly depth 1
- **Always import from index.ts/tsx** when referencing code from `ui/`, `utils/`, or `api/`
- **Use absolute imports** via TypeScript path mapping, not relative imports
- **Mock server** only runs in development mode when not in Docker (check `VITE_IN_DOCKER`)
- **Follow ESLint rules** - no commented-out code (`etc/no-commented-out-code`)
- **Environment variables**: Use `import.meta.env` (Vite) instead of `process.env`
  - `import.meta.env.DEV` - true in development mode
  - `import.meta.env.PROD` - true in production mode
  - `import.meta.env.MODE` - current mode ('development' or 'production')
  - Custom env vars must be prefixed with `VITE_` (e.g., `VITE_IN_DOCKER`)
