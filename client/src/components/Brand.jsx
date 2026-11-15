import FluidOrb from './ui/FluidOrb.jsx';

export default function Brand({ markOnly = false, className = '', size = 30 }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <FluidOrb size={size} aria-hidden="true" className="shrink-0" />
      {!markOnly && (
        <span className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          R2R
        </span>
      )}
    </div>
  );
}
