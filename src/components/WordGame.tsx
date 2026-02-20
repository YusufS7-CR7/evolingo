import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Brain, Trophy, Timer, Star, RefreshCw } from 'lucide-react';
import { ConfettiCelebration } from './ConfettiCelebration';
type WordPair = {
  en: string;
  ru: string;
};
// Large word pools per level — each level has 30+ unique words
const wordPools: Record<string, WordPair[]> = {
  Beginner: [
    {
      en: 'Apple',
      ru: 'Яблоко'
    },
    {
      en: 'Cat',
      ru: 'Кошка'
    },
    {
      en: 'Dog',
      ru: 'Собака'
    },
    {
      en: 'House',
      ru: 'Дом'
    },
    {
      en: 'Water',
      ru: 'Вода'
    },
    {
      en: 'Book',
      ru: 'Книга'
    },
    {
      en: 'Sun',
      ru: 'Солнце'
    },
    {
      en: 'Moon',
      ru: 'Луна'
    },
    {
      en: 'Tree',
      ru: 'Дерево'
    },
    {
      en: 'Car',
      ru: 'Машина'
    },
    {
      en: 'Fish',
      ru: 'Рыба'
    },
    {
      en: 'Bird',
      ru: 'Птица'
    },
    {
      en: 'Milk',
      ru: 'Молоко'
    },
    {
      en: 'Bread',
      ru: 'Хлеб'
    },
    {
      en: 'Chair',
      ru: 'Стул'
    },
    {
      en: 'Table',
      ru: 'Стол'
    },
    {
      en: 'Door',
      ru: 'Дверь'
    },
    {
      en: 'Window',
      ru: 'Окно'
    },
    {
      en: 'Bed',
      ru: 'Кровать'
    },
    {
      en: 'Hand',
      ru: 'Рука'
    },
    {
      en: 'Eye',
      ru: 'Глаз'
    },
    {
      en: 'Head',
      ru: 'Голова'
    },
    {
      en: 'Red',
      ru: 'Красный'
    },
    {
      en: 'Blue',
      ru: 'Синий'
    },
    {
      en: 'Green',
      ru: 'Зелёный'
    },
    {
      en: 'Big',
      ru: 'Большой'
    },
    {
      en: 'Small',
      ru: 'Маленький'
    },
    {
      en: 'Boy',
      ru: 'Мальчик'
    },
    {
      en: 'Girl',
      ru: 'Девочка'
    },
    {
      en: 'Mother',
      ru: 'Мама'
    },
    {
      en: 'Father',
      ru: 'Папа'
    },
    {
      en: 'One',
      ru: 'Один'
    },
    {
      en: 'Two',
      ru: 'Два'
    },
    {
      en: 'Three',
      ru: 'Три'
    },
    {
      en: 'Yes',
      ru: 'Да'
    },
    {
      en: 'No',
      ru: 'Нет'
    }],

  Elementary: [
    {
      en: 'School',
      ru: 'Школа'
    },
    {
      en: 'Friend',
      ru: 'Друг'
    },
    {
      en: 'City',
      ru: 'Город'
    },
    {
      en: 'Family',
      ru: 'Семья'
    },
    {
      en: 'Time',
      ru: 'Время'
    },
    {
      en: 'Money',
      ru: 'Деньги'
    },
    {
      en: 'Weather',
      ru: 'Погода'
    },
    {
      en: 'Kitchen',
      ru: 'Кухня'
    },
    {
      en: 'Garden',
      ru: 'Сад'
    },
    {
      en: 'Street',
      ru: 'Улица'
    },
    {
      en: 'Shop',
      ru: 'Магазин'
    },
    {
      en: 'Train',
      ru: 'Поезд'
    },
    {
      en: 'Bus',
      ru: 'Автобус'
    },
    {
      en: 'Airport',
      ru: 'Аэропорт'
    },
    {
      en: 'Hotel',
      ru: 'Отель'
    },
    {
      en: 'Restaurant',
      ru: 'Ресторан'
    },
    {
      en: 'Doctor',
      ru: 'Врач'
    },
    {
      en: 'Teacher',
      ru: 'Учитель'
    },
    {
      en: 'Breakfast',
      ru: 'Завтрак'
    },
    {
      en: 'Lunch',
      ru: 'Обед'
    },
    {
      en: 'Dinner',
      ru: 'Ужин'
    },
    {
      en: 'Ticket',
      ru: 'Билет'
    },
    {
      en: 'Passport',
      ru: 'Паспорт'
    },
    {
      en: 'Hobby',
      ru: 'Хобби'
    },
    {
      en: 'Music',
      ru: 'Музыка'
    },
    {
      en: 'Sport',
      ru: 'Спорт'
    },
    {
      en: 'Movie',
      ru: 'Фильм'
    },
    {
      en: 'Letter',
      ru: 'Письмо'
    },
    {
      en: 'Phone',
      ru: 'Телефон'
    },
    {
      en: 'Computer',
      ru: 'Компьютер'
    },
    {
      en: 'Clothes',
      ru: 'Одежда'
    },
    {
      en: 'Shoes',
      ru: 'Обувь'
    },
    {
      en: 'Market',
      ru: 'Рынок'
    },
    {
      en: 'Bridge',
      ru: 'Мост'
    },
    {
      en: 'River',
      ru: 'Река'
    },
    {
      en: 'Mountain',
      ru: 'Гора'
    }],

  'Pre-Intermediate': [
    {
      en: 'Experience',
      ru: 'Опыт'
    },
    {
      en: 'Environment',
      ru: 'Окружающая среда'
    },
    {
      en: 'Government',
      ru: 'Правительство'
    },
    {
      en: 'Education',
      ru: 'Образование'
    },
    {
      en: 'Technology',
      ru: 'Технология'
    },
    {
      en: 'Culture',
      ru: 'Культура'
    },
    {
      en: 'Society',
      ru: 'Общество'
    },
    {
      en: 'Knowledge',
      ru: 'Знание'
    },
    {
      en: 'Research',
      ru: 'Исследование'
    },
    {
      en: 'Development',
      ru: 'Развитие'
    },
    {
      en: 'Opportunity',
      ru: 'Возможность'
    },
    {
      en: 'Communication',
      ru: 'Общение'
    },
    {
      en: 'Relationship',
      ru: 'Отношения'
    },
    {
      en: 'Achievement',
      ru: 'Достижение'
    },
    {
      en: 'Advertisement',
      ru: 'Реклама'
    },
    {
      en: 'Behavior',
      ru: 'Поведение'
    },
    {
      en: 'Challenge',
      ru: 'Вызов'
    },
    {
      en: 'Decision',
      ru: 'Решение'
    },
    {
      en: 'Influence',
      ru: 'Влияние'
    },
    {
      en: 'Pollution',
      ru: 'Загрязнение'
    },
    {
      en: 'Tradition',
      ru: 'Традиция'
    },
    {
      en: 'Advantage',
      ru: 'Преимущество'
    },
    {
      en: 'Improvement',
      ru: 'Улучшение'
    },
    {
      en: 'Responsibility',
      ru: 'Ответственность'
    },
    {
      en: 'Suggestion',
      ru: 'Предложение'
    },
    {
      en: 'Competition',
      ru: 'Соревнование'
    },
    {
      en: 'Imagination',
      ru: 'Воображение'
    },
    {
      en: 'Appearance',
      ru: 'Внешность'
    },
    {
      en: 'Confidence',
      ru: 'Уверенность'
    },
    {
      en: 'Patience',
      ru: 'Терпение'
    },
    {
      en: 'Courage',
      ru: 'Смелость'
    },
    {
      en: 'Curiosity',
      ru: 'Любопытство'
    }],

  Intermediate: [
    {
      en: 'Negotiate',
      ru: 'Вести переговоры'
    },
    {
      en: 'Consequence',
      ru: 'Последствие'
    },
    {
      en: 'Perspective',
      ru: 'Перспектива'
    },
    {
      en: 'Significant',
      ru: 'Значительный'
    },
    {
      en: 'Contribute',
      ru: 'Вносить вклад'
    },
    {
      en: 'Establish',
      ru: 'Устанавливать'
    },
    {
      en: 'Investigate',
      ru: 'Расследовать'
    },
    {
      en: 'Phenomenon',
      ru: 'Явление'
    },
    {
      en: 'Controversy',
      ru: 'Противоречие'
    },
    {
      en: 'Elaborate',
      ru: 'Разрабатывать'
    },
    {
      en: 'Compromise',
      ru: 'Компромисс'
    },
    {
      en: 'Inevitable',
      ru: 'Неизбежный'
    },
    {
      en: 'Substantial',
      ru: 'Существенный'
    },
    {
      en: 'Acknowledge',
      ru: 'Признавать'
    },
    {
      en: 'Distinguish',
      ru: 'Различать'
    },
    {
      en: 'Emphasize',
      ru: 'Подчёркивать'
    },
    {
      en: 'Implement',
      ru: 'Внедрять'
    },
    {
      en: 'Perceive',
      ru: 'Воспринимать'
    },
    {
      en: 'Anticipate',
      ru: 'Предвидеть'
    },
    {
      en: 'Demonstrate',
      ru: 'Демонстрировать'
    },
    {
      en: 'Evaluate',
      ru: 'Оценивать'
    },
    {
      en: 'Hypothesis',
      ru: 'Гипотеза'
    },
    {
      en: 'Legislation',
      ru: 'Законодательство'
    },
    {
      en: 'Prejudice',
      ru: 'Предрассудок'
    },
    {
      en: 'Prosperity',
      ru: 'Процветание'
    },
    {
      en: 'Reluctant',
      ru: 'Неохотный'
    },
    {
      en: 'Sufficient',
      ru: 'Достаточный'
    },
    {
      en: 'Vulnerable',
      ru: 'Уязвимый'
    },
    {
      en: 'Ambiguous',
      ru: 'Двусмысленный'
    },
    {
      en: 'Coherent',
      ru: 'Связный'
    },
    {
      en: 'Dilemma',
      ru: 'Дилемма'
    },
    {
      en: 'Fluctuate',
      ru: 'Колебаться'
    }],

  'Upper-Intermediate': [
    {
      en: 'Ubiquitous',
      ru: 'Вездесущий'
    },
    {
      en: 'Exacerbate',
      ru: 'Усугублять'
    },
    {
      en: 'Pragmatic',
      ru: 'Прагматичный'
    },
    {
      en: 'Resilience',
      ru: 'Стойкость'
    },
    {
      en: 'Meticulous',
      ru: 'Скрупулёзный'
    },
    {
      en: 'Eloquent',
      ru: 'Красноречивый'
    },
    {
      en: 'Scrutiny',
      ru: 'Тщательная проверка'
    },
    {
      en: 'Ambivalent',
      ru: 'Двойственный'
    },
    {
      en: 'Complacent',
      ru: 'Самодовольный'
    },
    {
      en: 'Detrimental',
      ru: 'Вредный'
    },
    {
      en: 'Exemplify',
      ru: 'Служить примером'
    },
    {
      en: 'Formidable',
      ru: 'Грозный'
    },
    {
      en: 'Gratuitous',
      ru: 'Безосновательный'
    },
    {
      en: 'Hierarchical',
      ru: 'Иерархический'
    },
    {
      en: 'Impartial',
      ru: 'Беспристрастный'
    },
    {
      en: 'Juxtapose',
      ru: 'Сопоставлять'
    },
    {
      en: 'Lucrative',
      ru: 'Прибыльный'
    },
    {
      en: 'Mitigate',
      ru: 'Смягчать'
    },
    {
      en: 'Notorious',
      ru: 'Печально известный'
    },
    {
      en: 'Obsolete',
      ru: 'Устаревший'
    },
    {
      en: 'Paradox',
      ru: 'Парадокс'
    },
    {
      en: 'Repercussion',
      ru: 'Последствие'
    },
    {
      en: 'Superficial',
      ru: 'Поверхностный'
    },
    {
      en: 'Tenacious',
      ru: 'Упорный'
    },
    {
      en: 'Unprecedented',
      ru: 'Беспрецедентный'
    },
    {
      en: 'Vindicate',
      ru: 'Оправдывать'
    },
    {
      en: 'Whimsical',
      ru: 'Причудливый'
    },
    {
      en: 'Zealous',
      ru: 'Ревностный'
    },
    {
      en: 'Benevolent',
      ru: 'Благожелательный'
    },
    {
      en: 'Candid',
      ru: 'Откровенный'
    },
    {
      en: 'Discrepancy',
      ru: 'Расхождение'
    },
    {
      en: 'Ephemeral',
      ru: 'Мимолётный'
    }],

  Advanced: [
    {
      en: 'Sycophant',
      ru: 'Подхалим'
    },
    {
      en: 'Obfuscate',
      ru: 'Запутывать'
    },
    {
      en: 'Perfunctory',
      ru: 'Формальный'
    },
    {
      en: 'Recalcitrant',
      ru: 'Непокорный'
    },
    {
      en: 'Surreptitious',
      ru: 'Тайный'
    },
    {
      en: 'Vicissitude',
      ru: 'Превратность'
    },
    {
      en: 'Anachronism',
      ru: 'Анахронизм'
    },
    {
      en: 'Bellicose',
      ru: 'Воинственный'
    },
    {
      en: 'Cacophony',
      ru: 'Какофония'
    },
    {
      en: 'Deleterious',
      ru: 'Пагубный'
    },
    {
      en: 'Enervate',
      ru: 'Обессиливать'
    },
    {
      en: 'Fastidious',
      ru: 'Привередливый'
    },
    {
      en: 'Garrulous',
      ru: 'Болтливый'
    },
    {
      en: 'Hegemony',
      ru: 'Гегемония'
    },
    {
      en: 'Iconoclast',
      ru: 'Иконоборец'
    },
    {
      en: 'Juxtaposition',
      ru: 'Сопоставление'
    },
    {
      en: 'Laconic',
      ru: 'Лаконичный'
    },
    {
      en: 'Magnanimous',
      ru: 'Великодушный'
    },
    {
      en: 'Nefarious',
      ru: 'Гнусный'
    },
    {
      en: 'Ostentatious',
      ru: 'Показной'
    },
    {
      en: 'Pernicious',
      ru: 'Пагубный'
    },
    {
      en: 'Quintessential',
      ru: 'Типичнейший'
    },
    {
      en: 'Recondite',
      ru: 'Малоизвестный'
    },
    {
      en: 'Sagacious',
      ru: 'Проницательный'
    },
    {
      en: 'Trepidation',
      ru: 'Трепет'
    },
    {
      en: 'Unequivocal',
      ru: 'Однозначный'
    },
    {
      en: 'Verisimilitude',
      ru: 'Правдоподобие'
    },
    {
      en: 'Wanton',
      ru: 'Бессмысленный'
    },
    {
      en: 'Acrimonious',
      ru: 'Язвительный'
    },
    {
      en: 'Capricious',
      ru: 'Капризный'
    },
    {
      en: 'Duplicity',
      ru: 'Двуличие'
    },
    {
      en: 'Equanimity',
      ru: 'Невозмутимость'
    }]

};
interface WordGameProps {
  onCoinsEarned?: (amount: number) => void;
  userLevel?: string;
}
export function WordGame({
  onCoinsEarned,
  userLevel = 'Beginner'
}: WordGameProps) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>(
    'start'
  );
  const [mode, setMode] = useState<'en-ru' | 'ru-en'>('en-ru');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shuffledWords, setShuffledWords] = useState<WordPair[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  // Get the word pool for current level
  const currentPool = wordPools[userLevel] || wordPools['Beginner'];
  // Initialize game — picks random 10 from the level pool each time
  const startGame = () => {
    const shuffled = [...currentPool].
      sort(() => Math.random() - 0.5).
      slice(0, 10);
    setShuffledWords(shuffled);
    setCurrentWordIndex(0);
    setScore(0);
    setStreak(0);
    setCoinsEarned(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setGameState('playing');
    generateOptions(shuffled[0], currentPool);
    setTimeLeft(10);
  };
  // Generate options — distractors come from the SAME level pool
  const generateOptions = (correctWord: WordPair, pool: WordPair[]) => {
    const correctOption = mode === 'en-ru' ? correctWord.ru : correctWord.en;
    const otherWords = pool.
      filter((w) => w.en !== correctWord.en).
      sort(() => Math.random() - 0.5).
      slice(0, 3).
      map((w) => mode === 'en-ru' ? w.ru : w.en);
    const allOptions = [correctOption, ...otherWords].sort(
      () => Math.random() - 0.5
    );
    setOptions(allOptions);
  };
  // Timer logic
  useEffect(() => {
    if (gameState !== 'playing' || selectedOption) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, selectedOption]);
  const handleTimeOut = () => {
    setIsCorrect(false);
    setStreak(0);
    setTimeout(nextWord, 1500);
  };
  const handleAnswer = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const currentWord = shuffledWords[currentWordIndex];
    const correctOption = mode === 'en-ru' ? currentWord.ru : currentWord.en;
    if (option === correctOption) {
      setIsCorrect(true);
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setIsCorrect(false);
      setStreak(0);
    }
    setTimeout(nextWord, 1500);
  };
  const nextWord = () => {
    if (currentWordIndex < shuffledWords.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      setSelectedOption(null);
      setIsCorrect(null);
      setTimeLeft(10);
      generateOptions(shuffledWords[nextIndex], currentPool);
    } else {
      // Calculate final reward
      let reward = 0;
      if (score >= 10) reward = 3;
      else if (score >= 7) reward = 2;
      else if (score >= 4) reward = 1;

      if (reward > 0 && onCoinsEarned) {
        onCoinsEarned(reward);
      }
      setCoinsEarned(reward);
      setGameState('result');
    }
  };
  // Level label for display
  const levelLabels: Record<string, string> = {
    Beginner: 'Beginner (A1)',
    Elementary: 'Elementary (A2)',
    'Pre-Intermediate': 'Pre-Intermediate (B1)',
    Intermediate: 'Intermediate (B2)',
    'Upper-Intermediate': 'Upper-Intermediate (C1)',
    Advanced: 'Advanced (C2)'
  };
  return (
    <div className="max-w-2xl mx-auto p-4">
      <AnimatePresence mode="wait">
        {gameState === 'start' &&
          <motion.div
            key="start"
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -20
            }}
            className="text-center">

            <Card className="p-8 flex flex-col items-center gap-6 bg-white border-emerald-100">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-12 h-12 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800">
                Словарный челлендж
              </h1>

              {/* Level badge */}
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                <span className="text-emerald-700 font-bold text-sm">
                  Уровень: {levelLabels[userLevel] || userLevel}
                </span>
              </div>

              <p className="text-gray-500 text-lg">
                Проверь свои знания! У тебя есть 10 секунд на каждое слово. За
                правильные ответы ты получаешь монеты.
              </p>

              <div className="flex gap-4 bg-gray-100 p-1 rounded-xl w-full max-w-xs">
                <button
                  onClick={() => setMode('en-ru')}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'en-ru' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>

                  🇬🇧 → 🇷🇺
                </button>
                <button
                  onClick={() => setMode('ru-en')}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'ru-en' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>

                  🇷🇺 → 🇬🇧
                </button>
              </div>

              <Button size="xl" fullWidth onClick={startGame} className="mt-4">
                Начать игру
              </Button>
            </Card>
          </motion.div>
        }

        {gameState === 'playing' &&
          <motion.div
            key="playing"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="w-full">

            {/* Header Stats */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-700">
                  {score}/{shuffledWords.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-3 w-32 overflow-hidden">
                  <motion.div
                    className={`h-full ${timeLeft <= 3 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    animate={{
                      width: `${timeLeft / 10 * 100}%`
                    }}
                    transition={{
                      duration: 1,
                      ease: 'linear'
                    }} />

                </div>
                <Timer className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star className="w-5 h-5 fill-yellow-500" />
                <span>{coinsEarned}</span>
              </div>
            </div>

            <Card className="p-8 mb-6 text-center relative overflow-hidden">
              <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-4">
                {mode === 'en-ru' ?
                  'Переведи на русский' :
                  'Translate to English'}
              </h2>
              <motion.div
                key={currentWordIndex}
                initial={{
                  scale: 0.8,
                  opacity: 0
                }}
                animate={{
                  scale: 1,
                  opacity: 1
                }}
                className="text-4xl font-extrabold text-gray-800 mb-8">

                {mode === 'en-ru' ?
                  shuffledWords[currentWordIndex].en :
                  shuffledWords[currentWordIndex].ru}
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map((option) => {
                  const currentWord = shuffledWords[currentWordIndex];
                  const correctOption =
                    mode === 'en-ru' ? currentWord.ru : currentWord.en;
                  let variant: 'outline' | 'primary' | 'danger' | 'default' =
                    'outline';
                  if (selectedOption) {
                    if (option === correctOption) variant = 'primary'; else
                      if (
                        option === selectedOption &&
                        option !== correctOption)

                        variant = 'danger';
                  }
                  return (
                    <Button
                      key={option}
                      variant={variant}
                      size="lg"
                      className="w-full"
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedOption}>

                      {option}
                    </Button>);

                })}
              </div>
            </Card>
          </motion.div>
        }

        {gameState === 'result' &&
          <motion.div
            key="result"
            initial={{
              opacity: 0,
              scale: 0.9
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            className="text-center">

            <ConfettiCelebration trigger={true} />
            <Card className="p-8 flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                  Игра окончена!
                </h2>
                <p className="text-gray-500">Ты отлично справился!</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-gray-400 text-xs font-bold uppercase">
                    Точность
                  </div>
                  <div className="text-2xl font-black text-gray-800">
                    {Math.round(score / shuffledWords.length * 100)}%
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <div className="text-yellow-600 text-xs font-bold uppercase mb-2">
                    Награда
                  </div>
                  <div className="flex justify-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < coinsEarned ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <div className="text-xl font-black text-yellow-600 mt-1">
                    +{coinsEarned} монет
                  </div>
                </div>
              </div>

              <Button size="xl" fullWidth onClick={startGame} className="mt-4">
                <RefreshCw className="w-5 h-5 mr-2" />
                Играть снова
              </Button>
            </Card>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}