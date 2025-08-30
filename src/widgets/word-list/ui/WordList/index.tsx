import { WordCard } from "../../../../entities/word/ui/WordCard";
import { usePagination } from "../../../../shared/lib/hooks/usePagination";
import { Pagination } from "../../../../shared/ui/Pagination";
import { kwf1 } from "../../model/kwf1";
import styles from "./styles.module.css";

function WordList() {
  const { currentPage, currentData, totalPages, goToPage } = usePagination(
    kwf1,
    50
  );
  return (
    <div className={styles.container}>
      {currentData.map((values) => (
        <WordCard key={values.headword} word={values} />
      ))}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}

export { WordList };
