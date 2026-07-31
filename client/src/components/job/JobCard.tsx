import { Link } from 'react-router-dom';
import { Banknote, Building2, Clock, MapPin } from 'lucide-react';
import type { Job } from '@/types';
import { Badge } from '@/components/ui/card';
import { Avatar } from '@/components/ui/misc';
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS } from '@/lib/constants';
import { formatCurrency, timeAgo } from '@/lib/utils';

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11 rounded-lg text-sm">
          <Building2 className="h-5 w-5" />
        </Avatar>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 line-clamp-1">{job.title}</h3>
          <p className="text-sm text-slate-500">{job.company.name}</p>
        </div>
        {job.featured && <Badge className="ml-auto shrink-0">Featured</Badge>}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {job.location || 'Remote'}
        </span>
        <span className="flex items-center gap-1">
          <Banknote className="h-3.5 w-3.5" />
          {formatCurrency(job.salaryMin, job.salaryMax, job.currency)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {timeAgo(job.createdAt)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{JOB_TYPES[job.type] || job.type}</Badge>
        <Badge variant="secondary">{WORK_MODES[job.workMode] || job.workMode}</Badge>
        <Badge variant="outline">{EXPERIENCE_LEVELS[job.experienceLevel] || job.experienceLevel}</Badge>
      </div>
    </Link>
  );
}
