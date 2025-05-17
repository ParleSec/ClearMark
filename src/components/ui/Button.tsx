import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fluid?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fluid = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';
  
  const variants = {
    primary: 'bg-flow-600 text-white hover:bg-flow-700 active:bg-flow-800 shadow-sm hover:shadow',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400 dark:bg-slate-700 dark:text-slate-50 dark:hover:bg-slate-600',
    ghost: 'bg-transparent hover:bg-flow-50 text-flow-700 dark:hover:bg-slate-800 dark:text-flow-300',
    outline: 'border border-flow-300 dark:border-slate-600 text-flow-700 dark:text-flow-300 hover:bg-flow-50 dark:hover:bg-slate-800',
  };
  
  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  const fluidStyles = fluid ? 'rounded-fluid bg-gradient-to-r from-flow-500 to-flow-600 hover:from-flow-600 hover:to-flow-700 active:from-flow-700 active:to-flow-800 hover:shadow-flow transition-all duration-300' : '';
  
  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fluid && variant === 'primary' ? fluidStyles : '',
        className
      )}
      {...props}
    >
      {children}
      <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out pointer-events-none opacity-0 group-hover:opacity-20 bg-white" />
    </button>
  );
}; 