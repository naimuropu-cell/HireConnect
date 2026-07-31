import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { JobCard } from '@/components/job/JobCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, optionsFrom } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/misc';
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS } from '@/lib/constants';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function JobSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const params = useMemo(
    () => ({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      location: searchParams.get('location') || '',
      type: searchParams.get('type') || '',
      workMode: searchParams.get('workMode') || '',
      experience: searchParams.get('experience') || '',
      salaryMin: searchParams.get('salaryMin') || '',
      sort: searchParams.get('sort') || 'latest',
      page: searchParams.get('page') || '1',
    }),
    [searchParams]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', params],
    queryFn: async () => (await api.get('/jobs', { params })).data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/jobs/categories')).data,
  });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Find your next role</h1>
        <p className="text-sm text-slate-500">Search across thousands of opportunities</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Job title, keyword, or company"
            defaultValue={params.q}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setParam('q', (e.target as HTMLInputElement).value);
            }}
          />
        </div>
        <div className="flex gap-3">
          <Input
            className="lg:w-52"
            placeholder="Location"
            defaultValue={params.location}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setParam('location', (e.target as HTMLInputElement).value);
            }}
          />
          <Select
            className="lg:w-44"
            value={params.sort}
            onChange={(e) => setParam('sort', e.target.value)}
            options={[
              { value: 'latest', label: 'Latest' },
              { value: 'oldest', label: 'Oldest' },
              { value: 'salary_high', label: 'Highest salary' },
              { value: 'salary_low', label: 'Lowest salary' },
            ]}
          />
          <Button variant="outline" onClick={() => setShowFilters((s) => !s)} className="lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      <div className={`mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4 ${showFilters ? 'grid' : 'hidden lg:grid'}`}>
        <Select
          value={params.category}
          onChange={(e) => setParam('category', e.target.value)}
          placeholder="All categories"
          options={(categories?.categories || []).map((c: any) => ({ value: c.id, label: c.name }))}
        />
        <Select
          value={params.type}
          onChange={(e) => setParam('type', e.target.value)}
          placeholder="All job types"
          options={optionsFrom(JOB_TYPES)}
        />
        <Select
          value={params.workMode}
          onChange={(e) => setParam('workMode', e.target.value)}
          placeholder="All work modes"
          options={optionsFrom(WORK_MODES)}
        />
        <Select
          value={params.experience}
          onChange={(e) => setParam('experience', e.target.value)}
          placeholder="All experience levels"
          options={optionsFrom(EXPERIENCE_LEVELS)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {data?.total} job{data?.total === 1 ? '' : 's'} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((job: any) => <JobCard key={job.id} job={job} />)}
          </div>
          {data?.items.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <p className="text-lg font-medium text-slate-600">No jobs match your filters</p>
              <p className="mt-1 text-sm text-slate-400">Try adjusting your search criteria</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
