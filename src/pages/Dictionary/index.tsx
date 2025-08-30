import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWordsStore } from '../../shared/store/useWordsStore';
import { kwf1 } from '../../widgets/word-list/model/kwf1';
import { WordCard } from '../../entities/word/ui/WordCard';
import styles from './styles.module.css';

const Dictionary = () => {
  const { words, setWords } = useWordsStore();

  useEffect(() => {
    if (words.length === 0) {
      setWords(kwf1);
    }
  }, [words.length, setWords]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Словарь</h1>
        <Link to="/learning" className={styles.learningButton}>
          Начать изучение
        </Link>
      </div>
      
      <div className={styles.wordsGrid}>
        {words.map((word, index) => (
          <WordCard key={`${word.headword}-${index}`} word={word} />
        ))}
      </div>
    </div>
  );
};

export default Dictionary;