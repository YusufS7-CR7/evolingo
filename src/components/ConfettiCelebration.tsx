import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
interface ConfettiProps {
  trigger: boolean;
}
export function ConfettiCelebration({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<number[]>([]);
  useEffect(() => {
    if (trigger) {
      // Generate 50 particles
      setParticles(
        Array.from(
          {
            length: 50
          },
          (_, i) => i
        )
      );
      // Clear after animation
      const timer = setTimeout(() => setParticles([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);
  if (particles.length === 0) return null;
  const colors = ['#10B981', '#FBBF24', '#F97316', '#3B82F6', '#EC4899'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((i) => {
        const randomX = Math.random() * 100; // Random start position %
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomRotation = Math.random() * 360;
        const randomDelay = Math.random() * 0.2;
        return (
          <motion.div
            key={i}
            initial={{
              y: '100vh',
              x: `${randomX}vw`,
              opacity: 1,
              scale: 0
            }}
            animate={{
              y: '-10vh',
              x: `${randomX + (Math.random() * 20 - 10)}vw`,
              opacity: 0,
              scale: [0, 1, 1, 0],
              rotate: [0, randomRotation, randomRotation * 2]
            }}
            transition={{
              duration: 2 + Math.random(),
              ease: 'easeOut',
              delay: randomDelay
            }}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              backgroundColor: randomColor
            }} />);


      })}
    </div>);

}