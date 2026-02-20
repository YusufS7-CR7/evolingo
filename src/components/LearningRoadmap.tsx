import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Lock } from 'lucide-react';
import { courseApi } from '../api/client';
import { Lesson } from '../App'; // Import Lesson type

interface LearningRoadmapProps {
  userLevel: string;
  completedLessons: string[];
  progress?: { lessonId: string; score: number }[]; // Added progress prop
  onLessonSelect: (lesson: Lesson) => void;
}

interface Node {
  id: string;
  label: string;
  lessonData: Lesson;
}

export function LearningRoadmap({
  userLevel,
  completedLessons,
  progress = [], // Default to empty
  onLessonSelect
}: LearningRoadmapProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseApi.getCourses();
        const courses = response.data;
        const currentCourse = courses.find((c: any) => c.level === userLevel) || courses[0];

        if (currentCourse && currentCourse.modules) {
          const roadmapNodes: Node[] = [];
          currentCourse.modules.forEach((mod: any) => {
            mod.lessons.forEach((lesson: any) => {
              roadmapNodes.push({
                id: lesson.id,
                label: lesson.title,
                lessonData: lesson
              });
            });
          });
          setNodes(roadmapNodes);
        }
      } catch (error) {
        console.error('Failed to fetch courses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [userLevel]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your path...</div>;
  if (nodes.length === 0) return <div className="p-8 text-center text-gray-500">No lessons found.</div>;

  return (
    <div className="flex flex-col items-center py-8 relative">
      {/* Connecting Line */}
      <div className="absolute top-10 bottom-10 w-2 bg-gray-200 rounded-full -z-10" />

      {nodes.map((node, index) => {
        // Determine status based on PROGRESS (score >= 80 means completed)
        // completedLessons prop is already filtered by server to be >= 80, but we double check or use it directly
        const isCompleted = completedLessons.includes(node.id); // Server says it's completed (>= 80)

        // Find progress for this node to show partial score
        const nodeProgress = progress.find(p => p.lessonId === node.id);
        const score = nodeProgress ? nodeProgress.score : 0;

        // Logic for unlocking:
        // First node is always unlocked if no completions.
        // Otherwise, a node is unlocked if the PREVIOUS node is completed (>= 80).
        let isLocked = true;
        if (index === 0) {
          isLocked = false;
        } else {
          const prevNodeId = nodes[index - 1].id;
          const prevCompleted = completedLessons.includes(prevNodeId);
          isLocked = !prevCompleted;
        }

        let status: 'completed' | 'current' | 'locked' = 'locked';

        if (isCompleted) {
          status = 'completed';
        } else if (!isLocked) {
          status = 'current';
        }

        // Use partial score for current
        // If current and score > 0 but < 80, we show ring

        const offset = index % 2 === 0 ? -40 : 40;
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
            className="relative mb-12 flex flex-col items-center"
            style={{ marginLeft: offset }}>

            <div className="relative">
              {/* Progress Ring for ANY partial score < 100 */}
              {status !== 'locked' && score > 0 && score < 100 && (
                <div className="absolute -inset-3 flex items-center justify-center pointer-events-none">
                  <svg className="w-24 h-24 transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="transparent" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="44"
                      fill="transparent"
                      stroke={score >= 80 ? '#d97706' : '#10b981'} // Dark Gold or Emerald
                      strokeWidth="8"
                      strokeDasharray="276"
                      strokeDashoffset={276 - (276 * score) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              <motion.button
                onClick={() => {
                  if (status !== 'locked') {
                    onLessonSelect(node.lessonData);
                  }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`
                    w-20 h-20 rounded-full flex items-center justify-center border-b-4 shadow-lg z-10 transition-colors relative
                    ${status === 'locked' ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : ''}
                    ${status !== 'locked' && score === 100 ? 'bg-yellow-400 border-yellow-600' : ''} 
                    ${status !== 'locked' && score >= 80 && score < 100 ? 'bg-yellow-300 border-yellow-500' : ''}
                    ${status !== 'locked' && score < 80 ? 'bg-emerald-500 border-emerald-700' : ''}
                `}>

                {status === 'locked' && <Lock className="w-8 h-8 text-gray-400" />}

                {/* 100% Complete */}
                {status !== 'locked' && score === 100 && (
                  <Check className="w-10 h-10 text-white" strokeWidth={4} />
                )}

                {/* Partial or Just Started */}
                {status !== 'locked' && score < 100 && (
                  <div className="flex flex-col items-center justify-center">
                    {score === 0 ? (
                      <Star className="w-8 h-8 text-white fill-white mb-0.5" />
                    ) : (
                      <span className="text-xl font-black text-white leading-none drop-shadow-sm">{score}%</span>
                    )}
                  </div>
                )}

              </motion.button>
            </div>

            {/* Label Tooltip */}
            <div className="absolute top-24 bg-white px-3 py-1 rounded-lg shadow-md border border-gray-100 whitespace-nowrap z-20">
              <span className={`text-sm font-bold ${status === 'locked' ? 'text-gray-400' : 'text-gray-700'}`}>
                {node.label}
              </span>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-t border-l border-gray-100"></div>
            </div>
          </motion.div>);
      })}
    </div>);
}