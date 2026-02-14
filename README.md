# No Catch (v1)

A minimal giveaway site: one free item per day, random US winner, no accounts.

## Stack
- Next.js (App Router)
- Supabase (Postgres + Storage)
- Vercel (hosting + cron)
- Resend (email)

## Quickstart (local)
1. Create a Supabase project
2. Run the SQL in `supabase/schema.sql`
3. Copy `.env.example` to `.env.local` and fill in values
4. Install + run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy (Vercel)
- Import repo into Vercel
- Set env vars from `.env.example`
- Add a Vercel Cron job to call:

`https://YOUR_DOMAIN/api/cron/pick-winner?secret=CRON_SECRET`

Schedule: `5 0 * * *` in America/Los_Angeles (or `5 8 * * *` UTC depending on Vercel UI).
(We trigger a few seconds after midnight PT.)

## Admin
- Admin UI: `/admin`
- Requires `ADMIN_KEY` (set in env). The admin page prompts for it and stores it in localStorage.
- Admin API uses header: `x-admin-key: <ADMIN_KEY>`

## Notes
- Daily re-entry is enforced by a unique constraint: (date_pst, email)
- If first name/state are omitted, we generate deterministic `display_name` and `display_state` from an email hash.
- Winner selection uses Node's crypto randomness and logs are stored in the `winners` table.

