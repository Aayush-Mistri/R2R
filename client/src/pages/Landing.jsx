import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, LockKeyhole, Moon, Sun } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import MagicBento from '../components/landing/MagicBento.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const EASE = [0.22, 1, 0.36, 1];

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-zinc-200 bg-white/70 p-0.5 dark:border-zinc-800 dark:bg-zinc-900/60"
      role="group"
      aria-label="Color theme"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
        className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
          theme === 'light'
            ? 'bg-zinc-900 text-white'
            : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
        }`}
      >
        <Sun className="h-[15px] w-[15px]" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
        className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-100 text-zinc-900'
            : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200'
        }`}
      >
        <Moon className="h-[15px] w-[15px]" strokeWidth={1.8} />
      </button>
    </div>
  );
}

function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start center']
  });
  const opacity = useTransform(scrollYProgress, [0, 0.85], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [44, 0]);

  return (
    <motion.div ref={ref} style={reduceMotion ? undefined : { opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const reduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const lenisRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const lenis = new Lenis({ autoRaf: true, duration: 1.05, smoothWheel: true });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0.15]);
  const heroY = useTransform(heroProgress, [0, 1], [0, -70]);

  const scrollTo = (selector) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(selector, { offset: -56 });
      return;
    }
    document.querySelector(selector)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const rise = (delay) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: EASE, delay }
        };

  return (
    <div className="min-h-dvh bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-zinc-100 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Brand size={28} />
          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitch />
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white sm:inline-flex"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm h-9 px-3.5">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section
        ref={heroRef}
        className="relative flex min-h-dvh flex-col items-center justify-center px-5 pb-24 pt-28 text-center"
      >
        <motion.div
          style={reduceMotion ? undefined : { opacity: heroOpacity, y: heroY }}
          className="flex flex-col items-center"
        >
          <motion.p {...rise(0)} className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
            Personal finance, quietly kept
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            className="max-w-5xl text-balance text-[clamp(3.4rem,10.5vw,8.75rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-zinc-900 dark:text-zinc-50"
          >
            Know where it went.
          </motion.h1>

          <motion.p
            {...rise(0.18)}
            className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg"
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
        </motion.div>

        <button
          type="button"
          onClick={() => scrollTo('#why')}
          className="absolute bottom-8 flex flex-col items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
        >
          Scroll
          <motion.span
            animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.span>
        </button>
      </section>

      <section id="why" className="scroll-mt-16 px-5 pb-24 pt-20 sm:px-8 lg:pb-32 lg:pt-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
              The whole picture
            </p>
            <h2 className="mt-4 text-balance text-[clamp(2.1rem,4.8vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-zinc-900 dark:text-zinc-50">
              A personal finance tracker that stays out of your way.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
              No spreadsheets to keep tidy. Add what you spent, and R2R quietly keeps every balance,
              category and trend current — behind your PIN.
            </p>
          </Reveal>

          <Reveal className="mt-12 lg:mt-16">
            <MagicBento
              theme={theme}
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

          <p className="mt-5 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            Sample numbers for illustration.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <Reveal className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-7 rounded-2xl border border-zinc-200 bg-zinc-50/70 px-6 py-10 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                Start knowing.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
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

      <footer className="border-t border-zinc-100 px-5 py-8 dark:border-zinc-800/80 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Brand size={24} />
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <LockKeyhole className="h-3 w-3" />
            Private by design · R2R personal finance
          </p>
        </div>
      </footer>
    </div>
  );
}
