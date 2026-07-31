import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowUpRight } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/misc';
import { APPLICATION_STATUSES, STATUS_BADGE_VARIANT } from '@/lib/constants';
import { formatDateTime, formatDate } from '@/lib/utils';
import type { Application } from '@/types';

export default function MyApplications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => (await api.get('/applications/me')).data,
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => (await api.post(`/applications/${id}/withdraw`)).data,
    onSuccess: () => {
      toast.success('Application withdrawn');
      qc.invalidateQueries({ queryKey: ['my-applications'] });
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

  const applications: Application[] = data?.applications || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">My applications</h1>
      <p className="mt-1 text-sm text-slate-500">Track the status of every job you've applied to</p>

      <div className="mt-6 space-y-4">
        {applications.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <p className="text-lg font-medium text-slate-600">You haven't applied to any jobs yet</p>
            <Link to="/jobs" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
              Browse jobs
            </Link>
          </div>
        )}

        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{app.job?.title}</h3>
                  <Badge variant={STATUS_BADGE_VARIANT[app.status] || 'secondary'}>
                    {APPLICATION_STATUSES[app.status] || app.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                  {app.job?.company?.name} · Applied {formatDate(app.appliedAt)}
                </p>
                {app.job?.deadline && (
                  <p className="mt-1 text-xs text-slate-400">Deadline: {formatDate(app.job.deadline)}</p>
                )}
                {app.interviews && app.interviews.length > 0 && (
                  <div className="mt-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                    <span className="font-medium">Interview:</span> {formatDateTime(app.interviews[0].scheduledAt)}{' '}
                    · {app.interviews[0].mode}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {app.job && (
                  <Link to={`/jobs/${app.job.id}`}>
                    <Button variant="outline" size="sm">
                      View job <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {app.status !== 'WITHDRAWN' && ['PENDING', 'VIEWED'].includes(app.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    disabled={withdrawMutation.isPending}
                    onClick={() => withdrawMutation.mutate(app.id)}
                  >
                    Withdraw
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
