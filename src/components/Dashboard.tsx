import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Crown, User as UserIcon, ShieldAlert, Camera, GraduationCap, Sparkles, Star } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { ProgressRing } from './ProgressRing';
import { StreakCounter } from './StreakCounter';
import { CoinBalance } from './CoinBalance';
import { HeartBalance } from './HeartBalance';
import { XPBar } from './XPBar';
import { LearningRoadmap } from './LearningRoadmap';
import { Leaderboard } from './Leaderboard';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CommunityView } from './CommunityView';
import { Shop } from './Shop';
import { HeartShopModal } from './HeartShopModal';
import { AIAnalysisView } from './AIAnalysisView';
import { AIChatFloating } from './AIChatFloating';
import { useAuth } from '../context/AuthContext';
import { Lesson, UserState } from '../App';
import { WordGame } from './WordGame';
import { adminApi, userApi } from '../api/client';
import { getAvatarUrl } from '../api/avatarUrl';
import { BottomNav } from './BottomNav';


const goalLabels: Record<string, string> = {
  ielts: 'Подготовка к IELTS',
  conversational: 'Разговорный',
  work: 'Для работы',
  relocation: 'Переезд',
  school: 'Для учёбы'
};

const ageLabels: Record<string, string> = {
  'under-12': 'До 12',
  '13-17': '13 - 17',
  '18-24': '18 - 24',
  '25-34': '25 - 34',
  '35-44': '35 - 44',
  '45-plus': '45+'
};

interface DashboardProps {
  user: UserState;
  onStartLesson: (lesson: Lesson) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenPro: () => void;
  onCoinsEarned: (amount: number) => void;
  onTeacherLogin: () => void;
}

export function Dashboard({
  user,
  onStartLesson,
  activeTab,
  onTabChange,
  onOpenPro,
  onCoinsEarned,
  onTeacherLogin
}: DashboardProps) {
  const { logout, updateUser } = useAuth();
  const [showHeartShop, setShowHeartShop] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploading(true);
      const res = await userApi.uploadAvatar(formData);
      updateUser({ avatarUrl: res.data.avatarUrl });
    } catch (err: any) {
      console.error('Upload failed', err);
      alert('Ошибка при загрузке аватара: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Expose pro modal trigger for children like AITutor
  React.useEffect(() => {
    (window as any).triggerProModal = onOpenPro;
    return () => { delete (window as any).triggerProModal; };
  }, [onOpenPro]);
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  const currentLevelProgress = user.xp % 100;
  const calculatedLevel = Math.floor(user.xp / 100) + 1;
  return (
    <div className="min-h-screen bg-white md:bg-[#F0FDF4] dark:bg-gray-950 transition-colors duration-300">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} isPro={user.isPro} />

      <main className="md:ml-64 p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
        {activeTab === 'dashboard' &&
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Center Column - Roadmap */}
            <div className="lg:col-span-8 space-y-8">
              {/* Mobile Header Stats */}
              <div className="md:hidden flex justify-between items-center mb-6">
                <StreakCounter days={user.streak} />
                <CoinBalance amount={user.coins} />
              </div>

              {/* Current Lesson Card */}
              <motion.div variants={item}>
                <Card
                  variant="default"
                  className="bg-emerald-500 border-none p-6 text-white relative overflow-hidden">

                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                          {user.level} Путь
                        </span>
                      </div>
                      <h2 className="text-2xl font-extrabold mb-2">
                        Следующий урок
                      </h2>
                      <p className="text-emerald-100 font-medium mb-4">
                        Продолжай свой путь к цели:{' '}
                        {goalLabels[user.goal] || user.goal}
                      </p>
                      <Button
                        variant="outline"
                        className="bg-white text-emerald-500 border-none shadow-none hover:bg-emerald-50"
                        onClick={() => {
                          onTabChange('lessons');
                        }}>

                        <Play className="w-5 h-5 fill-emerald-500 mr-2" />
                        ПРОДОЛЖИТЬ
                      </Button>
                    </div>
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Zap className="w-16 h-16 text-white fill-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Roadmap */}
              <motion.div variants={item}>
                <LearningRoadmap
                  userLevel={user.level}
                  completedLessons={user.completedLessons}
                  progress={user.progress}
                  onLessonSelect={onStartLesson} />
              </motion.div>

              {/* Mobile Only: Extra Stats Stacked Below Roadmap */}
              <div className="lg:hidden space-y-6">
                {/* Pro Banner Mobile */}
                <motion.div variants={item}>
                  {user.isPro ? (
                    <Card className="p-4 bg-gradient-to-r from-amber-400 to-yellow-500 border-none text-white shadow-lg">
                      <div className="flex items-center gap-3">
                        <Crown className="w-8 h-8 text-white fill-white" />
                        <div className="text-left">
                          <p className="font-black text-lg leading-none">PRO Активен</p>
                          <p className="text-yellow-100 text-xs font-bold">Бесконечные жизни + AI анализ</p>
                        </div>
                        <Sparkles className="w-5 h-5 text-white/80 ml-auto" />
                      </div>
                    </Card>
                  ) : (
                    <button onClick={onOpenPro} className="w-full">
                      <Card className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Crown className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                            <div className="text-left">
                              <p className="font-black text-lg leading-none">СТАТЬ PRO</p>
                              <p className="text-indigo-100 text-xs font-bold">Бесконечные жизни + AI</p>
                            </div>
                          </div>
                          <span className="bg-white/20 px-3 py-1 rounded-lg font-bold text-sm">Подробнее</span>
                        </div>
                      </Card>
                    </button>
                  )}
                </motion.div>

                {/* Level Progress Mobile */}
                <motion.div variants={item}>
                  <Card className="p-6 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 self-start">
                      Текущий уровень
                    </h3>
                    <ProgressRing
                      level={calculatedLevel}
                      progress={currentLevelProgress}
                      size={120} />

                    <div className="mt-6 w-full">
                      <XPBar current={user.xp} max={calculatedLevel * 100} />
                    </div>
                  </Card>
                </motion.div>

                {/* Leaderboard Mobile */}
                <motion.div variants={item}>
                  <Leaderboard user={user} />
                </motion.div>
              </div>

            </div>

            {/* Right Column - Stats & Widgets */}
            <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 sticky top-8 h-fit">
              {/* User Stats Row */}
              <motion.div
                variants={item}
                className="flex items-center justify-between gap-2">

                <StreakCounter days={user.streak} />
                <div className="flex gap-2">
                  <HeartBalance hearts={user.hearts} onClick={() => setShowHeartShop(true)} />
                  <CoinBalance amount={user.coins} />
                </div>
              </motion.div>

              {/* Pro Banner */}
              <motion.div variants={item}>
                {user.isPro ? (
                  <Card className="p-4 bg-gradient-to-r from-amber-400 to-yellow-500 border-none text-white shadow-lg">
                    <div className="flex items-center gap-3">
                      <Crown className="w-8 h-8 text-white fill-white" />
                      <div className="text-left">
                        <p className="font-black text-lg leading-none">PRO Активен</p>
                        <p className="text-yellow-100 text-xs font-bold">Бесконечные жизни + AI анализ</p>
                      </div>
                      <Sparkles className="w-5 h-5 text-white/80 ml-auto" />
                    </div>
                  </Card>
                ) : (
                  <button onClick={onOpenPro} className="w-full">
                    <Card className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-white hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Crown className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                          <div className="text-left">
                            <p className="font-black text-lg leading-none">СТАТЬ PRO</p>
                            <p className="text-indigo-100 text-xs font-bold">Бесконечные жизни + AI</p>
                          </div>
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-lg font-bold text-sm">Подробнее</span>
                      </div>
                    </Card>
                  </button>
                )}
              </motion.div>

              {/* Level Progress */}
              <motion.div variants={item}>
                <Card className="p-6 flex flex-col items-center">
                  <h3 className="text-lg font-bold text-gray-700 mb-4 self-start">
                    Текущий уровень
                  </h3>
                  <ProgressRing
                    level={calculatedLevel}
                    progress={currentLevelProgress}
                    size={140} />

                  <div className="mt-6 w-full">
                    <XPBar current={user.xp} max={calculatedLevel * 100} />
                  </div>
                </Card>
              </motion.div>

              {/* Leaderboard */}
              <motion.div variants={item}>
                <Leaderboard user={user} />
              </motion.div>
            </div>
          </motion.div>
        }

        {activeTab === 'shop' && (
          <div className="p-4 md:p-8 pb-24">
            <Shop />
          </div>
        )}

        {activeTab === 'community' && <CommunityView user={user} />}

        {activeTab === 'ai-tutor' && <AIAnalysisView />}

        {activeTab === 'lessons' &&
          <WordGame onCoinsEarned={onCoinsEarned} userLevel={user.level} />
        }

        {activeTab === 'profile' &&
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 flex flex-col items-center text-center">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div
                className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-6 relative group cursor-pointer overflow-hidden border-4 border-white shadow-lg"
                onClick={handleAvatarClick}
              >
                {user.avatarUrl ? (
                  <img
                    src={getAvatarUrl(user.avatarUrl) || ''}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-emerald-600" />
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>

                {uploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">
                {user.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>

              {/* Pro Status Badge */}
              {user.isPro ? (
                <div className="w-full mb-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 p-3 opacity-15">
                    <Crown className="w-20 h-20" />
                  </div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 flex-shrink-0">
                      <Crown className="w-7 h-7 text-white fill-white" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-xl leading-none">PRO Версия активна</p>
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                      <p className="text-yellow-100 text-sm font-medium">Бесконечные жизни и Анализ ИИ открыты</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={onOpenPro} className="w-full mb-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Crown className="w-7 h-7 text-yellow-300 fill-yellow-300" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-lg leading-none">Стать PRO</p>
                        <p className="text-indigo-100 text-sm font-medium">Разблокируй бесконечные жизни + AI</p>
                      </div>
                    </div>
                  </div>
                </button>
              )}

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <div className="text-xs font-bold text-gray-400 uppercase">
                    Уровень
                  </div>
                  <div className="text-xl font-black text-gray-800 dark:text-white">
                    {user.level}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <div className="text-xs font-bold text-gray-400 uppercase">
                    Цель
                  </div>
                  <div className="text-xl font-black text-gray-800 dark:text-white">
                    {goalLabels[user.goal] || user.goal}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <div className="text-xs font-bold text-gray-400 uppercase">
                    Возраст
                  </div>
                  <div className="text-xl font-black text-gray-800 dark:text-white">
                    {ageLabels[user.age] || user.age}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <div className="text-xs font-bold text-gray-400 uppercase">
                    XP
                  </div>
                  <div className="text-xl font-black text-gray-800 dark:text-white">
                    {user.xp}
                  </div>
                </div>
              </div>

              <Button
                variant="danger"
                className="w-full mt-8"
                onClick={logout}
              >
                Выйти из аккаунта
              </Button>

              <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-100 w-full">
                <p className="text-xs font-black text-gray-300 uppercase mb-4 tracking-widest">Администрирование</p>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={async () => {
                    const pass = prompt('Введите пароль администратора:');
                    if (pass) {
                      try {
                        await adminApi.verify(pass);
                        localStorage.setItem('adminPassword', pass);
                        (window as any).triggerAdminView();
                      } catch (err: any) {
                        const errMsg = err.response?.data?.error || err.message || 'Unknown error';
                        alert(`Ошибка: ${errMsg}`);
                      }
                    }
                  }}
                  className="border-gray-200 text-gray-400 hover:text-emerald-500 hover:border-emerald-200"
                >
                  <ShieldAlert className="w-4 h-4 mr-2" /> ВОЙТИ КАК АДМИН
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={async () => {
                    const pass = prompt('Введите пароль учителя:');
                    if (pass) {
                      try {
                        await adminApi.verify(pass);
                        localStorage.setItem('adminPassword', pass);
                        onTeacherLogin();
                      } catch (err: any) {
                        const errMsg = err.response?.data?.error || err.message || 'Unknown error';
                        alert(`Ошибка: ${errMsg}`);
                      }
                    }
                  }}
                  className="border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 mt-4"
                >
                  <GraduationCap className="w-4 h-4 mr-2" /> ВОЙТИ КАК УЧИТЕЛЬ
                </Button>
              </div>
            </Card>
          </div>
        }
      </main >

      <AnimatePresence>
        {showHeartShop && (
          <HeartShopModal onClose={() => setShowHeartShop(false)} coins={user.coins} />
        )}
      </AnimatePresence>
      <AIChatFloating />
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div >);
}