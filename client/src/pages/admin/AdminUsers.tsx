import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { apiErrorMessage } from '@/lib/api';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Avatar, Spinner } from '@/components/ui/misc';
import { formatDate, initials } from '@/lib/utils';
import type { Paginated, User } from '@/types';

export default function AdminUsers() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', q, role, page],
    queryFn: async () => (await api.get('/admin/users', { params: { q, role, page, pageSize: 10 } })).data,
  });
  const users: Paginated<User> | undefined = data;

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await api.put(`/admin/users/${id}/status`, { isActive })).data,
    onSuccess: () => {
      toast.success('User updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Users</h1>
      <div className="mb-4 flex gap-3">
        <Input placeholder="Search by name or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="max-w-xs" />
        <Select
          className="w-40"
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All roles' },
            { value: 'SEEKER', label: 'Seekers' },
            { value: 'EMPLOYER', label: 'Employers' },
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
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.items.map((u: any) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar>{initials(u.firstName, u.lastName)}</Avatar>
                        <div>
                          <p className="font-medium text-slate-900">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Disabled'}</Badge>
                      {!u.emailVerified && <Badge className="ml-1" variant="warning">Unverified</Badge>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant={u.isActive ? 'outline' : 'success'}
                        size="sm"
                        disabled={toggleMutation.isPending}
                        onClick={() => toggleMutation.mutate({ id: u.id, isActive: !u.isActive })}
                      >
                        {u.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users && users.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 text-sm text-slate-500">
                <span>
                  Page {users.page} of {users.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= users.totalPages} onClick={() => setPage((p) => p + 1)}>
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
