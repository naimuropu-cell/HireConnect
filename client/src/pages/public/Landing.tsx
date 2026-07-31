import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Search, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/job/JobCard';

export default function Landing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['landing-jobs'],
    queryFn: async () => (await api.get('/jobs', { params: { pageSize: 6 } })).data,
  });

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <div>
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Sparkles className="h-4 w-4" />
            AI-powered candidate matching
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Find the right job.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Or the right candidate.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            HireConnect connects talented professionals with great companies through smart matching,
            clean dashboards, and a seamless application experience.
          </p>

          <form onSubmit={search} className="mx-auto mt-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-12 pl-9 text-base"
                placeholder="Job title, keyword, company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg">
              Search jobs
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span>Popular:</span>
            {['React', 'Design', 'Marketing', 'Data'].map((tag) => (
              <Link key={tag} to={`/jobs?q=${tag}`} className="font-medium text-indigo-600 hover:underline">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Search,
              title: 'Search smarter',
              desc: 'Advanced filters for role, type, location, salary and experience.',
            },
            {
              icon: UserCheck,
              title: 'Track everything',
              desc: 'Follow applications from pending to interview to hired.',
            },
            {
              icon: ShieldCheck,
              title: 'Trusted platform',
              desc: 'Verified companies and moderated jobs keep the platform safe.',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Latest opportunities</h2>
            <p className="text-sm text-slate-500">Fresh roles from verified companies</p>
          </div>
          <Link to="/jobs" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(isLoading ? Array.from({ length: 6 }) : data?.items || []).map((job: any, i: number) =>
            isLoading ? (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-slate-200" />
            ) : (
              <JobCard key={job.id} job={job} />
            )
          )}
        </div>
      </section>

      <section className="bg-indigo-600">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-14 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">Looking to hire top talent?</h2>
            <p className="mt-1 text-indigo-100">
              Post your first job for free and reach thousands of qualified candidates.
            </p>
          </div>
          <Link to="/register">
            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
              <Building2 className="h-5 w-5" /> For employers
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
