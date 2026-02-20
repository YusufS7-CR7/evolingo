import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldAlert, Trash2, Plus, Minus, Search, ArrowLeft } from 'lucide-react';
import { Card } from './ui/Card';
import { adminApi } from '../api/client';
import { Button } from './ui/Button';

interface AdminPanelProps {
    onClose: () => void;
}

interface AdminUser {
    id: number;
    name: string;
    email: string;
    level: string;
    xp: number;
    coins: number;
}

interface AdminGroup {
    id: number;
    name: string;
    level: string;
    isPublic: boolean;
    _count: { members: number };
}

export function AdminPanel({ onClose }: AdminPanelProps) {
    const [tab, setTab] = useState<'users' | 'groups' | 'content'>('users');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [groups, setGroups] = useState<AdminGroup[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [tab, search]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (tab === 'users') {
                const res = await adminApi.getUsers(search);
                setUsers(res.data);
            } else if (tab === 'groups') {
                const res = await adminApi.getGroups(search);
                setGroups(res.data);
            } else if (tab === 'content') {
                const res = await adminApi.getCourses();
                setCourses(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateXP = async (userId: number, amount: number) => {
        try {
            await adminApi.updateUserStats(userId, amount, 0);
            loadData();
        } catch (e) { alert('Action failed'); }
    };

    const handleUpdateCoins = async (userId: number, amount: number) => {
        try {
            await adminApi.updateUserStats(userId, 0, amount);
            loadData();
        } catch (e) { alert('Action failed'); }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Are you absolutely sure you want to delete this user? This cannot be undone.')) return;
        try {
            await adminApi.deleteUser(id);
            loadData();
        } catch (e) { alert('Action failed'); }
    };

    const handleDeleteGroup = async (id: number) => {
        if (!confirm('Are you absolutely sure you want to delete this group?')) return;
        try {
            await adminApi.deleteGroup(id);
            loadData();
        } catch (e) { alert('Action failed'); }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col p-4 md:p-8 overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-500" />
                        </button>
                        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8 text-red-500" />
                            ADMIN PANEL
                        </h1>
                    </div>
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                        <button
                            onClick={() => setTab('users')}
                            className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${tab === 'users' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            USERS
                        </button>
                        <button
                            onClick={() => setTab('groups')}
                            className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${tab === 'groups' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            GROUPS
                        </button>
                        <button
                            onClick={() => setTab('content')}
                            className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${tab === 'content' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            CONTENT
                        </button>
                    </div>
                </div>

                {/* Search & Actions */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={`Search ${tab}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-emerald-400 rounded-2xl shadow-sm outline-none font-bold transition-all text-lg"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
                    ) : (
                        <>
                            {tab === 'users' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {users.map(u => (
                                        <Card key={u.id} className="p-6 border-2 border-transparent hover:border-emerald-100 transition-all flex flex-col gap-4 relative overflow-hidden group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-black text-xl text-gray-800">{u.name}</h3>
                                                    <p className="text-sm font-bold text-gray-400">{u.email}</p>
                                                    <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-tighter bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                                        {u.level}
                                                    </span>
                                                </div>
                                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                <div className="bg-gray-50 p-3 rounded-2xl">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">XP: {u.xp}</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleUpdateXP(u.id, 100)} className="flex-1 bg-white border border-gray-200 p-1.5 rounded-lg hover:border-emerald-300 transition-colors flex justify-center">
                                                            <Plus className="w-4 h-4 text-emerald-500" />
                                                        </button>
                                                        <button onClick={() => handleUpdateXP(u.id, -100)} className="flex-1 bg-white border border-gray-200 p-1.5 rounded-lg hover:border-red-300 transition-colors flex justify-center">
                                                            <Minus className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-2xl">
                                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Coins: {u.coins}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const amount = prompt('Enter coins amount (positive to add, negative to remove):', '500');
                                                                if (amount && !isNaN(parseInt(amount))) {
                                                                    handleUpdateCoins(u.id, parseInt(amount));
                                                                }
                                                            }}
                                                            className="flex-1 bg-white border border-gray-200 p-1.5 rounded-lg hover:border-emerald-300 transition-colors flex justify-center items-center gap-2 group"
                                                        >
                                                            <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-500 group-hover:scale-110 transition-transform" />
                                                            <span className="text-xs font-bold text-gray-600">Manage</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {tab === 'groups' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {groups.map(g => (
                                        <Card key={g.id} className="p-6 border-2 border-transparent hover:border-emerald-100 transition-all flex flex-col gap-4 relative overflow-hidden group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-black text-xl text-gray-800">{g.name}</h3>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">
                                                            {g.level}
                                                        </span>
                                                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${g.isPublic ? 'bg-blue-50 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                            {g.isPublic ? 'PUBLIC' : 'SECRET'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteGroup(g.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between text-sm font-bold text-gray-400">
                                                <span>Members: {g._count.members}</span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {tab === 'content' && (
                                <div className="space-y-8">
                                    {!selectedCourse ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {courses.map(c => (
                                                <Card key={c.id} onClick={() => setSelectedCourse(c)} className="p-8 cursor-pointer hover:border-emerald-500 border-2 border-transparent transition-all flex flex-col items-center gap-4 bg-white shadow-chunky-gray">
                                                    <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center">
                                                        <ShieldAlert className="w-8 h-8 text-emerald-600" />
                                                    </div>
                                                    <h3 className="text-2xl font-black text-gray-800">{c.level}</h3>
                                                    <p className="text-gray-400 font-bold uppercase text-xs">{c.modules.length} Modules</p>
                                                    <Button variant="outline" fullWidth>Browse Roadmap</Button>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <Button size="sm" variant="outline" onClick={() => setSelectedCourse(null)}>
                                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Levels
                                                </Button>
                                                <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{selectedCourse.level} Roadmap</h2>
                                            </div>

                                            <div className="space-y-4">
                                                {selectedCourse.modules.map((m: any) => (
                                                    <div key={m.id} className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
                                                        <h4 className="font-black text-emerald-600 uppercase mb-4 text-sm tracking-widest">{m.title}</h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                            {m.lessons.map((l: any, idx: number) => (
                                                                <button
                                                                    key={l.id}
                                                                    onClick={() => setSelectedLesson(l)}
                                                                    className="p-3 bg-gray-50 border-2 border-transparent hover:border-emerald-300 rounded-2xl transition-all text-left group"
                                                                >
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Lesson {idx + 1}</p>
                                                                    <p className="font-bold text-gray-700 leading-tight group-hover:text-emerald-700">{l.title}</p>
                                                                </button>
                                                            ))}
                                                            <button
                                                                onClick={() => setSelectedLesson({
                                                                    id: 'new',
                                                                    moduleId: m.id,
                                                                    title: 'New Lesson',
                                                                    type: 'vocabulary',
                                                                    content: { words: [], theory: { explanation: '', examples: [] }, practice: [] }
                                                                })}
                                                                className="p-3 bg-emerald-50 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-2xl transition-all text-left group flex flex-col items-center justify-center gap-1"
                                                            >
                                                                <Plus className="w-5 h-5 text-emerald-500" />
                                                                <p className="font-bold text-emerald-600 text-xs">Add Lesson</p>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Lesson Editor Modal */}
            <AnimatePresence>
                {selectedLesson && (
                    <LessonEditor
                        lesson={selectedLesson}
                        onClose={() => {
                            setSelectedLesson(null);
                            loadData(); // Refresh to see changes
                        }}
                    />
                )}
            </AnimatePresence>
        </div >
    );
}

import { LessonEditor } from './LessonEditor';
