# Footnote (footnote.vote)

*Every claim, footnoted.*

A nonpartisan, source-cited guide to candidates in U.S. federal and state
races. See [`PLAN.md`](./PLAN.md) for the full product doctrine, data
sources, and phased build plan. [`design/prototype.jsx`](./design/prototype.jsx)
is the original standalone design mockup that `app/page.tsx` was built from.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The homepage currently renders fictional sample candidate data for layout
purposes. The real ingest pipeline (FEC, Voteview, OpenStates, etc.) is
Phase 0/1 work per `PLAN.md`.

## Database

Postgres, hosted on Supabase. Schema lives in `db/schema.ts` (Drizzle ORM),
modeled directly on `PLAN.md`'s data model. Copy `.env.example` to `.env` and
fill in `DATABASE_URL` (the Supabase "Transaction pooler" connection string)
to run migrations locally:

```bash
npm run db:generate   # write a new migration after a schema change
npm run db:migrate    # apply pending migrations
npm run db:studio     # browse the database
```

## Deployment

Deployed on Vercel, connected to this repo for auto-deploy on push to `main`.
Custom domain: `footnote.vote`.
