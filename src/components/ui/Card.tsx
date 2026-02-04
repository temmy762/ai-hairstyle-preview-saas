import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-2xl border border-[var(--salon-border,var(--mild-white-border))] bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:shadow-[var(--salon-primary,var(--crimson-600))]/5 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

type CardHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

type CardTitleProps = {
  children: ReactNode;
  className?: string;
};

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return <h3 className={`text-lg font-semibold text-[var(--salon-text,var(--crimson-900))] ${className}`}>{children}</h3>;
}

type CardDescriptionProps = {
  children: ReactNode;
  className?: string;
};

export function CardDescription({ children, className = "" }: CardDescriptionProps) {
  return <p className={`text-sm text-stone-600 ${className}`}>{children}</p>;
}

type CardContentProps = {
  children: ReactNode;
  className?: string;
};

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}
