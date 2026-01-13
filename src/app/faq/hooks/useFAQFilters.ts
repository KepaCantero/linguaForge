import { useMemo, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { AnalyticsEvent } from '@/types/analytics';
import { FAQ_CATEGORIES } from '../data/faq-data';

export function useFAQFilters(initialQuery: string = '') {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  const filteredCategories = useMemo(() => {
    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      questions: category.questions.filter((q) => {
        const query = searchQuery.toLowerCase();
        return q.q.toLowerCase().includes(query) || q.a.toLowerCase().includes(query);
      }),
    })).filter((category) => category.questions.length > 0);
  }, [searchQuery]);

  const toggleCategory = (categoryId: string) => {
    const newOpen = new Set(openCategories);
    const isOpening = !newOpen.has(categoryId);

    if (newOpen.has(categoryId)) {
      newOpen.delete(categoryId);
    } else {
      newOpen.add(categoryId);
    }
    setOpenCategories(newOpen);

    if (isOpening) {
      trackEvent(AnalyticsEvent.FAQ_CATEGORY_OPEN, {
        categoryId,
        timestamp: Date.now(),
        sessionId: '',
      });
    }
  };

  const toggleQuestion = (questionId: string) => {
    const newOpen = new Set(openQuestions);
    if (newOpen.has(questionId)) {
      newOpen.delete(questionId);
    } else {
      newOpen.add(questionId);
    }
    setOpenQuestions(newOpen);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 3) {
      trackEvent(AnalyticsEvent.FAQ_SEARCH, {
        searchQuery: value,
        timestamp: Date.now(),
        sessionId: '',
      });
    }
  };

  return {
    searchQuery,
    filteredCategories,
    openCategories,
    openQuestions,
    toggleCategory,
    toggleQuestion,
    handleSearchChange,
  };
}
