import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api, { apiErrorMessage } from '@/lib/api';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/misc';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as { email?: string; purpose?: 'EMAIL_VERIFY' | 'PASSWORD_RESET' };
  const purpose = state.purpose || 'EMAIL_VERIFY';
  const email = state.email || '';
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Missing email. Please start again.');
      return;
    }
    setLoading(true);
    try {
      if (purpose === 'EMAIL_VERIFY') {
        await api.post('/auth/verify-otp', { email, code, purpose });
        toast.success('Email verified! You can now log in.');
        navigate('/login');
      } else {
        await api.post('/auth/reset-password', { email, code, newPassword });
        toast.success('Password reset! You can now log in.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email, purpose });
      toast.success('A new code has been sent.');
      setTimer(60);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{purpose === 'EMAIL_VERIFY' ? 'Verify your email' : 'Reset password'}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {purpose === 'EMAIL_VERIFY'
            ? `We sent a 6-digit code to ${email || 'your email'}`
            : 'Enter the code from your email and choose a new password'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <Label htmlFor="code">6-digit code</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-[0.5em]"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        {purpose === 'PASSWORD_RESET' && (
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="8+ chars, uppercase, number"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
          {loading && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
          {purpose === 'EMAIL_VERIFY' ? 'Verify email' : 'Reset password'}
        </Button>
        <button
          type="button"
          onClick={resend}
          disabled={resending || timer > 0}
          className="w-full text-center text-sm text-indigo-600 hover:underline disabled:text-slate-400"
        >
          {timer > 0 ? `Resend code in ${timer}s` : resending ? 'Sending...' : 'Resend code'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
