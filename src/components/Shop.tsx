import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Snowflake, Wrench, ShieldCheck, ShoppingBag, Crown, Sparkles } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { userApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ConfettiCelebration } from './ConfettiCelebration';



export function Shop() {
    const { user, updateUser } = useAuth();
    const [buying, setBuying] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const items = [
        {
            id: 'heart',
            name: 'Восстановить жизнь',
            description: 'Восстанови одну жизнь, чтобы продолжить урок.',
            price: 50,
            icon: Heart,
            color: 'text-red-500',
            bgColor: 'bg-red-100',
            current: user?.hearts,
            max: 5,
            disabled: (user?.hearts || 0) >= 5
        },
        {
            id: 'freeze',
            name: 'Заморозка стрикa',
            description: 'Спасает 1 день пропуска. Максимум 2 в запасе.',
            price: 70,
            icon: Snowflake,
            color: 'text-blue-500',
            bgColor: 'bg-blue-100',
            current: user?.streakFreezes || 0,
            max: 2,
            disabled: (user?.streakFreezes || 0) >= 2
        },
        {
            id: 'repair',
            name: 'Ремонт стрикa',
            description: 'Восстанови потерянный стрик. Доступно 7 дней после потери.',
            price: 150,
            icon: Wrench,
            color: 'text-orange-500',
            bgColor: 'bg-orange-100',
            current: null,
            max: null,
            disabled: !canRepair()
        }
    ];

    function canRepair() {
        if (!user?.lastStreakLostAt) return false;

        const lastLost = new Date(user.lastStreakLostAt);
        const now = new Date();
        const diffDays = (now.getTime() - lastLost.getTime()) / (1000 * 3600 * 24);

        if (diffDays > 7) return false;

        if (user.lastRepairUsedAt) {
            const lastRepair = new Date(user.lastRepairUsedAt);
            const repairDiff = (now.getTime() - lastRepair.getTime()) / (1000 * 3600 * 24);
            if (repairDiff < 14) return false;
        }

        return true;
    }

    const handleBuy = async (itemId: string, price: number) => {
        if ((user?.coins || 0) < price) {
            alert('Недостаточно монет!');
            return;
        }

        setBuying(itemId);
        try {
            const res = await userApi.buyItem(itemId);
            updateUser(res.data);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } catch (e: any) {
            alert(e.response?.data?.error || 'Ошибка при покупке');
        } finally {
            setBuying(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <ConfettiCelebration trigger={showConfetti} />

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Магазин</h1>
                    <p className="text-gray-500 font-medium">Трать монеты на полезные бонусы</p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-2xl">
                    <ShoppingBag className="w-6 h-6 text-yellow-600" />
                    <span className="text-xl font-black text-yellow-600">{user?.coins}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="h-full"
                    >
                        <Card className="h-full flex flex-col p-6 border-b-4 border-gray-200">
                            <div className={`w-16 h-16 ${item.bgColor} rounded-2xl flex items-center justify-center mb-6 self-center`}>
                                <item.icon className={`w-8 h-8 ${item.color}`} fill="currentColor" fillOpacity={0.2} />
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{item.name}</h3>
                            <p className="text-gray-500 text-sm font-medium text-center mb-6 flex-1">
                                {item.description}
                            </p>

                            <div className="mt-auto">
                                {item.current !== undefined && item.current !== null && (
                                    <div className="text-center mb-4 text-xs font-bold uppercase text-gray-400 tracking-wider">
                                        В наличии: <span className="text-gray-800 text-sm ml-1">{item.current} {item.max ? `/ ${item.max}` : ''}</span>
                                    </div>
                                )}

                                <Button
                                    fullWidth
                                    size="lg"
                                    disabled={item.disabled || buying === item.id || (user?.coins || 0) < item.price}
                                    onClick={() => handleBuy(item.id, item.price)}
                                    className={item.disabled ? 'grayscale opacity-50' : ''}
                                >
                                    {buying === item.id ? (
                                        'Покупка...'
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-yellow-200 uppercase text-sm">
                                                {item.price}
                                            </span>
                                            <div className="w-4 h-4 rounded-full bg-yellow-400 border border-yellow-600" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {/* Pro Banner in Shop */}
                <div className="md:col-span-2 lg:col-span-3 mt-8">
                    {user?.isPro ? (
                        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <Crown className="w-40 h-40" />
                            </div>
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <Crown className="w-8 h-8 text-white fill-white" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight">PRO Версия Активна</h2>
                                    <Sparkles className="w-6 h-6 text-white/80" />
                                </div>
                                <p className="text-yellow-100 font-medium text-lg">
                                    У вас уже активирована PRO версия! Наслаждайтесь бесконечными жизнями и Анализом ИИ.
                                </p>
                            </div>
                            <div className="relative z-10 w-48 h-48 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                                <span className="text-6xl">👑</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="absolute inset-0 pattern-grid-lg opacity-10" />
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <ShieldCheck className="w-8 h-8 text-yellow-300" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Стань Pro</h2>
                                </div>
                                <p className="text-indigo-100 font-medium text-lg mb-6">
                                    Получи бесконечные жизни и поддержи развитие платформы!
                                </p>
                                <Button variant="secondary" onClick={() => (window as any).triggerProModal?.()}>
                                    ПОПРОБОВАТЬ
                                </Button>
                            </div>
                            <div className="relative z-10 w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/20">
                                <span className="text-6xl">🚀</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
