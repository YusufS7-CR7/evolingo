import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Plus } from 'lucide-react';

interface CoinNotificationProps {
    amount: number;
    isVisible: boolean;
}

export function CoinNotification({ amount, isVisible }: CoinNotificationProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.8, transition: { duration: 0.2 } }}
                    className="fixed top-24 right-6 z-[200] flex items-center gap-3 bg-white px-6 py-4 rounded-3xl shadow-2xl border-4 border-yellow-100 overflow-hidden"
                >
                    {/* Background Shine */}
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/30 to-transparent skew-x-12"
                    />

                    <div className="relative flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-2xl">
                            <Coins className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-yellow-600 uppercase tracking-widest leading-none mb-1">Получено</span>
                            <div className="flex items-center text-2xl font-black text-gray-800 leading-none">
                                <Plus className="w-4 h-4 text-emerald-500 mr-0.5" />
                                {amount}
                            </div>
                        </div>
                    </div>

                    {/* Floating mini coins animation */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 0, opacity: 0 }}
                            animate={{ y: -40, opacity: [0, 1, 0], x: (i - 1) * 20 }}
                            transition={{ delay: 0.1 * i, duration: 0.8 }}
                            className="absolute pointer-events-none"
                        >
                            <Coins className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
