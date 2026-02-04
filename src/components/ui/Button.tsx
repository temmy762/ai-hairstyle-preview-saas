import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--salon-primary,var(--crimson-600))] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-[var(--salon-primary,var(--crimson-600))] text-white hover:bg-[var(--salon-primary-hover,var(--crimson-700))] hover:shadow-lg hover:shadow-[var(--salon-primary,var(--crimson-600))]/20 active:scale-[0.98]",
    secondary: "bg-[var(--mild-white-darker)] text-[var(--salon-text,var(--crimson-900))] hover:bg-[var(--salon-primary-light,var(--crimson-50))]/10 border border-[var(--salon-border,var(--mild-white-border))] hover:border-[var(--salon-primary,var(--crimson-200))]",
    ghost: "text-[var(--salon-primary,var(--crimson-700))] hover:bg-[var(--salon-primary-light,var(--crimson-50))]/10 hover:text-[var(--salon-primary-hover,var(--crimson-800))]",
  };
  
  const sizeStyles = {
    sm: "h-9 px-3 text-sm rounded-xl",
    md: "h-11 px-5 text-sm rounded-xl",
    lg: "h-12 px-6 text-base rounded-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
