import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import Field from '../components/ui/Field.jsx';
import FormError from '../components/ui/FormError.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import OtpInput from '../components/ui/OtpInput.jsx';
import { Spinner } from '../components/BootScreen.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ResetPin() {
  const { state, user, resetPin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: user?.username || '',
    password: '',
    pin: '',
    confirmPin: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (state === 'loading') return null;
  if (state === 'authed') return <Navigate to="/" replace />;

  const setField = (key) => (value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password) {
      setError('Enter your username and password.');
      return;
    }
    if (!/^\d{4,6}$/.test(form.pin)) {
      setError('New PIN must be 4–6 digits.');
      return;
    }
    if (form.pin !== form.confirmPin) {
      setError('New PINs do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPin({ ...form, username: form.username.trim() });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your PIN?"
      subtitle="Prove it's you with your password, then choose a new PIN."
      footer={
        <Link
          to={state === 'pin' ? '/pin' : '/login'}
          className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={error} />

        <Field label="Username" htmlFor="username">
          <input
            id="username"
            className="input"
            value={form.username}
            onChange={(event) => setField('username')(event.target.value)}
            autoComplete="username"
            autoCapitalize="none"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            value={form.password}
            onChange={setField('password')}
            placeholder="Your password"
            autoComplete="current-password"
            strength={false}
            className="max-w-none"
          />
        </Field>

        <div>
          <p className="label text-center">New PIN</p>
          <OtpInput
            length={6}
            size="sm"
            fluid
            value={form.pin}
            onChange={setField('pin')}
            status={error ? 'error' : 'idle'}
          />
        </div>

        <div>
          <p className="label text-center">Confirm PIN</p>
          <OtpInput
            length={6}
            size="sm"
            fluid
            value={form.confirmPin}
            onChange={setField('confirmPin')}
            status={error ? 'error' : 'idle'}
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting && <Spinner />}
          Reset PIN & enter
        </button>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          Your PIN guards app opens. Your password still protects your data.
        </p>
      </form>
    </AuthLayout>
  );
}
