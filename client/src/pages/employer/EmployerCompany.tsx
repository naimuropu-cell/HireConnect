import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/misc';
import { COMPANY_SIZES } from '@/lib/constants';

export default function EmployerCompany() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['my-company'],
    queryFn: async () => (await api.get('/company/me')).data,
  });
  const company = data?.company;

  const createMutation = useMutation({
    mutationFn: async (payload: any) => (await api.post('/company', payload)).data,
    onSuccess: () => {
      toast.success('Company created. Awaiting admin approval.');
      qc.invalidateQueries({ queryKey: ['my-company'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => (await api.put('/company', payload)).data,
    onSuccess: () => {
      toast.success('Company updated');
      qc.invalidateQueries({ queryKey: ['my-company'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const uploadLogo = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('logo', file);
    try {
      await api.post('/company/logo', fd);
      toast.success('Logo uploaded');
      qc.invalidateQueries({ queryKey: ['my-company'] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!company) {
    return <CompanyCreateForm onSave={createMutation} />;
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const key of ['name', 'description', 'website', 'industry', 'size', 'location', 'foundedYear']) {
      const v = (fd.get(key) as string) || '';
      if (v) payload[key] = key === 'foundedYear' ? Number(v) : v;
      else payload[key] = null;
    }
    updateMutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company profile</h1>
          {!company.approved && (
            <Badge className="mt-1" variant="warning">
              Pending admin approval
            </Badge>
          )}
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
          <Building2 className="h-7 w-7" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Company name</Label>
                <Input name="name" defaultValue={company.name || ''} />
              </div>
              <div>
                <Label>Industry</Label>
                <Input name="industry" defaultValue={company.industry || ''} placeholder="e.g. Technology" />
              </div>
              <div>
                <Label>Company size</Label>
                <Select
                  name="size"
                  defaultValue={company.size || ''}
                  options={COMPANY_SIZES.map((s) => ({ value: s, label: s }))}
                />
              </div>
              <div>
                <Label>Founded year</Label>
                <Input name="foundedYear" type="number" defaultValue={company.foundedYear || ''} />
              </div>
              <div>
                <Label>Website</Label>
                <Input name="website" defaultValue={company.website || ''} placeholder="https://" />
              </div>
              <div>
                <Label>Location</Label>
                <Input name="location" defaultValue={company.location || ''} placeholder="City, Country" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" rows={5} defaultValue={company.description || ''} />
            </div>
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
                Save changes
              </Button>
              <div>
                <Label className="mb-0">Upload logo</Label>
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} disabled={uploading} />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function CompanyCreateForm({ onSave }: { onSave: any }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave.mutate({ name, description, website: website || null, industry: industry || null, location: location || null });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Create your company profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          You need a company profile to post jobs. It will be reviewed by an admin.
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Company name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Industry</Label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Technology" />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
              </div>
            </div>
            <div>
              <Label>Website</Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <Button type="submit" disabled={!name.trim() || onSave.isPending} className="w-full">
              {onSave.isPending && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
              Create company profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
