# HireConnect — Intelligent Candidate Matching Platform

HireConnect is a modern full-stack recruitment platform that connects job seekers and employers.

## Features

- **Authentication**: Register, login, forgot/reset password, OTP + email verification, remember me, change password, JWT + refresh tokens, role-based access (Seeker / Employer / Admin).
- **Job Seekers**: Professional profile (skills, education, experience, certifications), resume upload, job search with advanced filters, apply/withdraw, save jobs, track applications, notifications.
- **Employers**: Company registration & profile, job CRUD, applicants management, shortlist / reject / hire, schedule interviews, dashboard analytics & charts.
- **Admin**: User management, employer approval, job moderation, category & skill management, reports, analytics dashboard.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS, shadcn-style UI, React Router, TanStack Query, React Hook Form, Zod, Axios |
| Backend    | Node.js, Express, TypeScript, Prisma ORM, JWT, Bcrypt, Multer, Nodemailer, Socket.io |
| Database   | PostgreSQL (Supabase) for production, SQLite for local dev |
| Storage    | Local uploads (Cloudinary-ready) |

## Project Structure

```
HireConnect/
  client/     # React SPA
  server/     # Express + Prisma API
  docs/       # Documentation
  docker-compose.yml
  README.md
```

## Getting Started (local dev)

> Requires Node.js >= 20. The dev server uses SQLite so it runs with zero external services.

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Configure server env
cd ../server
copy .env.example .env

# 3. Create the DB schema and seed demo data
npx prisma migrate dev
npm run seed

# 4. Start the API (http://localhost:5000)
npm run dev

# 5. In another terminal, start the client (http://localhost:5173)
cd ../client
npm install
npm run dev
```

### Demo accounts (from seed)

| Role    | Email                  | Password  |
|---------|------------------------|-----------|
| Admin   | admin@hireconnect.com  | Admin@123 |
| Seeker  | seeker@hireconnect.com | Seeker@123|
| Employer| employer@hireconnect.com|Employer@123|

## Switching to PostgreSQL

1. Change `provider` to `"postgresql"` in `server/prisma/schema.prisma`.
2. Set `DATABASE_URL` to your Postgres (e.g. Supabase) connection string in `server/.env`.
3. `npx prisma migrate dev` and `npm run seed`.

## Scripts

| Where  | Script        | Purpose                          |
|--------|---------------|----------------------------------|
| server | `npm run dev` | Dev server with hot reload (tsx) |
| server | `npm run build`| Compile TypeScript to `dist/`   |
| server | `npm run seed`| Seed demo data                  |
| server | `npm test`    | Run API tests                   |
| client | `npm run dev` | Vite dev server                 |
| client | `npm run build`| Production build                |

## Docs

See `docs/` for the API reference and architecture notes.

## License

MIT — see [LICENSE](LICENSE).
