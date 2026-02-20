import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Volume2, BookOpen, Brain, CheckCircle, Trophy } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ConfettiCelebration } from './ConfettiCelebration';
import { Lesson } from '../App';

interface LessonViewProps {
  onClose: () => void;
  onComplete: (results: { xp: number; coins: number; lessonId: string; score?: number }) => Promise<{ isLevelComplete: boolean }>;
  onPromote: () => void;
  lesson: Lesson;
  hearts: number;
  isPro: boolean;
  onWrongAnswer: () => void;
}

type LessonPart = 'words' | 'theory' | 'practice';

export function LessonView({ onClose, onComplete, lesson, hearts, isPro, onWrongAnswer, onPromote }: LessonViewProps) {
  // Robustly parse content
  let content: any = {};
  try {
    content = typeof lesson.content === 'object' ? lesson.content : JSON.parse(lesson.content as any);
  } catch (e) {
    console.error('Failed to parse lesson content', e);
  }

  const words = content?.words || [];
  const practiceQuestions = Array.isArray(content?.practice) ? content.practice : (content?.practice ? [content.practice] : []);
  const theory = content?.theory || { explanation: 'No theory available.', examples: [] };

  const [part, setPart] = useState<LessonPart>('words');
  const [progress, setProgress] = useState(0);
  const [showFailure, setShowFailure] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);

  // Words State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Text-to-Speech: speak the English word using the browser's built-in API
  const speakWord = (word: string) => {
    if (!word || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop any previous speech
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    // Try to pick an English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;
    window.speechSynthesis.speak(utterance);
  };

  // Practice State
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [practiceStatus, setPracticeStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');

  useEffect(() => {
    setUserAnswer('');
  }, [currentPracticeIndex]);

  /* ... inside LessonView component ... */
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [earnedCoinsData, setEarnedCoinsData] = useState(0);

  const calculateProgress = (partType: LessonPart, index: number) => {
    let base = 0;
    if (partType === 'words') {
      base = (index / words.length) * 33;
    } else if (partType === 'theory') {
      base = 33;
    } else if (partType === 'practice') {
      base = 40 + (index / practiceQuestions.length) * 60;
    }
    setProgress(Math.min(100, Math.round(base)));
  };

  const handleNextWord = () => {
    setIsFlipped(false);
    if (currentWordIndex < words.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      calculateProgress('words', nextIndex);
    } else {
      setPart('theory');
      setProgress(33);
    }
  };

  const handleTheoryComplete = () => {
    setPart('practice');
    calculateProgress('practice', 0);
  };

  const handlePracticeCheck = (option: string) => {
    if (!option) return;

    // Normalize logic for open/choice
    // For now, strict match or contained in options
    // Assuming simple string check
    const currentQuestion = practiceQuestions[currentPracticeIndex];
    let isCorrect = false;

    if (currentQuestion.type === 'open') {
      // Simple case-insensitive check
      isCorrect = option.trim().toLowerCase() === currentQuestion.correct.toLowerCase();
    } else {
      isCorrect = option === currentQuestion.correct;
    }

    setSelectedOption(option); // Freeze input

    if (isCorrect) {
      setPracticeStatus('correct');
      setCorrectCount(prev => prev + 1);
    } else {
      setPracticeStatus('wrong');
      onWrongAnswer();
      // Strict mode: NO retry, just show wrong and move on with "Next"
      if (hearts <= 1) {
        setTimeout(() => setShowFailure(true), 1500);
      }
    }

    if (currentPracticeIndex === practiceQuestions.length - 1) {
      setProgress(100);
    }
  };

  const handleNextPractice = () => {
    if (currentPracticeIndex < practiceQuestions.length - 1) {
      const nextIndex = currentPracticeIndex + 1;
      setCurrentPracticeIndex(nextIndex);
      setPracticeStatus('idle');
      setSelectedOption(null);
      setUserAnswer('');
      calculateProgress('practice', nextIndex);
    } else {
      // Calculate final results
      const score = Math.round(((correctCount + (practiceStatus === 'correct' ? 0 : 0)) / practiceQuestions.length) * 100);
      // Note: correctCount is updated in handlePracticeCheck, but if we are on the last question, 
      // the state update might be batched. However, since we click "Next" (or "Finish") AFTER check, 
      // state should be stable.
      // Wait, if we are on the last question, we see "Finish Lesson" button.
      // So this handleNextPractice is only for < length - 1.
    }
  };

  const showResultsScreen = () => {
    const total = practiceQuestions.length;
    const score = Math.round((correctCount / total) * 100);
    const coins = Math.ceil(20 * (score / 100));
    setFinalScore(score);
    setEarnedCoinsData(coins);
    setShowResults(true);
  };

  const handleFinishConfirm = async () => {
    // Send data to server
    const res = await onComplete({
      xp: Math.ceil(50 * (finalScore / 100)),
      coins: earnedCoinsData,
      lessonId: lesson.id,
      score: finalScore
    });

    if (res.isLevelComplete) {
      setShowResults(false);
      setLevelComplete(true);
    } else {
      onClose();
    }
  };

  if (!lesson) return null;

  const currentQuestion = practiceQuestions[currentPracticeIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <ConfettiCelebration trigger={showResults && finalScore > 70} />

      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-8 h-8" />
        </button>

        <div className="flex-1 mx-8 flex flex-col items-center">
          <div className="text-gray-900 font-extrabold text-lg mb-1">{lesson.title}</div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              animate={{
                width: `${progress}%`
              }} />
          </div>
        </div>

        <div className="flex items-center text-red-500 font-bold text-xl">
          <Heart className={`w-6 h-6 ${isPro || hearts > 0 ? 'fill-red-500' : 'text-gray-300'} mr-2`} />
          {isPro ? '∞' : hearts}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-2xl mx-auto w-full">
        {/* Part Indicator - Hide if showing results */}
        {!showResults && (
          <div className="flex gap-4 mb-8">
            <div className={`flex items-center gap-2 font-bold ${part === 'words' ? 'text-emerald-500' : 'text-gray-400'}`}>
              <BookOpen className="w-5 h-5" /> Новые слова
            </div>
            <div className={`flex items-center gap-2 font-bold ${part === 'theory' ? 'text-emerald-500' : 'text-gray-400'}`}>
              <Brain className="w-5 h-5" /> Теория
            </div>
            <div className={`flex items-center gap-2 font-bold ${part === 'practice' ? 'text-emerald-500' : 'text-gray-400'}`}>
              <CheckCircle className="w-5 h-5" /> Практика
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {part === 'words' && !showResults && (
            <motion.div
              key="words"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col items-center">

              <div
                className="relative w-72 h-80 mb-8 perspective-1000 cursor-pointer group"
                onClick={() => {
                  speakWord(words[currentWordIndex]?.word);
                  setIsFlipped(!isFlipped);
                }}>

                <motion.div
                  className="w-full h-full relative preserve-3d"
                  animate={{
                    rotateY: isFlipped ? 180 : 0
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20
                  }}>

                  {/* Front: English */}
                  <div className="absolute inset-0 backface-hidden bg-white border-2 border-gray-200 rounded-3xl shadow-chunky-gray flex flex-col items-center justify-center p-6 group-hover:border-emerald-200 transition-colors">
                    <Volume2 className="w-12 h-12 text-blue-500 mb-6" />
                    <span className="text-4xl font-extrabold text-gray-800 text-center">
                      {words[currentWordIndex]?.word || 'Error'}
                    </span>
                    <span className="text-sm text-gray-400 mt-4 font-bold uppercase tracking-widest">
                      Нажми, чтобы услышать и перевести
                    </span>
                  </div>

                  {/* Back: Russian */}
                  <div className="absolute inset-0 backface-hidden bg-blue-50 border-2 border-blue-200 rounded-3xl shadow-chunky-blue flex flex-col items-center justify-center p-6 rotate-y-180">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(words[currentWordIndex]?.word);
                      }}
                      className="mb-4 p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                      title="Прослушать ещё раз"
                    >
                      <Volume2 className="w-7 h-7 text-blue-500" />
                    </button>
                    <span className="text-3xl font-bold text-blue-600 mb-4 text-center">
                      {words[currentWordIndex]?.translation}
                    </span>
                    <p className="text-center text-blue-800 font-medium italic">
                      "{words[currentWordIndex]?.example}"
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="w-full flex justify-between items-center max-w-xs gap-4">
                <p className="text-sm font-bold text-gray-400">{currentWordIndex + 1} / {words.length}</p>
                <Button
                  size="xl"
                  onClick={handleNextWord}
                  className="flex-1">
                  {currentWordIndex < words.length - 1 ? 'Следующее слово' : 'К теории'}
                </Button>
              </div>
            </motion.div>
          )}

          {part === 'theory' && !showResults &&
            <motion.div
              key="theory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full">
              <Card className="p-8 mb-8 bg-emerald-50 border-emerald-100 max-h-[400px] overflow-y-auto">
                <h3 className="text-2xl font-extrabold text-emerald-800 mb-4">
                  Грамматика и Теория
                </h3>
                <div className="space-y-6">
                  <p className="text-lg text-emerald-900 leading-relaxed whitespace-pre-wrap">
                    {theory.explanation}
                  </p>
                  {theory.examples && theory.examples.length > 0 && (
                    <div className="bg-white/50 p-4 rounded-xl border border-emerald-200">
                      <p className="font-bold text-emerald-700 mb-2 uppercase text-xs tracking-wider">Примеры:</p>
                      <ul className="space-y-2">
                        {theory.examples.map((ex: string, i: number) => (
                          <li key={i} className="text-emerald-800 italic font-medium">"{ex}"</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
              <Button size="xl" fullWidth onClick={handleTheoryComplete}>
                К практике
              </Button>
            </motion.div>
          }

          {part === 'practice' && currentQuestion && !showResults &&
            <motion.div
              key={`practice-${currentPracticeIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full">

              <div className="text-center mb-4">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Задание {currentPracticeIndex + 1} / {practiceQuestions.length}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-700 mb-8 text-center uppercase tracking-tight">
                {currentQuestion.question}
              </h2>

              {/* Render based on question type */}
              {(currentQuestion.type === 'open') ? (
                <div className="w-full mb-8 flex flex-col gap-4">
                  <input
                    type="text"
                    value={userAnswer || ''}
                    onChange={(e) => {
                      if (practiceStatus === 'idle') setUserAnswer(e.target.value);
                    }}
                    disabled={practiceStatus !== 'idle'}
                    placeholder="Введите ответ..."
                    className={`w-full p-4 text-xl font-bold border-2 rounded-2xl outline-none transition-all ${practiceStatus === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' :
                      practiceStatus === 'wrong' ? 'border-red-400 bg-red-50 text-red-700' :
                        'border-gray-200 focus:border-blue-400 text-gray-800'
                      }`}
                  />
                  {practiceStatus === 'wrong' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl font-bold text-sm">
                      Правильный ответ: {currentQuestion.correct}
                    </div>
                  )}
                  {practiceStatus === 'idle' && (
                    <Button
                      size="lg"
                      onClick={() => handlePracticeCheck(userAnswer)}
                      disabled={!userAnswer.trim()}
                    >
                      Проверить
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
                  {currentQuestion.options?.map((option: string) => {
                    let variant: 'outline' | 'danger' | 'primary' = 'outline';
                    // Visual feedback ONLY after selection
                    if (selectedOption) {
                      if (option === currentQuestion.correct) variant = 'primary'; // Show correct one
                      else if (option === selectedOption && practiceStatus === 'wrong') variant = 'danger'; // Show error if selected
                    }

                    return (
                      <Button
                        key={option}
                        variant={variant}
                        size="lg"
                        onClick={() => !selectedOption && handlePracticeCheck(option)}
                        className="w-full py-4 text-lg"
                        disabled={!!selectedOption}>
                        {option}
                      </Button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          }

          {/* Results Screen */}
          {showResults && (
            <motion.div
              key="results"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full flex flex-col items-center text-center space-y-6"
            >
              <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-16 h-16 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-800">Урок завершен!</h2>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                  <p className="text-gray-400 font-bold uppercase text-xs">Точность</p>
                  <p className={`text-4xl font-black ${finalScore >= 80 ? 'text-emerald-500' : finalScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {finalScore}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                  <p className="text-gray-400 font-bold uppercase text-xs">Заработано</p>
                  <p className="text-4xl font-black text-yellow-500">
                    +{earnedCoinsData}
                  </p>
                </div>
              </div>

              <p className="text-gray-500 font-medium text-lg">
                {finalScore === 100 ? "Идеально! Вы настоящий мастер!" :
                  finalScore >= 80 ? "Отличная работа! Так держать!" :
                    "Хорошая попытка! Практика ведет к совершенству."}
              </p>

              <Button size="xl" onClick={handleFinishConfirm} className="w-full max-w-xs shadow-chunky-emerald mt-4">
                Завершить
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Feedback - Only show if not on results screen */}
      <AnimatePresence>
        {practiceStatus !== 'idle' && !showResults && (
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className={`fixed bottom-0 left-0 w-full p-4 sm:p-8 border-t-4 ${practiceStatus === 'correct' ? 'bg-emerald-100 border-emerald-300' : 'bg-red-100 border-red-300'
              }`}>

            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${practiceStatus === 'correct' ? 'bg-white text-emerald-500' : 'bg-white text-red-500'
                  }`}>
                  {practiceStatus === 'correct' ? <CheckCircle className="w-8 h-8" /> : <X className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className={`text-2xl font-extrabold ${practiceStatus === 'correct' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                    {practiceStatus === 'correct' ? 'Правильно!' : 'Ой, ошибка!'}
                  </h3>
                  {practiceStatus === 'wrong' && (
                    <p className="text-red-700 font-bold">Осталось сердечек: {hearts}</p>
                  )}
                </div>
              </div>

              {/* Strict Mode: ALWAYS "Next" logic, no retry */}
              {currentPracticeIndex < practiceQuestions.length - 1 ? (
                <Button variant={practiceStatus === 'correct' ? "primary" : "danger"} size="lg" onClick={handleNextPractice}>
                  {practiceStatus === 'correct' ? 'Следующее задание' : 'Далее'}
                </Button>
              ) : (
                <Button variant={practiceStatus === 'correct' ? "primary" : "danger"} size="lg" onClick={showResultsScreen}>
                  Показать результаты
                </Button>
              )
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failure Screen */}
      <AnimatePresence>
        {showFailure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-8"
            >
              <Heart className="w-16 h-16 text-red-500 fill-red-500 opacity-50" />
            </motion.div>
            <h2 className="text-4xl font-black text-gray-800 mb-4 uppercase tracking-tight">У вас не осталось жизней</h2>
            <p className="text-xl text-gray-500 mb-12 max-w-md font-medium">
              Не расстраивайтесь! Жизни восстанавливаются каждый день, или вы можете купить их за монеты в магазине.
            </p>
            <Button size="xl" variant="primary" onClick={onClose} className="w-full max-w-xs shadow-chunky-blue">
              Вернуться назад
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Level Complete Promotion Screen */}
      <AnimatePresence>
        {levelComplete && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-[70] bg-emerald-500 flex flex-col items-center justify-center p-8 text-center text-white"
          >
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-md">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">Уровень полностью пройден!</h2>
            <p className="text-xl text-emerald-100 mb-12 max-w-md font-medium">
              Поздравляем! Вы завершили все модули этого уровня. Готовы двигаться дальше?
              За переход вы получите 100 монет!
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Button size="xl" className="bg-white text-emerald-500 hover:bg-emerald-50 border-none shadow-chunky-white" onClick={onPromote}>
                ПЕРЕЙТИ НА СЛЕДУЮЩИЙ УРОВЕНЬ
              </Button>
              <button onClick={onClose} className="text-emerald-200 font-bold hover:text-white transition-colors">
                Сделать это позже
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}