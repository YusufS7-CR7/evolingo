import { Home, BookOpen, Users, User, TrendingUp, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../api/avatarUrl';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const { user } = useAuth();

    const menuItems = [
        {
            id: 'dashboard',
            icon: Home,
            label: 'Учиться'
        },
        {
            id: 'lessons',
            icon: BookOpen,
            label: 'Практика'
        },
        {
            id: 'ai-tutor',
            icon: TrendingUp,
            label: 'Анализ'
        },
        {
            id: 'community',
            icon: Users,
            label: 'Группы'
        },
        {
            id: 'profile',
            icon: User,
            label: 'Профиль',
            avatar: user?.avatarUrl
        },
        {
            id: 'shop',
            icon: ShoppingBag,
            label: 'Магазин'
        }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 px-2 py-2 pb-safe transition-colors duration-300">
            <nav className="flex justify-around items-center">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const avatarSrc = getAvatarUrl((item as any).avatar);

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className="flex flex-col items-center justify-center p-2 w-full transition-colors"
                        >
                            {avatarSrc ? (
                                <div className={`w-6 h-6 rounded-full overflow-hidden border-2 mb-1 ${isActive ? 'border-emerald-500' : 'border-gray-300'}`}>
                                    <img
                                        src={avatarSrc}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <item.icon
                                    className={`w-6 h-6 mb-1 ${isActive ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400'}`}
                                    strokeWidth={2.5}
                                />
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
