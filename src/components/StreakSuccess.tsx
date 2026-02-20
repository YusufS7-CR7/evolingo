import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Check, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { ConfettiCelebration } from './ConfettiCelebration';

interface StreakSuccessProps {
    days: number;
    onClose: () => void;
}

export function StreakSuccess({ days, onClose }: StreakSuccessProps) {
    // Determine correct localized string for "days"
    const getDayDeclension = (num: number) => {
        const lastDigit = num % 10;
        const lastTwoDigits = num % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return 'дней';
        }
        if (lastDigit === 1) {
            return 'день';
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'дня';
        }
        return 'дней';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
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
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-orange-100/50 to-transparent pointer-events-none" />

                <div className="p-8 relative z-10 flex flex-col items-center">

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6 shadow-orange-200 shadow-xl"
                    >
                        <Flame className="w-20 h-20 text-orange-500 fill-orange-500 animate-pulse" />
                    </motion.div>

                    <h2 className="text-3xl font-black text-gray-800 mb-2">
                        Стрик продлен!
                    </h2>

                    <p className="text-gray-500 text-lg mb-8">
                        Ты занимаешься английским
                    </p>

                    <div className="flex items-baseline justify-center gap-2 mb-8">
                        <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                            {days}
                        </span>
                        <span className="text-2xl font-bold text-gray-400">
                            {getDayDeclension(days)}
                        </span>
                    </div>

                    <div className="w-full bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8 flex items-center justify-center gap-3">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        <span className="font-bold text-orange-700">Отличный темп!</span>
                    </div>

                    <Button
                        size="xl"
                        fullWidth
                        onClick={onClose}
                        className="group"
                    >
                        <Check className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                        Продолжить
                    </Button>

                </div>
            </motion.div>
        </motion.div>
    );
}
