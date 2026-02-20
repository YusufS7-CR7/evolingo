import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?:
  'primary' |
  'secondary' |
  'outline' |
  'danger' |
  'ghost' |
  'yellow' |
  'coral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  fullWidth = false,
  loading = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-bold rounded-2xl transition-all active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-2 uppercase tracking-wide';
  const variants = {
    primary:
      'bg-emerald-500 text-white shadow-chunky-green hover:bg-emerald-400',
    secondary: 'bg-blue-500 text-white shadow-chunky-blue hover:bg-blue-400',
    yellow: 'bg-yellow-400 text-white shadow-chunky-yellow hover:bg-yellow-300',
    coral: 'bg-coral-500 text-white shadow-chunky-coral hover:bg-coral-400',
    outline:
      'bg-white text-gray-500 border-2 border-gray-200 shadow-chunky-gray hover:bg-gray-50 hover:border-gray-300',
    danger: 'bg-red-500 text-white shadow-[0_6px_0_0_#B91C1C] hover:bg-red-400',
    ghost:
      'bg-transparent text-emerald-500 hover:bg-emerald-50 shadow-none active:translate-y-0'
  };
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };
  return (
    <motion.button
      whileTap={{
        scale: 0.95
      }}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}>

      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>);

}