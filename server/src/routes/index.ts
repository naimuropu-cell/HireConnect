import { Router } from 'express';
import * as auth from '../controllers/auth.controller';
import * as profile from '../controllers/profile.controller';
import * as jobs from '../controllers/job.controller';
import * as company from '../controllers/company.controller';
import * as app from '../controllers/application.controller';
import * as dashboard from '../controllers/dashboard.controller';
import * as notifications from '../controllers/notification.controller';
import * as admin from '../controllers/admin.controller';
import { authenticate, authorize, requireActiveUser } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshSchema,
  createJobSchema,
  updateJobSchema,
  listJobsSchema,
  updateProfileSchema,
  createCompanySchema,
  updateCompanySchema,
  applyJobSchema,
  updateApplicationSchema,
  scheduleInterviewSchema,
  reportSchema,
  resolveReportSchema,
  categorySchema,
  skillSchema,
} from '../schemas';
import { uploadResume, uploadLogo } from '../lib/upload';

const router = Router();

const me = [authenticate, requireActiveUser];

// ------------------------------- AUTH -------------------------------------
router.post('/auth/register', validate(registerSchema), auth.register);
router.post('/auth/login', validate(loginSchema), auth.login);
router.post('/auth/refresh', validate(refreshSchema), auth.refresh);
router.post('/auth/logout', auth.logout);
router.post('/auth/forgot-password', validate(forgotPasswordSchema), auth.forgotPassword);
router.post('/auth/verify-otp', validate(verifyOtpSchema), auth.verifyEmail);
router.post('/auth/resend-otp', auth.resendOtp);
router.post('/auth/reset-password', validate(resetPasswordSchema), auth.resetPassword);
router.post('/auth/change-password', [...me, validate(changePasswordSchema)], auth.changePassword);
router.get('/auth/me', me, auth.me);

// ------------------------------ PROFILE ------------------------------------
router.get('/profile/me', me, profile.getMyProfile);
router.put('/profile', me, validate(updateProfileSchema), profile.updateProfile);
router.post('/profile/resume', me, uploadResume.single('resume'), profile.uploadResume);
router.delete('/profile/resume', me, profile.removeResume);
router.get('/profile/:userId', me, profile.getPublicProfile);

// -------------------------------- JOBS -------------------------------------
router.get('/jobs', validate(listJobsSchema), jobs.listJobs);
router.get('/jobs/categories', jobs.getCategories);
router.get('/jobs/skills', jobs.getSkills);
router.get('/jobs/saved', me, jobs.getSavedJobs);
router.post('/jobs/:id/save', me, jobs.saveJob);
router.delete('/jobs/:id/save', me, jobs.unsaveJob);
router.post('/jobs/:id/apply', me, validate(applyJobSchema), app.applyToJob);
router.get('/jobs/:id', jobs.getJob);

router.get('/my/jobs', me, jobs.listMyJobs);
router.post('/jobs', me, validate(createJobSchema), jobs.createJob);
router.put('/jobs/:id', me, validate(updateJobSchema), jobs.updateJob);
router.post('/jobs/:id/close', me, jobs.closeJob);
router.post('/jobs/:id/reopen', me, jobs.reopenJob);
router.delete('/jobs/:id', me, jobs.deleteJob);

// ------------------------------ COMPANY ------------------------------------
router.post('/company', me, validate(createCompanySchema), company.createCompany);
router.get('/company/me', me, company.getMyCompany);
router.put('/company', me, validate(updateCompanySchema), company.updateCompany);
router.post('/company/logo', me, uploadLogo.single('logo'), company.uploadLogo);
router.get('/companies', company.listCompanies);
router.get('/companies/:slug', company.getPublicCompany);

// --------------------------- APPLICATIONS ----------------------------------
router.get('/applications/me', me, app.getMyApplications);
router.post('/applications/:id/withdraw', me, app.withdrawApplication);
router.get('/applications/:id', me, app.getApplication);

// Employer applicants
router.get('/jobs/:jobId/applicants', me, app.listApplicants);
router.put('/applications/:id/status', me, validate(updateApplicationSchema), app.updateApplicationStatus);
router.post('/applications/:id/interview', me, validate(scheduleInterviewSchema), app.scheduleInterview);
router.get('/interviews', me, app.listInterviews);

// --------------------------- RECOMMENDATIONS ------------------------------
router.get('/jobs/:jobId/recommendations', me, dashboard.candidateRecommendations);

// ----------------------------- DASHBOARD -----------------------------------
router.get('/dashboard/employer', me, dashboard.employerDashboard);
router.get('/dashboard/admin', me, authorize('ADMIN'), dashboard.adminDashboard);

// ----------------------------- NOTIFICATIONS -------------------------------
router.get('/notifications', me, notifications.getNotifications);
router.put('/notifications/read-all', me, notifications.markAllRead);
router.put('/notifications/:id/read', me, notifications.markOneRead);

// -------------------------------- ADMIN ------------------------------------
router.use('/admin', me, authorize('ADMIN'));
router.get('/admin/users', admin.listUsers);
router.put('/admin/users/:id/status', validate(resolveReportSchema), admin.updateUserStatus);
router.get('/admin/companies', admin.listCompanies);
router.put('/admin/companies/:id/approve', admin.approveCompany);
router.get('/admin/jobs', admin.listAllJobs);
router.put('/admin/jobs/:id/moderate', validate(resolveReportSchema), admin.moderateJob);
router.post('/admin/categories', validate(categorySchema), admin.createCategory);
router.put('/admin/categories/:id', validate(categorySchema.partial()), admin.updateCategory);
router.delete('/admin/categories/:id', admin.deleteCategory);
router.post('/admin/skills', validate(skillSchema), admin.createSkill);
router.delete('/admin/skills/:id', admin.deleteSkill);
router.get('/admin/reports', admin.listReports);
router.put('/admin/reports/:id', validate(resolveReportSchema), admin.resolveReport);
router.get('/admin/analytics', admin.analytics);

// -------------------------------- REPORTS ----------------------------------
router.post('/reports', me, validate(reportSchema), admin.createReport);

export default router;
