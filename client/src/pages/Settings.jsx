import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, ShieldCheck, Sun } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Field from '../components/ui/Field.jsx';
import FormError from '../components/ui/FormError.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import OtpInput from '../components/ui/OtpInput.jsx';
import { Spinner } from '../components/BootScreen.jsx';
import { toast } from '../components/ui/toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { api } from '../lib/api.js';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [pinForm, setPinForm] = useState({ currentPin: '', pin: '', confirmPin: '' });
  const [pinError, setPinError] = useState('');
  const [pinSaving, setPinSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handlePinSubmit = async (event) => {
    event.preventDefault();
    setPinError('');

    if (!/^\d{4,6}$/.test(pinForm.currentPin)) {
      setPinError('Enter your current 4–6 digit PIN.');
      return;
    }
    if (!/^\d{4,6}$/.test(pinForm.pin)) {
      setPinError('New PIN must be 4–6 digits.');
      return;
    }
    if (pinForm.pin !== pinForm.confirmPin) {
      setPinError('New PINs do not match.');
      return;
    }

    setPinSaving(true);
    try {
      await api.post('/auth/change-pin', pinForm);
      toast.success('PIN updated', {
        description: 'Use it the next time R2R opens.',
      });
      setPinForm({ currentPin: '', pin: '', confirmPin: '' });
    } catch (err) {
      setPinError(err.message);
    } finally {
      setPinSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }
    if (passwordForm.password.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.post('/auth/change-password', passwordForm);
      toast.success('Password updated');
      setPasswordForm({ currentPassword: '', password: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out', { description: 'Your PIN will be asked next time.' });
    navigate('/login', { replace: true });
  };

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Security, appearance and this session." />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <section className="card flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-zinc-900 text-lg font-semibold uppercase text-white dark:bg-zinc-100 dark:text-zinc-900">
              {user?.username?.slice(0, 1) || '?'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {user?.username}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  PIN protected
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Personal ledger
                </span>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="section-title">Appearance</h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Stored on this browser.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {themes.map((option) => {
                const Icon = option.icon;
                const selected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`flex items-center gap-2.5 rounded-lg border p-3 text-sm font-medium transition ${
                      selected
                        ? 'border-zinc-900 bg-zinc-50 text-zinc-900 dark:border-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-50'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                    }`}
                    aria-pressed={selected}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="section-title">Session</h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Signing out clears this browser&apos;s PIN challenge. You will need your password
              again next time.
            </p>
            <button type="button" className="btn btn-secondary mt-4" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="section-title">Change PIN</h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Used every time the app opens.
            </p>
            <form onSubmit={handlePinSubmit} className="mt-4 space-y-4" noValidate>
              <FormError message={pinError} />

              <div>
                <p className="label">Current PIN</p>
                <OtpInput
                  length={6}
                  size="sm"
                  mask
                  value={pinForm.currentPin}
                  onChange={(value) => {
                    setPinForm((current) => ({ ...current, currentPin: value }));
                    if (pinError) setPinError('');
                  }}
                  status={pinError ? 'error' : 'idle'}
                />
              </div>

              <div>
                <p className="label">New PIN</p>
                <OtpInput
                  length={6}
                  size="sm"
                  value={pinForm.pin}
                  onChange={(value) => {
                    setPinForm((current) => ({ ...current, pin: value }));
                    if (pinError) setPinError('');
                  }}
                  status={pinError ? 'error' : 'idle'}
                />
              </div>

              <div>
                <p className="label">Confirm PIN</p>
                <OtpInput
                  length={6}
                  size="sm"
                  value={pinForm.confirmPin}
                  onChange={(value) => {
                    setPinForm((current) => ({ ...current, confirmPin: value }));
                    if (pinError) setPinError('');
                  }}
                  status={pinError ? 'error' : 'idle'}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={pinSaving}>
                {pinSaving && <Spinner />}
                Update PIN
              </button>
            </form>
          </section>

          <section className="card p-5">
            <h2 className="section-title">Change password</h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Your first line of defence.
            </p>
            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3" noValidate>
              <FormError message={passwordError} />

              <Field label="Current password" htmlFor="currentPassword">
                <PasswordInput
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(currentPassword) =>
                    setPasswordForm((current) => ({ ...current, currentPassword }))
                  }
                  placeholder="Current password"
                  autoComplete="current-password"
                  strength={false}
                  className="max-w-none"
                />
              </Field>

              <Field label="New password" htmlFor="newPassword">
                <PasswordInput
                  id="newPassword"
                  value={passwordForm.password}
                  onChange={(password) =>
                    setPasswordForm((current) => ({ ...current, password }))
                  }
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="max-w-none"
                />
              </Field>

              <Field
                label="Confirm new password"
                htmlFor="confirmNewPassword"
                error={
                  passwordForm.confirmPassword &&
                  passwordForm.password !== passwordForm.confirmPassword
                    ? 'Passwords do not match'
                    : undefined
                }
              >
                <PasswordInput
                  id="confirmNewPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(confirmPassword) =>
                    setPasswordForm((current) => ({ ...current, confirmPassword }))
                  }
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  strength={false}
                  className="max-w-none"
                />
              </Field>

              <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                {passwordSaving && <Spinner />}
                Update password
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
