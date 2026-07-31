import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GraduationCap, Briefcase, Award, FileText, KeyRound, Plus, Trash2 } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Progress, Spinner } from '@/components/ui/misc';
import { Tabs } from '@/components/ui/misc';
import { SKILL_LEVELS } from '@/lib/constants';
import type { Certification, Education, Experience, Profile } from '@/types';

type Tab = 'basics' | 'skills' | 'education' | 'experience' | 'certs' | 'resume' | 'security';

export default function ProfileBuilder() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('basics');
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile/me')).data,
  });
  const profile: Profile | undefined = data?.profile;

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => (await api.put('/profile', payload)).data,
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const saveBasics = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const key of ['headline', 'about', 'location', 'phone', 'portfolio', 'github', 'linkedin']) {
      const v = (fd.get(key) as string) || '';
      if (v) payload[key] = v;
      else payload[key] = null;
    }
    setSaving(true);
    updateMutation.mutate(payload, { onSettled: () => setSaving(false) });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-slate-500">Complete your profile to increase your match score</p>
        </div>
        {profile && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <span className="text-sm text-slate-500">Profile completion</span>
            <span className="font-semibold text-indigo-600">{profile.completion}%</span>
            <Progress value={profile.completion} className="w-24" />
          </div>
        )}
      </div>

      <div className="mb-6 overflow-x-auto">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
          items={[
            { value: 'basics', label: 'Basics' },
            { value: 'skills', label: 'Skills' },
            { value: 'education', label: 'Education' },
            { value: 'experience', label: 'Experience' },
            { value: 'certs', label: 'Certifications' },
            { value: 'resume', label: 'Resume' },
            { value: 'security', label: 'Security' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : tab === 'basics' ? (
        <BasicsForm profile={profile!} onSave={saveBasics} saving={saving} />
      ) : tab === 'skills' ? (
        <SkillsEditor profile={profile!} onSave={updateMutation} />
      ) : tab === 'education' ? (
        <ListEditor
          type="education"
          items={(profile?.education || []) as unknown as Education[]}
          fields={[
            { name: 'institution', label: 'Institution', placeholder: 'University of Example' },
            { name: 'degree', label: 'Degree', placeholder: 'BSc' },
            { name: 'field', label: 'Field of study', placeholder: 'Computer Science' },
            { name: 'startDate', label: 'Start date', type: 'date' },
            { name: 'endDate', label: 'End date', type: 'date' },
            { name: 'description', label: 'Description', textarea: true },
          ]}
          onSave={updateMutation}
        />
      ) : tab === 'experience' ? (
        <ListEditor
          type="experience"
          items={(profile?.experience || []) as unknown as Experience[]}
          fields={[
            { name: 'company', label: 'Company', placeholder: 'Acme Inc' },
            { name: 'title', label: 'Job title', placeholder: 'Software Engineer' },
            { name: 'location', label: 'Location', placeholder: 'New York' },
            { name: 'startDate', label: 'Start date', type: 'date' },
            { name: 'endDate', label: 'End date', type: 'date' },
            { name: 'current', label: 'Current job', type: 'checkbox' },
            { name: 'description', label: 'Description', textarea: true },
          ]}
          onSave={updateMutation}
        />
      ) : tab === 'certs' ? (
        <ListEditor
          type="certifications"
          items={(profile?.certifications || []) as unknown as Certification[]}
          fields={[
            { name: 'name', label: 'Name', placeholder: 'AWS Certified Developer' },
            { name: 'issuer', label: 'Issuer', placeholder: 'Amazon' },
            { name: 'url', label: 'URL', placeholder: 'https://...' },
            { name: 'issuedDate', label: 'Issued date', type: 'date' },
          ]}
          onSave={updateMutation}
        />
      ) : tab === 'resume' ? (
        <ResumeEditor profile={profile!} />
      ) : (
        <SecurityForm />
      )}
    </div>
  );
}

function BasicsForm({
  profile,
  onSave,
  saving,
}: {
  profile: Profile;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Headline</Label>
              <Input name="headline" placeholder="e.g. Senior React Engineer" defaultValue={profile.headline || ''} />
            </div>
            <div>
              <Label>Location</Label>
              <Input name="location" placeholder="City, Country" defaultValue={profile.location || ''} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input name="phone" defaultValue={profile.phone || ''} />
            </div>
            <div>
              <Label>Portfolio</Label>
              <Input name="portfolio" placeholder="https://" defaultValue={profile.portfolio || ''} />
            </div>
            <div>
              <Label>GitHub</Label>
              <Input name="github" placeholder="https://github.com/..." defaultValue={profile.github || ''} />
            </div>
            <div>
              <Label>LinkedIn</Label>
              <Input name="linkedin" placeholder="https://linkedin.com/in/..." defaultValue={profile.linkedin || ''} />
            </div>
          </div>
          <div>
            <Label>About</Label>
            <Textarea name="about" rows={5} placeholder="Tell employers about yourself" defaultValue={profile.about || ''} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
            Save basics
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SkillsEditor({ profile, onSave }: { profile: Profile; onSave: any }) {
  const [skills, setSkills] = useState<(typeof profile.skills)[number][]>(profile.skills || []);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('INTERMEDIATE');

  const add = () => {
    if (!name.trim()) return;
    setSkills((prev) => [...prev.filter((s) => s.skill.name !== name.trim()), { skill: { id: name, name: name.trim() }, level }]);
    setName('');
  };

  const save = () => {
    onSave.mutate(
      { skills: skills.map((s) => ({ name: s.skill.name, level: s.level })) },
      { onSuccess: () => toast.success('Skills updated') }
    );
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1">
            <Label>Add skill</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder="e.g. TypeScript" />
          </div>
          <div className="w-44">
            <Label>Level</Label>
            <Select value={level} onChange={(e) => setLevel(e.target.value)} options={SKILL_LEVELS.map((l) => ({ value: l, label: l }))} />
          </div>
          <Button type="button" variant="secondary" onClick={add}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s.skill.name} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 py-1 pl-3 pr-1 text-sm text-indigo-700">
              {s.skill.name}
              <Badge variant="secondary" className="mr-1">
                {s.level}
              </Badge>
              <button
                className="rounded-full p-0.5 hover:bg-red-100 hover:text-red-600"
                onClick={() => setSkills((prev) => prev.filter((x) => x.skill.name !== s.skill.name))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
        <Button onClick={save} disabled={onSave.isPending}>
          {onSave.isPending && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
          Save skills
        </Button>
      </CardContent>
    </Card>
  );
}

interface FieldDef {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'date' | 'checkbox';
  textarea?: boolean;
}

function ListEditor({
  type,
  items,
  fields,
  onSave,
}: {
  type: 'education' | 'experience' | 'certifications';
  items: any[];
  fields: FieldDef[];
  onSave: any;
}) {
  const [rows, setRows] = useState<Record<string, any>[]>(items.length ? items : [{}]);
  const icons = { education: GraduationCap, experience: Briefcase, certifications: Award };
  const Icon = icons[type];

  const update = (idx: number, key: string, value: unknown) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };

  const save = () => {
    const cleaned = rows.filter((r) => Object.values(r).some((v) => (typeof v === 'string' ? v.trim() : Boolean(v))));
    const payload: Record<string, unknown> = {};
    payload[type] = cleaned.map((r) => ({ ...r, current: type === 'experience' ? r.current === 'on' || r.current === true : undefined }));
    onSave.mutate(payload, { onSuccess: () => toast.success('Saved') });
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Icon className="h-4 w-4" /> Add as many entries as you like
        </div>
        {rows.map((row, idx) => (
          <div key={idx} className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) =>
                f.type === 'checkbox' ? (
                  <label key={f.name} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={Boolean(row[f.name])} onChange={(e) => update(idx, f.name, e.target.checked)} />
                    {f.label}
                  </label>
                ) : f.textarea ? (
                  <div key={f.name} className="sm:col-span-2">
                    <Label>{f.label}</Label>
                    <Textarea
                      defaultValue={typeof row[f.name] === 'string' ? row[f.name] : ''}
                      onBlur={(e) => update(idx, f.name, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  </div>
                ) : (
                  <div key={f.name}>
                    <Label>{f.label}</Label>
                    <Input
                      type={f.type || 'text'}
                      defaultValue={row[f.name] ? String(row[f.name]).slice(0, 10) : ''}
                      onBlur={(e) => update(idx, f.name, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  </div>
                )
              )}
            </div>
            {rows.length > 1 && (
              <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setRows((prev) => [...prev, {}])}>
            <Plus className="h-4 w-4" /> Add entry
          </Button>
          <Button onClick={save} disabled={onSave.isPending}>
            {onSave.isPending && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ResumeEditor({ profile }: { profile: Profile }) {
  const [uploading, setUploading] = useState(false);
  const qc = useQueryClient();

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      await api.post('/profile/resume', fd);
      toast.success('Resume uploaded');
      qc.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete('/profile/resume');
      toast.success('Resume removed');
      qc.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-slate-600">
          <FileText className="h-5 w-5 text-indigo-600" />
          <span className="font-medium">Resume (PDF or DOC/DOCX, max 5MB)</span>
        </div>
        {profile.resumeUrl ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-800">{profile.resumeName || 'Resume'}</p>
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">
                View file
              </a>
            </div>
            <Button variant="destructive" size="sm" onClick={remove}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No resume uploaded yet.</p>
        )}
        <div>
          <Label>Upload new resume</Label>
          <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} disabled={uploading} />
          {uploading && <Spinner className="mt-2" />}
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed. Please log in again.');
      localStorage.removeItem('hc_access');
      localStorage.removeItem('hc_refresh');
      window.location.href = '/login';
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2 text-slate-600">
          <KeyRound className="h-5 w-5 text-indigo-600" />
          <span className="font-medium">Change password</span>
        </div>
        <form onSubmit={submit} className="max-w-sm space-y-4">
          <div>
            <Label>Current password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <Label>New password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="8+ chars, uppercase, number" />
          </div>
          <Button type="submit" disabled={loading || !currentPassword || !newPassword}>
            {loading && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
            Change password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
