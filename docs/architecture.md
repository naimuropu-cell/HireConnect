# Architecture

## High-level

```
client (React SPA, Vite on :5173)  ──proxy──►  server (Express on :5000)
                                                    │
                                              Prisma ORM ──► SQLite (dev) / PostgreSQL (prod)
                                                    │
                                              Socket.io (realtime notifications)
```

The client proxies `/api` and `/socket.io` to the server during development
(see `client/vite.config.ts`), so no CORS setup is needed locally.

## Monorepo layout

| Path      | Purpose                                                       |
|-----------|---------------------------------------------------------------|
| `server/` | Express + TypeScript API, Prisma schema/migrations, seed, tests |
| `client/` | React 19 SPA (Vite + Tailwind v4 + TanStack Query)              |
| `docs/`   | API reference and this document                                |

## Server

- **Entry**: `src/index.ts` (HTTP + Socket.io bootstrap), app assembly in `src/app.ts`.
- **Route map**: all endpoints in `src/routes/index.ts`.
- **Controllers** in `src/controllers/*`; Zod schemas in `src/schemas/index.ts`.
- **Middleware**: `authenticate` (Bearer JWT), `authorize('ADMIN')` (role gate),
  `validate(schema)` (validates `body`/`query`/`params`, exposes `req.validated`).
- **Error handling**: `ApiError` subclasses thrown in controllers are converted to JSON
  responses by `src/middleware/error.ts`. Prisma errors `P2002`/`P2025` map to 409/404.

### Data model notes

- The schema is **SQLite-first** for zero-setup local dev; switching to Postgres is a one-line
  provider change plus `DATABASE_URL`. Enum-like fields are plain `String` (validated by Zod)
  so the schema works on both providers — **do not reintroduce native Prisma enums**.
- `Application` has a unique `(jobId, userId)` — one application per user per job.
- `Report` is intentionally **string-typed** (`targetType` + `targetId`) rather than a FK,
  because the target is polymorphic across User/Company/Job.
- Profile sub-records (`education`, `experience`, `certifications`, `skills`) are **replaced**
  on `PUT /profile`, never merged.

### Email

`src/lib/mailer.ts` logs messages to the console when `SMTP_DEV=true` (the default) instead of
sending. Set real SMTP creds in `.env` to send live email. OTPs are stored hashed in `OtpCode`.

### Uploads

Resumes and logos are stored locally in `server/uploads/` and served at `/api/uploads/<file>`.
`MAX_FILE_SIZE_MB` and mime filters are enforced by `src/lib/upload.ts`. For production, swap
the disk storage for Cloudinary.

## Client

- **Routing**: `src/App.tsx` — lazy-loaded routes wrapped in `ProtectedRoute` (any authed user)
  and `RoleRoute role="..."` (role gate). Public pages sit inside `RootLayout` (navbar/footer).
- **Auth state**: `src/context/AuthContext.tsx`. Axios instance in `src/lib/api.ts` auto-attaches
  the bearer token and transparently refreshes the access token once on a 401, then redirects to
  `/login` if refresh fails.
- **Data fetching**: TanStack Query. List endpoints use query keys like `['jobs', params]`.
- **UI kit**: hand-written shadcn-style components in `src/components/ui/*` (Button, Card, Dialog,
  Input, Select, Tabs, ...). No shadcn CLI — extend the existing files directly.
- **Constants**: labels for job types/work modes/experience/application statuses live in
  `src/lib/constants.ts`. Badge colors are mapped there too.

## Conventions

- Server controllers use `validatedData<T>(req)` to read validated input; never trust `req.body` directly.
- All API responses are wrapped in `{ success: true, ... }`.
- Money is stored as `Int` (min/max) — no floats.
- Dates are ISO-8601 strings over the wire; the client formats with `Intl` helpers in `src/lib/utils.ts`.

## Scripts

- Server: `npm run dev` (tsx watch) · `npm run build` (tsc) · `npm run seed` · `npm test` (vitest) · `npm run db:studio`
- Client: `npm run dev` (Vite) · `npm run build` (tsc + vite build) · `npm run lint`

## Demo accounts

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@hireconnect.com  | Admin@123   |
| Seeker   | seeker@hireconnect.com | Seeker@123  |
| Employer | employer@hireconnect.com | Employer@123 |
