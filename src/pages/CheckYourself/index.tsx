import { WordList } from "../../widgets/word-list/ui/WordList";
import styles from "./styles.module.css";

export default function CheckYourselfPage() {
  return (
    <div className={styles.container}>
      <WordList />
    </div>
  );
}
