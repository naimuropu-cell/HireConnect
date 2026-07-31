import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarPlus, Mail, Sparkles } from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { Badge, Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Avatar, Spinner } from '@/components/ui/misc';
import { APPLICATION_STATUSES, STATUS_BADGE_VARIANT, INTERVIEW_MODES } from '@/lib/constants';
import { formatDate, timeAgo, initials } from '@/lib/utils';
import { optionsFrom } from '@/components/ui/select';

const EMPLOYER_ACTIONS = [
  { value: 'VIEWED', label: 'Mark viewed' },
  { value: 'SHORTLISTED', label: 'Shortlist' },
  { value: 'INTERVIEW', label: 'Move to interview' },
  { value: 'REJECTED', label: 'Reject' },
  { value: 'HIRED', label: 'Hire' },
];

export default function Applicants() {
  const { jobId } = useParams();
  const qc = useQueryClient();
  const [interviewApp, setInterviewApp] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState('VIDEO');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['applicants', jobId],
    queryFn: async () => (await api.get(`/jobs/${jobId}/applicants`)).data,
    enabled: !!jobId,
  });

  const { data: recData } = useQuery({
    queryKey: ['recommendations', jobId],
    queryFn: async () => (await api.get(`/jobs/${jobId}/recommendations`)).data,
    enabled: !!jobId,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      (await api.put(`/applications/${id}/status`, { status })).data,
    onSuccess: () => {
      toast.success('Application updated');
      qc.invalidateQueries({ queryKey: ['applicants', jobId] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const interviewMutation = useMutation({
    mutationFn: async () =>
      (await api.post(`/applications/${interviewApp}/interview`, { scheduledAt, mode, link: link || null, notes: notes || null })).data,
    onSuccess: () => {
      toast.success('Interview scheduled');
      setInterviewApp(null);
      qc.invalidateQueries({ queryKey: ['applicants', jobId] });
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

  const applications = data?.applications || [];
  const candidates = recData?.candidates || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Applicants</h1>
      <p className="mt-1 text-sm text-slate-500">
        {applications.length} application{applications.length === 1 ? '' : 's'} for this job
      </p>

      <div className="mt-6 space-y-4">
        {applications.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <p className="text-lg font-medium text-slate-600">No applications yet</p>
          </div>
        )}
        {applications.map((app: any) => (
          <Card key={app.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <Avatar className="h-10 w-10">
                    {initials(app.user?.firstName, app.user?.lastName)}
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {app.user?.firstName} {app.user?.lastName}
                      </h3>
                      <Badge variant={STATUS_BADGE_VARIANT[app.status] || 'secondary'}>
                        {APPLICATION_STATUSES[app.status] || app.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <a href={`mailto:${app.user?.email}`} className="flex items-center gap-1 hover:text-indigo-600">
                        <Mail className="h-3 w-3" /> {app.user?.email}
                      </a>
                      <span>Applied {timeAgo(app.appliedAt)}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {app.profile?.skills?.map((s: any) => (
                        <Badge key={s.skill.id} variant="secondary">
                          {s.skill.name} · {s.level}
                        </Badge>
                      ))}
                    </div>

                    {app.coverLetter && (
                      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                        {app.coverLetter}
                      </p>
                    )}
                    {app.resumeUrl && (
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                        View resume
                      </a>
                    )}
                    {app.interviews?.length > 0 && (
                      <p className="mt-2 text-sm text-indigo-700">
                        Interview: {formatDate(app.interviews[0].scheduledAt)} ({app.interviews[0].mode})
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <Select
                    className="w-44"
                    value=""
                    onChange={(e) => e.target.value && statusMutation.mutate({ id: app.id, status: e.target.value })}
                    options={[{ value: '', label: 'Change status...' }, ...EMPLOYER_ACTIONS]}
                  />
                  <Button variant="outline" size="sm" onClick={() => setInterviewApp(app.id)}>
                    <CalendarPlus className="h-4 w-4" /> Schedule interview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {candidates.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-indigo-600" /> Recommended candidates
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.slice(0, 6).map((c: any) => (
              <Card key={c.userId}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar>{initials(c.user?.firstName, c.user?.lastName)}</Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {c.user?.firstName} {c.user?.lastName}
                      </p>
                      <p className="text-xs text-slate-400">{c.headline || 'Professional'}</p>
                    </div>
                    <Badge className="ml-auto">{c.matchScore}%</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.skills?.slice(0, 4).map((s: any) => (
                      <Badge key={s.skill.id} variant="secondary">
                        {s.skill.name}
                      </Badge>
                    ))}
                  </div>
                  <a
                    href={`mailto:${c.user?.email}`}
                    className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
                  >
                    Contact candidate
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!interviewApp} onOpenChange={(open) => !open && setInterviewApp(null)}>
        <DialogHeader title="Schedule interview" description="The candidate will be notified by email" />
        <DialogContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Date & time *</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div>
              <Label>Mode</Label>
              <Select value={mode} onChange={(e) => setMode(e.target.value)} options={optionsFrom(INTERVIEW_MODES)} />
            </div>
          </div>
          {mode !== 'PHONE' && (
            <div>
              <Label>Meeting link</Label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/..." />
            </div>
          )}
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Add instructions for the candidate" />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setInterviewApp(null)}>
            Cancel
          </Button>
          <Button disabled={!scheduledAt || interviewMutation.isPending} onClick={() => interviewMutation.mutate()}>
            {interviewMutation.isPending && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
            Schedule
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
