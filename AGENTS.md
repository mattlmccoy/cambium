# Cambium - Custom Furniture Platform

## Project Overview
Cambium is a software-driven furniture platform. Users design personalized flat-pack furniture via a 3D web configurator. Furniture is fabricated at regional microfactories using locally-sourced wood.

## Architecture
- **Monorepo**: Turborepo + pnpm workspaces
- **apps/web**: Consumer-facing Next.js 15 app with 3D configurator (React Three Fiber)
- **apps/admin**: Internal business tools Next.js 15 app
- **packages/config-engine**: Pure TypeScript parametric engine (geometry, BOM, cost, validation) — no framework dependencies
- **packages/db**: Drizzle ORM schema + PostgreSQL client
- **packages/shared**: Types, constants, wood species data
- **packages/ui**: Shared React UI components

## Key Conventions
- TypeScript strict mode everywhere
- Tailwind CSS v4 for styling
- Zustand for client-side configurator state
- All dimensions are in millimeters internally
- Prices in the DB are stored in cents (integer)
- The config-engine must remain framework-agnostic (no React/Next.js imports)

## Commands
```bash
pnpm dev          # Start all dev servers (web:3000, admin:3001)
pnpm build        # Build all apps and packages
pnpm typecheck    # Type-check all packages
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
pnpm db:studio    # Open Drizzle Studio
```

## Important File Paths
- Configurator store: `apps/web/lib/configurator-store.ts`
- 3D scene: `apps/web/components/configurator/Scene.tsx`
- Side table model: `apps/web/components/configurator/SideTableModel.tsx`
- Config engine entry: `packages/config-engine/src/engine.ts`
- Wood species data: `packages/shared/src/constants/index.ts`
- DB schema: `packages/db/schema/`
