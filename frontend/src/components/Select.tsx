import type { ReactNode } from "react";

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}

export function Select({
  label,
  value,
  onChange,
  disabled,
  children,
}: SelectProps) {
  return (
    <label className="block">
      <span className="hud-label">{label}</span>
      <div className="relative mt-1.5">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border-b-2 border-outline bg-transparent py-2 pr-6 text-on-surface outline-none transition-colors focus:border-primary disabled:opacity-50"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant">
          ▾
        </span>
      </div>
    </label>
  );
}
