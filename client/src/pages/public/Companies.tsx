import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/misc';
import { Avatar } from '@/components/ui/misc';

export default function Companies() {
  const { data, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await api.get('/companies')).data,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Companies hiring on HireConnect</h1>
      <p className="mt-1 text-sm text-slate-500">Browse verified companies and their open roles</p>

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.companies.map((c: any) => (
            <Link key={c.id} to={`/companies/${c.slug}`}>
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 rounded-lg">
                      <Building2 className="h-5 w-5" />
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-400">
                        {c.industry || 'Company'} · {c._count?.jobs || 0} open role{c._count?.jobs === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  {c.location && (
                    <p className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {c.location}
                    </p>
                  )}
                  {c.description && <p className="line-clamp-2 text-sm text-slate-500">{c.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
