import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'default' | 'flat' | 'hoverable';
}
export function Card({
  children,
  className = '',
  variant = 'default',
  ...props
}: CardProps) {
  const baseStyles =
    'bg-white dark:bg-gray-800 rounded-3xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden';
  const variants = {
    default: 'shadow-lg',
    flat: 'shadow-none border-gray-200',
    hoverable:
      'shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer'
  };
  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}>

      {children}
    </motion.div>);

}