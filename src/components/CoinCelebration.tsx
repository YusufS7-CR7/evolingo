import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Check, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { ConfettiCelebration } from './ConfettiCelebration';

interface CoinCelebrationProps {
    amount: number;
    onClose: () => void;
}

export function CoinCelebration({ amount, onClose }: CoinCelebrationProps) {
    // Determine correct localized string for "coins"
    const getCoinDeclension = (num: number) => {
        const lastDigit = num % 10;
        const lastTwoDigits = num % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'монет';
        }
        if (lastDigit === 1) {
            return 'монета';
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'монеты';
        }
        return 'монет';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <ConfettiCelebration trigger={true} />

            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative text-center"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-yellow-100/50 to-transparent pointer-events-none" />

                <div className="p-8 relative z-10 flex flex-col items-center">

                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: 'spring', duration: 1 }}
                        className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-yellow-200 shadow-xl border-4 border-white"
                    >
                        <Coins className="w-20 h-20 text-white fill-white/20" />
                    </motion.div>

                    <h2 className="text-3xl font-black text-gray-800 mb-2">
                        Поздравляем!
                    </h2>

                    <p className="text-gray-500 text-lg mb-8">
                        Вы заработали
                    </p>

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: 'spring' }}
                        className="flex items-baseline justify-center gap-2 mb-8"
                    >
                        <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600 drop-shadow-sm">
                            +{amount}
                        </span>
                    </motion.div>

                    <div className="w-full bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-8 flex items-center justify-center gap-3">
                        <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-yellow-700">
                            {getCoinDeclension(amount)}
                        </span>
                    </div>

                    <Button
                        size="xl"
                        fullWidth
                        onClick={onClose}
                        className="group bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-600"
                    >
                        <Check className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                        Продолжить
                    </Button>

                </div>
            </motion.div>
        </motion.div>
    );
}
