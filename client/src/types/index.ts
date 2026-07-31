export type Role = 'SEEKER' | 'EMPLOYER' | 'ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatar?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  foundedYear?: number | null;
  approved: boolean;
  _count?: { jobs: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { jobs: number };
}

export interface Skill {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  companyId: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  description: string;
  type: string;
  workMode: string;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  experienceLevel: string;
  vacancies: number;
  deadline?: string | null;
  status: string;
  featured: boolean;
  views: number;
  publishedAt?: string | null;
  createdAt: string;
  company: Company;
  category?: Category | null;
  requiredSkills: { skill: Skill }[];
  _count?: { applications: number };
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: string;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  resumeName?: string | null;
  appliedAt: string;
  viewedAt?: string | null;
  decidedAt?: string | null;
  notes?: string | null;
  job?: Job;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar'>;
  interviews?: Interview[];
}

export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  durationMin: number;
  mode: string;
  link?: string | null;
  location?: string | null;
  notes?: string | null;
  status: string;
  application?: Application;
}

export interface ProfileSkill {
  level: string;
  skill: Skill;
}

export interface Education {
  id: string;
  institution: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current: boolean;
  description?: string | null;
}

export interface Certification {
  id: string;
  name: string;
  issuer?: string | null;
  url?: string | null;
  issuedDate?: string | null;
}

export interface Profile {
  id: string;
  userId: string;
  headline?: string | null;
  about?: string | null;
  location?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  resumeUrl?: string | null;
  resumeName?: string | null;
  portfolio?: string | null;
  github?: string | null;
  linkedin?: string | null;
  languages: string[];
  completion: number;
  skills: ProfileSkill[];
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
  reporter?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
