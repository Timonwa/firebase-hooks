'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

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
