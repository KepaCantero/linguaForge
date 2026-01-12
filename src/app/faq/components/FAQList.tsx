import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';
import { AnalyticsEvent } from '@/types/analytics';
import type { FAQCategory } from '../data/faq-data';

interface FAQListProps {
  categories: FAQCategory[];
  openCategories: Set<string>;
  openQuestions: Set<string>;
  onToggleCategory: (id: string) => void;
  onToggleQuestion: (id: string) => void;
}

export function FAQList({ categories, openCategories, openQuestions, onToggleCategory, onToggleQuestion }: FAQListProps) {
  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const isCategoryOpen = openCategories.has(category.id);

        return (
          <div
            key={category.id}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
          >
            <button
              onClick={() => onToggleCategory(category.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <span className="font-semibold text-white">{category.title}</span>
                <span className="text-sm text-gray-500">({category.questions.length})</span>
              </div>
              {isCategoryOpen ? <ChevronUp className="text-gray-400 w-5 h-5" /> : <ChevronDown className="text-gray-400 w-5 h-5" />}
            </button>

            <AnimatePresence>
              {isCategoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-3">
                    {category.questions.map((question) => {
                      const isQuestionOpen = openQuestions.has(question.id);

                      return (
                        <div key={question.id} className="border-b border-slate-700 last:border-0 pb-3 last:pb-0">
                          <button onClick={() => onToggleQuestion(question.id)} className="w-full text-left">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-white font-medium">{question.q}</span>
                              {isQuestionOpen ? (
                                <ChevronUp className="text-lf-accent w-4 h-4 flex-shrink-0 mt-1" />
                              ) : (
                                <ChevronDown className="text-gray-500 w-4 h-4 flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {isQuestionOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line mt-2">
                                  {question.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
