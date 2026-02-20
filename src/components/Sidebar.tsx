import React from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Users, User, TrendingUp, ShoppingBag, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAvatarUrl } from '../api/avatarUrl';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isPro: boolean;
}

export function Sidebar({ activeTab, onTabChange, isPro }: SidebarProps) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Учиться' },
    { id: 'lessons', icon: BookOpen, label: 'Практика' },
    { id: 'ai-tutor', icon: TrendingUp, label: 'Анализ ИИ' },
    { id: 'community', icon: Users, label: 'Группы' },
    { id: 'profile', icon: User, label: 'Профиль', avatar: user?.avatarUrl },
    { id: 'shop', icon: ShoppingBag, label: 'Магазин' }
  ];

  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 border-r-2 border-gray-200 dark:border-gray-700 p-4 fixed left-0 top-0 z-10 transition-colors duration-300">
      <div className="mb-8 px-4 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-emerald-500 tracking-tight">
          lingo
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isDark ? 'Светлая тема' : 'Тёмная тема'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const avatarSrc = getAvatarUrl((item as any).avatar);

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 border-2 border-emerald-200 dark:border-emerald-700'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent'
                }`}
            >
              {avatarSrc ? (
                <div className={`w-6 h-6 rounded-full overflow-hidden border-2 ${isActive ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <item.icon
                  className={`w-6 h-6 ${isActive ? 'fill-emerald-500' : 'group-hover:scale-110 transition-transform'}`}
                  strokeWidth={2.5}
                />
              )}
              <span className="font-bold text-sm uppercase tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}