import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, Crown, Heart, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { userApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ConfettiCelebration } from './ConfettiCelebration';

interface ProUpgradeModalProps {
  onClose: () => void;
  coins: number;
  isPro?: boolean;
}

export function ProUpgradeModal({ onClose, coins, isPro = false }: ProUpgradeModalProps) {
  const { updateUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [purchased, setPurchased] = React.useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await userApi.upgradePro();
      updateUser({ isPro: true, coins: res.data.coins });
      setPurchased(true);
    } catch (e: any) {
      alert('Ошибка при покупке: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  // Already has Pro
  if (isPro && !purchased) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md"
        >
          <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-10 text-white text-center relative overflow-hidden shadow-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Crown className="w-40 h-40" />
            </div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white/30 backdrop-blur-sm">
                <Crown className="w-12 h-12 text-white fill-white" />
              </div>
              <h2 className="text-3xl font-black mb-3 uppercase tracking-tight">Про Уже Активна!</h2>
              <p className="text-yellow-100 text-lg mb-6 font-medium">
                У вас уже есть PRO версия. Наслаждайтесь всеми преимуществами!
              </p>
              <div className="bg-white/20 rounded-2xl p-4 mb-8 backdrop-blur-sm space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-300 fill-red-300 flex-shrink-0" />
                  <span className="font-bold text-sm">Бесконечные жизни активны</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-200 flex-shrink-0" />
                  <span className="font-bold text-sm">Анализ ИИ доступен</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-white text-amber-600 font-black text-lg py-4 rounded-2xl hover:bg-yellow-50 transition-colors shadow-lg"
              >
                ОТЛИЧНО!
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (purchased) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-emerald-500">
        <ConfettiCelebration trigger={purchased} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-lg text-center text-white"
        >
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-md border-4 border-white/30"
          >
            <Crown className="w-16 h-16 text-yellow-300 fill-yellow-300 shadow-lg" />
          </motion.div>

          <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">Поздравляем с Pro!</h2>
          <p className="text-xl text-emerald-100 mb-12 font-medium">
            Теперь ваш путь к английскому стал ещё эффективнее и круче.
          </p>

          <div className="grid grid-cols-1 gap-4 mb-12 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20"
            >
              <Heart className="w-8 h-8 text-red-300 fill-red-300" />
              <div>
                <p className="font-bold">Бесконечные жизни</p>
                <p className="text-emerald-100 text-sm">Ошибайтесь сколько угодно, обучение не прервётся!</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20"
            >
              <TrendingUp className="w-8 h-8 text-blue-300" />
              <div>
                <p className="font-bold">Анализ уроков ИИ</p>
                <p className="text-emerald-100 text-sm">Персональные разборы ваших ошибок каждые 5 уроков.</p>
              </div>
            </motion.div>
          </div>

          <Button
            variant="outline"
            size="xl"
            fullWidth
            onClick={onClose}
            className="bg-white text-emerald-600 border-none shadow-chunky-white hover:scale-105"
          >
            ПОНЯТНО, ПОЕХАЛИ!
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <Card className="relative overflow-hidden border-0 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/10 rounded-full hover:bg-black/20 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Free Tier */}
            <div className="p-8 bg-gray-50 flex flex-col">
              <h3 className="text-2xl font-extrabold text-gray-400 mb-2">
                Базовый
              </h3>
              <div className="text-4xl font-black text-gray-800 mb-8">
                Бесплатно
              </div>

              <ul className="space-y-4 flex-1">
                <li className="flex items-center gap-3 text-gray-600 font-medium">
                  <Check className="w-5 h-5 text-gray-400" />
                  Ежедневные уроки
                </li>
                <li className="flex items-center gap-3 text-gray-600 font-medium">
                  <Check className="w-5 h-5 text-gray-400" />
                  Базовый ИИ чат
                </li>
                <li className="flex items-center gap-3 text-gray-400 font-medium line-through">
                  <X className="w-5 h-5" />
                  Безлимитные жизни
                </li>
                <li className="flex items-center gap-3 text-gray-400 font-medium line-through">
                  <X className="w-5 h-5" />
                  Анализ успеваемости
                </li>
              </ul>

              <div className="mt-8 text-center text-sm font-bold text-gray-400">
                Текущий план
              </div>
            </div>

            {/* Pro Tier */}
            <div className="p-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crown className="w-32 h-32" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                <h3 className="text-2xl font-extrabold text-white">Pro</h3>
              </div>
              <div className="text-4xl font-black text-white mb-1 flex items-baseline gap-2">
                300{' '}
                <span className="text-lg font-bold text-emerald-100">
                  монет
                </span>
              </div>
              <p className="text-emerald-100 font-medium mb-8 text-sm">
                Единоразовая покупка
              </p>

              <ul className="space-y-4 flex-1 relative z-10">
                <li className="flex items-center gap-3 font-bold">
                  <div className="bg-white/20 p-1 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                  Безлимитные жизни
                </li>
                <li className="flex items-center gap-3 font-bold">
                  <div className="bg-white/20 p-1 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                  Анализ уроков от ИИ
                </li>
              </ul>

              <Button
                variant="yellow"
                fullWidth
                size="lg"
                className="mt-8 shadow-xl"
                onClick={handleUpgrade}
                loading={loading}
                disabled={coins < 300 || loading}
              >
                {coins >= 300 ?
                  'Улучшить сейчас' :
                  `Нужно ещё ${300 - coins} монет`}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}