import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/misc';

export default function AdminCategories() {
  const qc = useQueryClient();
  const [catName, setCatName] = useState('');
  const [skillName, setSkillName] = useState('');

  const { data: categoriesData, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/jobs/categories')).data,
  });
  const { data: skillsData, isLoading: skillLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => (await api.get('/jobs/skills')).data,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['categories'] });
    qc.invalidateQueries({ queryKey: ['skills'] });
  };

  const createCat = useMutation({
    mutationFn: async () => (await api.post('/admin/categories', { name: catName })).data,
    onSuccess: () => {
      toast.success('Category created');
      setCatName('');
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const deleteCat = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/categories/${id}`)).data,
    onSuccess: () => {
      toast.success('Category deleted');
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const createSkill = useMutation({
    mutationFn: async () => (await api.post('/admin/skills', { name: skillName })).data,
    onSuccess: () => {
      toast.success('Skill created');
      setSkillName('');
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const deleteSkill = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/skills/${id}`)).data,
    onSuccess: () => {
      toast.success('Skill deleted');
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (catLoading || skillLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Categories</h2>
          <div className="mb-4 flex gap-2">
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="New category name" />
            <Button onClick={() => createCat.mutate()} disabled={!catName.trim()}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {categoriesData?.categories.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <div>
                  <p className="font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">{c._count?.jobs || 0} jobs</p>
                </div>
                <button className="text-slate-300 hover:text-red-600" onClick={() => deleteCat.mutate(c.id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Skills</h2>
          <div className="mb-4 flex gap-2">
            <Input value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="New skill name" />
            <Button onClick={() => createSkill.mutate()} disabled={!skillName.trim()}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillsData?.skills.map((s: any) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {s.name}
                <button className="text-slate-400 hover:text-red-600" onClick={() => deleteSkill.mutate(s.id)}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
