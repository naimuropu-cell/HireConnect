import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/misc';
import { formatDate } from '@/lib/utils';
import type { Paginated } from '@/types';

interface CompanyRow {
  id: string;
  name: string;
  slug: string;
  industry?: string | null;
  location?: string | null;
  approved: boolean;
  createdAt: string;
  owner?: { email: string; firstName: string; lastName: string };
  _count?: { jobs: number };
}

export default function AdminCompanies() {
  const qc = useQueryClient();
  const [approved, setApproved] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies', approved, page],
    queryFn: async () => (await api.get('/admin/companies', { params: { approved, page, pageSize: 10 } })).data,
  });
  const companies: Paginated<CompanyRow> | undefined = data;

  const approveMutation = useMutation({
    mutationFn: async (id: string) => (await api.put(`/admin/companies/${id}/approve`)).data,
    onSuccess: () => {
      toast.success('Company approved');
      qc.invalidateQueries({ queryKey: ['admin-companies'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Companies</h1>
      <div className="mb-4 flex gap-3">
        <Select
          className="w-48"
          value={approved}
          onChange={(e) => { setApproved(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All companies' },
            { value: 'false', label: 'Pending approval' },
            { value: 'true', label: 'Approved' },
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
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Jobs</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {companies?.items.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.location || '—'} · {formatDate(c.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.owner?.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{c.industry || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{c._count?.jobs || 0}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.approved ? 'success' : 'warning'}>{c.approved ? 'Approved' : 'Pending'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!c.approved && (
                        <Button size="sm" onClick={() => approveMutation.mutate(c.id)}>
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {companies && companies.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 text-sm text-slate-500">
                <span>
                  Page {companies.page} of {companies.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= companies.totalPages} onClick={() => setPage((p) => p + 1)}>
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
