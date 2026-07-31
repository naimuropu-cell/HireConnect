import { useQuery } from '@tanstack/react-query';
import { Building2, Briefcase, FileText, TrendingUp, UserCheck, Users } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/misc';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/dashboard/admin')).data,
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => (await api.get('/admin/analytics')).data,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const s = data?.stats;
  const m = data?.monthly;
  const maxApps = Math.max(1, ...(m?.applications || []).map((x: any) => x.count));

  const cards = [
    { label: 'Users', value: s.users, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Employers', value: s.employers, icon: UserCheck, color: 'text-sky-600 bg-sky-50' },
    { label: 'Companies', value: s.companies, icon: Building2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Jobs', value: s.jobs, icon: Briefcase, color: 'text-amber-600 bg-amber-50' },
    { label: 'Applications', value: s.applications, icon: FileText, color: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}>
                <c.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Pending company approvals</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{s.pendingCompanies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Open jobs</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{s.openJobs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Pending reports</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{s.reports}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform growth (6 months)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">Applications</p>
              <div className="flex h-32 items-end gap-2">
                {(m?.applications || []).map((x: any) => (
                  <div key={x.label} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">{x.count}</span>
                    <div className="w-full rounded-t bg-violet-500" style={{ height: `${Math.max(4, (x.count / maxApps) * 90)}px` }} />
                    <span className="text-[10px] text-slate-400">{x.label.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-600">New users</p>
              <div className="flex h-32 items-end gap-2">
                {(m?.users || []).map((x: any) => (
                  <div key={x.label} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">{x.count}</span>
                    <div className="w-full rounded-t bg-indigo-500" style={{ height: `${Math.max(4, (x.count / Math.max(1, ...(m?.users || []).map((y: any) => y.count))) * 90)}px` }} />
                    <span className="text-[10px] text-slate-400">{x.label.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" /> Today's activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'New users today', value: analytics?.analytics?.newUsersToday },
              { label: 'New jobs today', value: analytics?.analytics?.newJobsToday },
              { label: 'New applications today', value: analytics?.analytics?.newApplicationsToday },
              { label: 'New users (7d)', value: analytics?.analytics?.weeklyUsers },
              { label: 'Applications (7d)', value: analytics?.analytics?.weeklyApplications },
              { label: 'Hiring rate', value: `${analytics?.analytics?.hiringRate || 0}%` },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">{r.label}</span>
                <span className="font-semibold text-slate-900">{r.value ?? 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
