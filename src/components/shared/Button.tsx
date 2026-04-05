import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl cursor-pointer border-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'text-white',
  secondary: 'border',
  ghost: 'bg-transparent',
  danger: 'text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export function Button({ variant = 'primary', size = 'md', className, children, style, ...rest }: Props) {
  const inlineStyle: React.CSSProperties = { ...style };

  if (variant === 'primary') {
    inlineStyle.background = 'var(--primary)';
    inlineStyle.boxShadow = '0 1px 2px rgba(0,0,0,0.15)';
  } else if (variant === 'secondary') {
    inlineStyle.background = 'var(--bg-card)';
    inlineStyle.color = 'var(--text)';
    inlineStyle.borderColor = 'var(--border)';
  } else if (variant === 'ghost') {
    inlineStyle.color = 'var(--text-muted)';
  } else if (variant === 'danger') {
    inlineStyle.background = '#ef4444';
  }

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </button>
  );
}
