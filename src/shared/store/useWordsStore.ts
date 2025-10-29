import { create } from 'zustand';
import type { IWordModel, ILearningWord, ViewMode, ILearningStats } from '../../entities/word/model/types';

const WORDS_STORAGE_KEY = 'englishLearnWords';
const LEARNING_STATE_KEY = 'englishLearnLearningState';

const WORDS_PER_PAGE = 70;

// History entry for undo functionality
interface HistoryEntry {
  learningWords: ILearningWord[];
  currentWordIndex: number;
  stats: ILearningStats;
  showTranslation: boolean;
}

interface WordsStore {
  // Original words (base data)
  originalWords: IWordModel[];

  // Learning words (with tracking)
  learningWords: ILearningWord[];

  // Current state
  currentWordIndex: number;
  showTranslation: boolean;
  viewMode: ViewMode;

  // Statistics
  stats: ILearningStats;

  // History for undo
  history: HistoryEntry[];
  maxHistorySize: number;

  // Actions
  setWords: (words: IWordModel[]) => void;
  setViewMode: (mode: ViewMode) => void;

  // Word navigation
  getCurrentWord: () => ILearningWord | null;
  showTranslations: () => void;
  hideTranslations: () => void;

  // Learning actions
  handleKnow: () => void;
  handleMiss: () => void;

  // Undo
  undo: () => void;
  canUndo: () => boolean;

  // Reset
  resetLearning: () => void;

  // Get words for different views
  getWordsForView: () => ILearningWord[];

  // Page management
  goToNextPage: () => void;
}

// Convert IWordModel to ILearningWord
const convertToLearningWord = (word: IWordModel, index: number): ILearningWord => ({
  ...word,
  id: `${word.headword}-${index}`,
  missCount: 0,
  correctAfterMiss: 0,
  state: 'learning'
});

// Load original words from localStorage
const loadWordsFromStorage = (): IWordModel[] => {
  try {
    const stored = localStorage.getItem(WORDS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save words to localStorage
const saveWordsToStorage = (words: IWordModel[]) => {
  try {
    localStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(words));
  } catch (e) {
    console.error('Failed to save words to localStorage:', e);
  }
};

// Load learning state from localStorage
const loadLearningState = () => {
  try {
    const stored = localStorage.getItem(LEARNING_STATE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

// Save learning state to localStorage
const saveLearningState = (state: {
  learningWords: ILearningWord[];
  currentWordIndex: number;
  stats: ILearningStats;
  viewMode: ViewMode;
}) => {
  try {
    localStorage.setItem(LEARNING_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save learning state to localStorage:', e);
  }
};

// Initialize stats
const initStats = (totalWords: number): ILearningStats => ({
  currentPage: 0,
  totalPages: Math.ceil(totalWords / WORDS_PER_PAGE),
  hqSets: 0,
  missedInCurrentSet: 0,
  wordsPerPage: WORDS_PER_PAGE
});

// Initialize store with saved state or create new
const initializeStore = () => {
  const originalWords = loadWordsFromStorage();
  const savedState = loadLearningState();

  if (savedState && savedState.learningWords && savedState.learningWords.length > 0) {
    return {
      originalWords,
      learningWords: savedState.learningWords,
      currentWordIndex: savedState.currentWordIndex || 0,
      stats: savedState.stats || initStats(originalWords.length),
      viewMode: (savedState.viewMode || 'v1') as ViewMode,
      showTranslation: false,
      history: [],
      maxHistorySize: 50
    };
  }

  // First time initialization
  const pageWords = originalWords.slice(0, WORDS_PER_PAGE);
  const learningWords = pageWords.map((w, i) => convertToLearningWord(w, i));

  return {
    originalWords,
    learningWords,
    currentWordIndex: 0,
    stats: initStats(originalWords.length),
    viewMode: 'v1' as ViewMode,
    showTranslation: false,
    history: [],
    maxHistorySize: 50
  };
};

export const useWordsStore = create<WordsStore>((set, get) => ({
  ...initializeStore(),

  setWords: (words) => {
    saveWordsToStorage(words);
    const pageWords = words.slice(0, WORDS_PER_PAGE);
    const learningWords = pageWords.map((w, i) => convertToLearningWord(w, i));
    const stats = initStats(words.length);

    const newState = {
      originalWords: words,
      learningWords,
      currentWordIndex: 0,
      stats,
      viewMode: 'v1' as ViewMode,
      showTranslation: false,
      history: []
    };

    set(newState);
    saveLearningState(newState);
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  getCurrentWord: () => {
    const state = get();
    return state.learningWords[state.currentWordIndex] || null;
  },

  showTranslations: () => set({ showTranslation: true }),
  hideTranslations: () => set({ showTranslation: false }),

  handleKnow: () => {
    const state = get();
    const currentWord = state.learningWords[state.currentWordIndex];

    if (!currentWord) return;

    // Save current state to history
    const historyEntry: HistoryEntry = {
      learningWords: JSON.parse(JSON.stringify(state.learningWords)),
      currentWordIndex: state.currentWordIndex,
      stats: { ...state.stats },
      showTranslation: state.showTranslation
    };

    const newHistory = [...state.history, historyEntry].slice(-state.maxHistorySize);

    let newLearningWords = [...state.learningWords];
    let newIndex = state.currentWordIndex;

    // Check word state
    if (currentWord.missCount === 0) {
      // No misses - remove word
      newLearningWords.splice(state.currentWordIndex, 1);
      // Don't increment index, as the next word takes this position
      if (newIndex >= newLearningWords.length && newLearningWords.length > 0) {
        newIndex = newLearningWords.length - 1;
      }
    } else {
      // Has misses - increment correctAfterMiss
      const updatedWord = {
        ...currentWord,
        correctAfterMiss: currentWord.correctAfterMiss + 1
      };

      // Determine required correct answers based on miss count
      // missCount >= 4: need 10 correct answers
      // missCount < 4: need only 1 correct answer
      const requiredCorrectAnswers = currentWord.missCount >= 4 ? 10 : 1;

      // Check if word has been answered correctly enough times
      if (updatedWord.correctAfterMiss >= requiredCorrectAnswers) {
        // Word is learned - remove it from the list
        newLearningWords.splice(state.currentWordIndex, 1);
        // Don't increment index, as the next word takes this position
        if (newIndex >= newLearningWords.length && newLearningWords.length > 0) {
          newIndex = newLearningWords.length - 1;
        }
      } else {
        // Still needs more correct answers - move to position 5
        // Remove from current position
        newLearningWords.splice(state.currentWordIndex, 1);

        // Calculate target position (5 positions down, or end of list)
        const targetPosition = Math.min(state.currentWordIndex + 5, newLearningWords.length);
        newLearningWords.splice(targetPosition, 0, updatedWord);
      }
    }

    // Check if set is complete
    const newStats = { ...state.stats };
    if (newLearningWords.length === 0) {
      // Set completed
      if (newStats.missedInCurrentSet <= 3) {
        newStats.hqSets++;
      }

      // Check if we need to move to next page
      if (newStats.hqSets >= 3) {
        // Move to next page
        const nextPage = newStats.currentPage + 1;
        if (nextPage < newStats.totalPages) {
          const startIdx = nextPage * WORDS_PER_PAGE;
          const endIdx = Math.min(startIdx + WORDS_PER_PAGE, state.originalWords.length);
          const pageWords = state.originalWords.slice(startIdx, endIdx);
          newLearningWords = pageWords.map((w, i) => convertToLearningWord(w, startIdx + i));
          newStats.currentPage = nextPage;
          newStats.hqSets = 0;
          newStats.missedInCurrentSet = 0;
        }
      } else {
        // Reload current page
        const startIdx = newStats.currentPage * WORDS_PER_PAGE;
        const endIdx = Math.min(startIdx + WORDS_PER_PAGE, state.originalWords.length);
        const pageWords = state.originalWords.slice(startIdx, endIdx);
        newLearningWords = pageWords.map((w, i) => convertToLearningWord(w, startIdx + i));
        newStats.missedInCurrentSet = 0;
      }

      newIndex = 0;
    }

    const newState = {
      learningWords: newLearningWords,
      currentWordIndex: newIndex,
      stats: newStats,
      history: newHistory,
      showTranslation: false
    };

    set(newState);
    saveLearningState({
      learningWords: newLearningWords,
      currentWordIndex: newIndex,
      stats: newStats,
      viewMode: state.viewMode
    });
  },

  handleMiss: () => {
    const state = get();
    const currentWord = state.learningWords[state.currentWordIndex];

    if (!currentWord) return;

    // Save current state to history
    const historyEntry: HistoryEntry = {
      learningWords: JSON.parse(JSON.stringify(state.learningWords)),
      currentWordIndex: state.currentWordIndex,
      stats: { ...state.stats },
      showTranslation: state.showTranslation
    };

    const newHistory = [...state.history, historyEntry].slice(-state.maxHistorySize);

    // Update word - increment miss count
    const updatedWord = {
      ...currentWord,
      missCount: Math.min(currentWord.missCount + 1, 4),
      correctAfterMiss: 0, // Reset correct answers when missed
      state: 'consolidating' as const
    };

    const newLearningWords = [...state.learningWords];

    // Remove word from current position
    newLearningWords.splice(state.currentWordIndex, 1);

    // Calculate target position (3 positions down, or 2 from end if close to end)
    let targetPosition: number;
    if (newLearningWords.length <= 2) {
      // If 2 or fewer words left, put at end
      targetPosition = newLearningWords.length;
    } else {
      // Move 2 positions down (to 3rd line)
      targetPosition = Math.min(state.currentWordIndex + 2, newLearningWords.length);
    }

    newLearningWords.splice(targetPosition, 0, updatedWord);

    // Update stats - increment missed count (only once per word per set)
    const newStats = {
      ...state.stats,
      missedInCurrentSet: state.stats.missedInCurrentSet + 1
    };

    const newState = {
      learningWords: newLearningWords,
      currentWordIndex: state.currentWordIndex,
      stats: newStats,
      history: newHistory,
      showTranslation: false
    };

    set(newState);
    saveLearningState({
      learningWords: newLearningWords,
      currentWordIndex: state.currentWordIndex,
      stats: newStats,
      viewMode: state.viewMode
    });
  },

  undo: () => {
    const state = get();
    if (state.history.length === 0) return;

    const lastEntry = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);

    const newState = {
      learningWords: lastEntry.learningWords,
      currentWordIndex: lastEntry.currentWordIndex,
      stats: lastEntry.stats,
      showTranslation: lastEntry.showTranslation,
      history: newHistory
    };

    set(newState);
    saveLearningState({
      learningWords: lastEntry.learningWords,
      currentWordIndex: lastEntry.currentWordIndex,
      stats: lastEntry.stats,
      viewMode: state.viewMode
    });
  },

  canUndo: () => {
    const state = get();
    return state.history.length > 0;
  },

  resetLearning: () => {
    const state = get();
    const pageWords = state.originalWords.slice(0, WORDS_PER_PAGE);
    const learningWords = pageWords.map((w, i) => convertToLearningWord(w, i));
    const stats = initStats(state.originalWords.length);

    const newState = {
      learningWords,
      currentWordIndex: 0,
      stats,
      showTranslation: false,
      history: []
    };

    set(newState);
    saveLearningState({
      learningWords,
      currentWordIndex: 0,
      stats,
      viewMode: state.viewMode
    });
  },

  getWordsForView: () => {
    const state = get();
    switch (state.viewMode) {
      case 'v1': {
        // Only current word
        const currentWord = state.learningWords[state.currentWordIndex];
        return currentWord ? [currentWord] : [];

      }
      case 'v2':
        // Current page state (all learning words in current order)
        return state.learningWords;

      case 'v3': {

        // Current page in original order with actual learning state
        const startIdx = state.stats.currentPage * WORDS_PER_PAGE;
        const endIdx = Math.min(startIdx + WORDS_PER_PAGE, state.originalWords.length);
        const pageWords = state.originalWords.slice(startIdx, endIdx);

        // Map original words to learning words with actual state
        return pageWords.map((originalWord, index) => {
          // Try to find this word in learningWords to get its actual state
          const learningWord = state.learningWords.find(
            lw => lw.headword === originalWord.headword && lw.PoS === originalWord.PoS
          );

          if (learningWord) {
            // Return the learning word with its actual state
            return learningWord;
          } else {
            // Word not in learning list anymore (already learned or not started)
            return convertToLearningWord(originalWord, startIdx + index);
          }
        });
      }
      case 'v4':
        // All words from dictionary with their learning state
        return state.originalWords.map((originalWord, index) => {
          // Try to find this word in learningWords to get its actual state
          const learningWord = state.learningWords.find(
            lw => lw.headword === originalWord.headword && lw.PoS === originalWord.PoS
          );

          if (learningWord) {
            return learningWord;
          } else {
            return convertToLearningWord(originalWord, index);
          }
        });

      default:
        return state.learningWords;
    }
  },

  goToNextPage: () => {
    const state = get();
    const nextPage = state.stats.currentPage + 1;

    if (nextPage < state.stats.totalPages) {
      const startIdx = nextPage * WORDS_PER_PAGE;
      const endIdx = Math.min(startIdx + WORDS_PER_PAGE, state.originalWords.length);
      const pageWords = state.originalWords.slice(startIdx, endIdx);
      const learningWords = pageWords.map((w, i) => convertToLearningWord(w, startIdx + i));

      const newStats = {
        ...state.stats,
        currentPage: nextPage,
        hqSets: 0,
        missedInCurrentSet: 0
      };

      const newState = {
        learningWords,
        currentWordIndex: 0,
        stats: newStats,
        history: []
      };

      set(newState);
      saveLearningState({
        learningWords,
        currentWordIndex: 0,
        stats: newStats,
        viewMode: state.viewMode
      });
    }
  }
}));