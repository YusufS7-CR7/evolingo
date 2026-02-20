import { useState, useEffect, useRef } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Dashboard } from './components/Dashboard';
import { LessonView } from './components/LessonView';
import { PlacementTest } from './components/PlacementTest';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { courseApi, authApi, userApi } from './api/client';
import { AdminPanel } from './components/AdminPanel';
import { StreakSuccess } from './components/StreakSuccess';
import { TeacherPanel } from './components/TeacherPanel';
import { CoinCelebration } from './components/CoinCelebration';

export type UserState = {
  name: string;
  email: string;
  age: string;
  goal: string;
  level: string;
  xp: number;
  coins: number;
  streak: number;
  streakFreezes?: number;
  streakRepairs?: number;
  hearts: number;
  isPro: boolean;
  avatarUrl?: string;
  completedLessons: string[];
  progress?: { lessonId: string; score: number }[];
};

export interface Lesson {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar';
  content: {
    words: { word: string; translation: string; example: string }[];
    theory: string;
    practice: {
      question: string;
      options: string[];
      correct: string;
    };
  };
}

type View = 'auth' | 'onboarding' | 'placement' | 'dashboard' | 'lesson' | 'admin' | 'teacher';

function AppContent() {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const [currentView, setCurrentView] = useState<View>('auth');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProModal, setShowProModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  // isNewUser was unused
  // notification was unused (CoinNotification is now handled by CoinCelebration)
  const [streakCelebration, setStreakCelebration] = useState<{ visible: boolean; days: number }>({ visible: false, days: 0 });
  const [coinCelebration, setCoinCelebration] = useState<{ visible: boolean; amount: number }>({ visible: false, amount: 0 });

  // Track previous coins to detect increases
  const prevCoinsRef = useRef<number | null>(null);

  // Sync view with auth state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // If user has no goal or age set, they MUST go to onboarding
        const needsOnboarding = !user.goal || !user.age;

        if (currentView === 'auth') {
          // If just logged in
          prevCoinsRef.current = user.coins; // Initialize prevCoins to current to avoid celebration on login
          setCurrentView(needsOnboarding ? 'onboarding' : 'dashboard');
        } else if (needsOnboarding && currentView === 'dashboard') {
          // Force redirect if on dashboard but missing info
          setCurrentView('onboarding');
        }

        // Check for coin increase
        // We only check if prevCoinsRef is NOT null (meaning initialized)
        if (prevCoinsRef.current !== null) {
          const diff = user.coins - prevCoinsRef.current;
          if (diff > 0) {
            setCoinCelebration({ visible: true, amount: diff });
          }
        }
        prevCoinsRef.current = user.coins;

      } else {
        setCurrentView('auth');
        setActiveTab('dashboard'); // Reset tab on logout
        // Reset new user flag removed
        prevCoinsRef.current = null; // Reset prev coins
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const handleOnboardingComplete = async (data: {
    name: string;
    age: string;
    goal: string;
    level: string;
  }) => {
    try {
      await authApi.updateProfile({
        name: data.name,
        age: data.age,
        goal: data.goal,
        level: data.level
      });
      // Update local state
      updateUser(data);
      setCurrentView('dashboard');
    } catch (e: any) {
      console.error('Failed to update profile', e);
      alert('Ошибка при сохранении профиля: ' + (e.response?.data?.error || e.message));
    }
  };

  const [pendingOnboarding, setPendingOnboarding] = useState<any>(null);

  const handleStartPlacement = (partialData: any) => {
    setPendingOnboarding(partialData);
    setCurrentView('placement');
  };

  const handlePlacementComplete = async (level: string) => {
    try {
      // If we came from onboarding, save that info too!
      if (pendingOnboarding) {
        await authApi.updateProfile({
          ...pendingOnboarding,
          level
        });
        updateUser({ ...pendingOnboarding, level });
      } else {
        await courseApi.submitPlacement(level);
        updateUser({ level });
      }
      setCurrentView('dashboard');
      setPendingOnboarding(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (mappedUser.hearts <= 0) {
      alert('У вас не осталось жизней! Купите их в магазине или подождите завтрашнего дня.');
      return;
    }
    setCurrentLesson(lesson);
    setCurrentView('lesson');
  };

  const handleLessonComplete = async (results: {
    xp: number;
    coins: number;
    lessonId: string;
    score?: number; // Added score prop
  }) => {
    try {
      const currentStreak = user?.streak || 0;

      const response = await courseApi.completeLesson({
        lessonId: results.lessonId,
        score: results.score || 0 // Pass actual score
      });

      const { user: serverUser, isLevelComplete } = response.data;

      // Update local state
      updateUser({
        xp: serverUser.xp,
        coins: serverUser.coins,
        completedLessons: serverUser.completedLessons, // Now filtered by >= 80
        progress: serverUser.progress, // Full progress
        level: serverUser.level,
        streak: serverUser.streak
      });

      // Check for streak increment
      if (serverUser.streak > currentStreak) {
        setStreakCelebration({ visible: true, days: serverUser.streak });
      }

      return { isLevelComplete };
    } catch (e) {
      console.error('Failed to complete lesson', e);
      return { isLevelComplete: false };
    }
  };

  const handlePromote = async () => {
    try {
      const res = await userApi.promoteUser();
      const { user: serverUser, bonus } = res.data;

      updateUser({
        level: serverUser.level,
        coins: serverUser.coins
      });

      handleCoinsEarned(bonus);
      setCurrentView('dashboard');
    } catch (e) {
      console.error('Failed to promote user', e);
    }
  };

  const handleCoinsEarned = (amount: number) => {
    // We removed the optimistic update here because the server response 
    // (in handlePromote or handleLessonComplete) already brings back the updated user
    // with the correct coin balance.
    // However, we still want to trigger the celebration!
    setCoinCelebration({ visible: true, amount });
  };

  const handleWrongAnswer = async () => {
    try {
      const res = await userApi.loseHeart();
      updateUser({ hearts: res.data.hearts });
    } catch (e) {
      console.error('Failed to lose heart', e);
    }
  };

  useEffect(() => {
    (window as any).triggerAdminView = () => setCurrentView('admin');
    return () => {
      delete (window as any).triggerAdminView;
    };
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Helper to map AuthContext User to UserState expected by components
  const mappedUser: UserState = user ? {
    name: user.name,
    email: user.email,
    age: user.age || '',
    goal: user.goal || '',
    level: user.level || 'Beginner',
    xp: user.xp || 0,
    coins: user.coins || 0,
    streak: user.streak || 0,
    streakFreezes: user.streakFreezes || 0,
    streakRepairs: user.streakRepairs || 0,
    hearts: user.hearts ?? 5,
    isPro: user.isPro || false,
    avatarUrl: user.avatarUrl,
    completedLessons: user.completedLessons || [],
    progress: user.progress || []
  } : {
    name: '', email: '', age: '', goal: '', level: 'Beginner', xp: 0, coins: 0, streak: 0, hearts: 5, isPro: false, completedLessons: [], progress: []
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
      <AnimatePresence mode="wait">
        {!isAuthenticated &&
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <AuthScreen />
          </motion.div>
        }

        {isAuthenticated && currentView === 'onboarding' &&
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <OnboardingFlow
              onComplete={handleOnboardingComplete}
              onStartPlacementTest={handleStartPlacement}
              initialName={mappedUser.name} />
          </motion.div>
        }

        {isAuthenticated && currentView === 'placement' &&
          <motion.div
            key="placement"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <PlacementTest onComplete={handlePlacementComplete} />
          </motion.div>
        }

        {isAuthenticated && currentView === 'dashboard' &&
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <Dashboard
              user={mappedUser}
              onStartLesson={handleStartLesson}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenPro={() => setShowProModal(true)}
              onCoinsEarned={handleCoinsEarned}
              onTeacherLogin={() => setCurrentView('teacher')} />
          </motion.div>
        }

        {isAuthenticated && currentView === 'lesson' && currentLesson &&
          <motion.div
            key="lesson"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40">
            <LessonView
              lesson={currentLesson}
              onComplete={handleLessonComplete}
              onPromote={handlePromote}
              onClose={() => setCurrentView('dashboard')}
              hearts={mappedUser.hearts}
              isPro={mappedUser.isPro}
              onWrongAnswer={handleWrongAnswer} />
          </motion.div>
        }

        {currentView === 'admin' && (
          <AdminPanel onClose={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'teacher' && (
          <TeacherPanel onClose={() => setCurrentView('dashboard')} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProModal &&
          <ProUpgradeModal
            onClose={() => setShowProModal(false)}
            coins={mappedUser.coins}
            isPro={mappedUser.isPro} />
        }
      </AnimatePresence>

      <AnimatePresence>
        {streakCelebration.visible && (
          <StreakSuccess
            days={streakCelebration.days}
            onClose={() => setStreakCelebration({ ...streakCelebration, visible: false })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {coinCelebration.visible && (
          <CoinCelebration
            amount={coinCelebration.amount}
            onClose={() => {
              setCoinCelebration({ ...coinCelebration, visible: false });
              setCurrentView('dashboard');
            }}
          />
        )}
      </AnimatePresence>

      {/* CoinNotification removed */}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}