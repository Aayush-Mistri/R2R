import { Check } from 'lucide-react';
import { CATEGORY_COLORS } from '../../lib/constants.js';

export default function ColorSwatches({ value, onChange, colors = CATEGORY_COLORS }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => {
        const selected = value?.toLowerCase() === color.toLowerCase();
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={`Use color ${color}`}
            aria-pressed={selected}
            className={`grid h-7 w-7 place-items-center rounded-full ring-offset-2 ring-offset-white transition dark:ring-offset-zinc-950 ${
              selected ? 'ring-2 ring-zinc-900 dark:ring-white' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: color }}
          >
            {selected && <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}
