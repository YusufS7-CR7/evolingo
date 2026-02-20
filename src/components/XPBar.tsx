import React from 'react';
import { motion } from 'framer-motion';
interface XPBarProps {
  current: number;
  max: number;
}
export function XPBar({ current, max }: XPBarProps) {
  const percentage = Math.min(100, current / max * 100);
  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-between text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
        <span>Прогресс XP</span>
        <span>
          {current} / {max} XP
        </span>
      </div>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
        <motion.div
          className="h-full bg-blue-500 rounded-full relative"
          initial={{
            width: 0
          }}
          animate={{
            width: `${percentage}%`
          }}
          transition={{
            duration: 1,
            ease: 'easeOut',
            delay: 0.2
          }}>

          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
        </motion.div>
      </div>
    </div>);

}