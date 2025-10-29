import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useWordsStore } from "../../shared/store/useWordsStore";
import type { ILearningWord } from "../../entities/word/model/types";
import styles from "./styles.module.css";

const Learning = () => {
  const {
    currentWordIndex,
    showTranslation,
    viewMode,
    stats,
    getCurrentWord,
    showTranslations,
    hideTranslations,
    handleKnow,
    handleMiss,
    setViewMode,
    undo,
    canUndo,
    originalWords,
    getWordsForView,
  } = useWordsStore();

  const currentWord = getCurrentWord();
  const wordsToDisplay = getWordsForView();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }

      // Space for show translation
      if (e.key === " " && !showTranslation) {
        e.preventDefault();
        showTranslations();
      }

      // Arrow keys for know/miss
      if (showTranslation) {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          handleKnow();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          handleMiss();
        }
      }

      // Number keys for view mode
      if (e.key === "1") setViewMode("v1");
      if (e.key === "2") setViewMode("v2");
      if (e.key === "3") setViewMode("v3");
      if (e.key === "4") setViewMode("v4");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showTranslation,
    canUndo,
    undo,
    showTranslations,
    handleKnow,
    handleMiss,
    setViewMode,
  ]);

  // Render miss count visualization
  const renderMissCount = (word: ILearningWord) => {
    if (viewMode === "v4") return null;

    if (viewMode === "v1") {
      // For v1, show only the number
      if (word.missCount > 0) {
        return <span className={styles.missCountNumber}>{word.missCount}</span>;
      }
      return null;
    }

    // For v2-v3, show squares
    if (word.missCount === 0) return null;

    const squares = "■".repeat(word.missCount);
    return <span className={styles.missCountSquares}>{squares}</span>;
  };

  // Render correct after miss count
  const renderCorrectAfterMiss = (word: ILearningWord) => {
    if (viewMode === "v4" || word.correctAfterMiss === 0) return null;

    if (viewMode === "v1") {
      return (
        <span className={styles.correctCount}>{word.correctAfterMiss}</span>
      );
    }

    // For v2-v3, show squares in groups
    const fullGroups = Math.floor(word.correctAfterMiss / 3);
    const remainder = word.correctAfterMiss % 3;

    const groups = [];
    for (let i = 0; i < fullGroups; i++) {
      groups.push("■■■");
    }
    if (remainder > 0) {
      groups.push("■".repeat(remainder));
    }

    return <span className={styles.correctSquares}>{groups.join(" ")}</span>;
  };

  // If no words are loaded, show upload prompt
  if (originalWords.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>Нет загруженных слов</h2>
          <p className={styles.emptyDescription}>
            Загрузите JSON файл со своими словами или используйте встроенный
            словарь, чтобы начать изучение
          </p>
          <div className={styles.emptyActions}>
            <Link to="/upload" className={styles.emptyButton}>
              📂 Загрузить слова
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className={styles.container}>
        <div className={styles.completed}>
          <h2>Поздравляем! Вы изучили все слова!</h2>
          <Link to="/dictionary" className={styles.button}>
            Вернуться к словарю
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckOrKnow = () => {
    if (!showTranslation) {
      showTranslations();
    } else {
      handleKnow();
      hideTranslations();
    }
  };

  const handleDontKnow = () => {
    if (showTranslation) {
      handleMiss();
      hideTranslations();
    }
  };

  return (
    <div className={styles.containerFullWidth}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/dictionary" className={styles.backButton}>
            ← Словарь
          </Link>
          <Link to="/upload" className={styles.uploadButton}>
            📂 Загрузить другие слова
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>page | страница:</span>
            <span className={styles.statValue}>
              {stats.currentPage + 1} / {stats.totalPages}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>HQ sets | проходов:</span>
            <span className={styles.statValue}>{stats.hqSets}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>missed | пропущено:</span>
            <span className={styles.statValue}>{stats.missedInCurrentSet}</span>
          </div>
        </div>

        <div className={styles.viewModeSelector}>
          <button
            className={`${styles.viewModeButton} ${
              viewMode === "v1" ? styles.active : ""
            }`}
            onClick={() => setViewMode("v1")}
          >
            v1
          </button>
          <button
            className={`${styles.viewModeButton} ${
              viewMode === "v2" ? styles.active : ""
            }`}
            onClick={() => setViewMode("v2")}
          >
            v2
          </button>
          <button
            className={`${styles.viewModeButton} ${
              viewMode === "v3" ? styles.active : ""
            }`}
            onClick={() => setViewMode("v3")}
          >
            v3
          </button>
          <button
            className={`${styles.viewModeButton} ${
              viewMode === "v4" ? styles.active : ""
            }`}
            onClick={() => setViewMode("v4")}
          >
            v4
          </button>
        </div>
      </div>

      <div className={styles.learningCard}>
        {viewMode === "v1" ? (
          // v1: Current word only
          <div className={styles.wordSectionV1}>
            <div className={styles.wordRow}>
              <h1 className={styles.headword}>{currentWord.headword}</h1>
              {renderMissCount(currentWord)}
              {renderCorrectAfterMiss(currentWord)}
            </div>
            <div className={styles.wordInfo}>
              <span className={styles.pos}>{currentWord.PoS}</span>
              <span className={styles.ipa}>{currentWord.IPA}</span>
              <span className={styles.range}>{"<1-3>"}</span>
            </div>
          </div>
        ) : (
          // v2-v4: List view
          <div className={styles.wordsListView}>
            {wordsToDisplay.map((word, index) => {
              // For v2, highlight the current word based on currentWordIndex
              // For v3-v4, highlight based on whether this is the current learning word
              const isCurrentWord =
                viewMode === "v2"
                  ? index === currentWordIndex
                  : word.id === currentWord?.id;

              return (
                <div
                  key={word.id}
                  className={`${styles.wordListItem} ${
                    isCurrentWord ? styles.currentWord : ""
                  } ${
                    word.state === "consolidating" ? styles.consolidating : ""
                  }`}
                >
                  <span className={styles.headwordList}>{word.headword}</span>
                  <span className={styles.posList}>{word.PoS}</span>
                  <span className={styles.ipaList}>{word.IPA}</span>
                  {renderMissCount(word)}
                  {renderCorrectAfterMiss(word)}
                  <span className={styles.rangeList}>{"<1-3>"}</span>
                </div>
              );
            })}
          </div>
        )}

        {showTranslation && viewMode === "v1" && (
          <div className={styles.translationSection}>
            <div className={styles.translations}>
              <h3>Определения:</h3>
              <ul>
                {currentWord.definitions.map((translation, index) => (
                  <li
                    key={index}
                    dangerouslySetInnerHTML={{
                      __html: translation
                        .replace(/_([^_]+)_/g, "<em>$1</em>")
                        .replace(/\*(.*?)\*/g, "<strong>$1</strong>"),
                    }}
                  />
                ))}
              </ul>
            </div>

            <div className={styles.examples}>
              <h3>Примеры:</h3>
              <ul>
                {currentWord.examples
                  .flatMap((example) =>
                    example
                      .split(/\s{2,}/)
                      .filter((sentence) => sentence.trim())
                  )
                  .map((sentence, index) => (
                    <li
                      key={index}
                      dangerouslySetInnerHTML={{
                        __html: sentence
                          .trim()
                          .replace(/\*(.*?)\*/g, "<strong>$1</strong>"),
                      }}
                    />
                  ))}
              </ul>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.knowButton}`}
            onClick={handleCheckOrKnow}
          >
            {showTranslation ? "✔" : "show"}
          </button>

          <button
            className={`${styles.button} ${styles.dontKnowButton} ${
              !showTranslation ? styles.disabled : ""
            }`}
            onClick={handleDontKnow}
            disabled={!showTranslation}
          >
            ×
          </button>

          <button
            className={`${styles.button} ${styles.undoButton} ${
              !canUndo() ? styles.disabled : ""
            }`}
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Learning;
