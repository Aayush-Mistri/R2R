import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import Field from '../components/ui/Field.jsx';
import FormError from '../components/ui/FormError.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import { Spinner } from '../components/BootScreen.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

const USERNAME_PATTERN = /^[a-zA-Z0-9._]{3,20}$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [availability, setAvailability] = useState({ status: 'idle', message: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const value = username.trim();

    if (!value) {
      setAvailability({ status: 'idle', message: '' });
      return undefined;
    }

    if (!USERNAME_PATTERN.test(value)) {
      setAvailability({
        status: 'invalid',
        message: '3–20 characters, using letters, numbers, dots or underscores',
      });
      return undefined;
    }

    let cancelled = false;
    setAvailability({ status: 'checking', message: 'Checking availability…' });
    const timer = window.setTimeout(async () => {
      try {
        const data = await api.get(
          `/auth/username-available?username=${encodeURIComponent(value)}`,
          { auth: false }
        );
        if (cancelled) return;
        setAvailability(
          data.available
            ? { status: 'available', message: 'Username is available' }
            : { status: 'taken', message: data.reason || 'That username is already taken' }
        );
      } catch {
        if (!cancelled) setAvailability({ status: 'idle', message: '' });
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [username]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordLongEnough = password.length >= 8;
  const canSubmit =
    availability.status === 'available' &&
    passwordLongEnough &&
    passwordsMatch &&
    !submitting;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (availability.status !== 'available') {
      setError('Choose an available username first.');
      return;
    }
    if (!passwordLongEnough) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ username: username.trim(), password, confirmPassword });
      navigate('/pin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="A private ledger, guarded by a password and a PIN."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={error} />

        <Field
          label="Username"
          htmlFor="username"
          hint={
            availability.status === 'idle'
              ? 'This is what you will sign in with.'
              : undefined
          }
        >
          <input
            id="username"
            className="input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="pick a username"
            autoComplete="username"
            autoCapitalize="none"
            autoFocus
          />
          {availability.status !== 'idle' && (
            <p
              className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                availability.status === 'available'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : availability.status === 'taken' || availability.status === 'invalid'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {availability.status === 'available' && <Check className="h-3.5 w-3.5" />}
              {(availability.status === 'taken' || availability.status === 'invalid') && (
                <X className="h-3.5 w-3.5" />
              )}
              {availability.status === 'checking' && <Spinner className="h-3 w-3" />}
              {availability.message}
            </p>
          )}
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="max-w-none"
          />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="confirmPassword"
          error={
            confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined
          }
        >
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat your password"
            autoComplete="new-password"
            strength={false}
            className="max-w-none"
          />
        </Field>

        <button type="submit" className="btn btn-primary w-full" disabled={!canSubmit}>
          {submitting && <Spinner />}
          Create account
        </button>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          You&apos;ll set a 4–6 digit PIN on the next step.
        </p>
      </form>
    </AuthLayout>
  );
}
