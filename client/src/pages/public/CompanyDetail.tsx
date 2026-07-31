import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Globe, MapPin } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Spinner } from '@/components/ui/misc';
import { JobCard } from '@/components/job/JobCard';

export default function CompanyDetail() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['company', slug],
    queryFn: async () => (await api.get(`/companies/${slug}`)).data,
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const company = data?.company;
  if (!company) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-lg font-medium text-slate-600">Company not found</p>
        <Link to="/companies" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
          Back to companies
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                {company.industry && <Badge variant="secondary">{company.industry}</Badge>}
                {company.size && <Badge variant="secondary">{company.size} employees</Badge>}
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {company.location}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> {company.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>
          {company.description && (
            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{company.description}</p>
          )}
        </CardContent>
      </Card>

      <h2 className="mb-4 mt-8 text-xl font-bold">Open positions ({company.jobs?.length || 0})</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {company.jobs?.map((job: any) => (
          <JobCard key={job.id} job={job} />
        ))}
        {company.jobs?.length === 0 && (
          <p className="text-sm text-slate-400">No open positions right now.</p>
        )}
      </div>
    </div>
  );
}
