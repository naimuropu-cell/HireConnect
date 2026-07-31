export const JOB_TYPES: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

export const WORK_MODES: Record<string, string> = {
  ONSITE: 'On-site',
  HYBRID: 'Hybrid',
  REMOTE: 'Remote',
};

export const EXPERIENCE_LEVELS: Record<string, string> = {
  ENTRY: 'Entry level',
  JUNIOR: 'Junior',
  MID: 'Mid level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
};

export const APPLICATION_STATUSES: Record<string, string> = {
  PENDING: 'Pending',
  VIEWED: 'Viewed',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  REJECTED: 'Rejected',
  HIRED: 'Hired',
  WITHDRAWN: 'Withdrawn',
};

export const STATUS_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  VIEWED: 'secondary',
  SHORTLISTED: 'default',
  INTERVIEW: 'default',
  REJECTED: 'danger',
  HIRED: 'success',
  WITHDRAWN: 'secondary',
};

export const JOB_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  OPEN: 'success',
  CLOSED: 'secondary',
  DRAFT: 'warning',
  ARCHIVED: 'secondary',
};

export const INTERVIEW_MODES: Record<string, string> = {
  ONSITE: 'On-site',
  VIDEO: 'Video',
  PHONE: 'Phone',
};

export const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
