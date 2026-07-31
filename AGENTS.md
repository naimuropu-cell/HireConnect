# AGENTS.md

Full-stack recruitment platform. Monorepo with `server/` (Express + Prisma API) and `client/` (React 19 SPA).

## Commands

Server (`server/`):
- `npm run dev` — tsx watch on :5000
- `npm run build` — tsc to `dist/`
- `npm run seed` — reset demo data (run after `prisma migrate reset`/`migrate dev`)
- `npm test` — vitest unit tests
- `npx prisma studio` — browse the DB
- Setup order for a fresh clone: `copy .env.example .env` → `npx prisma migrate dev` → `npm run seed`

Client (`client/`):
- `npm run dev` — Vite on :5173 (proxies `/api` and `/socket.io` to :5000, no CORS issues)
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — eslint (only fast-refresh warnings are expected)

## Architecture notes (verified)

- **Prisma schema is SQLite-first** and intentionally uses `String` for enum-like fields (job type, status, role, etc.) validated by Zod. Do NOT add native Prisma enums — SQLite doesn't support them and this keeps the Postgres provider swap one line.
- `Report` is string-typed (`targetType` + `targetId`) on purpose — it's polymorphic across User/Company/Job. Adding FK relations to it breaks (see git history: P2003).
- `PUT /profile` **replaces** arrays (`skills`, `education`, `experience`, `certifications`), doesn't merge.
- Email sends to the console by default (`SMTP_DEV=true`). OTP codes are the auth-flow's verification channel; there's no separate email-notification provider.
- Server route map is `src/routes/index.ts`; controllers use `validatedData<T>(req)` for Zod-validated input — never read `req.body` directly.
- Client: TanStack Query for data, AuthContext + axios interceptor (auto token refresh, one-time on 401), role guards in `src/components/layout/guards.tsx`, shadcn-style UI hand-written in `src/components/ui/*` (no shadcn CLI).

## Environment gotchas

- Windows / PowerShell 5.1 shell. SQLite dev DB (`server/prisma/dev.db`) is gitignored.
- No Docker locally; `docker-compose.yml` exists for Postgres deployment (untested here).
- Demo accounts (from seed): admin/Admin@123, seeker/Seeker@123, employer/Employer@123.
- `docs/API.md` and `docs/architecture.md` are the authoritative references; keep them in sync when changing endpoints.
