import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, LockKeyhole } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import MagicBento from '../components/landing/MagicBento.jsx';

const EASE = [0.22, 1, 0.36, 1];

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-12% 0px' });
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.72, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const reduceMotion = useReducedMotion();
  const rise = (delay) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: EASE, delay },
        };

  return (
    <div className="min-h-dvh bg-white text-zinc-900">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-zinc-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Brand size={28} />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm h-9 px-3.5">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative flex min-h-dvh flex-col items-center justify-center px-5 pb-24 pt-28 text-center">
        <motion.p
          {...rise(0)}
          className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-400"
        >
          Personal finance, quietly kept
        </motion.p>

        <motion.h1
          {...rise(0.08)}
          className="max-w-5xl text-balance text-[clamp(3.4rem,10.5vw,8.75rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-zinc-900"
        >
          Know where it went.
        </motion.h1>

        <motion.p
          {...rise(0.18)}
          className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-zinc-500 sm:text-lg"
        >
          A private ledger for the money you spend, save and move. Log it in seconds; R2R keeps the
          balances, categories and charts in order.
        </motion.p>

        <motion.div
          {...rise(0.26)}
          className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          <Link to="/register" className="btn btn-primary h-11 gap-2 px-6">
            Start your ledger
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="btn btn-secondary h-11 px-6">
            I already have an account
          </Link>
        </motion.div>

        <a
          href="#why"
          className="absolute bottom-8 flex flex-col items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:text-zinc-700"
        >
          Scroll
          <motion.span
            animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.span>
        </a>
      </section>

      <section id="why" className="scroll-mt-16 px-5 pb-24 pt-20 sm:px-8 lg:pb-32 lg:pt-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-400">
              The whole picture
            </p>
            <h2 className="mt-4 text-balance text-[clamp(2.1rem,4.8vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-zinc-900">
              A personal finance tracker that stays out of your way.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-500">
              No spreadsheets to keep tidy. Add what you spent, and R2R quietly keeps every balance,
              category and trend current — behind your PIN.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-12 lg:mt-16">
            <MagicBento
              theme="light"
              columns={4}
              rowHeight={200}
              gap={12}
              radius={20}
              enableBorderGlow
              enableSpotlight
              spotlightRadius={300}
              clickEffect
              glowColor="#1A73F2"
            />
          </Reveal>

          <p className="mt-5 text-center text-[11px] text-zinc-400">
            Sample numbers for illustration.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <Reveal className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-7 rounded-2xl border border-zinc-200 bg-zinc-50/70 px-6 py-10 sm:px-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Start knowing.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                One ledger, one PIN, and no clutter between you and your money.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link to="/register" className="btn btn-primary h-11 gap-2 px-6">
                Create an account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn btn-secondary h-11 px-6">
                Sign in
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-zinc-100 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Brand size={24} />
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <LockKeyhole className="h-3 w-3" />
            Private by design · R2R personal finance
          </p>
        </div>
      </footer>
    </div>
  );
}
