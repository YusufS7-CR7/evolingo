import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, ShieldAlert, CheckCircle, Type } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { adminApi } from '../api/client';

interface LessonEditorProps {
    lesson: any;
    onClose: () => void;
}

export function LessonEditor({ lesson, onClose }: LessonEditorProps) {
    const [title, setTitle] = useState(lesson.title);
    const [content, setContent] = useState(() => {
        try {
            return typeof lesson.content === 'object' ? lesson.content : JSON.parse(lesson.content);
        } catch (e) {
            return { words: [], theory: { explanation: '', examples: [] }, practice: [] };
        }
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (lesson.id === 'new') {
                await adminApi.createLesson({
                    moduleId: lesson.moduleId,
                    title,
                    type: lesson.type,
                    content
                });
            } else {
                await adminApi.updateLesson(lesson.id, { title, content });
            }
            onClose();
        } catch (e) {
            alert('Failed to save lesson');
        } finally {
            setSaving(false);
        }
    };

    const updateWord = (index: number, field: string, value: string) => {
        const newWords = [...content.words];
        newWords[index] = { ...newWords[index], [field]: value };
        setContent({ ...content, words: newWords });
    };

    const addWord = () => {
        setContent({
            ...content,
            words: [...content.words, { word: '', translation: '', example: '' }]
        });
    };

    const removeWord = (index: number) => {
        const newWords = content.words.filter((_: any, i: number) => i !== index);
        setContent({ ...content, words: newWords });
    };

    const updatePractice = (index: number, field: string, value: any) => {
        const newPractice = [...content.practice];
        newPractice[index] = { ...newPractice[index], [field]: value };
        setContent({ ...content, practice: newPractice });
    };

    const addPractice = () => {
        setContent({
            ...content,
            // Default to multiple choice. Type can be switched.
            practice: [...content.practice, {
                type: 'multiple_choice',
                question: '',
                options: ['', '', '', ''],
                correct: ''
            }]
        });
    };

    const removePractice = (index: number) => {
        const newPractice = content.practice.filter((_: any, i: number) => i !== index);
        setContent({ ...content, practice: newPractice });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-5xl h-full flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-gray-100"
            >
                {/* Editor Header */}
                <div className="p-6 border-b-2 border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Editing Lesson</p>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-xl font-black text-gray-800 bg-transparent border-b-2 border-transparent focus:border-emerald-400 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                    {/* Words Section */}
                    <section>
                        <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" /> Vocabulary Cards
                            </div>
                            <Button size="sm" variant="outline" onClick={addWord}>
                                <Plus className="w-4 h-4 mr-1" /> Add Word
                            </Button>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {content.words.map((w: any, i: number) => (
                                <div key={i} className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 flex flex-col gap-3 relative group/card">
                                    <button
                                        onClick={() => removeWord(i)}
                                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/card:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black text-gray-400 text-xs">{i + 1}</div>
                                        <input
                                            value={w.word}
                                            placeholder="English Word"
                                            onChange={(e) => updateWord(i, 'word', e.target.value)}
                                            className="flex-1 bg-white border-2 border-transparent focus:border-emerald-400 px-3 py-2 rounded-xl outline-none font-bold"
                                        />
                                    </div>
                                    <input
                                        value={w.translation}
                                        placeholder="Russian Translation"
                                        onChange={(e) => updateWord(i, 'translation', e.target.value)}
                                        className="bg-white border-2 border-transparent focus:border-emerald-400 px-3 py-2 rounded-xl outline-none font-bold"
                                    />
                                    <textarea
                                        value={w.example}
                                        placeholder="Example Usage"
                                        onChange={(e) => updateWord(i, 'example', e.target.value)}
                                        className="bg-white border-2 border-transparent focus:border-emerald-400 px-3 py-2 rounded-xl outline-none font-medium text-sm h-20 resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Theory Section */}
                    <section>
                        <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-emerald-500" /> Theory & Explanation
                        </h3>
                        <div className="bg-emerald-50/50 p-6 rounded-3xl border-2 border-emerald-100">
                            <textarea
                                value={content.theory?.explanation}
                                onChange={(e) => setContent({ ...content, theory: { ...content.theory, explanation: e.target.value } })}
                                className="w-full bg-white border-2 border-emerald-100 focus:border-emerald-400 px-4 py-3 rounded-2xl outline-none font-medium min-h-[150px]"
                                placeholder="Explain the grammar point..."
                            />
                            <div className="mt-4 space-y-2">
                                <p className="text-xs font-black text-emerald-600 uppercase mb-2">Examples</p>
                                {content.theory?.examples?.map((ex: string, i: number) => (
                                    <input
                                        key={i}
                                        value={ex}
                                        onChange={(e) => {
                                            const newEx = [...content.theory.examples];
                                            newEx[i] = e.target.value;
                                            setContent({ ...content, theory: { ...content.theory, examples: newEx } });
                                        }}
                                        className="w-full bg-white border-2 border-emerald-100 focus:border-emerald-400 px-4 py-2 rounded-xl outline-none font-medium italic"
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Practice Section */}
                    <section>
                        <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" /> Practice Questions
                            </div>
                            <Button size="sm" variant="outline" onClick={addPractice}>
                                <Plus className="w-4 h-4 mr-1" /> Add Question
                            </Button>
                        </h3>
                        <div className="space-y-6">
                            {content.practice.map((q: any, i: number) => (
                                <Card key={i} className="p-6 bg-white border-2 border-gray-100 flex flex-col gap-4 relative group/quiz">
                                    <button
                                        onClick={() => removePractice(i)}
                                        className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/quiz:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Question Header & Type Selector */}
                                    <div className="flex items-start gap-4 mb-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black flex-shrink-0">{i + 1}</span>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="flex items-center gap-3 mb-2">
                                                <select
                                                    value={q.type || 'multiple_choice'}
                                                    onChange={(e) => updatePractice(i, 'type', e.target.value)}
                                                    className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold uppercase text-gray-600 outline-none border hover:bg-gray-200 cursor-pointer"
                                                >
                                                    <option value="multiple_choice">Multiple Choice</option>
                                                    <option value="open">Open Answer</option>
                                                </select>
                                            </div>
                                            <input
                                                value={q.question}
                                                placeholder="Question Content"
                                                onChange={(e) => updatePractice(i, 'question', e.target.value)}
                                                className="w-full text-lg font-bold border-b-2 border-transparent focus:border-blue-400 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Question Body */}
                                    {(!q.type || q.type === 'multiple_choice') ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                            {q.options.map((opt: string, optIdx: number) => (
                                                <div key={optIdx} className="flex gap-2">
                                                    <input
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...q.options];
                                                            newOpts[optIdx] = e.target.value;
                                                            updatePractice(i, 'options', newOpts);
                                                        }}
                                                        className={`flex-1 px-4 py-2 rounded-xl border-2 outline-none font-bold transition-all ${opt === q.correct ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}
                                                    />
                                                    <button
                                                        onClick={() => updatePractice(i, 'correct', opt)}
                                                        className={`px-3 rounded-xl font-black text-[10px] ${opt === q.correct ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                                                    >
                                                        CORRECT
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-4 bg-blue-50 p-4 rounded-xl border-2 border-blue-100">
                                            <p className="text-xs font-black text-blue-600 uppercase mb-2">Correct Answer (Exact Match)</p>
                                            <input
                                                value={q.correct}
                                                placeholder="Enter the exact answer user must type..."
                                                onChange={(e) => updatePractice(i, 'correct', e.target.value)}
                                                className="w-full bg-white px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-400 outline-none font-bold text-blue-900"
                                            />
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>
            </motion.div>
        </motion.div>
    );
}
