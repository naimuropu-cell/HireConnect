import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Banknote, Bookmark, BookmarkCheck, Building2, Calendar, Flag, MapPin, Send, Users, Clock,
} from 'lucide-react';
import api, { apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Badge, Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea, Label } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/misc';
import { APPLICATION_STATUSES, STATUS_BADGE_VARIANT, JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS } from '@/lib/constants';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [reportReason, setReportReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => (await api.get(`/jobs/${id}`)).data,
    enabled: !!id,
  });

  const { data: savedData } = useQuery({
    queryKey: ['saved-status', id, user?.id],
    queryFn: async () => {
      const res = await api.get('/jobs/saved');
      const saved = res.data.saved as { jobId: string }[];
      return saved.some((s) => s.jobId === id);
    },
    enabled: !!user && !!id,
  });

  const job = data?.job;

  const applyMutation = useMutation({
    mutationFn: async () => (await api.post(`/jobs/${id}/apply`, { coverLetter })).data,
    onSuccess: () => {
      toast.success('Application submitted!');
      setApplyOpen(false);
      qc.invalidateQueries({ queryKey: ['job', id] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedData) return api.delete(`/jobs/${id}/save`);
      return api.post(`/jobs/${id}/save`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-status', id] });
      toast.success(savedData ? 'Job removed from saved' : 'Job saved');
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const reportMutation = useMutation({
    mutationFn: async () =>
      (await api.post('/reports', { targetType: 'JOB', targetId: id, reason: reportReason })).data,
    onSuccess: () => {
      toast.success('Report submitted. Thank you for keeping the platform safe.');
      setReportOpen(false);
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

  if (!job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-lg font-medium text-slate-600">Job not found</p>
        <Link to="/jobs" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const myApplication = user && job.applications?.find((a: any) => a.userId === user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/jobs" className="mb-4 inline-block text-sm text-indigo-600 hover:underline">
        ← Back to jobs
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                {job.featured && <Badge>Featured</Badge>}
              </div>
              <Link to={`/companies/${job.company.slug}`} className="text-indigo-600 hover:underline">
                <span className="flex items-center gap-1.5 text-base font-medium">
                  <Building2 className="h-4 w-4" /> {job.company.name}
                </span>
              </Link>
            </div>
            <div className="flex gap-2">
              {user && user.role === 'SEEKER' && (
                <>
                  <Button variant="outline" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {savedData ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {savedData ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={() => setReportOpen(true)}>
                    <Flag className="h-4 w-4" /> Report
                  </Button>
                  <Button onClick={() => setApplyOpen(true)} disabled={!!myApplication}>
                    <Send className="h-4 w-4" />
                    {myApplication ? 'Applied' : 'Apply now'}
                  </Button>
                </>
              )}
              {!user && (
                <Link to="/login">
                  <Button>Log in to apply</Button>
                </Link>
              )}
            </div>
          </div>

          {myApplication && (
            <div className="mt-4 rounded-lg bg-indigo-50 p-4 text-sm">
              <span className="font-medium text-indigo-800">Your application status: </span>
              <Badge variant={STATUS_BADGE_VARIANT[myApplication.status] || 'secondary'}>
                {APPLICATION_STATUSES[myApplication.status] || myApplication.status}
              </Badge>
              {myApplication.interviews?.length > 0 && (
                <div className="mt-2 text-indigo-700">
                  Interview:{' '}
                  {formatDateTime(myApplication.interviews[0].scheduledAt)} ({myApplication.interviews[0].mode})
                </div>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCell icon={MapPin} label="Location" value={job.location || 'Remote'} />
            <InfoCell icon={Banknote} label="Salary" value={formatCurrency(job.salaryMin, job.salaryMax, job.currency)} />
            <InfoCell icon={Clock} label="Job type" value={JOB_TYPES[job.type] || job.type} />
            <InfoCell icon={Building2} label="Work mode" value={WORK_MODES[job.workMode] || job.workMode} />
            <InfoCell icon={Users} label="Experience" value={EXPERIENCE_LEVELS[job.experienceLevel] || job.experienceLevel} />
            <InfoCell icon={Calendar} label="Deadline" value={job.deadline ? formatDate(job.deadline) : 'Rolling'} />
          </div>

          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">Required skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((rs: any) => (
                <Badge key={rs.skill.id} variant="secondary">
                  {rs.skill.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">Job description</h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{job.description}</div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogHeader title="Apply for this job" description={`${job.title} at ${job.company.name}`} />
        <DialogContent>
          <div>
            <Label>Cover letter (optional)</Label>
            <Textarea
              rows={6}
              placeholder="Tell the employer why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              Your resume from your profile will be attached to this application.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setApplyOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
            {applyMutation.isPending && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
            Submit application
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogHeader title="Report this job" description="Let us know why this listing is problematic" />
        <DialogContent>
          <div>
            <Label>Reason</Label>
            <Textarea
              rows={4}
              placeholder="e.g. spam, misleading salary, duplicate posting..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setReportOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={reportReason.trim().length < 3 || reportMutation.isPending}
            onClick={() => reportMutation.mutate()}
          >
            Submit report
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function InfoCell({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
      <Icon className="h-4 w-4 text-indigo-600" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
