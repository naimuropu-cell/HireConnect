import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/misc';
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS } from '@/lib/constants';
import { optionsFrom } from '@/components/ui/select';
import type { Job } from '@/types';

export default function PostJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/jobs/categories')).data,
  });

  const { data: editData, isLoading: editLoading } = useQuery({
    queryKey: ['job-edit', id],
    queryFn: async () => (await api.get(`/jobs/${id}`)).data,
    enabled: isEdit,
  });

  useEffect(() => {
    if (editData?.job) {
      setSkills((editData.job.requiredSkills || []).map((rs: any) => rs.skill.name));
    }
  }, [editData]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEdit) return (await api.put(`/jobs/${id}`, payload)).data;
      return (await api.post('/jobs', payload)).data;
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Job updated' : 'Job posted');
      navigate('/employer/jobs');
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (isEdit && editLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const job: Job | undefined = editData?.job;

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setSkillInput('');
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const salaryMin = Number(fd.get('salaryMin')) || null;
    const salaryMax = Number(fd.get('salaryMax')) || null;
    const payload = {
      title: fd.get('title') as string,
      categoryId: (fd.get('categoryId') as string) || null,
      description: fd.get('description') as string,
      type: (fd.get('type') as string) || 'FULL_TIME',
      workMode: (fd.get('workMode') as string) || 'ONSITE',
      location: (fd.get('location') as string) || null,
      salaryMin,
      salaryMax,
      currency: (fd.get('currency') as string) || 'USD',
      experienceLevel: (fd.get('experienceLevel') as string) || 'MID',
      vacancies: Number(fd.get('vacancies')) || 1,
      deadline: (fd.get('deadline') as string) || null,
      requiredSkills: skills,
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{isEdit ? 'Edit job' : 'Post a new job'}</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <Label>Job title *</Label>
              <Input name="title" required minLength={3} defaultValue={job?.title} placeholder="e.g. Senior React Engineer" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select
                  name="categoryId"
                  defaultValue={job?.categoryId || ''}
                  placeholder="Select a category"
                  options={(categoriesData?.categories || []).map((c: any) => ({ value: c.id, label: c.name }))}
                />
              </div>
              <div>
                <Label>Job type</Label>
                <Select name="type" defaultValue={job?.type || 'FULL_TIME'} options={optionsFrom(JOB_TYPES)} />
              </div>
              <div>
                <Label>Work mode</Label>
                <Select name="workMode" defaultValue={job?.workMode || 'ONSITE'} options={optionsFrom(WORK_MODES)} />
              </div>
              <div>
                <Label>Experience level</Label>
                <Select name="experienceLevel" defaultValue={job?.experienceLevel || 'MID'} options={optionsFrom(EXPERIENCE_LEVELS)} />
              </div>
              <div>
                <Label>Location</Label>
                <Input name="location" defaultValue={job?.location || ''} placeholder="City, Country or Remote" />
              </div>
              <div>
                <Label>Vacancies</Label>
                <Input name="vacancies" type="number" min={1} defaultValue={job?.vacancies || 1} />
              </div>
              <div>
                <Label>Minimum salary</Label>
                <Input name="salaryMin" type="number" defaultValue={job?.salaryMin || ''} placeholder="50000" />
              </div>
              <div>
                <Label>Maximum salary</Label>
                <Input name="salaryMax" type="number" defaultValue={job?.salaryMax || ''} placeholder="80000" />
              </div>
              <div>
                <Label>Currency</Label>
                <Input name="currency" defaultValue={job?.currency || 'USD'} maxLength={10} />
              </div>
              <div>
                <Label>Application deadline</Label>
                <Input name="deadline" type="date" defaultValue={job?.deadline ? job.deadline.slice(0, 10) : ''} />
              </div>
            </div>

            <div>
              <Label>Required skills</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter"
                />
                <Button type="button" variant="secondary" onClick={addSkill}>
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">
                    {s}
                    <button type="button" onClick={() => setSkills((prev) => prev.filter((x) => x !== s))} className="hover:text-red-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Label>Job description *</Label>
              <Textarea name="description" required minLength={20} rows={8} defaultValue={job?.description} placeholder="Describe the role, responsibilities, and requirements..." />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
                {isEdit ? 'Save changes' : 'Post job'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
