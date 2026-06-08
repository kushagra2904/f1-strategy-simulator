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
          className="w-full cursor-pointer appearance-none border-b-2 border-outline bg-transparent py-2 pr-7 font-mono text-on-surface outline-none transition-colors hover:border-outline-strong focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {children}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
          className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-primary"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}
