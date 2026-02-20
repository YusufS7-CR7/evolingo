import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Sparkles } from 'lucide-react';
interface CoinBalanceProps {
  amount: number;
}
export function CoinBalance({ amount }: CoinBalanceProps) {
  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-100 shadow-sm relative overflow-hidden">
      <div className="relative">
        <Coins className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5
          }}>

          <Sparkles className="w-3 h-3 text-yellow-400" />
        </motion.div>
      </div>
      <span className="text-lg font-extrabold text-yellow-500">{amount}</span>
    </div>);

}