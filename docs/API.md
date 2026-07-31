# API Reference

Base URL (dev): `http://localhost:5000/api`

All responses use `{ success: true, ... }` on success and
`{ success: false, message, details? }` on failure.

## Authentication

### Register
`POST /auth/register`
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "StrongPass1",
  "role": "SEEKER"          // SEEKER | EMPLOYER
}
```
Sends an email verification OTP. Creates a `Profile` (seeker) or placeholder `Company` (employer).

### Login
`POST /auth/login` — body: `{ email, password, rememberMe? }`
Returns `{ accessToken, refreshToken, user }`. With `rememberMe` the refresh token is also set as an httpOnly cookie (`hc_refresh`).

### Refresh
`POST /auth/refresh` — body: `{ refreshToken? }` (falls back to cookie). Returns a new access token.

### Logout
`POST /auth/logout` — revokes the refresh token.

### Forgot / reset password
- `POST /auth/forgot-password` — `{ email }` sends a 6-digit reset code.
- `POST /auth/verify-otp` — `{ email, code, purpose }` verifies email.
- `POST /auth/reset-password` — `{ email, code, newPassword }`.
- `POST /auth/resend-otp` — `{ email, purpose }`.

### Authenticated user
- `GET /auth/me`
- `POST /auth/change-password` — `{ currentPassword, newPassword }`

## Public

### Jobs
- `GET /jobs?q=&category=&location=&company=&type=&workMode=&experience=&salaryMin=&salaryMax=&sort=latest|oldest|salary_high|salary_low&page=&pageSize=`
  - `type`, `workMode`, `experience` accept comma-separated values.
- `GET /jobs/:id` — public detail (increments views).
- `GET /jobs/categories`
- `GET /jobs/skills`

### Companies
- `GET /companies`
- `GET /companies/:slug`

## Authenticated (Bearer access token)

### Jobs (employer)
- `POST /jobs` — create job (requires approved company).
- `PUT /jobs/:id` — update own job.
- `POST /jobs/:id/close`, `POST /jobs/:id/reopen`
- `DELETE /jobs/:id` — employer owner or admin.
- `GET /my/jobs`

### Profile (seeker)
- `GET /profile/me`
- `PUT /profile` — accepts `headline, about, location, phone, dateOfBirth, portfolio, github, linkedin, languages[]`, and arrays `skills[{name,level}], education[], experience[], certifications[]`. Editing arrays **replaces** them.
- `POST /profile/resume` — multipart, field `resume` (PDF/DOC/DOCX, ≤5MB).
- `DELETE /profile/resume`
- `GET /profile/:userId`

### Applications (seeker)
- `POST /jobs/:id/apply` — `{ coverLetter?, resumeUrl?, resumeName? }`. Uses profile resume if none passed.
- `POST /applications/:id/withdraw`
- `GET /applications/me`

### Saved jobs
- `POST /jobs/:id/save`, `DELETE /jobs/:id/save`, `GET /jobs/saved`

### Company (employer)
- `POST /company`, `GET /company/me`, `PUT /company`, `POST /company/logo`

### Applicants (employer)
- `GET /jobs/:jobId/applicants?status=`
- `PUT /applications/:id/status` — `{ status: VIEWED|SHORTLISTED|INTERVIEW|REJECTED|HIRED, notes? }` (emails candidate)
- `POST /applications/:id/interview` — `{ scheduledAt, durationMin, mode, link?, location?, notes? }` (emails candidate)
- `GET /interviews`

### Recommendations
- `GET /jobs/:jobId/recommendations` — ranked candidates by skill match.

### Dashboards
- `GET /dashboard/employer`
- `GET /dashboard/admin` (admin only)

### Notifications
- `GET /notifications?unread=true&page=&pageSize=`
- `PUT /notifications/read-all`, `PUT /notifications/:id/read`

### Reports
- `POST /reports` — `{ targetType: USER|COMPANY|JOB, targetId, reason, details? }`

## Admin (role `ADMIN`)

- `GET /admin/users?q=&role=&active=&page=` · `PUT /admin/users/:id/status` — `{ isActive, role? }`
- `GET /admin/companies?approved=` · `PUT /admin/companies/:id/approve`
- `GET /admin/jobs?status=` · `PUT /admin/jobs/:id/moderate` — `{ status, featured? }`
- `POST /admin/categories` · `PUT /admin/categories/:id` · `DELETE /admin/categories/:id`
- `POST /admin/skills` · `DELETE /admin/skills/:id`
- `GET /admin/reports?status=` · `PUT /admin/reports/:id` — `{ action: RESOLVED|DISMISSED }`
- `GET /admin/analytics`

## Socket.io

Connect to `/` with query `userId=<user id>`. Server emits `notification` events
when a user receives a new notification (application status, interview, admin actions).
