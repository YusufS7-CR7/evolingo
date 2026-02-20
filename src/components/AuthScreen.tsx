import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Mail, Lock, ArrowRight, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
interface AuthScreenProps {
  onRegisterStart?: () => void;
}
export function AuthScreen({ onRegisterStart }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!isLogin && !name) return;

    setError('');
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        if (onRegisterStart) onRegisterStart();
        await register({ email, password, name });
      }
      // App.tsx handles redirection based on auth state
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };
  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Side - AI Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-[-40px] w-32 h-32 bg-purple-400/20 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center z-10 w-full max-w-sm"
        >
          {/* Main AI Bot Icon */}
          <div className="mb-8 relative inline-block">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-28 h-28 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-2xl"
            >
              <span className="text-6xl">🤖</span>
            </motion.div>

            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-3xl border-2 border-white/30"
            />

            {/* Floating AI badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full shadow-lg"
            >
              AI ✨
            </motion.div>
          </div>

          {/* Animated chat bubbles */}
          <div className="space-y-3 mb-8 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-white/10">
                <p className="text-white text-sm font-medium">Привет! Я твой ИИ-репетитор 👋</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex items-start gap-3 justify-end"
            >
              <div className="bg-white/25 backdrop-blur-sm rounded-2xl rounded-tr-sm px-4 py-3 border border-white/10">
                <p className="text-white text-sm font-medium">Как сказать "привет" по-английски?</p>
              </div>
              <div className="w-8 h-8 bg-emerald-400/40 rounded-full flex items-center justify-center flex-shrink-0 text-sm">👤</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-white/10">
                <p className="text-white text-sm font-medium">«Hello» или «Hi» — оба варианта верны! 🎯</p>
              </div>
            </motion.div>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {[
              { icon: '🧠', label: 'ИИ-анализ' },
              { icon: '💬', label: 'ИИ-чат 24/7' },
              { icon: '🎯', label: 'Персональный план' },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + i * 0.15 }}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5"
              >
                <span className="text-sm">{f.icon}</span>
                <span className="text-white text-xs font-bold">{f.label}</span>
              </motion.div>
            ))}
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Учи английский<br />
            <span className="text-yellow-300">с помощью ИИ</span>
          </h1>
          <p className="text-indigo-100 text-base font-medium max-w-xs mx-auto">
            Персональный ИИ-репетитор анализирует твой прогресс и строит индивидуальный план обучения.
          </p>
        </motion.div>
      </div>


      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-10 lg:hidden">
            <h1 className="text-3xl font-extrabold text-emerald-500">lingo</h1>
          </div>

          <div className="flex gap-4 mb-8 bg-gray-100 p-1 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isLogin ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>

              ВОЙТИ
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!isLogin ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>

              РЕГИСТРАЦИЯ
            </button>
          </div>

          <motion.form
            key={isLogin ? 'login' : 'signup'}
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -20
            }}
            className="space-y-6"
            onSubmit={handleSubmit}>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {!isLogin &&
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                  Полное имя
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 pl-12 font-bold text-gray-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                    placeholder="Иван Иванов" />

                  <Smile className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            }

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Эл. почта
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 pl-12 font-bold text-gray-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                  placeholder="hello@example.com" />

                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Пароль
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 pl-12 font-bold text-gray-700 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                  placeholder="••••••••" />

                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <Button fullWidth size="lg" className="mt-8 group">
              {isLogin ? 'Войти' : 'Создать аккаунт'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.form>


          <div className="mt-8 text-center">
            <p className="text-gray-400 font-medium text-sm">
              Входя, вы соглашаетесь с{' '}
              <a href="#" className="text-emerald-500 hover:underline">
                Условиями
              </a>{' '}
              и{' '}
              <a href="#" className="text-emerald-500 hover:underline">
                Политикой конфиденциальности
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>);

}