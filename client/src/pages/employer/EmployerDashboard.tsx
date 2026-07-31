import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Briefcase, CalendarCheck, FileText, PlusCircle, TrendingUp, UserCheck, Users } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { JOB_STATUS_VARIANT } from '@/lib/constants';
import { Badge } from '@/components/ui/card';

export default function EmployerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['employer-dashboard'],
    queryFn: async () => (await api.get('/dashboard/employer')).data,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const stats = data?.stats;
  const monthly = data?.monthlyApplications || [];
  const performance = data?.jobPerformance || [];

  const cards = [
    { label: 'Active jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Total applications', value: stats.totalApplications, icon: FileText, color: 'text-sky-600 bg-sky-50' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Interviews', value: stats.interviews, icon: CalendarCheck, color: 'text-amber-600 bg-amber-50' },
    { label: 'Hired', value: stats.hired, icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
  ];

  const maxApp = Math.max(1, ...monthly.map((m: any) => m.count));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Employer dashboard</h1>
          <p className="text-sm text-slate-500">Hiring rate: {stats.hiringRate}%</p>
        </div>
        <Link to="/employer/jobs/new">
          <Button>
            <PlusCircle className="h-4 w-4" /> Post a job
          </Button>
        </Link>
      </div>

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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" /> Monthly applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-2">
              {monthly.map((m: any) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-slate-600">{m.count}</span>
                  <div
                    className="w-full rounded-t-md bg-indigo-500 transition-all"
                    style={{ height: `${Math.max(4, (m.count / maxApp) * 140)}px` }}
                  />
                  <span className="text-[10px] text-slate-400">{m.label.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" /> Job performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {performance.length === 0 && <p className="text-sm text-slate-400">Post your first job to see performance.</p>}
            {performance.slice(0, 6).map((j: any) => (
              <Link key={j.id} to={`/employer/jobs/${j.id}/edit`} className="block rounded-lg border border-slate-100 p-3 hover:border-indigo-200">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-slate-800">{j.title}</p>
                  <Badge variant={JOB_STATUS_VARIANT[j.status] || 'secondary'}>{j.status}</Badge>
                </div>
                <div className="mt-1 flex gap-4 text-xs text-slate-500">
                  <span>{j.views} views</span>
                  <span>{j.applications} applications</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {stats.totalApplications > 0 && (
        <Card className="mt-6">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">{stats.hiringRate}% hiring rate</p>
              <p className="text-sm text-slate-500">
                {stats.hired} of {stats.totalApplications} applications converted to hires.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
