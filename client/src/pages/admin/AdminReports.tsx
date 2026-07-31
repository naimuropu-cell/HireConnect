import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/misc';
import { formatDate } from '@/lib/utils';
import type { Paginated, Report } from '@/types';

export default function AdminReports() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', status, page],
    queryFn: async () => (await api.get('/admin/reports', { params: { status, page, pageSize: 10 } })).data,
  });
  const reports: Paginated<Report> | undefined = data;

  const resolveMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'RESOLVED' | 'DISMISSED' }) =>
      (await api.put(`/admin/reports/${id}`, { action })).data,
    onSuccess: () => {
      toast.success('Report updated');
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reports</h1>
      <div className="mb-4 flex gap-3">
        <Select
          className="w-48"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All reports' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'RESOLVED', label: 'Resolved' },
            { value: 'DISMISSED', label: 'Dismissed' },
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
                  <th className="px-4 py-3">Reported target</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports?.items.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{r.targetType}</Badge>
                      <p className="mt-0.5 text-xs text-slate-400">#{r.targetId.slice(-8)}</p>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="font-medium text-slate-800">{r.reason}</p>
                      {r.details && <p className="text-xs text-slate-400">{r.details}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{r.reporter?.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status === 'PENDING' ? 'warning' : r.status === 'RESOLVED' ? 'success' : 'secondary'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'PENDING' && (
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" onClick={() => resolveMutation.mutate({ id: r.id, action: 'RESOLVED' })}>
                            <Check className="h-4 w-4" /> Resolve
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => resolveMutation.mutate({ id: r.id, action: 'DISMISSED' })}>
                            <X className="h-4 w-4" /> Dismiss
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports && reports.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 text-sm text-slate-500">
                <span>
                  Page {reports.page} of {reports.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= reports.totalPages} onClick={() => setPage((p) => p + 1)}>
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
