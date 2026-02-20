import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
interface StreakCounterProps {
  days: number;
}
export function StreakCounter({ days }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-100 shadow-sm">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}>

        <Flame className="w-6 h-6 text-coral-500 fill-coral-500" />
      </motion.div>
      <div className="flex flex-col leading-none">
        <span className="text-lg font-extrabold text-coral-500">{days}</span>
        <span className="text-xs font-bold text-gray-400 uppercase">
          Дней подряд
        </span>
      </div>
    </div>);

}