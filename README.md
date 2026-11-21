# DarERP

A bilingual (Arabic / English) business management system.

**Built with:** Next.js 16 (React) · Supabase (database, logins, permissions) · Tailwind CSS · hosted on Vercel.

## What's included

| Feature | Details |
|---|---|
| Sign in / sign up | Email and password, "forgot password" by email |
| Approval of new users | The **first** person to sign up becomes **Admin**. Everyone after that waits until an admin approves them. |
| Roles | Admin, Manager, Staff |
| Permissions | Admins choose what Managers and Staff can do (Roles & permissions page). Enforced in the database, not just hidden in the UI. |
| Users page | Approve, deactivate and change the role of any user |
| My account | Change name and password |
| Arabic + English | Full right-to-left layout in Arabic, one click to switch |
| Mobile friendly | Sidebar becomes a slide-in menu on phones |
| Dark mode | Follows the device setting |

---

## Put it online (one time, about 15 minutes)

### 1. Create the database (Supabase)

1. Go to [supabase.com](https://supabase.com) → **New project**. Choose a name, a strong database password and the region closest to your users.
2. When it's ready, open **SQL Editor** → **New query**.
3. Open the file [`supabase/migrations/20261121000000_foundation.sql`](supabase/migrations/20261121000000_foundation.sql), copy **all** of it, paste it in the editor and click **Run**. You should see "Success".
4. Open **Project Settings → API keys** (or the **Connect** button) and keep these two values for step 2:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **Publishable key** (starts with `sb_publishable_`; older projects call it the **anon** key)

### 2. Host the app (Vercel)

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New → Project** → import **DarERP**.
2. Before clicking Deploy, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your Publishable key |

3. Click **Deploy**. You get an address like `https://darerp.vercel.app`.

### 3. Connect the two

In Supabase → **Authentication → URL Configuration**:

- **Site URL:** your Vercel address, e.g. `https://darerp.vercel.app`
- **Redirect URLs:** add
  - `https://darerp.vercel.app/auth/confirm`
  - `http://localhost:3000/auth/confirm` (for working on your own computer)

### 4. Create your admin account

Open your site and **create an account first**. The first account becomes the Admin automatically. Confirm your email, sign in, and you're in.

Then ask your team to sign up and approve them in **Users**.

> **Tip (later):** Supabase's built-in email service only sends a few emails per hour. Before real use, connect your own email sender in Supabase → **Authentication → Emails → SMTP Settings** (for example [Resend](https://resend.com)).
>
> **Your own domain:** in Vercel → Project → **Settings → Domains**, then update the Site URL and Redirect URLs in Supabase to match.

---

## Run it on your own computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
cp .env.example .env.local   # then put your Supabase URL and key in .env.local
npm run dev
```

Open http://localhost:3000.

| Command | What it does |
|---|---|
| `npm run dev` | Start the app for development |
| `npm run build` | Build for production (also checks types) |
| `npm run lint` | Check code style |
| `npm run test:db` | Test the database security rules (no Supabase account needed) |

---

## Project layout

```
supabase/migrations/      Database: tables, roles, permissions, security rules
tests/db/                 Tests for the database security rules
src/proxy.ts              Runs before every page: language in URL + login check
src/app/[lang]/(auth)/    Sign in, sign up, forgot/reset password, waiting-for-approval
src/app/[lang]/(app)/     Signed-in pages: dashboard, users, roles, settings
src/app/auth/confirm/     Where links in Supabase emails land
src/i18n/dictionaries/    All text, in English (en.ts) and Arabic (ar.ts)
src/lib/auth.ts           Who is signed in + permission checks
src/lib/permissions.ts    List of roles and permissions
src/components/           Shared building blocks (buttons, cards, sidebar…)
```

## Improving it with Claude

Open this repository in Claude Code and describe what you want, for example
*"Add a Customers module: list, add, edit, with a customers.view and customers.manage permission"*.
`CLAUDE.md` explains to Claude how the project is built and the rules to follow.
