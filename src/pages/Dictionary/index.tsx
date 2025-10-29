import { Link } from 'react-router-dom';
import { useWordsStore } from '../../shared/store/useWordsStore';
import { WordCard } from '../../entities/word/ui/WordCard';
import styles from './styles.module.css';

const Dictionary = () => {
  const { originalWords } = useWordsStore();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Словарь</h1>
        <div className={styles.headerButtons}>
          <Link to="/upload" className={styles.uploadButton}>
            📂 Загрузить слова
          </Link>
          <Link to="/learning" className={styles.learningButton}>
            Начать изучение
          </Link>
        </div>
      </div>

      {originalWords.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>Словарь пуст</h2>
          <p>Загрузите слова, чтобы начать изучение</p>
          <Link to="/upload" className={styles.uploadButtonLarge}>
            Загрузить слова
          </Link>
        </div>
      ) : (
        <div className={styles.wordsGrid}>
          {originalWords.map((word, index) => (
            <WordCard key={`${word.headword}-${index}`} word={word} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dictionary;