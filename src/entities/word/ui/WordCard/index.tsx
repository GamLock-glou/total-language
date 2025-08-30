import cn from "classnames";
import type { IWordModel } from "../../model/types";
import styles from "./WordCard.module.css";

interface Props {
  word: IWordModel;
}

function WordCard({ word }: Props) {
  const { headword, PoS, IPA, translations, examples } = word;
  return (
    <div className={cn(styles.container)}>
      <div className={styles.header}>
        <span className={styles.headword}>{headword}</span>
        <span className={styles.PoS}>{PoS}</span>
        <span className={styles.ipa}>{IPA}</span>
      </div>


      <div className={styles.translations}>
        {translations.map((translate, index) => (
          <span key={translate} className={styles.translation}>
            {index + 1}. {translate}
          </span>
        ))}
      </div>

      <div className={styles.examples}>
        <strong>Примеры:</strong>
        <ol>
          {examples
            .flatMap((example) =>
              example.split(/\s{2,}/).filter((sentence) => sentence.trim())
            )
            .map((sentence, index) => (
              <li key={index}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: sentence
                      .trim()
                      .replace(/\*(.*?)\*/g, "<span class='highlighted'>$1</span>"),
                  }}
                />
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
}

export { WordCard };
