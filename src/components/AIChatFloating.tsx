import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, X, MessageCircle, Minimize2, Sparkles } from 'lucide-react';
import { aiApi } from '../api/client';
import { Button } from './ui/Button';

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export function AIChatFloating() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: 'Привет! Чем могу помочь сегодня?',
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
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

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
            const errorMessage = e.response?.data?.message || e.message || 'Ошибка';
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: `Ошибка: ${errorMessage}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-12 right-32 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-24 right-0 w-[400px] h-[600px] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 flex flex-col overflow-hidden shadow-emerald-500/20"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">AI Помощник</h3>
                                    <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest">Онлайн 24/7</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-2 bg-black/10 rounded-full">
                                <Minimize2 className="w-5 h-5 opacity-80" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${msg.role === 'user'
                                        ? 'bg-emerald-500 text-white rounded-tr-none shadow-md'
                                        : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-3xl flex gap-1.5 shadow-sm border border-gray-100">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Спроси о чем угодно..."
                                    className="flex-1 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm outline-none transition-all font-medium"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/30"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-20 h-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-300 group ${isOpen
                    ? 'bg-white text-emerald-500 border-4 border-emerald-500'
                    : 'bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 text-white p-[3px]'
                    }`}
            >
                {!isOpen && (
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity transition-all duration-300" />
                )}

                <div className={`relative w-full h-full rounded-[1.8rem] flex flex-col items-center justify-center ${!isOpen ? 'bg-[#0f172a]/10 backdrop-blur-sm' : ''}`}>
                    {isOpen ? (
                        <X className="w-8 h-8" />
                    ) : (
                        <>
                            <div className="flex items-center justify-center gap-0.5 mb-1">
                                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                <Bot className="w-7 h-7" />
                            </div>
                            <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">AI CHAT</span>
                        </>
                    )}
                </div>
            </motion.button>
        </div>
    );
}
