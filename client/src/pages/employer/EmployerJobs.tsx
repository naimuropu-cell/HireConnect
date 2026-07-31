import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, Pencil, PlusCircle, Users, XCircle } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { Badge, Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/misc';
import { JOB_STATUS_VARIANT, JOB_TYPES, WORK_MODES } from '@/lib/constants';
import { formatCurrency, timeAgo } from '@/lib/utils';

export default function EmployerJobs() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: async () => (await api.get('/my/jobs')).data,
  });

  const closeMutation = useMutation({
    mutationFn: async (id: string) => (await api.post(`/jobs/${id}/close`)).data,
    onSuccess: () => {
      toast.success('Job closed');
      qc.invalidateQueries({ queryKey: ['my-jobs'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const jobs = data?.jobs || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My jobs</h1>
          <p className="text-sm text-slate-500">{jobs.length} job{jobs.length === 1 ? '' : 's'}</p>
        </div>
        <Link to="/employer/jobs/new">
          <Button>
            <PlusCircle className="h-4 w-4" /> Post a job
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <p className="text-lg font-medium text-slate-600">No jobs yet</p>
            <Link to="/employer/jobs/new" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
              Post your first job
            </Link>
          </div>
        )}

        {jobs.map((job: any) => (
          <Card key={job.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/jobs/${job.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">
                      {job.title}
                    </Link>
                    <Badge variant={JOB_STATUS_VARIANT[job.status] || 'secondary'}>{job.status}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span>{JOB_TYPES[job.type] || job.type}</span>
                    <span>{WORK_MODES[job.workMode] || job.workMode}</span>
                    <span>{job.location || 'Remote'}</span>
                    <span>{formatCurrency(job.salaryMin, job.salaryMax, job.currency)}</span>
                    <span>Posted {timeAgo(job.createdAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link to={`/employer/jobs/${job.id}/applicants`}>
                    <Button variant="secondary" size="sm">
                      <Users className="h-4 w-4" /> {job._count?.applications || 0}
                    </Button>
                  </Link>
                  <Link to={`/employer/jobs/${job.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  {job.status === 'OPEN' && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => closeMutation.mutate(job.id)}>
                      <XCircle className="h-4 w-4" /> Close
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {job.views} views
                </span>
                <span>{job._count?.applications || 0} applications</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
