'use client';

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';

export function Field({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted text-xs">{label}</span>
      <input
        {...props}
        className="border-line bg-bg focus:border-accent rounded-md border px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-accent mt-0.5"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-fg">{label}</span>
        {hint ? <span className="text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Select({
  label,
  hint,
  options,
  ...props
}: {
  label: ReactNode;
  hint?: ReactNode;
  options: { label: string; value: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-fg">{label}</span>
      <select
        {...props}
        className="border-line bg-bg focus:border-accent rounded-md border px-2 py-1.5 text-xs outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-muted">{hint}</span> : null}
    </label>
  );
}

export function Button({
  variant = 'primary',
  ...props
}: {
  variant?: 'primary' | 'secondary' | 'danger';
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: 'bg-accent text-accent-fg hover:opacity-90',
    secondary: 'border border-line hover:bg-surface',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  }[variant];

  return (
    <button
      type="button"
      {...props}
      className={`w-fit rounded-md px-3 py-2 text-sm font-medium transition-opacity disabled:opacity-50 ${styles}`}
    />
  );
}
