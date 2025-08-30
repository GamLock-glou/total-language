import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWordsStore } from "../../shared/store/useWordsStore";
import { kwf1 } from "../../widgets/word-list/model/kwf1";
import styles from "./styles.module.css";

const Learning = () => {
  const {
    words,
    currentWordIndex,
    showTranslation,
    setWords,
    nextWord,
    showTranslations,
    hideTranslations,
    markWordAsKnown,
    getCurrentWord,
  } = useWordsStore();

  const [dontKnowEnabled, setDontKnowEnabled] = useState(false);

  useEffect(() => {
    if (words.length === 0) {
      setWords(kwf1);
    }
  }, [words.length, setWords]);

  useEffect(() => {
    setDontKnowEnabled(false);
  }, [currentWordIndex]);

  const currentWord = getCurrentWord();

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

  const handleKnow = () => {
    markWordAsKnown();
    nextWord();
    hideTranslations();
  };

  const handleCheck = () => {
    showTranslations();
    setDontKnowEnabled(true);
  };

  const handleDontKnow = () => {
    if (dontKnowEnabled) {
      nextWord();
      hideTranslations();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/dictionary" className={styles.backButton}>
          ← Словарь
        </Link>
        <div className={styles.progress}>
          {currentWordIndex + 1} / {words.length}
        </div>
      </div>

      <div className={styles.learningCard}>
        <div className={styles.wordSection}>
          <h1 className={styles.headword}>{currentWord.headword}</h1>
          <div className={styles.wordInfo}>
            <span className={styles.pos}>{currentWord.PoS}</span>
            <span className={styles.ipa}>{currentWord.IPA}</span>
          </div>
        </div>
          {showTranslation && (
            <div className={styles.translationSection}>
              <div className={styles.translations}>
                <h3>Переводы:</h3>
                <ul>
                  {currentWord.translations.map((translation, index) => (
                    <li key={index}>{translation}</li>
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
            onClick={handleKnow}
          >
            ✔
          </button>

          <button
            className={`${styles.button} ${styles.checkButton}`}
            onClick={handleCheck}
          >
            show
          </button>

          <button
            className={`${styles.button} ${styles.dontKnowButton} ${
              !dontKnowEnabled ? styles.disabled : ""
            }`}
            onClick={handleDontKnow}
            disabled={!dontKnowEnabled}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Learning;
