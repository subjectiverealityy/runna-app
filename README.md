Important: Please let's all create our feature/action branches from the dev branch and aim for descriptive commit histories.

# Runna — frontend-only preview

The real application's screens, built against the actual Next.js file
structure the backend-wired app uses — but with **no backend at all**.
Every screen renders from in-memory mock data (ported from the prototype),
and every interaction — sending a request, paying for an order, blocking
someone — is a real client-side state update, not a stub. Refresh the page
and everything resets to the seed data; nothing persists.

This exists so frontend work (styling, layout, interaction polish) can
happen without waiting on a live Supabase project, and so anyone picking
up the real implementation can see exactly which screens exist and how
they're meant to behave before wiring in real data.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. You'll land on a sign-in screen that's a
person picker instead of real Google auth — pick any seeded runner,
customer, or the admin account to see their screens, or go through
onboarding fresh as a new person. See "What's different from real
sign-in" below for why this screen only exists in this build.

## How this relates to the real, backend-wired app

There's a second, complete version of this project — Next.js + Supabase,
real auth, a real Postgres schema, RLS policies, API routes enforcing
every business rule — built from the same prototype and the same two spec
docs. This frontend-only build is structurally identical to it: same
route groups, same component boundaries, same design tokens. The
difference is entirely in **where data comes from**:

| | This build | The backend-wired app |
|---|---|---|
| Data | `lib/mock/data.ts` — static seed data | Postgres, via Supabase |
| State changes | `lib/mock/store.tsx` — a React Context holding everything in memory | API routes in `app/api/**`, calling `lib/business/*.ts` |
| Auth | A person picker (`app/(auth)/sign-in`) | Real Google OAuth via Supabase Auth |
| Persistence | None — refresh resets everything | Real, in Postgres |

**`lib/mock/store.tsx` is the one file that matters most here.** Every
action it exposes — `submitRequest`, `sendPrice`, `acceptPrice`,
`setPersonBlocked`, and so on — has a comment directly above it describing
the real API route it should become, which validation rules that route
needs to enforce, and in several cases, a real bug that was found and
fixed when this logic was first built out for the backend-wired app (an
ownership check that was missing, a race condition, a schema mismatch).
Porting a screen from this build into the real one is mostly: replace the
call into the mock store with a `fetch()` to the matching API route: the
JSX, the layout, and the interaction logic around it should carry over
directly.

## What's different from real sign-in

Since there's no backend, there's no real identity. `app/(auth)/sign-in`
is a list of every seeded person plus an admin shortcut — picking one
just sets which person you're "logged in" as
(`lib/mock/store.tsx::signInAs`). This screen doesn't exist in the
backend-wired app at all; it's replaced by a single "Sign in with Google"
button. Everywhere else in this codebase, the current person comes from
`useMockStore().currentPerson`, the same way the real app reads an
authenticated session — so that part of the swap should be mechanical.

## What is genuinely real here (not stubbed)

- The full order lifecycle: request → price → payment (wallet, since
  there's no real Flutterwave here either) → fulfilment code → delivered.
- The 5-minute countdown, the 24-hour chat lock and auto-unlock, and the
  3-miss auto-offline rule all actually run, on a real client-side
  interval — exactly like the original prototype did. (This is also
  exactly the one thing that does NOT survive into the backend-wired app
  as-is; see that app's `docs/backend-stack-decisions.md` for why.)
- Reporting, blocking (with the report-queue cleanup that was a real bug
  fix in the backend-wired app), feedback submission, starring, the
  vendor-runner self-fulfilment flow, and the full admin Data tab
  (campus/vendor/destination CRUD, soft-delete only) are all genuinely
  interactive.
- Onboarding enforces the same minimum-viable-profile validation
  (`lib/mock/store.tsx`'s `finishRunnerOnboarding`/`updateRunnerProfile`
  callers) that both onboarding and Settings enforce client-side in the
  real app.

## What's deliberately not modelled

- Payment is wallet-only; there's no direct-charge/Flutterwave path at
  all here, since there's nothing to charge against. The backend-wired
  app's `acceptPrice` has a real payment-bypass fix worth reading about in
  its hardening notes before assuming this mock version's simpler
  wallet-always-works version is safe to copy verbatim.
- Replying to Runna Support as a user isn't wired up (see the comment in
  `components/chat/SupportChatScreen.tsx`) — admin can message a person
  and it shows up, but the person's own reply box doesn't do anything yet.
- No RLS, no ownership checks, no concurrency handling — none of that
  applies when everything lives in one browser tab's memory. The
  backend-wired app's hardening notes are the list of what has to exist
  once real users and a real database are involved.
