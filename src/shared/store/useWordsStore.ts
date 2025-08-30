import { create } from 'zustand';
import type { IWordModel } from '../../entities/word/model/types';

interface WordsStore {
  words: IWordModel[];
  currentWordIndex: number;
  showTranslation: boolean;
  learnedWords: Set<number>;
  
  // Actions
  setWords: (words: IWordModel[]) => void;
  nextWord: () => void;
  previousWord: () => void;
  showTranslations: () => void;
  hideTranslations: () => void;
  markWordAsKnown: () => void;
  markWordAsUnknown: () => void;
  resetLearning: () => void;
  getCurrentWord: () => IWordModel | null;
}

export const useWordsStore = create<WordsStore>((set, get) => ({
  words: [],
  currentWordIndex: 0,
  showTranslation: false,
  learnedWords: new Set(),

  setWords: (words) => set({ words, currentWordIndex: 0 }),

  nextWord: () => set((state) => ({
    currentWordIndex: Math.min(state.currentWordIndex + 1, state.words.length - 1),
    showTranslation: false
  })),

  previousWord: () => set((state) => ({
    currentWordIndex: Math.max(state.currentWordIndex - 1, 0),
    showTranslation: false
  })),

  showTranslations: () => set({ showTranslation: true }),
  hideTranslations: () => set({ showTranslation: false }),

  markWordAsKnown: () => {
    const state = get();
    const newLearnedWords = new Set(state.learnedWords);
    newLearnedWords.add(state.currentWordIndex);
    set({ learnedWords: newLearnedWords });
  },

  markWordAsUnknown: () => {
    const state = get();
    const newLearnedWords = new Set(state.learnedWords);
    newLearnedWords.delete(state.currentWordIndex);
    set({ learnedWords: newLearnedWords });
  },

  resetLearning: () => set({ 
    currentWordIndex: 0, 
    showTranslation: false, 
    learnedWords: new Set() 
  }),

  getCurrentWord: () => {
    const state = get();
    return state.words[state.currentWordIndex] || null;
  }
}));