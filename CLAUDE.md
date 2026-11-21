@AGENTS.md

# DarERP – notes for Claude

Bilingual (Arabic default, English) ERP foundation. The owner is not a developer:
explain changes in plain language, and keep the README setup steps accurate.

## Stack

- Next.js 16 App Router with **Cache Components** + Partial Prefetching (see `next.config.ts`).
  This Next.js is newer than most training data: read `node_modules/next/dist/docs/` before using an API.
  Middleware is called **Proxy** here (`src/proxy.ts`).
- Supabase (Postgres, Auth, Row Level Security) via `@supabase/ssr`.
- Tailwind CSS v4 with design tokens in `src/app/globals.css` (`bg-surface`, `text-muted`, `bg-primary`…).
- zod for validating Server Action input, lucide-react for icons.

## Commands

- `npm run lint`, `npx tsc --noEmit`, `npm run build`: run all three before committing.
- `npm run test:db`: runs every migration in PGlite and checks the RLS/permission rules.
  Extend `tests/db/permissions.test.mjs` when you add tables or policies.

## Architecture rules

- **Routing:** every page lives under `src/app/[lang]/` (`lang` = `ar` | `en`, see `src/i18n/config.ts`).
  `(auth)` = public pages, `(app)` = signed-in pages with the sidebar shell.
  `/auth/confirm` (outside `[lang]`) handles Supabase email links.
- **Text:** never hard-code UI text. Add keys to BOTH `src/i18n/dictionaries/en.ts` and `ar.ts`
  (ar.ts is typed against en.ts, so a missing key is a type error). Server components get
  `getDictionary(lang)`; pass the needed slice to client components as props.
- **RTL:** use logical Tailwind classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`,
  `border-s`) instead of left/right. Mark emails/numbers/codes with `ltr` / `.ltr-text`.
- **Auth & permissions (defense in depth):**
  1. `src/proxy.ts`: fast check that someone is signed in.
  2. Pages: `requireUser(lang)` / `requirePermission(lang, "x.y")` from `src/lib/auth.ts`.
  3. Server Actions: re-check with `getCurrentUser()` + `can(user, "x.y")`. Never trust the client.
  4. Database: RLS policies using `public.has_permission('x.y')`. This is the real guarantee.
- **Supabase server client** (`src/lib/supabase/server.ts`) calls `await connection()` first:
  Supabase reads the clock, which Cache Components forbids during prerender/prefetch.
  Code that reads the session must sit behind `<Suspense>` (the `(app)/loading.tsx` boundary
  covers pages; the layout wraps user-dependent parts in their own `<Suspense>`).
- **Mutations:** Server Actions return `{ error?: ErrorKey }` / `FormState` (keys into
  `dict.errors`), and call `refresh()` from `next/cache` after a successful write.
- **Database changes:** always a NEW file in `supabase/migrations/` (timestamp prefix), never edit an
  applied one. Enable RLS on every new table. Update `src/lib/supabase/database.types.ts`.
  Tell the owner to run the new file in the Supabase SQL Editor (or `npx supabase db push`).

## Adding a module (e.g. Customers)

1. Migration: table(s) + RLS policies + `insert into public.permissions` rows
   (`customers.view`, `customers.manage`) + sensible `role_permissions` defaults.
2. `src/lib/permissions.ts`: add the permission keys.
3. Dictionaries: permission labels/descriptions, nav label, page text (en + ar).
4. Page(s) under `src/app/[lang]/(app)/customers/` using `requirePermission`.
5. Sidebar item in `src/components/shell/sidebar-nav.tsx` with its `permission`.
6. Types in `database.types.ts`, tests in `tests/db/`, then lint + tsc + build.

## Roles model

- `admin` always has every permission (not stored in `role_permissions`).
- First sign-up becomes an active admin; later sign-ups are inactive `staff` until approved.
- The last active admin can't be demoted or deactivated (DB trigger `guard_profile_update`).
