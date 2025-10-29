export interface IWordModel {
  headword: string;
  PoS: string;
  IPA: string;
  definitions: string[];
  examples: string[];
}

// Extended word model for learning tracking
export interface ILearningWord extends IWordModel {
  id: string; // unique identifier
  missCount: number; // количество промахов (1-3)
  correctAfterMiss: number; // количество правильных ответов после промахов (0-10)
  state: "learning" | "consolidating" | "learned"; // состояние слова
}

// View modes
export type ViewMode = "v1" | "v2" | "v3" | "v4";

// Learning statistics
export interface ILearningStats {
  currentPage: number; // текущая страница
  totalPages: number; // всего страниц
  hqSets: number; // количество HQ проходов (≤3 промахов)
  missedInCurrentSet: number; // пропущено в текущем проходе
  wordsPerPage: number; // слов на странице (обычно 70)
}
