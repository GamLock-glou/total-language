import cn from "classnames";
import type { IWordModel } from "../../model/types";
import styles from "./WordCard.module.css";

interface Props {
  word: IWordModel;
}

function WordCard({ word }: Props) {
  const { headword, PoS, IPA, definitions, examples } = word;
  return (
    <div className={cn(styles.container)}>
      <div className={styles.header}>
        <span className={styles.headword}>{headword}</span>
        <span className={styles.PoS}>{PoS}</span>
        <span className={styles.ipa}>{IPA}</span>
      </div>

      <div className={styles.translations}>
        {definitions.map((definition, index) => (
          <span key={definition} className={styles.translation}>
            {index + 1}.{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: definition
                  .replace(/_([^_]+)_/g, "<span class='italic'>$1</span>")
                  .replace(/\*(.*?)\*/g, "<span class='highlighted'>$1</span>"),
              }}
            />
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
                      .replace(
                        /\*(.*?)\*/g,
                        "<span class='highlighted'>$1</span>"
                      ),
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
