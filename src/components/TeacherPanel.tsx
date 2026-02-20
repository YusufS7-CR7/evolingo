import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowLeft, Plus, BookOpen, Pencil, Check, X } from 'lucide-react';
import { Card } from './ui/Card';
import { adminApi } from '../api/client';
import { Button } from './ui/Button';
import { LessonEditor } from './LessonEditor';

interface TeacherPanelProps {
    onClose: () => void;
}

export function TeacherPanel({ onClose }: TeacherPanelProps) {
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    // Inline lesson title editing
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [savingTitle, setSavingTitle] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (editingLessonId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingLessonId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getCourses();
            setCourses(res.data);
        } catch (e) {
            console.error(e);
            alert('Failed to load courses. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const startEditingTitle = (e: React.MouseEvent, lesson: any) => {
        e.stopPropagation(); // don't open the lesson editor
        setEditingLessonId(lesson.id);
        setEditingTitle(lesson.title);
    };

    const cancelEditing = () => {
        setEditingLessonId(null);
        setEditingTitle('');
    };

    const saveTitle = async (lesson: any) => {
        if (!editingTitle.trim() || editingTitle.trim() === lesson.title) {
            cancelEditing();
            return;
        }
        setSavingTitle(true);
        try {
            await adminApi.updateLesson(lesson.id, {
                title: editingTitle.trim(),
                content: lesson.content
            });
            // Update local state
            setCourses(prev => prev.map(course => ({
                ...course,
                modules: course.modules.map((m: any) => ({
                    ...m,
                    lessons: m.lessons.map((l: any) =>
                        l.id === lesson.id ? { ...l, title: editingTitle.trim() } : l
                    )
                }))
            })));
            // Also update selectedCourse if it's open
            if (selectedCourse) {
                setSelectedCourse((prev: any) => ({
                    ...prev,
                    modules: prev.modules.map((m: any) => ({
                        ...m,
                        lessons: m.lessons.map((l: any) =>
                            l.id === lesson.id ? { ...l, title: editingTitle.trim() } : l
                        )
                    }))
                }));
            }
            cancelEditing();
        } catch (e) {
            console.error(e);
            alert('Не удалось сохранить название урока.');
        } finally {
            setSavingTitle(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, lesson: any) => {
        if (e.key === 'Enter') saveTitle(lesson);
        if (e.key === 'Escape') cancelEditing();
    };

    return (
        <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col p-4 md:p-8 overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-500" />
                        </button>
                        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                            <GraduationCap className="w-8 h-8 text-blue-500" />
                            TEACHER PANEL
                        </h1>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-gray-400 font-bold">Loading content...</div>
                    ) : (
                        <div className="space-y-8">
                            {!selectedCourse ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {courses.map(c => (
                                        <Card key={c.id} onClick={() => setSelectedCourse(c)} className="p-8 cursor-pointer hover:border-blue-500 border-2 border-transparent transition-all flex flex-col items-center gap-4 bg-white shadow-chunky-gray group">
                                            <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                <BookOpen className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-800">{c.level}</h3>
                                            <p className="text-gray-400 font-bold uppercase text-xs">{c.modules.length} Modules</p>
                                            <Button variant="outline" fullWidth className="group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200">Manage Content</Button>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Button size="sm" variant="outline" onClick={() => setSelectedCourse(null)}>
                                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
                                        </Button>
                                        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{selectedCourse.level} Curriculum</h2>
                                    </div>

                                    <div className="space-y-4">
                                        {selectedCourse.modules.map((m: any) => (
                                            <div key={m.id} className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
                                                <h4 className="font-black text-blue-600 uppercase mb-4 text-sm tracking-widest">{m.title}</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {m.lessons.map((l: any, idx: number) => (
                                                        <div key={l.id} className="relative group">
                                                            {editingLessonId === l.id ? (
                                                                /* ── Inline edit mode ── */
                                                                <div className="p-3 bg-blue-50 border-2 border-blue-400 rounded-2xl flex flex-col gap-2">
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase">Lesson {idx + 1}</p>
                                                                    <input
                                                                        ref={inputRef}
                                                                        value={editingTitle}
                                                                        onChange={e => setEditingTitle(e.target.value)}
                                                                        onKeyDown={e => handleKeyDown(e, l)}
                                                                        onBlur={() => saveTitle(l)}
                                                                        className="text-sm font-bold text-gray-800 bg-white border border-blue-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-400 w-full"
                                                                        disabled={savingTitle}
                                                                    />
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onMouseDown={e => { e.preventDefault(); saveTitle(l); }}
                                                                            className="flex-1 flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-1 text-xs font-bold transition-colors"
                                                                            disabled={savingTitle}
                                                                        >
                                                                            <Check className="w-3 h-3" />
                                                                        </button>
                                                                        <button
                                                                            onMouseDown={e => { e.preventDefault(); cancelEditing(); }}
                                                                            className="flex-1 flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg py-1 text-xs font-bold transition-colors"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                /* ── Normal display mode ── */
                                                                <button
                                                                    onClick={() => setSelectedLesson(l)}
                                                                    className="w-full p-3 bg-gray-50 border-2 border-transparent hover:border-blue-300 rounded-2xl transition-all text-left group/btn"
                                                                >
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Lesson {idx + 1}</p>
                                                                    <p className="font-bold text-gray-700 leading-tight group-hover/btn:text-blue-700 pr-5">{l.title}</p>
                                                                </button>
                                                            )}

                                                            {/* Edit pencil icon — only shows when NOT in edit mode */}
                                                            {editingLessonId !== l.id && (
                                                                <button
                                                                    onClick={e => startEditingTitle(e, l)}
                                                                    title="Переименовать урок"
                                                                    className="absolute top-2 right-2 p-1 rounded-lg bg-white/80 hover:bg-blue-100 hover:text-blue-600 text-gray-400 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => setSelectedLesson({
                                                            id: 'new',
                                                            moduleId: m.id,
                                                            title: 'New Lesson',
                                                            type: 'vocabulary',
                                                            content: { words: [], theory: { explanation: '', examples: [] }, practice: [] }
                                                        })}
                                                        className="p-3 bg-blue-50 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl transition-all text-left group flex flex-col items-center justify-center gap-1"
                                                    >
                                                        <Plus className="w-5 h-5 text-blue-500" />
                                                        <p className="font-bold text-blue-600 text-xs">Add Lesson</p>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
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
        </div>
    );
}
