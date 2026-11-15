import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform
} from 'motion/react';
import { ArrowDown, ArrowRight, Check, Moon, Sun } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import MagicBento from '../components/landing/MagicBento.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import './Landing.css';

const EASE = [0.22, 1, 0.36, 1];

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="lp-theme-switch" role="group" aria-label="Color theme">
      <button
        type="button"
        onClick={() => setTheme('light')}
        data-active={theme === 'light' ? '' : undefined}
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
      >
        <Sun className="h-[15px] w-[15px]" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        data-active={theme === 'dark' ? '' : undefined}
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
      >
        <Moon className="h-[15px] w-[15px]" strokeWidth={1.8} />
      </button>
    </div>
  );
}

function PhoneMock({ children, compact = false }) {
  return (
    <div className={`lp-phone${compact ? ' lp-phone--compact' : ''}`} aria-hidden="true">
      <div className="lp-phone-screen">{children}</div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="flex h-full flex-col px-4 pb-5 pt-9 text-zinc-900">
      <div className="flex items-center justify-between text-[9px] font-medium text-zinc-400">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-400">Total balance</p>
          <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">₹1,24,560</p>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f3fb]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4f9bd1]" />
        </span>
      </div>

      <svg className="lp-spark mt-3" viewBox="0 0 220 64" fill="none">
        <defs>
          <linearGradient id="lp-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bcd9f0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#bcd9f0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M4 52c16-3 24-17 40-14s16 13 30 8 16-20 30-16 16 10 30 4 20-14 32-20v50H4Z"
          fill="url(#lp-spark-fill)"
        />
        <path
          d="M4 52c16-3 24-17 40-14s16 13 30 8 16-20 30-16 16 10 30 4 20-14 32-20"
          stroke="#4f9bd1"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[#f2efe8] px-3 py-2">
          <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-400">Spent</p>
          <p className="mt-0.5 text-[13px] font-semibold">₹42.8k</p>
        </div>
        <div className="rounded-xl bg-[#eaf2ea] px-3 py-2">
          <p className="text-[8px] uppercase tracking-[0.14em] text-zinc-400">Saved</p>
          <p className="mt-0.5 text-[13px] font-semibold text-[#1f7a4d]">₹18.2k</p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {[
          { name: 'Salary', meta: 'Income', amount: '+₹85,000', tone: 'text-[#1f7a4d]', dot: 'bg-[#9cc8ae]' },
          { name: 'Big Basket', meta: 'Groceries', amount: '−₹2,340', tone: 'text-zinc-900', dot: 'bg-[#e0c9a6]' },
          { name: 'Filter coffee', meta: 'Food', amount: '−₹180', tone: 'text-zinc-900', dot: 'bg-[#c9b8de]' }
        ].map((row) => (
          <div key={row.name} className="flex items-center gap-2.5">
            <span className={`h-6 w-6 shrink-0 rounded-full ${row.dot}`} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-medium">{row.name}</span>
              <span className="block text-[8px] text-zinc-400">{row.meta}</span>
            </span>
            <span className={`text-[11px] font-medium tabular-nums ${row.tone}`}>{row.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickAddScreen() {
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-9 text-zinc-900">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold tracking-[-0.01em]">Add transaction</p>
        <span className="text-[13px] text-zinc-300">×</span>
      </div>

      <div className="mt-5 rounded-2xl bg-[#f2efe8] px-3 py-3 text-center">
        <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-400">Expense</p>
        <p className="mt-1 text-[30px] font-semibold tracking-[-0.04em]">₹450</p>
      </div>

      <div className="mt-3 flex gap-1.5">
        <span className="rounded-full bg-[#e8f3fb] px-2.5 py-1 text-[9px] font-medium text-[#2a6f9c]">Food</span>
        <span className="rounded-full bg-[#f2efe8] px-2.5 py-1 text-[9px] font-medium text-zinc-500">UPI · HDFC</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 text-center text-[12px] font-medium text-zinc-700">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((key) => (
          <span key={key} className="grid h-8 place-items-center rounded-lg bg-[#f7f5f0]">
            {key}
          </span>
        ))}
      </div>

      <div className="mt-auto grid h-9 place-items-center rounded-full bg-[#17161a] text-[11px] font-medium text-white">
        Save transaction
      </div>
    </div>
  );
}

const BUDGETS = [
  { label: 'Food', spent: '₹7,200', of: '₹10,000', fill: 72, color: '#4f9bd1' },
  { label: 'Lifestyle', spent: '₹4,800', of: '₹10,000', fill: 48, color: '#9cc8ae' },
  { label: 'Transport', spent: '₹1,550', of: '₹5,000', fill: 31, color: '#d8b48a' }
];

function BudgetsScreen() {
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-9 text-zinc-900">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold tracking-[-0.01em]">Budgets</p>
        <span className="text-[9px] text-zinc-400">September</span>
      </div>

      <div className="mt-4 rounded-2xl bg-[#f2efe8] px-3 py-3">
        <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-400">Left to spend</p>
        <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">₹11,450</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e3ded2]">
          <span className="block h-full w-[68%] rounded-full bg-[#4f9bd1]" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {BUDGETS.map((budget) => (
          <div key={budget.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium">{budget.label}</span>
              <span className="text-[9px] text-zinc-400">
                {budget.spent} <span className="text-zinc-300">/ {budget.of}</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#efece4]">
              <span
                className="block h-full rounded-full"
                style={{ width: `${budget.fill}%`, backgroundColor: budget.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-xl border border-dashed border-zinc-200 px-3 py-2 text-center text-[9px] text-zinc-400">
        + New budget
      </div>
    </div>
  );
}

function InsightsScreen() {
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-9 text-zinc-900">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold tracking-[-0.01em]">Insights</p>
        <span className="text-[9px] text-zinc-400">September</span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div
          className="relative grid h-[92px] w-[92px] shrink-0 place-items-center rounded-full"
          style={{
            background:
              'conic-gradient(#4f9bd1 0% 34%, #9cc8ae 34% 62%, #d8b48a 62% 78%, #e4e1d8 78% 100%)'
          }}
        >
          <span className="grid h-[62px] w-[62px] place-items-center rounded-full bg-[#fbfaf7] text-center">
            <span>
              <span className="block text-[13px] font-semibold tracking-[-0.02em]">₹42.8k</span>
              <span className="block text-[7px] uppercase tracking-[0.14em] text-zinc-400">spent</span>
            </span>
          </span>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Food', value: '34%', dot: 'bg-[#4f9bd1]' },
            { label: 'Home', value: '28%', dot: 'bg-[#9cc8ae]' },
            { label: 'Travel', value: '16%', dot: 'bg-[#d8b48a]' }
          ].map((entry) => (
            <div key={entry.label} className="flex items-center gap-2 text-[9px]">
              <span className={`h-1.5 w-1.5 rounded-full ${entry.dot}`} />
              <span className="w-9 text-zinc-500">{entry.label}</span>
              <span className="font-medium tabular-nums">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-400">Last 7 days</p>
        <div className="flex h-[84px] items-end gap-1.5">
          {[42, 58, 49, 71, 63, 88, 76].map((height, index) => (
            <span
              key={index}
              className={`flex-1 rounded-t-[4px] ${height === 88 ? 'bg-[#4f9bd1]' : 'bg-[#dfe9f0]'}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between rounded-xl bg-[#eaf2ea] px-3 py-2">
        <span className="text-[9px] text-zinc-500">Saved this month</span>
        <span className="text-[11px] font-semibold text-[#1f7a4d]">₹18.2k</span>
      </div>
    </div>
  );
}

function Beat({ index, children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.22, 0.78, 1], [64, 0, 0, -64]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center justify-center px-6">
      <motion.div
        style={reduce ? undefined : { opacity, y }}
        className="max-w-4xl text-center will-change-transform"
      >
        <span className="lp-eyebrow">0{index + 1}</span>
        <p className="lp-ink mt-6 text-balance text-[clamp(2.2rem,6.4vw,4.8rem)] font-medium leading-[1.06] tracking-[-0.035em]">
          {children}
        </p>
      </motion.div>
    </section>
  );
}

function RevealScene() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.14, 0.6, 1], [0, 1, 1, 0.12]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const phoneY = useTransform(scrollYProgress, [0.15, 0.9], ['62vh', '0vh']);
  const phoneOpacity = useTransform(scrollYProgress, [0.12, 0.32], [0, 1]);
  const phoneScale = useTransform(scrollYProgress, [0.15, 0.9], [0.94, 1]);

  return (
    <section ref={ref} className="relative h-[210vh]">
      <div className="sticky top-0 flex h-[100svh] items-start justify-center overflow-hidden px-6 pt-[17vh]">
        <div className="lp-glow bottom-[-16%] left-1/2 h-[560px] w-[560px] -translate-x-1/2 opacity-80" />
        <motion.div
          style={reduce ? undefined : { opacity: titleOpacity, y: titleY }}
          className="relative z-10 text-center will-change-transform"
        >
          <p className="lp-eyebrow">Everything, in one place</p>
          <p className="lp-ink mt-4 text-[clamp(3.4rem,13vw,7.5rem)] font-semibold leading-none tracking-[-0.05em]">
            R2R
          </p>
          <p className="lp-soft mx-auto mt-4 max-w-xs text-sm leading-relaxed">
            The ledger that keeps itself. Every balance, category and trend, quietly current.
          </p>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <motion.div
            style={reduce ? undefined : { y: phoneY, opacity: phoneOpacity, scale: phoneScale }}
            className="translate-y-0 will-change-transform"
          >
            <PhoneMock>
              <DashboardScreen />
            </PhoneMock>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    title: 'Quick add',
    copy: 'Amount, category, account. Three taps and the rest of the screen closes behind you.',
    screen: <QuickAddScreen />
  },
  {
    title: 'Budgets',
    copy: 'Set a ceiling per category and watch it fill. No surprises at the end of the month.',
    screen: <BudgetsScreen />
  },
  {
    title: 'Charts',
    copy: 'Where the month actually went, in one glance. Trends and splits, without a spreadsheet.',
    screen: <InsightsScreen />
  }
];

function PinnedFeatures() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 1 / 3 ? 0 : value < 2 / 3 ? 1 : 2;
    setActive((current) => (current === next ? current : next));
  });

  const fade = { duration: reduce ? 0 : 0.5, ease: EASE };

  return (
    <section ref={ref} className="relative h-[280vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-5 sm:px-8">
        <div className="lp-glow left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-7 md:grid md:grid-cols-2 md:items-center md:gap-16">
          <div className="flex justify-center">
            <PhoneMock compact>
              <div className="lp-screen-fade">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                    className="absolute inset-0"
                  >
                    {FEATURES[active].screen}
                  </motion.div>
                </AnimatePresence>
              </div>
            </PhoneMock>
          </div>

          <div className="relative w-full max-w-sm text-center md:text-left">
            <div className="relative min-h-[150px] md:min-h-[210px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -14 }}
                  transition={fade}
                  className="absolute inset-x-0 top-0"
                >
                  <p className="lp-eyebrow">0{active + 1}</p>
                  <h3 className="lp-ink mt-3 text-[clamp(1.9rem,4.4vw,3rem)] font-semibold leading-none tracking-[-0.035em]">
                    {FEATURES[active].title}
                  </h3>
                  <p className="lp-soft mx-auto mt-4 max-w-xs text-sm leading-relaxed md:mx-0">
                    {FEATURES[active].copy}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 md:justify-start" aria-hidden="true">
              {FEATURES.map((feature, index) => (
                <span
                  key={feature.title}
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: index === active ? 26 : 8,
                    backgroundColor: index === active ? 'var(--lp-ink)' : 'var(--lp-line)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const AMOUNT = '+₹450';

function SaveMoment() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setCount(AMOUNT.length);
      setSaved(true);
      return undefined;
    }
    let index = 0;
    const typing = setInterval(() => {
      index += 1;
      setCount(index);
      if (index >= AMOUNT.length) clearInterval(typing);
    }, 120);
    const settle = setTimeout(() => setSaved(true), AMOUNT.length * 120 + 450);
    return () => {
      clearInterval(typing);
      clearTimeout(settle);
    };
  }, [inView, reduce]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="lp-eyebrow">Quick add</p>

        <div className="lp-surface lp-border mt-8 rounded-[28px] px-6 py-7 shadow-[0_30px_60px_-40px_rgba(23,22,26,0.45)]">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em]">
            <span className="lp-faint">Expense</span>
            <span className="lp-faint">Food · UPI</span>
          </div>

          <p className="lp-ink mt-4 text-[clamp(2.8rem,9vw,4.2rem)] font-semibold leading-none tracking-[-0.045em] tabular-nums">
            {AMOUNT.slice(0, count)}
            {count < AMOUNT.length && !reduce && (
              <span className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.08em] animate-pulse bg-current align-middle" />
            )}
          </p>

          <div className="mt-6 flex min-h-[30px] items-center justify-between">
            <AnimatePresence>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f2ea] px-3 py-1.5 text-[11px] font-medium text-[#1f7a4d] dark:bg-emerald-500/15 dark:text-emerald-300"
                >
                  <Check className="h-3 w-3" strokeWidth={2.6} />
                  Saved.
                </motion.span>
              )}
            </AnimatePresence>
            <span className="lp-faint text-[10px] uppercase tracking-[0.18em]">R2R</span>
          </div>
        </div>

        <AnimatePresence>
          {saved && (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.7, ease: EASE, delay: reduce ? 0 : 0.15 }}
              className="lp-ink mt-9 text-[clamp(1.7rem,4.4vw,2.6rem)] font-medium tracking-[-0.035em]"
            >
              Ten seconds. Done.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Rise({ children, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.28], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.28], [36, 0]);

  return (
    <motion.div ref={ref} style={reduce ? undefined : { opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const reduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const lenisRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const lenis = new Lenis({ autoRaf: true, duration: 1.05, smoothWheel: true });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (selector) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(selector, { offset: -56 });
      return;
    }
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <div className="landing min-h-[100svh] overflow-x-clip">
      <header className="lp-header fixed inset-x-0 top-0 z-50" data-scrolled={scrolled ? '' : undefined}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Brand size={26} />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeSwitch />
            <Link to="/login" className="lp-link hidden text-[13px] font-medium sm:inline-flex">
              Sign in
            </Link>
            <Link to="/register" className="lp-btn h-9 px-4 text-[13px]">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pb-28 pt-24 text-center">
          <motion.p {...rise(0)} className="lp-eyebrow">
            Personal finance, quietly kept
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            className="lp-ink mt-6 max-w-5xl text-balance text-[clamp(3.2rem,11vw,8.5rem)] font-semibold leading-[0.94] tracking-[-0.05em]"
          >
            Know where it went.
          </motion.h1>

          <motion.p
            {...rise(0.18)}
            className="lp-soft mt-7 max-w-xl text-pretty text-base leading-relaxed sm:text-lg"
          >
            A private ledger for the money you spend, save and move. Log it in seconds; R2R keeps the
            balances, categories and charts in order.
          </motion.p>

          <motion.div {...rise(0.26)} className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link to="/register" className="lp-btn h-12 px-6">
              Start your ledger
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="lp-btn h-12 border border-[color:var(--lp-line)] bg-transparent px-6 text-[color:var(--lp-ink)] backdrop-blur">
              I already have an account
            </Link>
          </motion.div>

          <button
            type="button"
            onClick={() => scrollTo('#beats')}
            className="lp-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <span className="lp-eyebrow">Scroll</span>
            <motion.span
              animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="lp-border grid h-9 w-9 place-items-center rounded-full"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </motion.span>
          </button>
        </section>

        <div id="beats">
          <Beat index={0}>You don&apos;t know where it goes.</Beat>
          <Beat index={1}>Every month. Same story.</Beat>
          <Beat index={2}>Not anymore.</Beat>
        </div>

        <RevealScene />

        <PinnedFeatures />

        <SaveMoment />

        <section className="relative px-5 pb-28 pt-10 sm:px-8">
          <Rise className="mx-auto max-w-6xl">
            <p className="lp-eyebrow">The whole picture</p>
            <h2 className="lp-ink mt-4 max-w-3xl text-balance text-[clamp(2rem,4.8vw,3.8rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
              A personal finance tracker that stays out of your way.
            </h2>
            <p className="lp-soft mt-5 max-w-2xl text-base leading-relaxed">
              No spreadsheets to keep tidy. Add what you spent, and R2R quietly keeps every balance,
              category and trend current — behind your PIN.
            </p>

            <div className="mt-12 lg:mt-16">
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
                glowColor={theme === 'dark' ? '#bcd9f0' : '#1A73F2'}
              />
            </div>

            <p className="lp-faint mt-5 text-center text-[11px]">Sample numbers for illustration.</p>
          </Rise>
        </section>

        <section className="relative flex min-h-[100svh] items-center justify-center px-6 pb-24 text-center">
          <div className="lp-glow left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-70" />
          <Rise className="relative z-10 w-full max-w-2xl">
            <p className="lp-eyebrow">R2R</p>
            <h2 className="lp-ink mt-5 text-[clamp(2.8rem,8vw,5.6rem)] font-semibold leading-none tracking-[-0.05em]">
              Start knowing.
            </h2>
            <p className="lp-soft mx-auto mt-5 max-w-md text-base leading-relaxed">
              One ledger, one PIN, and no clutter between you and your money.
            </p>
            <Link to="/login" className="lp-btn mt-9 h-12 px-7">
              Enter
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="lp-faint mt-6 text-xs">
              New here?{' '}
              <Link to="/register" className="lp-link">
                Create an account
              </Link>
            </p>
          </Rise>
        </section>
      </main>
    </div>
  );
}
