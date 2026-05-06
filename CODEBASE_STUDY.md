# Codebase Study Notes

## Scope reviewed
- Reviewed repository structure, routes, shared components, page modules, state store, and test/tooling configuration.
- Focused on application-owned source tracked by git (`git ls-files`) to avoid third-party dependencies.

## High-level architecture
- Stack: React 18 + TypeScript + Vite + Tailwind + shadcn/ui + React Router + Zustand.
- App entrypoint is `src/main.tsx`, mounting a single `<App />` tree.
- Routing is centralized in `src/App.tsx` and split into:
  - Public marketing pages
  - Authentication pages
  - Role-based dashboard areas (admin / teacher / student / parent), each with nested routes.

## Source layout observations
- `src/components/ui/*`: large collection of reusable shadcn/Radix UI primitives.
- `src/components/site/*`: marketing-site scaffolding (`Navbar`, `Footer`, `SiteLayout`, hero/CTA blocks).
- `src/components/dashboard/*`: common dashboard presentation widgets.
- `src/pages/*`: top-level marketing and auth pages.
- `src/pages/dashboard/*`: role dashboards and role-specific feature pages.
- `src/store/index.ts`: centralized Zustand state for teacher timetable slots and clock-in status.
- `src/lib/*`: shared helpers (`utils`, CSV helper).
- `src/test/*`: Vitest setup and example test.

## Functional understanding
- The project is currently UI-first and mostly static/mock-data driven.
- Dashboard pages provide shell workflows for each role, with some interactive state via Zustand:
  - Teacher timetable editing data model (`WeeklySchedule` / `SlotData`).
  - Teacher clock-in/clock-out toggle with last action timestamp.
- React Query provider is present globally, suggesting readiness for server-state integration, though most pages appear static now.

## Design system and consistency
- Styling uses semantic tokens and utility conventions defined in `src/index.css` and Tailwind config.
- The visual system emphasizes reusable UI primitives from `src/components/ui` and composition in route pages.

## Test and quality setup
- Linting: ESLint (`npm run lint`).
- Unit tests: Vitest (`npm run test`) with Testing Library setup in `src/test/setup.ts`.
- Build pipeline: Vite (`npm run build`, `npm run preview`).

## Quantitative snapshot (tracked files)
Generated from `git ls-files`:
- Total tracked files: 146
- TSX files: 110 (~9.7k lines)
- TS files: 11 (~462 lines)
- CSS files: 2 (~112 lines)
- Markdown docs: 2 (~1k lines)

## Key risks / opportunities noticed
- Many dashboard flows are still mock/static and will need backend wiring for real users.
- Role logic currently appears URL-driven; future auth/authorization hardening will be important.
- Store currently centers teacher-specific state; broader state patterns may be needed as features become dynamic.

## Suggested next deep-dive passes
1. Route-by-route interaction inventory (forms, tables, actions, validation).
2. Shared data contract audit (where mock structures should become API contracts).
3. UI primitive usage audit to reduce duplication and enforce consistent variants.
4. Test coverage expansion for authentication flow and dashboard critical interactions.
