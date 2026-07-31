# 💼 HireConnect - AI Based Job Matching Platform

> A modern AI-inspired recruitment platform that connects job seekers and employers through an intelligent job matching system. Built with React, TypeScript, Express.js, PostgreSQL, and Prisma.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Overview

HireConnect is a full-stack recruitment platform designed to simplify the hiring process for both job seekers and employers.

The platform enables employers to post jobs, manage candidates, and track hiring activities, while job seekers can create professional profiles, search jobs, and apply online. It features secure authentication, role-based access control, responsive UI, and scalable architecture.

---

# ✨ Key Features

## 👤 Authentication

- User Registration
- Secure Login
- JWT Authentication
- Role-Based Access Control
- Forgot Password
- Reset Password
- Change Password
- Email Verification

---

## 👨‍💼 Job Seeker Features

- Professional Profile
- Resume Upload
- Skills Management
- Education & Experience
- Job Search
- Advanced Filters
- Save Jobs
- Apply Jobs
- Track Application Status
- Profile Completion

---

## 🏢 Employer Features

- Company Profile
- Post New Jobs
- Edit Jobs
- Delete Jobs
- View Applicants
- Shortlist Candidates
- Reject Candidates
- Dashboard Analytics
- Manage Active Jobs

---

## 👑 Admin Features

- Dashboard
- User Management
- Employer Management
- Job Moderation
- Category Management
- Skills Management
- Reports & Analytics

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication
- Bcrypt
- Multer
- Nodemailer
- Socket.IO

## Database

- PostgreSQL

---

# 📂 Project Structure

```
HireConnect
│
├── client
│   ├── src
│   ├── public
│   └── package.json
│
├── server
│   ├── prisma
│   ├── src
│   ├── uploads
│   └── package.json
│
├── docs
│
├── README.md
└── LICENSE
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/naimuropu-cell/HireConnect.git
cd HireConnect
```

---

# ⚙ Backend Setup

```bash
cd server

npm install

copy .env.example .env

npx prisma migrate dev

npm run seed

npm run dev
```

Backend runs on

```
http://localhost:5000
```

---

# 💻 Frontend Setup

```bash
cd client

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# 🔑 Demo Accounts

## 👑 Admin

| Email | Password |
|--------|----------|
| admin@hireconnect.com | Admin@123 |

---

## 🏢 Employer

| Email | Password |
|--------|----------|
| employer@hireconnect.com | Employer@123 |

---

## 👤 Job Seeker

| Email | Password |
|--------|----------|
| seeker@hireconnect.com | Seeker@123 |

---

# 📸 Screenshots

> Add screenshots here

```
Home Page

Login

Dashboard

Job Listings

Employer Dashboard

Admin Dashboard
```

---

# 🔄 Application Workflow

```
User Registration
        │
        ▼
Login
        │
        ▼
Select Role
        │
 ┌──────┴────────┐
 │               │
 ▼               ▼
Employer      Job Seeker
 │               │
 ▼               ▼
Post Job      Search Job
 │               │
 ▼               ▼
Receive       Apply Job
Applications      │
 │               ▼
 ▼          Track Status
Shortlist
 │
 ▼
Hire Candidate
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing (Bcrypt)
- Protected Routes
- Role-Based Authorization
- Input Validation
- Secure File Upload
- Environment Variables
- API Validation

---

# 📈 Future Improvements

- AI Resume Parser
- Resume Scoring
- Candidate Recommendation
- Company Reviews
- Google Login
- LinkedIn Login
- Two-Factor Authentication
- Interview Scheduling
- Real-Time Chat
- AI Career Assistant

---

# 🧪 QA Testing Scope

The platform is suitable for Manual & Automation Testing.

Modules:

- Authentication
- User Registration
- Login
- Forgot Password
- Profile Management
- Resume Upload
- Job Search
- Job Details
- Apply Job
- Employer Dashboard
- Admin Dashboard
- Notifications
- CRUD Operations
- API Testing

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository

2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push changes

```bash
git push origin feature/new-feature
```

5. Create a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Md. Naimur Rahman**

GitHub: https://github.com/naimuropu-cell

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
