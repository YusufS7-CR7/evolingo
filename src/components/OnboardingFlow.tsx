import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import {
  Check,
  Zap,
  Trophy,
  User,
  Calendar,
  Target,
  BarChart
} from
  'lucide-react';
import { ConfettiCelebration } from './ConfettiCelebration';
interface OnboardingData {
  name: string;
  age: string;
  goal: string;
  level: string;
}
interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onStartPlacementTest: (partialData: Partial<OnboardingData>) => void;
  initialName?: string;
}
type StepType = 'welcome' | 'input' | 'choice' | 'completion';
interface Step {
  id: string;
  type: StepType;
  title: string;
  description: string;
  icon?: React.ReactNode;
  placeholder?: string;
  options?: {
    id: string;
    label: string;
    icon: string;
    special?: boolean;
  }[];
}
const steps: Step[] = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'Привет! 👋',
    description:
      'Мы поможем тебе выучить английский. Давай настроим твой профиль.',
    icon: <Zap className="w-32 h-32 text-yellow-400 fill-yellow-400" />
  },
  {
    id: 'name',
    type: 'input',
    title: 'Как тебя зовут?',
    description: 'Мы хотим знать, как к тебе обращаться.',
    placeholder: 'Твоё имя',
    icon: <User className="w-24 h-24 text-blue-400" />
  },
  {
    id: 'age',
    type: 'choice',
    title: 'Сколько тебе лет?',
    description: 'Это поможет нам подобрать контент.',
    icon: <Calendar className="w-24 h-24 text-coral-400" />,
    options: [
      {
        id: 'under-12',
        label: 'До 12',
        icon: '👶'
      },
      {
        id: '13-17',
        label: '13 - 17',
        icon: '🎒'
      },
      {
        id: '18-24',
        label: '18 - 24',
        icon: '🎓'
      },
      {
        id: '25-34',
        label: '25 - 34',
        icon: '💼'
      },
      {
        id: '35-44',
        label: '35 - 44',
        icon: '🏠'
      },
      {
        id: '45-plus',
        label: '45+',
        icon: '👓'
      }]

  },
  {
    id: 'goal',
    type: 'choice',
    title: 'Для чего тебе английский?',
    description: 'Мы построим путь на основе твоей цели.',
    icon: <Target className="w-24 h-24 text-red-400" />,
    options: [
      {
        id: 'ielts',
        label: 'Подготовка к IELTS',
        icon: '📚'
      },
      {
        id: 'conversational',
        label: 'Разговорный',
        icon: '🗣️'
      },
      {
        id: 'work',
        label: 'Для работы',
        icon: '💼'
      },
      {
        id: 'relocation',
        label: 'Переезд',
        icon: '✈️'
      },
      {
        id: 'school',
        label: 'Для учёбы',
        icon: '🎓'
      }]

  },
  {
    id: 'level',
    type: 'choice',
    title: 'Какой у тебя текущий уровень?',
    description: 'Будь честен — это поможет найти правильную точку старта.',
    icon: <BarChart className="w-24 h-24 text-emerald-400" />,
    options: [
      {
        id: 'Beginner',
        label: 'Beginner (A1)',
        icon: '🌱'
      },
      {
        id: 'Elementary',
        label: 'Elementary (A2)',
        icon: '🌿'
      },
      {
        id: 'Pre-Intermediate',
        label: 'Pre-Intermediate (B1)',
        icon: '🌳'
      },
      {
        id: 'Intermediate',
        label: 'Intermediate (B2)',
        icon: '🌲'
      },
      {
        id: 'Upper-Intermediate',
        label: 'Upper-Intermediate (C1)',
        icon: '⛰️'
      },
      {
        id: 'Advanced',
        label: 'Advanced (C2)',
        icon: '🚀'
      },
      {
        id: 'unknown',
        label: 'Узнать свой уровень →',
        icon: '🔍',
        special: true
      }]

  },
  {
    id: 'ready',
    type: 'completion',
    title: 'Всё готово!',
    description: 'Мы создали персональный путь обучения специально для тебя.',
    icon: <Trophy className="w-32 h-32 text-yellow-400 fill-yellow-400" />
  }];

export function OnboardingFlow({
  onComplete,
  onStartPlacementTest,
  initialName = ''
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(initialName);
  const [showConfetti, setShowConfetti] = useState(false);
  // State to collect all data
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    name: initialName
  });
  const step = steps[currentStep];
  const handleNext = () => {
    // Special case for placement test
    if (step.id === 'level' && selectedOption === 'unknown') {
      onStartPlacementTest(formData);
      return;
    }
    // Save data
    if (step.id === 'name')
      setFormData((prev) => ({
        ...prev,
        name: inputValue
      }));
    if (step.id === 'age')
      setFormData((prev) => ({
        ...prev,
        age: selectedOption!
      }));
    if (step.id === 'goal')
      setFormData((prev) => ({
        ...prev,
        goal: selectedOption!
      }));
    if (step.id === 'level')
      setFormData((prev) => ({
        ...prev,
        level: selectedOption!
      }));
    if (currentStep < steps.length - 1) {
      // Validation
      if (step.type === 'choice' && !selectedOption) return;
      if (step.type === 'input' && !inputValue.trim()) return;
      setCurrentStep((prev) => prev + 1);
      setSelectedOption(null); // Reset selection for next step
      if (currentStep === steps.length - 2) {
        setShowConfetti(true);
      }
    } else {
      // Complete
      onComplete(formData as OnboardingData);
    }
  };
  const isNextDisabled = () => {
    if (step.type === 'choice') return !selectedOption;
    if (step.type === 'input') return !inputValue.trim();
    return false;
  };
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <ConfettiCelebration trigger={showConfetti} />

      {/* Progress Bar */}
      <div className="absolute top-8 left-0 w-full px-8">
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{
              width: 0
            }}
            animate={{
              width: `${(currentStep + 1) / steps.length * 100}%`
            }}
            transition={{
              duration: 0.5
            }} />

        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
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
          transition={{
            duration: 0.3
          }}
          className="w-full max-w-lg text-center">

          {/* Icon/Illustration */}
          <div className="mb-8 flex justify-center">
            {step.icon &&
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3
                }}>

                {step.icon}
              </motion.div>
            }
          </div>

          <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
            {step.title}
          </h2>
          <p className="text-gray-500 text-lg font-medium mb-10">
            {step.description}
          </p>

          {/* Input Type Step */}
          {step.type === 'input' &&
            <div className="mb-10">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={step.placeholder}
                className="w-full text-center text-2xl font-bold p-4 border-b-4 border-gray-200 focus:border-emerald-500 outline-none transition-colors bg-transparent placeholder-gray-300"
                autoFocus
                onKeyDown={(e) =>
                  e.key === 'Enter' && !isNextDisabled() && handleNext()
                } />

            </div>
          }

          {/* Choice Type Step */}
          {step.type === 'choice' && step.options &&
            <div className="grid grid-cols-1 gap-4 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {step.options.map((option) =>
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`
                    flex items-center p-4 rounded-2xl border-2 border-b-4 transition-all text-left group
                    ${selectedOption === option.id ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                    ${option.special ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' : ''}
                  `}>

                  <span className="text-2xl mr-4 group-hover:scale-110 transition-transform">
                    {option.icon}
                  </span>
                  <span className="font-bold text-gray-700 text-lg">
                    {option.label}
                  </span>
                  {selectedOption === option.id &&
                    <Check
                      className="ml-auto w-6 h-6 text-emerald-500"
                      strokeWidth={3} />

                  }
                </button>
              )}
            </div>
          }

          <Button
            size="lg"
            fullWidth
            onClick={handleNext}
            disabled={isNextDisabled()}
            className={isNextDisabled() ? 'opacity-50 cursor-not-allowed' : ''}>

            {currentStep === steps.length - 1 ? 'Поехали!' : 'Продолжить'}
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>);

}