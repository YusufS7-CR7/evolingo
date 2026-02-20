import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Coins, ShoppingBag } from 'lucide-react';
import { Button } from './ui/Button';
import { userApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface HeartShopModalProps {
    onClose: () => void;
    coins: number;
}

export function HeartShopModal({ onClose, coins }: HeartShopModalProps) {
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleBuy = async () => {
        if (coins < 50) return;
        setLoading(true);
        try {
            const res = await userApi.buyHeart();
            updateUser({
                coins: res.data.coins,
                hearts: res.data.hearts
            });
            onClose();
        } catch (e) {
            alert('Failed to buy heart');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-gray-100 p-8"
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-emerald-500" />
                        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Магазин жизней</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-6 py-4">
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-lg" />
                        </motion.div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-white">
                            +1
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-500 font-bold mb-2 uppercase text-xs tracking-widest">Стоимость</p>
                        <div className="flex items-center justify-center gap-2 text-3xl font-black text-yellow-500">
                            <Coins className="w-8 h-8 fill-yellow-500" />
                            50
                        </div>
                    </div>

                    <div className="w-full space-y-4 pt-4">
                        <Button
                            fullWidth
                            size="xl"
                            onClick={handleBuy}
                            disabled={coins < 50 || loading}
                            className={coins < 50 ? 'opacity-50 grayscale' : ''}
                        >
                            {loading ? 'Покупка...' : coins < 50 ? 'Недостаточно монет' : 'Купить жизнь'}
                        </Button>
                        <p className="text-center text-xs font-bold text-gray-400">
                            У вас в наличии: {coins} монет
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
