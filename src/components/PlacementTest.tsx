import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Check, ArrowRight, Brain, Trophy } from 'lucide-react';
import { ConfettiCelebration } from './ConfettiCelebration';
import { ProgressRing } from './ProgressRing';
interface PlacementTestProps {
  onComplete: (level: string) => void;
}
type Question = {
  id: number;
  type: 'choice' | 'fill';
  question: string;
  options: string[];
  correct: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
};
// Expanded pool covering more levels
const questionsPool: Question[] = [
  // A1 - Beginner
  {
    id: 1,
    type: 'choice',
    question: 'Select the correct verb: "She ___ to the store yesterday."',
    options: ['go', 'went', 'gone', 'going'],
    correct: 'went',
    difficulty: 'A1'
  },
  {
    id: 2,
    type: 'fill',
    question: 'Complete: "I ___ a student."',
    options: ['is', 'are', 'am', 'be'],
    correct: 'am',
    difficulty: 'A1'
  },
  // A2 - Elementary
  {
    id: 3,
    type: 'choice',
    question: 'Which sentence is correct?',
    options: [
      "He don't like pizza.",
      "He doesn't likes pizza.",
      "He doesn't like pizza.",
      'He no like pizza.'],

    correct: "He doesn't like pizza.",
    difficulty: 'A2'
  },
  // B1 - Pre-Intermediate
  {
    id: 4,
    type: 'fill',
    question: 'Select the synonym for "Happy"',
    options: ['Sad', 'Joyful', 'Angry', 'Tired'],
    correct: 'Joyful',
    difficulty: 'B1'
  },
  {
    id: 5,
    type: 'choice',
    question: 'I have been living here ___ 2010.',
    options: ['since', 'for', 'from', 'during'],
    correct: 'since',
    difficulty: 'B1'
  },
  // B2 - Intermediate
  {
    id: 6,
    type: 'choice',
    question: 'If I ___ you, I would accept the offer.',
    options: ['was', 'were', 'am', 'have been'],
    correct: 'were',
    difficulty: 'B2'
  },
  {
    id: 7,
    type: 'fill',
    question: 'She is looking forward ___ you.',
    options: ['to see', 'seeing', 'to seeing', 'see'],
    correct: 'to seeing',
    difficulty: 'B2'
  },
  // C1 - Upper-Intermediate/Advanced
  {
    id: 8,
    type: 'choice',
    question: 'Hardly ___ started speaking when the phone rang.',
    options: ['had he', 'he had', 'did he', 'he did'],
    correct: 'had he',
    difficulty: 'C1'
  },
  {
    id: 9,
    type: 'fill',
    question: 'The meeting was called ___ due to the storm.',
    options: ['out', 'off', 'away', 'back'],
    correct: 'off',
    difficulty: 'C1'
  }];

export function PlacementTest({ onComplete }: PlacementTestProps) {
  const [step, setStep] = useState<'intro' | 'self-assess' | 'test' | 'result'>(
    'intro'
  );
  const [selfLevel, setSelfLevel] = useState<string>('');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const handleStart = () => setStep('self-assess');
  const handleSelfAssess = (level: string) => {
    setSelfLevel(level);
    setTestQuestions([...questionsPool].sort(() => Math.random() - 0.5));
    setStep('test');
  };
  const handleAnswer = (option: string) => {
    if (isAnimating) return;
    setSelectedOption(option);
    setIsAnimating(true);
    const isCorrect = option === testQuestions[currentQIndex].correct;
    if (isCorrect) setScore((s) => s + 1);
    setTimeout(() => {
      if (currentQIndex < testQuestions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnimating(false);
      } else {
        setStep('result');
      }
    }, 1000);
  };
  const calculateLevel = () => {
    const percentage = score / testQuestions.length * 100;
    if (percentage >= 90) return 'Advanced';
    if (percentage >= 75) return 'Upper-Intermediate';
    if (percentage >= 60) return 'Intermediate';
    if (percentage >= 45) return 'Pre-Intermediate';
    if (percentage >= 30) return 'Elementary';
    return 'Beginner';
  };
  const finalLevel = calculateLevel();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {step === 'intro' &&
          <motion.div
            key="intro"
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
            className="max-w-md text-center">

            <div className="mb-8 flex justify-center">
              <Brain className="w-32 h-32 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
              Давай определим твой уровень
            </h1>
            <p className="text-gray-500 text-lg mb-8">
              Пройди быстрый тест для персонализации пути обучения. Это займёт
              всего 2 минуты!
            </p>
            <Button size="xl" fullWidth onClick={handleStart}>
              Начать тест
            </Button>
          </motion.div>
        }

        {step === 'self-assess' &&
          <motion.div
            key="self-assess"
            initial={{
              opacity: 0,
              x: 50
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -50
            }}
            className="max-w-md w-full">

            <h2 className="text-2xl font-extrabold text-center mb-8">
              Как ты оцениваешь свой английский?
            </h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {[
                'Beginner',
                'Elementary',
                'Pre-Intermediate',
                'Intermediate',
                'Upper-Intermediate',
                'Advanced'].
                map((level) =>
                  <Button
                    key={level}
                    variant="outline"
                    fullWidth
                    className="justify-between group"
                    onClick={() => handleSelfAssess(level)}>

                    {level}
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                )}
            </div>
          </motion.div>
        }

        {step === 'test' && testQuestions.length > 0 &&
          <motion.div
            key="test"
            className="max-w-lg w-full"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                <span>
                  Вопрос {currentQIndex + 1} из {testQuestions.length}
                </span>
                <span>
                  {Math.round(currentQIndex / testQuestions.length * 100)}%
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  animate={{
                    width: `${(currentQIndex + 1) / testQuestions.length * 100}%`
                  }}
                  transition={{
                    duration: 0.5
                  }} />

              </div>
            </div>

            <Card className="p-8 mb-8">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full mb-3">
                  {testQuestions[currentQIndex].type === 'fill' ?
                    'Заполни пропуск' :
                    'Выбери ответ'}
                </span>
                <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
                  {testQuestions[currentQIndex].question}
                </h3>
              </div>

              <div className="grid gap-4">
                {testQuestions[currentQIndex].options.map((option) => {
                  const isSelected = selectedOption === option;
                  const isCorrect =
                    option === testQuestions[currentQIndex].correct;
                  let variant: 'outline' | 'primary' | 'danger' = 'outline';
                  if (isSelected) {
                    variant = isCorrect ? 'primary' : 'danger';
                  } else if (
                    isAnimating &&
                    option === testQuestions[currentQIndex].correct &&
                    selectedOption) {
                    variant = 'primary';
                  }
                  return (
                    <Button
                      key={option}
                      variant={variant}
                      fullWidth
                      onClick={() => handleAnswer(option)}
                      disabled={isAnimating}
                      className="justify-start text-left">

                      {option}
                    </Button>);

                })}
              </div>
            </Card>
          </motion.div>
        }

        {step === 'result' &&
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
            className="max-w-md w-full text-center">

            <ConfettiCelebration trigger={true} />
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="relative w-40 h-40 mx-auto">
                  {/* Decorative Ring */}
                  <div className="absolute inset-0 rounded-full border-8 border-emerald-100" />
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent animate-spin-slow"
                    style={{ transform: 'rotate(-90deg)' }}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-2 shadow-sm">
                    <Trophy className="w-10 h-10 text-yellow-400 mb-1" />
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Уровень
                    </div>
                    <div className="text-xl font-black text-gray-800 leading-none mt-1">
                      {finalLevel}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-emerald-600 mb-4">
              Отлично!
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              На основе теста, твой уровень — <strong>{finalLevel}</strong>. Мы
              построили путь для достижения твоей цели!
            </p>

            <Button size="xl" fullWidth onClick={() => onComplete(finalLevel)}>
              Построить мой путь
            </Button>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}