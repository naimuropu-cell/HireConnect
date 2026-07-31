import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { apiErrorMessage } from '@/lib/api';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/misc';
import { formatDate } from '@/lib/utils';
import { JOB_STATUS_VARIANT } from '@/lib/constants';
import type { Paginated } from '@/types';
import type { Job } from '@/types';

export default function AdminJobs() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', status, page],
    queryFn: async () => (await api.get('/admin/jobs', { params: { status, page, pageSize: 10 } })).data,
  });
  const jobs: Paginated<Job> | undefined = data;

  const moderateMutation = useMutation({
    mutationFn: async ({ id, status: s, featured }: { id: string; status?: string; featured?: boolean }) =>
      (await api.put(`/admin/jobs/${id}/moderate`, { status: s, featured })).data,
    onSuccess: () => {
      toast.success('Job updated');
      qc.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Job moderation</h1>
      <div className="mb-4 flex gap-3">
        <Select
          className="w-44"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'OPEN', label: 'Open' },
            { value: 'CLOSED', label: 'Closed' },
            { value: 'DRAFT', label: 'Draft' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Applications</th>
                  <th className="px-4 py-3">Posted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs?.items.map((j) => (
                  <tr key={j.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="max-w-xs truncate font-medium text-slate-900">{j.title}</p>
                      {j.featured && <Badge className="mt-0.5">Featured</Badge>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{j.company?.name}</td>
                    <td className="px-4 py-3 text-slate-500">{j._count?.applications || 0}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(j.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={JOB_STATUS_VARIANT[j.status] || 'secondary'}>{j.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moderateMutation.mutate({ id: j.id, featured: !j.featured })}
                        >
                          {j.featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        {j.status === 'OPEN' && (
                          <Button variant="ghost" size="sm" onClick={() => moderateMutation.mutate({ id: j.id, status: 'CLOSED' })}>
                            Close
                          </Button>
                        )}
                        {j.status === 'CLOSED' && (
                          <Button variant="ghost" size="sm" onClick={() => moderateMutation.mutate({ id: j.id, status: 'OPEN' })}>
                            Reopen
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs && jobs.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 text-sm text-slate-500">
                <span>
                  Page {jobs.page} of {jobs.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= jobs.totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
