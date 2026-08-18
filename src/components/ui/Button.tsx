import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps) => {
  const base = 'flex min-h-[44px] items-center justify-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] disabled:cursor-not-allowed disabled:opacity-60'
  const styles = variant === 'primary'
    ? 'bg-[var(--color-button-background)] text-[var(--color-button-text)] hover:bg-[var(--color-button-hover)]'
    : 'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}

export default Button
