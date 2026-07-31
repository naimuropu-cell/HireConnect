import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const emailSchema = z.string().email('Invalid email address');

export const roleSchema = z.enum(['SEEKER', 'EMPLOYER']);

// ------------------------------- AUTH ------------------------------------

export const registerSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(1, 'First name is required').max(100),
      lastName: z.string().min(1, 'Last name is required').max(100),
      email: emailSchema,
      password: passwordSchema,
      role: roleSchema,
      phone: z.string().optional(),
    })
    .refine((d) => (d.role === 'EMPLOYER' ? true : true)),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: emailSchema }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
    code: z.string().length(6, 'Code must be 6 digits'),
    purpose: z.enum(['EMAIL_VERIFY', 'PASSWORD_RESET']),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    code: z.string().length(6, 'Code must be 6 digits'),
    newPassword: passwordSchema,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().optional() }),
});

// ------------------------------- JOBS ------------------------------------

export const jobTypeSchema = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']);
export const workModeSchema = z.enum(['ONSITE', 'HYBRID', 'REMOTE']);
export const experienceSchema = z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']);

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title is required').max(200),
    categoryId: z.string().optional().nullable(),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    type: jobTypeSchema.default('FULL_TIME'),
    workMode: workModeSchema.default('ONSITE'),
    location: z.string().max(200).optional().nullable(),
    salaryMin: z.number().int().nonnegative().optional().nullable(),
    salaryMax: z.number().int().nonnegative().optional().nullable(),
    currency: z.string().max(10).default('USD'),
    experienceLevel: experienceSchema.default('MID'),
    vacancies: z.number().int().min(1).max(999).default(1),
    deadline: z.string().optional().nullable(),
    requiredSkills: z.array(z.string()).optional().default([]),
    featured: z.boolean().optional(),
    status: z.enum(['OPEN', 'DRAFT']).default('OPEN'),
  }),
});

export const updateJobSchema = createJobSchema.partial();

export const listJobsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    company: z.string().optional(),
    type: z.string().optional(),
    workMode: z.string().optional(),
    experience: z.string().optional(),
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    sort: z.enum(['latest', 'oldest', 'salary_high', 'salary_low', 'relevance']).optional(),
    page: z.string().optional(),
    pageSize: z.string().optional(),
  }),
});

// ------------------------------ PROFILE ----------------------------------

const dateLike = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v ? new Date(v) : null));

const educationItem = z.object({
  institution: z.string().min(1),
  degree: z.string().optional().nullable(),
  field: z.string().optional().nullable(),
  startDate: dateLike,
  endDate: dateLike,
  description: z.string().optional().nullable(),
});

const experienceItem = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional().nullable(),
  startDate: dateLike,
  endDate: dateLike,
  current: z.boolean().optional(),
  description: z.string().optional().nullable(),
});

const certificationItem = z.object({
  name: z.string().min(1),
  issuer: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  issuedDate: dateLike,
});

export const updateProfileSchema = z.object({
  body: z.object({
    headline: z.string().max(200).optional().nullable(),
    about: z.string().max(5000).optional().nullable(),
    location: z.string().max(200).optional().nullable(),
    phone: z.string().max(30).optional().nullable(),
    dateOfBirth: dateLike,
    portfolio: z.string().url('Invalid URL').optional().nullable(),
    github: z.string().url('Invalid URL').optional().nullable(),
    linkedin: z.string().url('Invalid URL').optional().nullable(),
    languages: z.array(z.string()).optional(),
    skills: z
      .array(z.object({ name: z.string().min(1), level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']) }))
      .optional(),
    education: z.array(educationItem).optional(),
    experience: z.array(experienceItem).optional(),
    certifications: z.array(certificationItem).optional(),
  }),
});

export const educationSchema = z.object({ body: educationItem });
export const experienceSchema_item = z.object({ body: experienceItem });
export const certificationSchema = z.object({ body: certificationItem });

// ------------------------------ COMPANY ----------------------------------

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Company name is required').max(150),
    description: z.string().max(5000).optional(),
    website: z.string().url('Invalid URL').optional().nullable(),
    industry: z.string().max(100).optional().nullable(),
    size: z.string().max(50).optional().nullable(),
    location: z.string().max(200).optional().nullable(),
    foundedYear: z.number().int().min(1800).max(2100).optional().nullable(),
  }),
});

export const updateCompanySchema = createCompanySchema.partial();

// ----------------------------- APPLICATION -------------------------------

export const applyJobSchema = z.object({
  body: z.object({
    coverLetter: z.string().max(5000).optional().nullable(),
    resumeUrl: z.string().optional().nullable(),
    resumeName: z.string().optional().nullable(),
  }),
});

export const updateApplicationSchema = z.object({
  body: z.object({
    status: z.enum(['VIEWED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED']),
    notes: z.string().max(2000).optional().nullable(),
  }),
});

export const scheduleInterviewSchema = z.object({
  body: z.object({
    scheduledAt: z.string().min(1, 'Scheduled time is required'),
    durationMin: z.number().int().min(15).max(480).default(60),
    mode: z.enum(['ONSITE', 'VIDEO', 'PHONE']).default('VIDEO'),
    link: z.string().url('Invalid URL').optional().nullable(),
    location: z.string().optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
  }),
});

// ------------------------------- ADMIN -----------------------------------

export const reportSchema = z.object({
  body: z.object({
    targetType: z.enum(['USER', 'COMPANY', 'JOB']),
    targetId: z.string().min(1),
    reason: z.string().min(3, 'Reason is required').max(500),
    details: z.string().max(2000).optional().nullable(),
  }),
});

export const resolveReportSchema = z.object({
  body: z.object({
    action: z.enum(['RESOLVED', 'DISMISSED']),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional().nullable(),
  }),
});

export const skillSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
  }),
});
