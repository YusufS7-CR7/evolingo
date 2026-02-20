import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface HeartBalanceProps {
    hearts: number;
    onClick?: () => void;
}

export function HeartBalance({ hearts, onClick }: HeartBalanceProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 shadow-sm transition-all
        ${hearts === 0 ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-red-500'}
      `}
        >
            <div className="relative">
                <Heart className={`w-6 h-6 ${hearts > 0 ? 'fill-red-500' : 'text-red-300'}`} />
                {hearts === 0 && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full"
                    />
                )}
            </div>
            <span className="text-lg font-extrabold">{hearts}</span>
        </motion.button>
    );
}
