import React from 'react';
import styles from './styles.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  if (totalPages === 0) return null;

  return (
    <nav className={`${styles.pagination} ${className}`} aria-label="Pagination Navigation">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="Previous Page"
        className={styles.paginationBtn}
      >
        ← Prev
      </button>

      <span className={styles.paginationInfo}>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
        className={styles.paginationBtn}
      >
        Next →
      </button>
    </nav>
  );
};
