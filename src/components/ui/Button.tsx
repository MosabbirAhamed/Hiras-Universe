import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps) => {
  const base = 'rounded-md px-4 py-2 text-sm font-medium min-h-[44px] flex items-center justify-center'
  const styles = variant === 'primary' ? 'bg-mocha text-ivory' : 'bg-transparent border border-taupe text-charcoal'
  return <button className={`${base} ${styles} ${className}`} {...props} />
}

export default Button
