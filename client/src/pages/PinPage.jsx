import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ChevronLeft, Timer } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import FormError from '../components/ui/FormError.jsx';
import OtpInput from '../components/ui/OtpInput.jsx';
import { Spinner } from '../components/BootScreen.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function PinSetup() {
  const { setupPin } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const editPin = (setter) => (value) => {
    setter(value);
    if (error) setError('');
  };

  const handleContinue = (event) => {
    event.preventDefault();
    setError('');
    if (!/^\d{4,6}$/.test(pin)) {
      setError('PIN must be 4–6 digits.');
      return;
    }
    setStep('confirm');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    if (pin !== confirmPin) {
      setError('PINs do not match. Try again.');
      setConfirmPin('');
      return;
    }

    setSubmitting(true);
    try {
      await setupPin(pin, confirmPin);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={step === 'enter' ? handleContinue : handleSave} className="space-y-4" noValidate>
      <div className="flex gap-1.5">
        <span className="h-1 w-7 rounded-full bg-zinc-900 dark:bg-zinc-100" />
        <span
          className={`h-1 w-7 rounded-full ${
            step === 'confirm' ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-800'
          }`}
        />
      </div>

      <FormError message={error} />

      {step === 'enter' ? (
        <>
          <div>
            <p className="label text-center">New PIN</p>
            <div className="flex justify-center">
              <OtpInput
                length={6}
                size="md"
                value={pin}
                onChange={editPin(setPin)}
                autoFocus
                status={error ? 'error' : 'idle'}
              />
            </div>
            <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
              4–6 digits. Avoid 1234 or your birth year.
            </p>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={pin.length < 4}
          >
            Continue
          </button>
        </>
      ) : (
        <>
          <div>
            <p className="label text-center">Confirm PIN</p>
            <div className="flex justify-center">
              <OtpInput
                length={6}
                size="md"
                value={confirmPin}
                onChange={editPin(setConfirmPin)}
                autoFocus
                status={error ? 'error' : 'idle'}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting && <Spinner />}
            Set PIN & enter
          </button>
          <button
            type="button"
            className="btn btn-ghost w-full"
            onClick={() => {
              setStep('enter');
              setConfirmPin('');
              setError('');
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            Change PIN
          </button>
        </>
      )}
    </form>
  );
}

function PinVerify() {
  const { user, verifyPin, logout } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [lockedUntil]);

  const remaining = lockedUntil
    ? Math.max(0, Math.ceil((new Date(lockedUntil).getTime() - now) / 1000))
    : 0;
  const locked = remaining > 0;

  useEffect(() => {
    if (lockedUntil && remaining === 0) {
      setLockedUntil(null);
      setError('');
      setAttemptsLeft(null);
    }
  }, [lockedUntil, remaining]);

  const handlePinChange = (value) => {
    setPin(value);
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (locked) return;
    setError('');
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Enter your 4–6 digit PIN.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyPin(pin);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.data?.attemptsLeft !== undefined) setAttemptsLeft(err.data.attemptsLeft);
      if (err.data?.lockedUntil) setLockedUntil(err.data.lockedUntil);
      setPin('');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSwitch = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const countdown = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {user?.username && (
        <div className="flex items-center gap-2.5 rounded-lg border border-zinc-200/80 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[11px] font-semibold uppercase text-white dark:bg-zinc-100 dark:text-zinc-900">
            {user.username.slice(0, 1)}
          </span>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {user.username}
          </span>
          <button
            type="button"
            onClick={handlePasswordSwitch}
            className="ml-auto text-xs text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            Not you?
          </button>
        </div>
      )}

      {locked ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Too many attempts. You can try again in <strong className="num">{countdown}</strong>.
          </span>
        </div>
      ) : (
        <FormError message={error} />
      )}

      <div>
        <div className="flex justify-center">
          <OtpInput
            length={6}
            size="md"
            mask
            value={pin}
            onChange={handlePinChange}
            autoFocus
            disabled={locked || submitting}
            status={error ? 'error' : 'idle'}
          />
        </div>
        {attemptsLeft !== null && attemptsLeft > 0 && !locked && (
          <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
            {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} left before a short lock
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={locked || submitting || pin.length < 4}
      >
        {submitting && <Spinner />}
        Unlock
      </button>

      <div className="flex items-center justify-between pt-1 text-xs">
        <Link
          to="/reset-pin"
          className="text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Forgot PIN?
        </Link>
        <button
          type="button"
          onClick={handlePasswordSwitch}
          className="text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Use password instead
        </button>
      </div>
    </form>
  );
}

export default function PinPage() {
  const { state, user } = useAuth();

  if (state === 'loading') return null;
  if (state === 'authed') return <Navigate to="/" replace />;
  if (state === 'guest') return <Navigate to="/login" replace />;

  const isSetup = state === 'setup';

  return (
    <AuthLayout
      title={isSetup ? 'Set your PIN' : 'Enter your PIN'}
      subtitle={
        isSetup
          ? 'A second lock for your ledger. You will enter it every time R2R opens.'
          : `Welcome back${user?.username ? `, ${user.username}` : ''}. Enter your PIN to continue.`
      }
    >
      {isSetup ? <PinSetup /> : <PinVerify />}
    </AuthLayout>
  );
}
