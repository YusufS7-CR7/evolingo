import React from 'react';
import { motion } from 'framer-motion';
interface ProgressRingProps {
  level: number;
  progress: number; // 0 to 100
  size?: number;
}
export function ProgressRing({
  level,
  progress,
  size = 120
}: ProgressRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress / 100 * circumference;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size
      }}>

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round" />

        {/* Progress Circle */}
        <motion.circle
          stroke="#10B981"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: circumference
          }}
          animate={{
            strokeDashoffset: offset
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
            type: 'spring',
            stiffness: 60
          }} />

      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
          Уровень
        </span>
        <motion.span
          className="text-3xl font-extrabold text-gray-800"
          initial={{
            scale: 0
          }}
          animate={{
            scale: 1
          }}
          transition={{
            delay: 0.5,
            type: 'spring'
          }}>

          {level}
        </motion.span>
      </div>
    </div>);

}