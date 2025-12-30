import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWordsStore } from '../../shared/store/useWordsStore';
import type { IWordModel } from '../../entities/word/model/types';
import { kwf1 } from '../../widgets/word-list/model/kwf1';
import styles from './styles.module.css';

export default function UploadWords() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { setWords } = useWordsStore();
  const navigate = useNavigate();

  const parseFile = async (file: File): Promise<IWordModel[]> => {
    const text = await file.text();

    try {
      // Try to parse as JSON
      const data = JSON.parse(text);

      // If it's an array, assume it's the words array
      if (Array.isArray(data)) {
        return data;
      }

      // If it has a words property
      if (data.words && Array.isArray(data.words)) {
        return data.words;
      }

      throw new Error('Invalid JSON format. Expected an array of words or an object with a "words" property.');
    } catch (e) {
      throw new Error(`Failed to parse file: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const validateWords = (words: any[]): words is IWordModel[] => {
    if (!Array.isArray(words) || words.length === 0) {
      throw new Error('File must contain at least one word');
    }

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!word.headword || typeof word.headword !== 'string') {
        throw new Error(`Word at index ${i} is missing required field "headword"`);
      }
      if (!word.PoS || typeof word.PoS !== 'string') {
        throw new Error(`Word at index ${i} is missing required field "PoS"`);
      }
      if (!word.IPA || typeof word.IPA !== 'string') {
        throw new Error(`Word at index ${i} is missing required field "IPA"`);
      }
      if (!Array.isArray(word.definitions)) {
        throw new Error(`Word at index ${i} has invalid "definitions" field (must be an array)`);
      }
      if (!Array.isArray(word.examples)) {
        throw new Error(`Word at index ${i} has invalid "examples" field (must be an array)`);
      }
    }

    return true;
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setFileName(file.name);

    // Check file type
    if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
      setError('Please upload a .json or .txt file');
      return;
    }

    try {
      const words = await parseFile(file);

      if (validateWords(words)) {
        setWords(words);
        // Navigate to learning page after successful upload
        setTimeout(() => {
          navigate('/learning');
        }, 1000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process file');
      setFileName(null);
    }
  }, [navigate, setWords]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleUseDefaultWords = () => {
    setWords(kwf1);
    setFileName('Default word list (KWF1)');
    setTimeout(() => {
      navigate('/learning');
    }, 500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Upload Your Words</h1>
        <p className={styles.description}>
          Upload a JSON or text file with your vocabulary list to start learning
        </p>

        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.dropzoneContent}>
            <svg
              className={styles.uploadIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className={styles.dropzoneText}>
              Drag and drop your file here, or
            </p>
            <label className={styles.browseButton}>
              Browse files
              <input
                type="file"
                accept=".json,.txt"
                onChange={handleFileInput}
                className={styles.fileInput}
              />
            </label>
            <p className={styles.fileTypes}>Supported formats: JSON, TXT</p>
          </div>
        </div>

        <div className={styles.orDivider}>
          <span>OR</span>
        </div>

        <button
          className={styles.defaultWordsButton}
          onClick={handleUseDefaultWords}
        >
          Use Default Word List ({kwf1.length} words)
        </button>

        {fileName && !error && (
          <div className={styles.success}>
            <svg
              className={styles.successIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p>Successfully loaded: {fileName}</p>
            <p className={styles.redirecting}>Redirecting to learning page...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <svg
              className={styles.errorIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p>{error}</p>
          </div>
        )}

        <div className={styles.formatExample}>
          <h3>Expected JSON format:</h3>
          <pre className={styles.code}>
{`[
  {
    "headword": "hello",
    "PoS": "interjection",
    "IPA": "[həˈloʊ]",
    "definitions": ["привет", "здравствуйте"],
    "examples": ["*Hello*, how are you?"]
  },
  ...
]`}
          </pre>
        </div>
      </div>
    </div>
  );
}
