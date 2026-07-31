import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bookmark } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { JobCard } from '@/components/job/JobCard';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/misc';

export default function SavedJobs() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => (await api.get('/jobs/saved')).data,
  });

  const unsaveMutation = useMutation({
    mutationFn: async (jobId: string) => (await api.delete(`/jobs/${jobId}/save`)).data,
    onSuccess: () => {
      toast.success('Removed from saved');
      qc.invalidateQueries({ queryKey: ['saved-jobs'] });
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

  const saved = data?.saved || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Saved jobs</h1>
      <p className="mt-1 text-sm text-slate-500">Jobs you've bookmarked for later</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {saved.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-lg font-medium text-slate-600">No saved jobs yet</p>
            <Link to="/jobs" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
              Browse jobs
            </Link>
          </div>
        )}
        {saved.map((s: any) => (
          <div key={s.id} className="relative">
            <JobCard job={s.job} />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 text-slate-400 hover:text-red-600"
              onClick={() => unsaveMutation.mutate(s.jobId)}
            >
              <Bookmark className="h-4 w-4 fill-current" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
