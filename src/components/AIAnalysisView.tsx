import React from 'react';
import { motion } from 'framer-motion';
import { Bot, TrendingUp, AlertCircle, Sparkles, RefreshCw, BookOpen, CheckCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { aiApi } from '../api/client';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';

export function AIAnalysisView() {
    const { user } = useAuth();
    const [analysis, setAnalysis] = React.useState<string | null>(null);
    const [lessonsAnalyzed, setLessonsAnalyzed] = React.useState<number>(0);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [tip, setTip] = React.useState('');

    const tips = [
        "Окружи себя языком: поменяй язык телефона на английский.",
        "Смотри фильмы с субтитрами, а не в дубляже.",
        "Учи не отдельные слова, а целые фразы.",
        "Записывай себя на диктофон, чтобы слышать прогресс.",
        "Читай детские книги на английском — там простой язык.",
        "Думай на английском хотя бы 5 минут в день.",
        "Используй стикеры с названиями предметов по всему дому."
    ];

    React.useEffect(() => {
        const dayOfYear = Math.floor(Date.now() / 86400000);
        setTip(tips[dayOfYear % tips.length]);
    }, []);

    const loadAnalysis = async () => {
        // Client-side Pro check — no API call needed if not Pro
        if (!user?.isPro) {
            setError('PRO_REQUIRED');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await aiApi.getAnalysis();
            setAnalysis(res.data.reply);
            setLessonsAnalyzed(res.data.lessonsAnalyzed ?? 0);
        } catch (err: any) {
            console.error("AI Analysis Error:", err);
            if (err.response && err.response.status === 403) {
                setError('PRO_REQUIRED');
            } else if (
                err.response?.status === 429 ||
                err.response?.data?.code === 'DAILY_LIMIT_EXCEEDED'
            ) {
                setError('DAILY_LIMIT_EXCEEDED');
            } else if (!err.response || err.message === 'Network Error') {
                setError('NETWORK_ERROR');
            } else {
                const msg = err.response?.data?.message || err.message || 'Неизвестная ошибка';
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadAnalysis();
    }, [user?.isPro]);

    // Render analysis text with basic markdown-like formatting
    const renderAnalysisText = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, i) => {
            // Bold headers like **text:**
            const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            if (line.trim() === '') return <div key={i} className="h-2" />;
            return (
                <p
                    key={i}
                    className="text-white/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: boldLine }}
                />
            );
        });
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                    <p className="text-white/80 font-medium animate-pulse">ИИ анализирует твой прогресс...</p>
                    <p className="text-white/50 text-sm mt-2">Это может занять несколько секунд</p>
                </div>
            );
        }

        if (error === 'PRO_REQUIRED') {
            return (
                <div className="text-center py-8">
                    <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Анализ ИИ — только для Pro</h3>
                    <p className="text-indigo-100 mb-2 max-w-md mx-auto text-sm">
                        У вас не активирована подписка Про, чтобы использовать Анализ ИИ.
                    </p>
                    <p className="text-indigo-200/70 mb-6 max-w-md mx-auto text-xs">
                        Получи персональный разбор ошибок и план обучения от ИИ.
                    </p>
                    <Button
                        variant="yellow"
                        onClick={() => (window as any).triggerProModal?.()}
                        className="shadow-xl"
                    >
                        Стать PRO
                    </Button>
                </div>
            );
        }

        if (error === 'NETWORK_ERROR') {
            return (
                <div className="text-center py-10">
                    <div className="text-5xl mb-4">📡</div>
                    <h3 className="text-white font-bold text-xl mb-2">Нет соединения с сервером</h3>
                    <p className="text-indigo-100 text-sm max-w-xs mx-auto">
                        Не удалось подключиться к серверу.<br />Проверьте интернет и попробуйте снова.
                    </p>
                    <button onClick={loadAnalysis} className="mt-4 bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-xl transition-colors">
                        Попробовать снова
                    </button>
                </div>
            );
        }

        if (error === 'DAILY_LIMIT_EXCEEDED') {
            return (
                <div className="text-center py-10">
                    <div className="text-5xl mb-4">🌙</div>
                    <h3 className="text-white font-bold text-xl mb-2">Дневной лимит исчерпан</h3>
                    <p className="text-indigo-100 text-sm max-w-xs mx-auto">
                        Дневной лимит на использование ИИ исчерпан.<br />Попробуйте завтра.
                    </p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                    <p className="text-red-100 font-medium">{error}</p>
                    <button onClick={loadAnalysis} className="mt-4 text-white underline hover:no-underline">
                        Попробовать снова
                    </button>
                </div>
            );
        }

        if (analysis) {
            return (
                <div className="space-y-3">
                    {lessonsAnalyzed > 0 && (
                        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 mb-4">
                            <BookOpen className="w-4 h-4 text-white/70 flex-shrink-0" />
                            <span className="text-white/70 text-sm">
                                Анализ основан на последних <strong className="text-white">{lessonsAnalyzed}</strong> уроках
                            </span>
                        </div>
                    )}
                    <div className="space-y-1">
                        {renderAnalysisText(analysis)}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <TrendingUp className="w-10 h-10 text-indigo-500" />
                        Анализ ИИ
                    </h1>
                    <p className="text-gray-500 font-medium">Персональный разбор твоего прогресса и рекомендации</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <span className="text-indigo-700 font-bold text-sm">Умный Помощник</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Analysis Card */}
                <Card className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bot className="w-48 h-48" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-8 h-8" />
                                <h3 className="font-bold text-2xl">Твоя динамика</h3>
                            </div>
                            {!loading && !error && (
                                <button
                                    onClick={loadAnalysis}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-3 py-2 text-sm font-medium"
                                    title="Обновить анализ"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Обновить
                                </button>
                            )}
                        </div>

                        <Card className="bg-white/10 border-white/10 backdrop-blur-sm min-h-[200px] p-5">
                            {renderContent()}
                        </Card>
                    </div>
                </Card>

                <div className="space-y-8">
                    {/* Tip of the day */}
                    <Card className="p-8 border-emerald-100 bg-emerald-50/50 relative">
                        <div className="flex items-center gap-3 mb-6 text-emerald-700">
                            <AlertCircle className="w-8 h-8" />
                            <h3 className="font-bold text-2xl">Совет дня</h3>
                        </div>
                        <p className="text-emerald-800 text-lg font-medium leading-relaxed italic">
                            "{tip}"
                        </p>
                    </Card>

                    {/* Quick Tips List */}
                    <div className="grid grid-cols-1 gap-4">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-white rounded-2xl border-2 border-gray-100 flex items-center gap-4 shadow-sm"
                        >
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Индивидуальный план</p>
                                <p className="text-sm text-gray-500 font-medium">Следуй рекомендациям ИИ для ускорения</p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-white rounded-2xl border-2 border-gray-100 flex items-center gap-4 shadow-sm"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Анализ каждые 5 уроков</p>
                                <p className="text-sm text-gray-500 font-medium">ИИ отслеживает твой прогресс автоматически</p>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-white rounded-2xl border-2 border-gray-100 flex items-center gap-4 shadow-sm"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Bot className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Постоянное общение</p>
                                <p className="text-sm text-gray-500 font-medium">Чат доступен 24/7 на любой странице</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
