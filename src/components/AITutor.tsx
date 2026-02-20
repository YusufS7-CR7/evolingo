import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { aiApi } from '../api/client';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export function AITutor() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: 'Привет! Я твой персональный ИИ-репетитор. Я анализирую твои успехи и готов помочь с любыми вопросами по английскому. О чем хочешь поговорить?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await aiApi.sendMessage(input);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: res.data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.response?.data?.message || e.message || 'Произошла непредвиденная ошибка';
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: `Ошибка: ${errorMessage}. Попробуй позже или проверь консоль.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <Bot className="w-10 h-10 text-emerald-500" />
                        AI Помощник
                    </h1>
                    <p className="text-gray-500 font-medium">Твой персональный репетитор и аналитик</p>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-700 font-bold text-sm">Pro Активен</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Chat Area */}
                <Card className="lg:col-span-2 flex flex-col overflow-hidden border-none shadow-xl bg-white relative">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-emerald-100'
                                            }`}>
                                            {msg.role === 'user' ? <User className="w-5 h-5 text-indigo-600" /> : <Bot className="w-5 h-5 text-emerald-600" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl font-medium shadow-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-50 p-4 rounded-2xl flex gap-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Спроси меня о грамматике или словах..."
                                className="flex-1 bg-white border-2 border-transparent focus:border-emerald-500 rounded-xl px-4 py-2 outline-none transition-all font-medium"
                            />
                            <Button onClick={handleSend} disabled={loading || !input.trim()}>
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Sidebar / Stats */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Аналитика обучения</h3>
                        </div>
                        <p className="text-indigo-100 text-sm mb-4">
                            Я анализирую каждое твое действие. После каждых 5 уроков здесь будет появляться детальный разбор.
                        </p>
                        <div className="space-y-3">
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                                <div className="text-xs font-bold text-indigo-200 uppercase">Последний анализ</div>
                                <div className="font-bold">Пока недостаточно данных</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-emerald-100 bg-emerald-50/50">
                        <div className="flex items-center gap-3 mb-4 text-emerald-700">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Совет дня</h3>
                        </div>
                        <p className="text-emerald-800 text-sm font-medium leading-relaxed">
                            "Окружи себя языком: поменяй язык телефона на английский и старайся думать на нем хотя бы 5 минут в день."
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
