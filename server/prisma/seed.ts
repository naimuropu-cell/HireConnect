import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Software Engineering', slug: 'software-engineering', description: 'Software development roles' },
  { name: 'Design', slug: 'design', description: 'UI/UX and product design' },
  { name: 'Marketing', slug: 'marketing', description: 'Digital marketing roles' },
  { name: 'Sales', slug: 'sales', description: 'Sales and business development' },
  { name: 'Data Science', slug: 'data-science', description: 'Data, analytics and AI' },
  { name: 'Customer Support', slug: 'customer-support', description: 'Support and success roles' },
  { name: 'Human Resources', slug: 'human-resources', description: 'HR and people operations' },
  { name: 'Finance', slug: 'finance', description: 'Accounting and finance roles' },
];

const skills = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'SQL',
  'PostgreSQL',
  'AWS',
  'Docker',
  'Figma',
  'UI Design',
  'SEO',
  'Content Marketing',
  'Salesforce',
  'B2B Sales',
  'Machine Learning',
  'Data Analysis',
  'Customer Success',
  'Recruiting',
  'Financial Modeling',
  'Git',
  'GraphQL',
  'Tailwind CSS',
];

interface SeedJob {
  title: string;
  category: string;
  description: string;
  type: string;
  workMode: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  experienceLevel: string;
  skills: string[];
  featured?: boolean;
  company: string;
}

const jobs: SeedJob[] = [
  {
    title: 'Senior Frontend Engineer',
    category: 'Software Engineering',
    description:
      'We are looking for a Senior Frontend Engineer to build delightful, accessible, and performant web applications. You will work closely with design and backend teams to ship features used by thousands of candidates every day.',
    type: 'FULL_TIME',
    workMode: 'REMOTE',
    location: 'Remote',
    salaryMin: 90000,
    salaryMax: 140000,
    experienceLevel: 'SENIOR',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Git'],
    featured: true,
    company: 'TechNova',
  },
  {
    title: 'Backend Engineer (Node.js)',
    category: 'Software Engineering',
    description:
      'Join our platform team to design and scale our API infrastructure. You will own services end-to-end, improve reliability, and collaborate with engineers across the company.',
    type: 'FULL_TIME',
    workMode: 'HYBRID',
    location: 'New York, USA',
    salaryMin: 110000,
    salaryMax: 160000,
    experienceLevel: 'SENIOR',
    skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
    featured: true,
    company: 'CloudWorks',
  },
  {
    title: 'Product Designer',
    category: 'Design',
    description:
      'We are hiring a Product Designer to craft intuitive and beautiful experiences across our platform. You will own the end-to-end design process from research to high-fidelity prototypes.',
    type: 'FULL_TIME',
    workMode: 'ONSITE',
    location: 'London, UK',
    salaryMin: 60000,
    salaryMax: 85000,
    experienceLevel: 'MID',
    skills: ['Figma', 'UI Design', 'React'],
    company: 'DesignHub',
  },
  {
    title: 'Digital Marketing Specialist',
    category: 'Marketing',
    description:
      'Own our growth marketing channels, run campaigns end-to-end, and optimize for conversions. You will work with a small, high-performing team in a fast-paced environment.',
    type: 'FULL_TIME',
    workMode: 'REMOTE',
    location: 'Remote',
    salaryMin: 45000,
    salaryMax: 65000,
    experienceLevel: 'JUNIOR',
    skills: ['SEO', 'Content Marketing'],
    company: 'GrowthLab',
  },
  {
    title: 'Machine Learning Engineer',
    category: 'Data Science',
    description:
      'Build and deploy ML models that power smart candidate matching and job recommendations. Strong background in NLP and production ML systems is a must.',
    type: 'FULL_TIME',
    workMode: 'HYBRID',
    location: 'San Francisco, USA',
    salaryMin: 130000,
    salaryMax: 190000,
    experienceLevel: 'SENIOR',
    skills: ['Python', 'Machine Learning', 'SQL', 'AWS'],
    featured: true,
    company: 'DataMind AI',
  },
  {
    title: 'Data Analyst',
    category: 'Data Science',
    description:
      'Turn raw data into actionable insights. You will build dashboards, run A/B tests, and partner with product and marketing teams to inform decisions.',
    type: 'FULL_TIME',
    workMode: 'ONSITE',
    location: 'Berlin, Germany',
    salaryMin: 55000,
    salaryMax: 75000,
    experienceLevel: 'JUNIOR',
    skills: ['SQL', 'Data Analysis', 'Python'],
    company: 'Insight Co',
  },
  {
    title: 'Customer Success Manager',
    category: 'Customer Support',
    description:
      'Ensure our enterprise customers achieve their goals with our platform. You will manage onboarding, drive adoption, and reduce churn.',
    type: 'FULL_TIME',
    workMode: 'HYBRID',
    location: 'Toronto, Canada',
    salaryMin: 60000,
    salaryMax: 80000,
    experienceLevel: 'MID',
    skills: ['Customer Success', 'Salesforce'],
    company: 'SuccessNow',
  },
  {
    title: 'Talent Acquisition Specialist',
    category: 'Human Resources',
    description:
      'Own the full recruitment lifecycle for technical roles. You will source, screen, and close top engineering talent while partnering with hiring managers.',
    type: 'CONTRACT',
    workMode: 'REMOTE',
    location: 'Remote',
    salaryMin: 50000,
    salaryMax: 70000,
    experienceLevel: 'MID',
    skills: ['Recruiting', 'B2B Sales'],
    company: 'HirePro HR',
  },
  {
    title: 'Frontend Intern',
    category: 'Software Engineering',
    description:
      'A hands-on internship building real features on our product. Great mentorship, modern stack, and the opportunity to learn from senior engineers.',
    type: 'INTERNSHIP',
    workMode: 'ONSITE',
    location: 'Austin, USA',
    salaryMin: 20000,
    salaryMax: 30000,
    experienceLevel: 'ENTRY',
    skills: ['React', 'TypeScript', 'Git'],
    company: 'TechNova',
  },
  {
    title: 'Financial Analyst',
    category: 'Finance',
    description:
      'Support budgeting, forecasting, and financial reporting. You will model business scenarios and partner with leadership on strategic decisions.',
    type: 'FULL_TIME',
    workMode: 'ONSITE',
    location: 'Singapore',
    salaryMin: 65000,
    salaryMax: 90000,
    experienceLevel: 'MID',
    skills: ['Financial Modeling', 'SQL'],
    company: 'FinanceWorks',
  },
];

async function main() {
  console.log('Seeding database...');

  await prisma.savedJob.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.profileSkill.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.category.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  const password = (pw: string) => bcrypt.hashSync(pw, 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hireconnect.com',
      password: password('Admin@123'),
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const seeker = await prisma.user.create({
    data: {
      email: 'seeker@hireconnect.com',
      password: password('Seeker@123'),
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'SEEKER',
      emailVerified: true,
      phone: '+1 555 0100',
    },
  });

  const seeker2 = await prisma.user.create({
    data: {
      email: 'seeker2@hireconnect.com',
      password: password('Seeker@123'),
      firstName: 'Mohammed',
      lastName: 'Rahim',
      role: 'SEEKER',
      emailVerified: true,
    },
  });

  const employerUser = await prisma.user.create({
    data: {
      email: 'employer@hireconnect.com',
      password: password('Employer@123'),
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'EMPLOYER',
      emailVerified: true,
    },
  });

  // Categories
  for (const c of categories) {
    await prisma.category.create({ data: c });
  }
  const catMap = new Map<string, string>();
  for (const c of await prisma.category.findMany()) catMap.set(c.name, c.id);

  // Skills
  for (const s of skills) {
    await prisma.skill.create({ data: { name: s, slug: s.toLowerCase().replace(/[^a-z0-9]+/g, '-') } });
  }
  const skillMap = new Map<string, string>();
  for (const s of await prisma.skill.findMany()) skillMap.set(s.name, s.id);

  // Companies
  const companies = [
    { name: 'TechNova', industry: 'Technology', size: '51-200', location: 'Remote' },
    { name: 'CloudWorks', industry: 'Cloud Infrastructure', size: '201-500', location: 'New York, USA' },
    { name: 'DesignHub', industry: 'Design', size: '11-50', location: 'London, UK' },
    { name: 'GrowthLab', industry: 'Marketing', size: '11-50', location: 'Remote' },
    { name: 'DataMind AI', industry: 'Artificial Intelligence', size: '51-200', location: 'San Francisco, USA' },
    { name: 'Insight Co', industry: 'Analytics', size: '201-500', location: 'Berlin, Germany' },
    { name: 'SuccessNow', industry: 'SaaS', size: '51-200', location: 'Toronto, Canada' },
    { name: 'HirePro HR', industry: 'Recruitment', size: '11-50', location: 'Remote' },
    { name: 'FinanceWorks', industry: 'Finance', size: '501-1000', location: 'Singapore' },
  ];

  // Companies — each owned by a distinct employer user; TechNova owned by demo employer
  const companyRecords: Record<string, string> = {};
  for (const c of companies) {
    let ownerId = employerUser.id;
    if (c.name !== 'TechNova') {
      const u = await prisma.user.create({
        data: {
          email: `${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@hireconnect.com`,
          password: password('Employer@123'),
          firstName: c.name,
          lastName: 'Employer',
          role: 'EMPLOYER',
          emailVerified: true,
        },
      });
      ownerId = u.id;
    }
    const rec = await prisma.company.create({
      data: {
        userId: ownerId,
        name: c.name,
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        industry: c.industry,
        size: c.size,
        location: c.location,
        approved: true,
        approvedAt: new Date(),
      },
    });
    companyRecords[c.name] = rec.id;
  }

  // Jobs
  const jobIds: string[] = [];
  for (const j of jobs) {
    const baseSlug = j.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const job = await prisma.job.create({
      data: {
        companyId: companyRecords[j.company],
        categoryId: catMap.get(j.category) || null,
        title: j.title,
        slug: baseSlug,
        description: j.description,
        type: j.type,
        workMode: j.workMode,
        location: j.location,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        experienceLevel: j.experienceLevel,
        status: 'OPEN',
        featured: j.featured || false,
        publishedAt: new Date(),
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        views: Math.floor(Math.random() * 400),
        requiredSkills: {
          create: j.skills.map((s) => ({ skillId: skillMap.get(s)! })),
        },
      },
    });
    jobIds.push(job.id);
  }

  // Seeker profile
  const aliceProfile = await prisma.profile.create({
    data: {
      userId: seeker.id,
      headline: 'Senior Full-Stack Engineer | React & Node.js',
      about:
        'Engineer with 6+ years of experience building web applications. Passionate about clean architecture, TypeScript, and product quality.',
      location: 'New York, USA',
      phone: '+1 555 0100',
      portfolio: 'https://alice.dev',
      github: 'https://github.com/alice',
      linkedin: 'https://linkedin.com/in/alice',
      languages: 'English,Native;French,Intermediate',
      skills: {
        create: [
          { skillId: skillMap.get('React')!, level: 'EXPERT' },
          { skillId: skillMap.get('TypeScript')!, level: 'EXPERT' },
          { skillId: skillMap.get('Node.js')!, level: 'ADVANCED' },
          { skillId: skillMap.get('GraphQL')!, level: 'ADVANCED' },
          { skillId: skillMap.get('Tailwind CSS')!, level: 'EXPERT' },
          { skillId: skillMap.get('PostgreSQL')!, level: 'INTERMEDIATE' },
        ],
      },
      education: {
        create: [
          {
            institution: 'Cornell University',
            degree: 'BSc',
            field: 'Computer Science',
            startDate: new Date('2014-09-01'),
            endDate: new Date('2018-05-30'),
          },
        ],
      },
      experience: {
        create: [
          {
            company: 'TechNova',
            title: 'Senior Frontend Engineer',
            location: 'Remote',
            startDate: new Date('2022-03-01'),
            current: true,
            description: 'Led migration to React 18 and TypeScript; improved performance by 40%.',
          },
          {
            company: 'FinBank',
            title: 'Full-Stack Developer',
            location: 'New York',
            startDate: new Date('2018-06-01'),
            endDate: new Date('2022-02-28'),
            description: 'Built internal banking tools with Node.js and React.',
          },
        ],
      },
      certifications: {
        create: [{ name: 'AWS Certified Developer', issuer: 'Amazon', issuedDate: new Date('2023-04-01') }],
      },
    },
  });

  const mohammedProfile = await prisma.profile.create({
    data: {
      userId: seeker2.id,
      headline: 'Data Scientist | NLP & Machine Learning',
      about: 'MSc Data Science graduate focused on NLP, recommendation systems, and ML engineering.',
      location: 'London, UK',
      languages: 'English,Fluent;Arabic,Native',
      skills: {
        create: [
          { skillId: skillMap.get('Python')!, level: 'EXPERT' },
          { skillId: skillMap.get('Machine Learning')!, level: 'ADVANCED' },
          { skillId: skillMap.get('SQL')!, level: 'ADVANCED' },
          { skillId: skillMap.get('AWS')!, level: 'INTERMEDIATE' },
        ],
      },
      education: {
        create: [
          {
            institution: 'Imperial College London',
            degree: 'MSc',
            field: 'Data Science',
            startDate: new Date('2021-09-01'),
            endDate: new Date('2022-09-30'),
          },
        ],
      },
      experience: {
        create: [
          {
            company: 'DataMind AI',
            title: 'ML Engineer Intern',
            startDate: new Date('2022-06-01'),
            endDate: new Date('2022-08-31'),
            description: 'Built a resume parser and skills-extraction pipeline.',
          },
        ],
      },
    },
  });

  // Applications
  await prisma.application.create({
    data: {
      jobId: jobIds[0],
      userId: seeker.id,
      status: 'SHORTLISTED',
      coverLetter: 'I have 6 years building React applications and would love to bring my experience to TechNova.',
      resumeUrl: null,
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.application.create({
    data: {
      jobId: jobIds[4],
      userId: seeker2.id,
      status: 'PENDING',
      coverLetter: 'My MSc focused on NLP and recommendation engines — a perfect fit for your matching product.',
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.application.create({
    data: {
      jobId: jobIds[0],
      userId: seeker2.id,
      status: 'REJECTED',
      appliedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Saved jobs for seeker
  await prisma.savedJob.create({ data: { userId: seeker.id, jobId: jobIds[4] } });
  await prisma.savedJob.create({ data: { userId: seeker.id, jobId: jobIds[2] } });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: seeker.id,
      type: 'APPLICATION_UPDATE',
      title: 'Application shortlisted',
      message: 'Your application for Senior Frontend Engineer at TechNova was shortlisted.',
      link: '/applications',
    },
  });
  await prisma.notification.create({
    data: {
      userId: employerUser.id,
      type: 'APPLICATION_UPDATE',
      title: 'New application',
      message: 'Someone applied to "Senior Frontend Engineer".',
      link: '/employer/applications',
    },
  });

  // A pending company to demonstrate admin approval
  const startupxUser = await prisma.user.create({
    data: {
      email: 'startupx@hireconnect.com',
      password: password('Employer@123'),
      firstName: 'StartupX',
      lastName: 'Employer',
      role: 'EMPLOYER',
      emailVerified: true,
    },
  });
  await prisma.company.create({
    data: {
      userId: startupxUser.id,
      name: 'StartupX',
      slug: 'startupx',
      industry: 'Technology',
      size: '1-10',
      location: 'Remote',
      approved: false,
    },
  });

  // Demo reports
  await prisma.report.create({
    data: {
      reporterId: seeker.id,
      targetType: 'JOB',
      targetId: jobIds[1],
      reason: 'Suspected duplicate posting',
      details: 'This job appears identical to another posting from the same company.',
      status: 'PENDING',
    },
  });

  console.log('Seed complete.');
  console.log('  Admin:    admin@hireconnect.com / Admin@123');
  console.log('  Seeker:   seeker@hireconnect.com / Seeker@123');
  console.log('  Employer: employer@hireconnect.com / Employer@123');
  void aliceProfile;
  void mohammedProfile;
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
