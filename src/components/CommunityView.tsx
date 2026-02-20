import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Trophy, Star, Send, Plus, Search, ChevronRight, User } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UserState } from '../App';
import { userApi } from '../api/client';
import { socket } from '../api/socket';
import { getAvatarUrl } from '../api/avatarUrl';

interface CommunityViewProps {
  user: UserState;
}

interface Message {
  id: number;
  content: string;
  userId: number;
  user: {
    name: string;
    id: number;
    avatarUrl?: string;
  };
  createdAt: string;
}

interface Group {
  id: number;
  name: string;
  level: string;
  maxMembers: number;
  _count?: {
    members: number;
  };
}

export function CommunityView({ user }: CommunityViewProps) {
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [view, setView] = useState<'chat' | 'browse'>('chat');

  // Create Group Form
  const [createForm, setCreateForm] = useState({
    name: '',
    level: user.level,
    maxMembers: 10,
    isPublic: true
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadActiveGroup = async () => {
    try {
      setLoading(true);
      const myRes = await userApi.getMyGroups();
      setMyGroups(myRes.data);

      if (myRes.data.length > 0) {
        // If no active group or current active is not in new list, pick first
        if (!activeGroup || !myRes.data.find((g: Group) => g.id === activeGroup.id)) {
          setActiveGroup(myRes.data[0]);
        }
      } else {
        const joinRes = await userApi.joinGroup();
        setActiveGroup(joinRes.data);
        const updatedMy = await userApi.getMyGroups();
        setMyGroups(updatedMy.data);
      }
    } catch (e) {
      console.error(e);
      setView('browse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveGroup();
    loadAvailableGroups();

    // Connect socket on mount
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!activeGroup) {
      setMessages([]);
      return;
    }

    // Load History
    const loadHistory = async () => {
      try {
        const msgsRes = await userApi.getGroupMessages(activeGroup.id);
        setMessages(msgsRes.data);
      } catch (e) {
        console.error('Failed to load history', e);
        setMessages([]);
      }
    };
    loadHistory();

    // Join room for this group
    socket.emit('join_group', activeGroup.id);

    const onMessage = (msg: Message) => {
      // Room isolation is handled by server, but we check groupId for safety if available
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on('receive_message', onMessage);

    return () => {
      socket.off('receive_message', onMessage);
      // We don't disconnect here because we want to stay connected for switching
    };
  }, [activeGroup?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        userApi.searchGroups(searchQuery).then(res => setSearchResults(res.data));
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadAvailableGroups = async () => {
    try {
      const res = await userApi.getAvailableGroups();
      setAvailableGroups(res.data);
    } catch (e) { }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await userApi.createGroup({
        name: createForm.name,
        level: createForm.level,
        maxMembers: createForm.maxMembers,
        isPublic: createForm.isPublic
      });
      setShowCreateModal(false);
      setActiveGroup(res.data);
      const updatedMy = await userApi.getMyGroups();
      setMyGroups(updatedMy.data);
      setView('chat');
    } catch (e) {
      alert('Failed to create group');
    }
  };

  const handleJoinById = async (groupId: number) => {
    try {
      const res = await userApi.joinGroupById(groupId);
      setActiveGroup(res.data);
      const updatedMy = await userApi.getMyGroups();
      setMyGroups(updatedMy.data);
      setView('chat');
    } catch (e) {
      alert('Could not join group. Maybe it is full?');
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup) return;
    if (!confirm(`Вы действительно хотите выйти из группы "${activeGroup.name}"?`)) return;

    try {
      await userApi.leaveGroupById(activeGroup.id);
      const updatedMy = await userApi.getMyGroups();
      setMyGroups(updatedMy.data);

      if (updatedMy.data.length > 0) {
        setActiveGroup(updatedMy.data[0]);
      } else {
        setActiveGroup(null);
        setView('browse');
      }
      await loadAvailableGroups();
    } catch (e) {
      alert('Ошибка при выходе из группы');
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeGroup) return;

    socket.emit('send_message', {
      groupId: activeGroup.id,
      content: newMessage
    });

    setNewMessage('');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Загрузка сообщества...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Search & Create Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700">
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant={view === 'chat' ? 'primary' : 'outline'}
            onClick={() => setView('chat')}
            size="sm"
            className="flex-1 md:flex-none"
          >
            <MessageCircle className="w-4 h-4 mr-2" /> Чаты
          </Button>
          <Button
            variant={view === 'browse' ? 'primary' : 'outline'}
            onClick={() => setView('browse')}
            size="sm"
            className="flex-1 md:flex-none"
          >
            <Search className="w-4 h-4 mr-2" /> Поиск групп
          </Button>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Найти группу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-emerald-400 rounded-xl outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <Button variant="yellow" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Создать
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          {view === 'chat' && activeGroup ? (
            <Card className="h-[600px] flex flex-col p-0 overflow-hidden border-2 border-emerald-50">
              <div className="p-4 bg-emerald-500 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-black flex items-center gap-2">
                      {activeGroup.name}
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded uppercase">{activeGroup.level}</span>
                    </h3>
                    <p className="text-xs text-emerald-100 italic">Свободно: {activeGroup.maxMembers - (activeGroup._count?.members || 0)} мест</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLeaveGroup}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-[10px] font-black"
                  >
                    ВЫЙТИ ИЗ ГРУППЫ
                  </Button>
                  <Users className="w-5 h-5 text-white/50" />
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <MessageCircle className="w-16 h-16 mb-4" />
                    <p className="font-bold">Здесь пока тихо...<br />Напишите первым!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.userId === user.id;
                    return (
                      <div key={idx} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-2 items-end`}>
                        {!isMe && (
                          <div className="flex-shrink-0">
                            {msg.user.avatarUrl ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                                <img
                                  src={getAvatarUrl(msg.user.avatarUrl) || ''}
                                  alt={msg.user.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold border-2 border-gray-200">
                                {msg.user.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          {!isMe && <span className="text-xs font-bold text-gray-400 ml-2 mb-1">{msg.user.name}</span>}
                          <div className={`px-4 py-2 rounded-2xl shadow-sm ${isMe
                            ? 'bg-emerald-500 text-white rounded-tr-none'
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-2 border-gray-100 dark:border-gray-600 rounded-tl-none'
                            }`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Написать в группу..."
                    className="flex-1 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-emerald-400 rounded-xl px-4 py-2 outline-none font-medium transition-all"
                  />
                  <Button size="md" type="submit" disabled={!newMessage.trim()}>
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </Card>
          ) : view === 'chat' && !activeGroup ? (
            <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-700">Вы пока не состоите в группе</h3>
              <p className="text-gray-400 mb-6">Найдите подходящую группу или создайте свою!</p>
              <Button onClick={() => setView('browse')}>Посмотреть доступные</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-gray-700 mb-4 flex items-center gap-2">
                <Search className="w-6 h-6 text-emerald-500" />
                {searchQuery ? `Результаты для "${searchQuery}"` : 'Рекомендованные группы'}
                <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded ml-auto font-bold tracking-tighter">
                  {searchQuery ? searchResults.length : availableGroups.length} ГРУПП
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchQuery && searchResults.length === 0 ? (
                  <div className="md:col-span-2 py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-black text-gray-400 uppercase tracking-tight">Групп не существует</h3>
                    <p className="text-sm font-bold text-gray-300 mt-1">Попробуйте изменить запрос или создайте свою!</p>
                  </div>
                ) : (searchQuery ? searchResults : availableGroups).map(g => (
                  <Card key={g.id} className="p-5 hover:border-emerald-300 transition-all group overflow-hidden relative border-2 border-transparent">
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {g.level}
                          </span>
                        </div>
                        <h4 className="text-lg font-extrabold text-gray-800 group-hover:text-emerald-600 transition-colors">
                          {g.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-3 text-sm font-bold text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {g._count?.members || 0} / {g.maxMembers}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleJoinById(g.id)}>
                        Вступить <ChevronRight className="ml-1 w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* My Groups List */}
          {myGroups.length > 0 && (
            <Card className="p-6 border-2 border-emerald-50">
              <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Мои группы
              </h3>
              <div className="space-y-2">
                {myGroups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setActiveGroup(g);
                      setView('chat');
                    }}
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${activeGroup?.id === g.id
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'hover:bg-gray-50 text-gray-600'
                      }`}
                  >
                    <div className="text-left">
                      <p className="font-black text-xs uppercase tracking-tight truncate max-w-[120px]">{g.name}</p>
                      <p className={`text-[9px] font-bold ${activeGroup?.id === g.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                        {g.level}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activeGroup?.id === g.id ? 'text-white' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6 border-2 border-emerald-50">
            <h3 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Лидеры недели
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-black text-xs">1</div>
                  <span className="font-black text-gray-700">{user.name}</span>
                </div>
                <span className="text-sm font-black text-emerald-500">{user.xp} XP</span>
              </div>
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tight">Обновляется каждое воскресенье</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-none shadow-chunky-indigo group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <h3 className="font-black text-xl mb-2 relative z-10">Твой прогресс</h3>
            <p className="text-indigo-100 text-sm mb-4 relative z-10 font-bold">
              Покажи всем, чего ты достиг за {user.streak} дн.!
            </p>
            <Button variant="yellow" fullWidth size="md" onClick={() => {
              setNewMessage(`Посмотрите на мой прогресс! Я занимаюсь уже ${user.streak} дней подряд! 🚀`);
              setView('chat');
            }}>
              <Star className="w-4 h-4 mr-2" /> Поделиться
            </Button>
          </Card>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >✕</button>
            <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <Plus className="w-8 h-8 text-emerald-500" /> Создать группу
            </h3>
            <form onSubmit={handleCreateGroup} className="space-y-5">
              <div>
                <label className="block text-sm font-black text-gray-500 uppercase mb-2">Название группы</label>
                <input
                  required
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-emerald-400 rounded-xl outline-none font-bold transition-all"
                  placeholder="Напр. Super English Squad"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-500 uppercase mb-2">Уровень английского</label>
                <select
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent focus:bg-white focus:border-emerald-400 rounded-xl outline-none font-bold transition-all"
                  value={createForm.level}
                  onChange={(e) => setCreateForm({ ...createForm, level: e.target.value })}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Elementary">Elementary</option>
                  <option value="Pre-Intermediate">Pre-Intermediate</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Upper-Intermediate">Upper-Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-black text-gray-500 uppercase mb-2">Макс. участников: {createForm.maxMembers}</label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 appearance-none bg-gray-100 h-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-500 uppercase mb-2">Приватность</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, isPublic: true })}
                    className={`p-3 rounded-xl border-2 font-black text-xs transition-all ${createForm.isPublic
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                      }`}
                  >
                    ПУБЛИЧНАЯ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, isPublic: false })}
                    className={`p-3 rounded-xl border-2 font-black text-xs transition-all ${!createForm.isPublic
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                      }`}
                  >
                    СКРЫТНАЯ
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-bold leading-relaxed">
                  {createForm.isPublic
                    ? '• Публичные группы видны всем пользователям вашего уровня и легко находятся через адаптивный поиск.'
                    : '• Скрытые группы не отображаются в списках. Найти их можно ТОЛЬКО по точному названию — любая опечатка скроет группу из поиска.'}
                </p>
              </div>
              <Button fullWidth size="xl" type="submit" className="mt-4">
                ПОДТВЕРДИТЬ И СОЗДАТЬ
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}