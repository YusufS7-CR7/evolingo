import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, User } from 'lucide-react';
import { Card } from './ui/Card';
import { UserState } from '../App';
import { userApi } from '../api/client';
import { getAvatarUrl } from '../api/avatarUrl';

interface LeaderboardProps {
  user: UserState;
}

interface LeaderboardUser {
  id: number;
  name: string;
  xp: number;
  level: string;
  avatarUrl?: string;
}

export function Leaderboard({ user }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await userApi.getLeaderboard();
        setLeaders(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLeaderboard();
  }, [user.xp]);

  return (
    <Card className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Рейтинг</h3>
        <Trophy className="w-6 h-6 text-yellow-500" />
      </div>

      <div className="space-y-4">
        {leaders.length === 0 && <div className="text-gray-400 text-center">Загрузка...</div>}
        {leaders.map((leader, index) => {
          const isMe = leader.name === user.name;
          return (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center p-3 rounded-xl border ${isMe
                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-700'
                : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600'
                }`}>

              <span className={`font-bold w-8 ${index < 3 ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-400'}`}>
                #{index + 1}
              </span>

              {leader.avatarUrl ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-200 mr-3 shadow-sm flex-shrink-0">
                  <img
                    src={getAvatarUrl(leader.avatarUrl) || ''}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold mr-3 shadow-sm flex-shrink-0">
                  {leader.name.charAt(0)}
                </div>
              )}

              <div className="flex-1">
                <span className={`font-bold block ${isMe ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-100'}`}>
                  {leader.name} {isMe && '(Вы)'}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{leader.level}</span>
              </div>

              <span className="font-bold text-gray-500 dark:text-gray-300 text-sm">{leader.xp} XP</span>
            </motion.div>
          );
        })}
      </div>

      <button className="w-full mt-4 text-emerald-500 font-bold text-sm uppercase hover:underline">
        Смотреть лигу
      </button>
    </Card>);
}