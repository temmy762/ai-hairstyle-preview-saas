import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[var(--salon-text,var(--crimson-900))]">
          {label}
        </label>
      )}
      <input
        className={`w-full h-11 rounded-xl border border-[var(--salon-border,var(--mild-white-border))] bg-white/80 backdrop-blur-sm px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[var(--salon-primary,var(--crimson-600))] focus:outline-none focus:ring-2 focus:ring-[var(--salon-primary,var(--crimson-600))]/20 focus:ring-offset-0 transition-all duration-300 disabled:bg-stone-50 disabled:cursor-not-allowed ${
          error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
